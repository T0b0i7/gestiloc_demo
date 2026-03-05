import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Save, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { propertyService, uploadService } from "@/services/api";

/* ─── Types ─── */

interface FormData {
  type: string;
  name: string;
  description: string;
  address: string;
  city: string;
  district: string;
  zip_code: string;
  surface: string;
  room_count: string;
  bedroom_count: string;
  bathroom_count: string;
  rent_amount: string;
  charges_amount: string;
  deposit_amount: string;
  status: string;
  reference_code: string;
  floor: string;
}

type CreatePropertyPayload = any;
type FormErrors = Partial<Record<keyof FormData | "photos", string>>;

type ApiErr = {
  response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
  request?: unknown;
  message?: string;
};

function looksTechnical(msg?: string) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("sql") || m.includes("exception") || m.includes("stack") ||
    m.includes("trace") || m.includes("undefined") || m.includes("vendor/") ||
    m.includes("laravel") || m.includes("symfony")
  );
}

function normalizeApiError(err: ApiErr, fallback: string) {
  if (err?.request && !err?.response) return "Le serveur ne répond pas. Vérifie ta connexion puis réessaie.";
  const status = err?.response?.status;
  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 413) return "Fichiers trop volumineux. Réduis la taille des photos.";
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";
  const backendMsg = err?.response?.data?.message?.trim();
  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;
  return fallback;
}

/* ─── Component ─── */

export const AjouterBien = ({
  notify,
}: {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    type: "apartment",
    name: "",
    description: "",
    address: "",
    city: "",
    district: "",
    zip_code: "",
    surface: "",
    room_count: "",
    bedroom_count: "",
    bathroom_count: "",
    rent_amount: "",
    charges_amount: "",
    deposit_amount: "",
    status: "available",
    reference_code: "",
    floor: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const navigate = useNavigate();

  const nameRef = useRef<HTMLInputElement | null>(null);
  const surfaceRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);

  const pushNotify = (msg: string, type: "success" | "info" | "error") => {
    if (notify) notify(msg, type);
    else alert(msg);
  };

  const clearError = (key: keyof FormErrors) => {
    setFormErrors((p) => {
      if (!p[key]) return p;
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name as keyof FormErrors);
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);
    const maxPhotos = 8;
    const maxSize = 5 * 1024 * 1024;
    const ok = arr.filter((f) => f.size <= maxSize);
    if (ok.length !== arr.length) pushNotify("Certaines photos dépassent 5MB et ont été ignorées.", "info");
    const merged = [...photos, ...ok].slice(0, maxPhotos);
    if (photos.length + ok.length > maxPhotos) pushNotify("Maximum 8 photos.", "info");
    photoPreviews.forEach((u) => URL.revokeObjectURL(u));
    setPhotos(merged);
    setPhotoPreviews(merged.map((f) => URL.createObjectURL(f)));
    clearError("photos");
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => {
      const toRemove = prev[index];
      if (toRemove) URL.revokeObjectURL(toRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => { photoPreviews.forEach((u) => URL.revokeObjectURL(u)); };
  }, [photoPreviews]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "Le titre du bien est obligatoire.";
    if (!formData.surface || Number(formData.surface) <= 0) errs.surface = "La surface doit être > 0.";
    if (!formData.address.trim()) errs.address = "L'adresse est obligatoire.";
    if (!formData.city.trim()) errs.city = "La ville est obligatoire.";
    if (formData.rent_amount && Number(formData.rent_amount) < 0) errs.rent_amount = "Le loyer doit être positif.";
    if (formData.reference_code && !/^[A-Z0-9-]+$/.test(formData.reference_code)) {
      errs.reference_code = "Uniquement lettres MAJ, chiffres et tirets.";
    }
    return errs;
  };

  const focusFirstError = (errs: FormErrors) => {
    if (errs.name) nameRef.current?.focus();
    else if (errs.surface) surfaceRef.current?.focus();
    else if (errs.address) addressRef.current?.focus();
    else if (errs.city) cityRef.current?.focus();
  };

  const handleSubmit = async () => {
    const errs = validate();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      const msg = Object.values(errs)[0] || "Vérifie le formulaire.";
      pushNotify(msg, "error");
      focusFirstError(errs);
      return;
    }
    setIsLoading(true);
    try {
      let uploadedPhotoUrls: string[] = [];
      if (photos.length > 0) {
        for (const file of photos) {
          const res = await uploadService.uploadPhoto(file);
          uploadedPhotoUrls.push(res.path);
        }
      }
      const payload: CreatePropertyPayload = {
        type: formData.type,
        title: formData.name.trim(),
        name: formData.name.trim(),
        description: formData.description || null,
        address: formData.address,
        district: formData.district || null,
        city: formData.city,
        state: null,
        zip_code: formData.zip_code || null,
        latitude: null,
        longitude: null,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        room_count: formData.room_count ? parseInt(formData.room_count) : null,
        bedroom_count: formData.bedroom_count ? parseInt(formData.bedroom_count) : null,
        bathroom_count: formData.bathroom_count ? parseInt(formData.bathroom_count) : null,
        rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
        charges_amount: formData.charges_amount ? parseFloat(formData.charges_amount) : null,
        status: formData.status,
        reference_code: formData.reference_code || null,
        amenities: [],
        photos: uploadedPhotoUrls.length ? uploadedPhotoUrls : null,
        meta: {
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : undefined,
        },
      };
      await propertyService.createProperty(payload);
      pushNotify("✅ Le bien a été ajouté avec succès !", "success");
      navigate("/proprietaire/mes-biens");
    } catch (e: any) {
      const err = e as ApiErr;
      console.error("Erreur lors de l'ajout du bien:", err);
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const be = err.response.data.errors;
        const mapped: FormErrors = {};
        if (be.title || be.name) mapped.name = (be.title?.[0] || be.name?.[0]) ?? "Titre invalide.";
        if (be.surface) mapped.surface = be.surface?.[0] || "Surface invalide.";
        if (be.address) mapped.address = be.address?.[0] || "Adresse invalide.";
        if (be.city) mapped.city = be.city?.[0] || "Ville invalide.";
        if (be.reference_code) mapped.reference_code = be.reference_code?.[0] || "Référence invalide.";
        if (be.rent_amount) mapped.rent_amount = be.rent_amount?.[0] || "Loyer invalide.";
        if (be.photos) mapped.photos = be.photos?.[0] || "Photos invalides.";
        setFormErrors((p) => ({ ...p, ...mapped }));
        pushNotify("Certains champs sont invalides. Vérifie le formulaire.", "error");
        focusFirstError(mapped);
        return;
      }
      const msg = normalizeApiError(err, "Une erreur est survenue lors de l'ajout du bien.");
      pushNotify(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.")) {
      navigate("/proprietaire/mes-biens");
    }
  };

  const photosRemaining = useMemo(() => Math.max(0, 8 - photos.length), [photos.length]);

  /* ─── Render ─── */
  return (
    <>
      <style>{`
        .ab-page {
          padding: 1.5rem 1rem 3rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Manrope', sans-serif;
          color: #1a1a1a;
        }

        /* ── Top bar ── */
        .ab-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .ab-btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 12px;
          border: 1.5px solid #d1d5db;
          background: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .ab-btn-back:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        .ab-actions-top {
          display: flex;
          gap: 10px;
        }
        .ab-btn-cancel {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 12px;
          border: 1.5px solid #fca5a5;
          background: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .ab-btn-cancel:hover { background: #fef2f2; }
        .ab-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

        .ab-btn-save {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
          border-radius: 12px;
          border: none;
          background: #4CAF50;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 4px 14px rgba(76,175,80,0.25);
        }
        .ab-btn-save:hover { background: #43A047; box-shadow: 0 6px 18px rgba(76,175,80,0.3); }
        .ab-btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Title ── */
        .ab-title {
          font-family: 'Merriweather', serif;
          font-size: 1.75rem;
          font-weight: 900;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }
        .ab-subtitle {
          font-family: 'Manrope', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        /* ── Grid ── */
        .ab-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        /* ── Section card ── */
        .ab-section {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 18px;
          padding: 1.5rem;
        }
        .ab-section-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1.5px solid #e8f0e8;
        }
        .ab-section-icon {
          font-size: 1.3rem;
        }
        .ab-section-title {
          font-family: 'Merriweather', serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }

        /* ── Fields ── */
        .ab-fields {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .ab-fields.one { grid-template-columns: 1fr; }

        .ab-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .ab-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #374151;
          font-family: 'Manrope', sans-serif;
        }
        .ab-label .req { color: #dc2626; }

        .ab-input {
          width: 100%;
          padding: 0.7rem 0.85rem;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .ab-input:hover { border-color: #9ca3af; }
        .ab-input:focus { border-color: #4CAF50; box-shadow: 0 0 0 3px rgba(76,175,80,0.12); }
        .ab-input::placeholder { color: #9ca3af; font-weight: 400; }

        textarea.ab-input {
          min-height: 100px;
          resize: vertical;
          font-family: 'Manrope', sans-serif;
        }

        select.ab-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 2.2rem;
        }

        .ab-help {
          font-size: 0.72rem;
          color: #9ca3af;
          font-weight: 500;
          font-style: italic;
        }
        .ab-error-msg {
          font-size: 0.75rem;
          font-weight: 600;
          color: #dc2626;
        }

        /* ── Finances sub-section (warm orange) ── */
        .ab-finances {
          margin-top: 1.25rem;
          background: linear-gradient(135deg, #fff8ef 0%, #fff3e0 100%);
          border: 1.5px solid #ffe0b2;
          border-radius: 16px;
          padding: 1.25rem;
        }
        .ab-finances-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
          padding-bottom: 0.6rem;
          border-bottom: 1.5px solid #ffe0b2;
        }
        .ab-finances-title {
          font-family: 'Merriweather', serif;
          font-size: 0.95rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }
        .ab-input-warm {
          width: 100%;
          padding: 0.7rem 0.85rem;
          border: 1.5px solid #ffcc80;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .ab-input-warm:hover { border-color: #ffa726; }
        .ab-input-warm:focus { border-color: #fb8c00; box-shadow: 0 0 0 3px rgba(255,152,0,0.12); }
        .ab-input-warm::placeholder { color: #bfaE90; font-weight: 400; }

        /* ── Photos section ── */
        .ab-photos {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .ab-photos-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }
        .ab-photos-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Merriweather', serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #1a1a1a;
        }
        .ab-btn-add-photos {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 999px;
          border: 1.5px dashed #4CAF50;
          background: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #4CAF50;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .ab-btn-add-photos:hover {
          background: #f0fdf0;
          border-color: #2e7d32;
        }

        .ab-previews {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .ab-thumb {
          width: 128px;
          height: 92px;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transition: 0.18s ease;
        }
        .ab-thumb:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .ab-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ab-thumb-remove {
          position: absolute;
          right: 6px;
          top: 6px;
          border: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.92);
          border-radius: 999px;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.18s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .ab-thumb-remove:hover { transform: scale(1.1); background: #fff; }

        /* ── Footer ── */
        .ab-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        /* ── Responsive ── */
        @media (max-width: 820px) {
          .ab-grid { grid-template-columns: 1fr; }
          .ab-topbar { flex-direction: column; align-items: stretch; }
          .ab-actions-top { justify-content: flex-end; }
          .ab-fields { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ab-page">
        {/* ── Top bar ── */}
        <div className="ab-topbar">
          <button className="ab-btn-back" onClick={() => navigate("/proprietaire/dashboard")}>
            <ArrowLeft size={15} />
            ← Retour au tableau de bord
          </button>
          <div className="ab-actions-top">
            <button className="ab-btn-cancel" onClick={handleCancel} disabled={isLoading}>
              <X size={14} />
              Annuler
            </button>
            <button className="ab-btn-save" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <h1 className="ab-title">Créer un bien</h1>
        <p className="ab-subtitle">Ajoutez un nouveau bien immobilier à votre portefeuille</p>

        {/* ── Two-column grid ── */}
        <div className="ab-grid">
          {/* ── LEFT: Informations générales ── */}
          <div className="ab-section">
            <div className="ab-section-head">
              <span className="ab-section-icon">🏠</span>
              <h2 className="ab-section-title">Informations générales</h2>
            </div>

            {/* Type & Statut */}
            <div className="ab-fields" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="ab-input">
                  <option value="apartment">Appartement</option>
                  <option value="house">Maison</option>
                  <option value="office">Bureau</option>
                  <option value="commercial">Local commercial</option>
                  <option value="parking">Parking</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="ab-field">
                <label className="ab-label">Statut</label>
                <select name="status" value={formData.status} onChange={handleChange} className="ab-input">
                  <option value="available">Disponible</option>
                  <option value="rented">Loué</option>
                  <option value="maintenance">En rénovation</option>
                  <option value="sold">Vendu</option>
                </select>
              </div>
            </div>

            {/* Titre du bien */}
            <div className="ab-fields one" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Titre du bien</label>
                <input
                  ref={nameRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Appartement T3 centre-ville"
                  className="ab-input"
                />
                {formErrors.name && <span className="ab-error-msg">{formErrors.name}</span>}
              </div>
            </div>

            {/* Surface */}
            <div className="ab-fields one" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Surface (m²)</label>
                <input
                  ref={surfaceRef}
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  placeholder="Ex: 65"
                  className="ab-input"
                  min="0"
                  step="0.01"
                />
                {formErrors.surface && <span className="ab-error-msg">{formErrors.surface}</span>}
              </div>
            </div>

            {/* Référence */}
            <div className="ab-fields one" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Référence (Optionnel)</label>
                <input
                  type="text"
                  name="reference_code"
                  value={formData.reference_code}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    setFormData((p) => ({ ...p, reference_code: v }));
                    clearError("reference_code");
                  }}
                  placeholder="Ex: APP-123"
                  className="ab-input"
                />
                {formErrors.reference_code && <span className="ab-error-msg">{formErrors.reference_code}</span>}
              </div>
            </div>

            {/* Étage & Chambres */}
            <div className="ab-fields" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Étage</label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="Ex: 3"
                  className="ab-input"
                  min="0"
                />
              </div>
              <div className="ab-field">
                <label className="ab-label">Nombre de chambre (s)</label>
                <input
                  type="number"
                  name="bedroom_count"
                  value={formData.bedroom_count}
                  onChange={handleChange}
                  placeholder="Ex: 6"
                  className="ab-input"
                  min="0"
                />
              </div>
            </div>

            {/* Salle de bain & Pièces */}
            <div className="ab-fields" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Salle de bain</label>
                <input
                  type="number"
                  name="bathroom_count"
                  value={formData.bathroom_count}
                  onChange={handleChange}
                  placeholder="Ex: 3"
                  className="ab-input"
                  min="0"
                />
              </div>
              <div className="ab-field">
                <label className="ab-label">Nombre de pièce (s)</label>
                <input
                  type="number"
                  name="room_count"
                  value={formData.room_count}
                  onChange={handleChange}
                  placeholder="Ex: 6"
                  className="ab-input"
                  min="0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="ab-fields one">
              <div className="ab-field">
                <label className="ab-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez le bien (optionnel)…"
                  className="ab-input"
                />
                <span className="ab-help">Points forts, emplacement, spécificités...</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Adresse + Finances ── */}
          <div className="ab-section">
            <div className="ab-section-head">
              <span className="ab-section-icon">🧑</span>
              <h2 className="ab-section-title">Adresse</h2>
            </div>

            {/* Adresse */}
            <div className="ab-fields one" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Adresse</label>
                <input
                  ref={addressRef}
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="N° et nom de la rue"
                  className="ab-input"
                />
                {formErrors.address && <span className="ab-error-msg">{formErrors.address}</span>}
              </div>
            </div>

            {/* Ville */}
            <div className="ab-fields one" style={{ marginBottom: 14 }}>
              <div className="ab-field">
                <label className="ab-label">Ville</label>
                <input
                  ref={cityRef}
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ex: Cotonou"
                  className="ab-input"
                />
                {formErrors.city && <span className="ab-error-msg">{formErrors.city}</span>}
              </div>
            </div>

            {/* Quartier */}
            <div className="ab-fields one" style={{ marginBottom: 0 }}>
              <div className="ab-field">
                <label className="ab-label">Quartier / Arrondissement</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Ex: Fidjrossè"
                  className="ab-input"
                />
              </div>
            </div>

            {/* ── Finances sub-section ── */}
            <div className="ab-finances">
              <div className="ab-finances-head">
                <span style={{ fontSize: "1.1rem" }}>💰</span>
                <h3 className="ab-finances-title">Finances</h3>
              </div>

              <div className="ab-fields one" style={{ marginBottom: 14 }}>
                <div className="ab-field">
                  <label className="ab-label">Loyer hors charges (FCFA)</label>
                  <input
                    type="number"
                    name="rent_amount"
                    value={formData.rent_amount}
                    onChange={handleChange}
                    className="ab-input-warm"
                    min="0"
                    step="0.01"
                  />
                  {formErrors.rent_amount && <span className="ab-error-msg">{formErrors.rent_amount}</span>}
                </div>
              </div>

              <div className="ab-fields one" style={{ marginBottom: 14 }}>
                <div className="ab-field">
                  <label className="ab-label">Loyer charges locatives (FCFA)</label>
                  <input
                    type="number"
                    name="charges_amount"
                    value={formData.charges_amount}
                    onChange={handleChange}
                    className="ab-input-warm"
                    min="0"
                    step="0.01"
                  />
                  <span className="ab-help">Charges mensuelles (eau, électricité, entretien...)</span>
                </div>
              </div>

              <div className="ab-fields one">
                <div className="ab-field">
                  <label className="ab-label">Caution / Dépôt de garantie (FCFA)</label>
                  <input
                    type="number"
                    name="deposit_amount"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                    className="ab-input-warm"
                    min="0"
                    step="0.01"
                  />
                  <span className="ab-help">Montant du dépôt de garantie demandé au locataire</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Photos section ── */}
        <div className="ab-photos">
          <div className="ab-photos-top">
            <div>
              <div className="ab-photos-title">
                <span>🖼️</span> Photos du bien
              </div>
              <p className="ab-help" style={{ marginTop: 4 }}>
                Optionnel • Max 8 photos • 5MB max • Reste: {photosRemaining}
              </p>
            </div>
            <label className="ab-btn-add-photos">
              <ImageIcon size={15} />
              Ajouter des photos
              <input type="file" accept="image/*" multiple onChange={handleFilesChange} style={{ display: "none" }} />
            </label>
          </div>

          {formErrors.photos && <span className="ab-error-msg" style={{ display: "block", marginBottom: 8 }}>{formErrors.photos}</span>}

          {photoPreviews.length > 0 ? (
            <div className="ab-previews">
              {photoPreviews.map((src, index) => (
                <div className="ab-thumb" key={index}>
                  <img src={src} alt={`Photo ${index + 1}`} />
                  <button type="button" className="ab-thumb-remove" onClick={() => handleRemovePhoto(index)} aria-label="Supprimer">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="ab-help" style={{ marginTop: 4 }}>Aucune photo ajoutée.</p>
          )}

          {/* ── Footer inside photos card ── */}
          <div className="ab-footer" style={{ marginTop: 16 }}>
            <button className="ab-btn-cancel" onClick={handleCancel} disabled={isLoading}>
              <X size={14} />
              Annuler
            </button>
            <button className="ab-btn-save" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default AjouterBien;
