import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Save,
  Home,
  Building2,
  MapPin,
  Ruler,
  Euro,
  X,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { propertyService, uploadService } from "@/services/api";

/**
 * ✅ Même style & mêmes couleurs EXACTEMENT que "AjouterLocataire"
 * - Header gradient: #667eea -> #764ba2
 * - Accents: indigo #4f46e5 + violet #7c3aed
 * - Halos: bleu/violet + touche vert subtil
 * ✅ Logique inchangée
 */

const styles = `
  :root{
    --gradA:#667eea;
    --gradB:#764ba2;
    --indigo:#4f46e5;
    --violet:#7c3aed;
    --emerald:#10b981;

    --bg:#ffffff;
    --ink:#0f172a;
    --muted:#64748b;
    --muted2:#94a3b8;

    --line: rgba(15,23,42,.10);
    --line2: rgba(15,23,42,.08);

    --shadow: 0 22px 70px rgba(0,0,0,.18);
    --shadow2: 0 12px 35px rgba(15,23,42,.10);
    --shadow3: 0 8px 18px rgba(15,23,42,.08);

    --ring: 0 0 0 4px rgba(79,70,229,.14);
  }

  *{ box-sizing:border-box; }

  .page{
    min-height: 100vh;
    padding: 26px;
    color: var(--ink);
    background:#ffffff;
    position: relative;
  }

  /* ✅ même ambiance "AjouterLocataire" */
  .page::before{
    content:"";
    position: fixed;
    inset: 0;
    background:
      radial-gradient(900px 520px at 12% -8%, rgba(102,126,234,.16) 0%, rgba(102,126,234,0) 62%),
      radial-gradient(900px 520px at 92% 8%, rgba(118,75,162,.14) 0%, rgba(118,75,162,0) 64%),
      radial-gradient(700px 420px at 40% 110%, rgba(16,185,129,.10) 0%, rgba(16,185,129,0) 60%);
    pointer-events:none;
    z-index:-2;
  }

  .shell{ max-width: 1200px; margin: 0 auto; }

  .card{
    background: rgba(255,255,255,.92);
    border-radius: 22px;
    box-shadow: var(--shadow);
    overflow: hidden;
    border: 1px solid rgba(102,126,234,.18);
    position: relative;
    backdrop-filter: blur(10px);
  }

  .card::before{
    content:"";
    position:absolute;
    inset:0;
    pointer-events:none;
    background:
      radial-gradient(circle at 14% 18%, rgba(102,126,234,.10), rgba(102,126,234,0) 58%),
      radial-gradient(circle at 88% 30%, rgba(118,75,162,.10), rgba(118,75,162,0) 58%),
      radial-gradient(circle at 50% 95%, rgba(16,185,129,.08), rgba(16,185,129,0) 55%);
    z-index: 0;
  }

  .header{
    background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
    padding: 2.25rem;
    color: #fff;
    position: relative;
    overflow:hidden;
    z-index: 1;
  }

  .header-art{
    position:absolute;
    inset:0;
    pointer-events:none;
    z-index:0;
  }
  .header-art .blob{
    position:absolute;
    right:-180px;
    top:-210px;
    width: 640px;
    height: 640px;
    opacity: .95;
    filter: drop-shadow(0 18px 44px rgba(0,0,0,.18));
  }
  .header-art .ring{
    position:absolute;
    left:-140px;
    bottom:-180px;
    width: 520px;
    height: 520px;
    opacity: .55;
  }

  .headerRow{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 14px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }

  .titleWrap{ display:flex; flex-direction:column; gap: 8px; }

  .title{
    display:flex;
    align-items:center;
    gap: 10px;
    font-weight: 1000;
    letter-spacing: -0.03em;
    font-size: 28px;
    margin: 0;
    line-height: 1.05;
     color: white;
  }

  .subtitle{
    margin: 0;
    opacity: .94;
    font-weight: 650;
    font-size: 14px;
    max-width: 72ch;
     color: white;
  }

  .badgeRow{
    display:flex;
    gap: .6rem;
    align-items:center;
    flex-wrap: wrap;
  }

  .pillHead{
    display:inline-flex;
    align-items:center;
    gap: .5rem;
    padding: .5rem .75rem;
    border-radius: 999px;
    background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.18);
    backdrop-filter: blur(10px);
    font-weight: 850;
    font-size: .82rem;
    white-space: nowrap;
  }

  .body{
    padding: 2.25rem;
    position: relative;
    z-index: 1;
  }

  .actionsTop{
    display:flex;
    align-items:center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .actionsRight{ display:flex; gap: 10px; flex-wrap: wrap; }

  .btn{
    border: 2px solid rgba(67,56,202,.20);
    background: rgba(255,255,255,.92);
    color: #4338ca;
    border-radius: 14px;
    padding: 10px 12px;
    font-weight: 950;
    font-size: 14px;
    display:inline-flex;
    align-items:center;
    gap: 8px;
    cursor: pointer;
    transition: 180ms ease;
    box-shadow: 0 2px 10px rgba(15,23,42,.04);
    white-space: nowrap;
  }
  .btn:hover:not(:disabled){
    transform: translateY(-1px);
    background: rgba(67,56,202,.06);
  }
  .btn:disabled{ opacity:.65; cursor:not-allowed; transform:none; }

  .btn-danger{
    color: #e11d48;
    border-color: rgba(225,29,72,.18);
  }
  .btn-danger:hover:not(:disabled){ background: rgba(225,29,72,.06); }

  .btn-primary{
    border: none;
    color:#fff;
    background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
    box-shadow: 0 14px 30px rgba(79,70,229,.22);
  }
  .btn-primary:hover:not(:disabled){
    box-shadow: 0 18px 34px rgba(79,70,229,.28);
  }

  .banner{
    display:flex;
    gap: 10px;
    align-items:flex-start;
    padding: 14px 16px;
    background:
      radial-gradient(700px 220px at 20% 0%, rgba(79,70,229,.10), transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,0.74), rgba(255,255,255,0.50));
    border: 1px solid rgba(15,23,42,.10);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(17,24,39,.06);
    margin-bottom: 16px;
  }
  .banner strong{
    display:block;
    font-weight: 950;
    font-size: 13px;
    letter-spacing: -0.01em;
  }
  .banner p{
    margin: 2px 0 0 0;
    font-weight: 750;
    font-size: 13px;
    color: var(--muted);
    white-space: pre-line;
  }

  .grid{
    display:grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 14px;
  }

  .section{
    background: rgba(255,255,255,.72);
    padding: 1.25rem;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.08);
    box-shadow: 0 10px 30px rgba(17,24,39,.06);
    backdrop-filter: blur(10px);
    position: relative;
    overflow:hidden;
  }
  .section::before{
    content:"";
    position:absolute;
    inset:0;
    background:
      radial-gradient(900px 260px at 90% 0%, rgba(124,58,237,.06), transparent 62%),
      radial-gradient(900px 260px at 10% 0%, rgba(79,70,229,.07), transparent 62%);
    pointer-events:none;
  }
  .section > *{ position: relative; }

  .sectionHead{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(102,126,234,.28);
  }

  .sectionTitle{
    display:flex;
    align-items:center;
    gap: 8px;
    font-weight: 950;
    font-size: 14px;
    margin: 0;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .pill{
    display:inline-flex;
    align-items:center;
    gap: .45rem;
    padding: .25rem .6rem;
    border-radius: 999px;
    background: rgba(79,70,229,.10);
    border: 1px solid rgba(79,70,229,.18);
    color: #4338ca;
    font-weight: 950;
    font-size: .78rem;
    white-space: nowrap;
  }

  .fields{
    display:grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .fields.one{ grid-template-columns: 1fr; }

  .field{ display:flex; flex-direction:column; gap: 6px; }

  .label{
    font-size: 12px;
    font-weight: 950;
    color: #334155;
    display:flex;
    align-items:center;
    gap: 6px;
    letter-spacing: -0.005em;
  }
  .req{ color:#e11d48; }

  .control{
    width: 100%;
    padding: 0.85rem 1rem;
    border: 2px solid rgba(148,163,184,.35);
    border-radius: 12px;
    font-size: 14px;
    color: var(--ink);
    background: rgba(255,255,255,.92);
    transition: all .2s ease;
    font-weight: 750;
    box-shadow: 0 2px 10px rgba(15,23,42,.04);
    outline:none;
    font-family: inherit;
  }
  .control:hover{
    border-color: rgba(79,70,229,.30);
    background: rgba(255,255,255,.96);
  }
  .control:focus{
    border-color: rgba(79,70,229,.75);
    box-shadow: var(--ring);
    background: rgba(255,255,255,1);
  }

  .help{
    font-size: 12px;
    color: var(--muted);
    font-weight: 650;
  }

  .error{
    display:flex;
    gap: 8px;
    align-items:flex-start;
    font-size: 12px;
    font-weight: 900;
    color: #be123c;
    background: rgba(255,241,242,.92);
    border: 1px solid rgba(244,63,94,.30);
    border-radius: 12px;
    padding: 8px 10px;
  }

  .iconInput{ position: relative; }
  .iconInput input{ padding-left: 2.85rem; }
  .iconLeft{
    position:absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events:none;
  }

  .photosRow{
    margin-top: 14px;
    padding: 16px;
    border-top: 1px solid rgba(148,163,184,.35);
    background:
      radial-gradient(900px 220px at 12% 0%, rgba(102,126,234,.10), transparent 58%),
      linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,255,255,0.54));
    border-radius: 18px;
  }

  .uploadRow{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .uploadLabel{
    display:inline-flex;
    align-items:center;
    gap: 8px;
    border: 1px dashed rgba(79,70,229,.35);
    border-radius: 999px;
    padding: 9px 12px;
    font-weight: 950;
    font-size: 13px;
    cursor:pointer;
    background: rgba(255,255,255,0.92);
    transition: 180ms ease;
    box-shadow: 0 14px 34px rgba(79,70,229,.14);
  }
  .uploadLabel:hover{
    transform: translateY(-1px);
    border-color: rgba(79,70,229,.55);
    box-shadow: 0 18px 40px rgba(79,70,229,.18);
  }

  .previews{ display:flex; flex-wrap: wrap; gap: 10px; }

  .thumb{
    width: 128px;
    height: 92px;
    border-radius: 16px;
    overflow:hidden;
    border: 1px solid rgba(15,23,42,.12);
    background: rgba(255,255,255,0.90);
    position: relative;
    box-shadow: 0 14px 30px rgba(15,23,42,.10);
    transition: 180ms ease;
  }
  .thumb:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(15,23,42,.14); }
  .thumb img{ width:100%; height:100%; object-fit: cover; }

  .remove{
    position:absolute;
    right: 8px;
    top: 8px;
    border: 1px solid rgba(15,23,42,.12);
    background: rgba(255,255,255,0.94);
    border-radius: 999px;
    width: 30px;
    height: 30px;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    transition: 180ms ease;
    box-shadow: 0 10px 22px rgba(15,23,42,.12);
  }
  .remove:hover{ transform: scale(1.03); }

  .footer{
    display:flex;
    justify-content:flex-end;
    gap: 10px;
    padding-top: 16px;
    flex-wrap: wrap;
  }

  @media (max-width: 980px){
    .grid{ grid-template-columns: 1fr; }
    .page{ padding: 16px; }
    .btn{ width: 100%; justify-content:center; }
    .actionsRight{ width:100%; }
    .footer .btn{ width: 100%; }
    .header{ padding: 1.5rem; }
    .body{ padding: 1.25rem; }
    .header-art .blob{ right:-240px; top:-260px; width: 740px; height: 740px; opacity:.85; }
    .header-art .ring{ left:-220px; bottom:-240px; width: 620px; height: 620px; opacity:.40; }
  }
`;

interface FormData {
  type: string;
  name: string;
  description: string;
  address: string;
  city: string;
  district: string;
  zip_code: string;
  surface: string;
  room_count: string;      // Nombre de pièces
  bedroom_count: string;   // Nombre de chambres
  bathroom_count: string;  // Nombre de salles de bain
  rent_amount: string;
  status: string;
  reference_code: string;
  // Caractéristiques supplémentaires
  terrace: boolean;        // Terrasse
  balcony: boolean;        // Balcon
  garden: boolean;         // Jardin
  parking: boolean;        // Parking
  floor: string;          // Étage
  elevator: boolean;       // Ascenseur
  furnished: boolean;      // Meublé
  heating_type: string;    // Type de chauffage
  energy_class: string;    // Classe énergétique
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
    m.includes("sql") ||
    m.includes("exception") ||
    m.includes("stack") ||
    m.includes("trace") ||
    m.includes("undefined") ||
    m.includes("vendor/") ||
    m.includes("laravel") ||
    m.includes("symfony")
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
    status: "available",
    reference_code: "",
    // Caractéristiques supplémentaires
    terrace: false,
    balcony: false,
    garden: false,
    parking: false,
    floor: "",
    elevator: false,
    furnished: false,
    heating_type: "",
    energy_class: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [banner, setBanner] = useState<{ title: string; text?: string } | null>(null);

  const navigate = useNavigate();

  const nameRef = useRef<HTMLInputElement | null>(null);
  const surfaceRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const zipRef = useRef<HTMLInputElement | null>(null);
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
    return () => {
      photoPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [photoPreviews]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!formData.name.trim()) errs.name = "Le titre du bien est obligatoire.";
    if (!formData.surface || Number(formData.surface) <= 0) errs.surface = "La surface doit être > 0.";
    if (!formData.address.trim()) errs.address = "L’adresse est obligatoire.";
    if (!formData.zip_code.trim()) errs.zip_code = "Le code postal est obligatoire.";
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
    else if (errs.zip_code) zipRef.current?.focus();
    else if (errs.city) cityRef.current?.focus();
  };

  const handleSubmit = async () => {
    setBanner(null);

    const errs = validate();
    setFormErrors(errs);

    if (Object.keys(errs).length > 0) {
      const msg = Object.values(errs)[0] || "Vérifie le formulaire.";
      setBanner({ title: "Formulaire incomplet", text: msg });
      pushNotify(msg, "error");
      focusFirstError(errs);
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ Upload des photos si présentes
      let uploadedPhotoUrls: string[] = [];
      if (photos.length > 0) {
        for (const file of photos) {
          const res = await uploadService.uploadPhoto(file);
          uploadedPhotoUrls.push(res.path);
        }
      }

      // 2️⃣ Payload inchangé
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
        charges_amount: null,
        status: formData.status,

        reference_code: formData.reference_code || null,
        amenities: [],
        photos: uploadedPhotoUrls.length ? uploadedPhotoUrls : null,
        meta: {
          terrace: formData.terrace,
          balcony: formData.balcony,
          garden: formData.garden,
          parking: formData.parking,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          elevator: formData.elevator,
          furnished: formData.furnished,
          heating_type: formData.heating_type || undefined,
          energy_class: formData.energy_class || undefined,
        },
      };

      const property = await propertyService.createProperty(payload);
      console.log("Property created:", property);

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
        if (be.zip_code) mapped.zip_code = be.zip_code?.[0] || "Code postal invalide.";
        if (be.city) mapped.city = be.city?.[0] || "Ville invalide.";
        if (be.reference_code) mapped.reference_code = be.reference_code?.[0] || "Référence invalide.";
        if (be.rent_amount) mapped.rent_amount = be.rent_amount?.[0] || "Loyer invalide.";
        if (be.photos) mapped.photos = be.photos?.[0] || "Photos invalides.";

        setFormErrors((p) => ({ ...p, ...mapped }));

        const msg = "Certains champs sont invalides. Vérifie le formulaire.";
        setBanner({ title: "Erreur de validation", text: msg });
        pushNotify(msg, "error");
        focusFirstError(mapped);
        return;
      }

      const msg = normalizeApiError(err, "Une erreur est survenue lors de l'ajout du bien.");
      setBanner({ title: "Impossible d’enregistrer", text: msg });
      pushNotify(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.")) {
      navigate("/proprietaire/biens");
    }
  };

  const photosRemaining = useMemo(() => Math.max(0, 8 - photos.length), [photos.length]);

  return (
    <>
      <style>{styles}</style>

      <div className="page">
        <div className="shell">
          <div className="card">
            <div className="header">
              <div className="header-art" aria-hidden="true">
                <svg className="blob" viewBox="0 0 600 600" fill="none">
                  <defs>
                    <linearGradient id="hb1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="rgba(255,255,255,.65)" />
                      <stop offset="1" stopColor="rgba(255,255,255,.08)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M420 70C500 110 560 190 560 290C560 420 460 520 320 540C190 560 70 490 50 360C30 240 110 140 240 90C310 62 360 44 420 70Z"
                    fill="url(#hb1)"
                    opacity="0.65"
                  />
                  <path
                    d="M455 140C505 175 530 235 520 295C505 390 410 450 320 460C230 470 150 420 130 340C110 260 155 190 235 150C315 110 395 105 455 140Z"
                    fill="rgba(255,255,255,.10)"
                  />
                </svg>

                <svg className="ring" viewBox="0 0 500 500" fill="none">
                  <defs>
                    <radialGradient
                      id="hb2"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(220 210) rotate(45) scale(240)"
                    >
                      <stop stopColor="rgba(255,255,255,.34)" />
                      <stop offset="1" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                  </defs>
                  <circle cx="240" cy="240" r="210" fill="url(#hb2)" />
                </svg>
              </div>

              <div className="headerRow">
                <div className="titleWrap">
                  <h1 className="title">
                    <Building2 size={22} />
                    Ajouter un bien
                  </h1>
                  <p className="subtitle">Même look premium (couleurs + halos) que “AjouterLocataire”.</p>
                </div>

                <div className="badgeRow">
                  <span className="pillHead">
                    <Home size={16} />
                    Infos
                  </span>
                  <span className="pillHead">
                    <MapPin size={16} />
                    Adresse
                  </span>
                  <span className="pillHead">
                    <ImageIcon size={16} />
                    Photos
                  </span>
                </div>
              </div>
            </div>

            <div className="body">
              <div className="actionsTop">
                <button className="btn" onClick={handleCancel} disabled={isLoading}>
                  <ArrowLeft size={16} />
                  Retour
                </button>

                <div className="actionsRight">
                  <button className="btn btn-danger" onClick={handleCancel} disabled={isLoading}>
                    <X size={16} />
                    Annuler
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>

              {banner ? (
                <div className="banner">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>{banner.title}</strong>
                    {banner.text ? <p>{banner.text}</p> : null}
                  </div>
                </div>
              ) : null}

              <div className="grid">
                {/* LEFT */}
                <div className="section">
                  <div className="sectionHead">
                    <h2 className="sectionTitle">
                      <Home size={16} />
                      Informations générales
                    </h2>
                    <span className="pill">Essentiel</span>
                  </div>

                  <div className="fields">
                    <div className="field">
                      <label className="label">
                        Type <span className="req">*</span>
                      </label>
                      <select name="type" value={formData.type} onChange={handleChange} className="control">
                        <option value="apartment">Appartement</option>
                        <option value="house">Maison</option>
                        <option value="office">Bureau</option>
                        <option value="commercial">Local commercial</option>
                        <option value="parking">Parking</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="label">
                        Statut <span className="req">*</span>
                      </label>
                      <select name="status" value={formData.status} onChange={handleChange} className="control">
                        <option value="available">Disponible</option>
                        <option value="rented">Loué</option>
                        <option value="maintenance">En rénovation</option>
                        <option value="sold">Vendu</option>
                      </select>
                    </div>
                  </div>

                  <div className="fields one" style={{ marginTop: 12 }}>
                    <div className="field">
                      <label className="label">
                        Titre du bien <span className="req">*</span>
                      </label>
                      <input
                        ref={nameRef}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Appartement T3 centre-ville"
                        className="control"
                      />
                      {formErrors.name ? <div className="error">{formErrors.name}</div> : null}
                    </div>
                  </div>

                  <div className="fields" style={{ marginTop: 12 }}>
                    <div className="field">
                      <label className="label">
                        Surface (m²) <span className="req">*</span>
                      </label>
                      <div className="iconInput">
                        <span className="iconLeft">
                          <Ruler size={16} />
                        </span>
                        <input
                          ref={surfaceRef}
                          type="number"
                          name="surface"
                          value={formData.surface}
                          onChange={handleChange}
                          placeholder="Ex: 65"
                          className="control"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {formErrors.surface ? <div className="error">{formErrors.surface}</div> : null}
                    </div>

                    <div className="field">
                      <label className="label">Nombre de pièces</label>
                      <input
                        type="number"
                        name="room_count"
                        value={formData.room_count}
                        onChange={handleChange}
                        placeholder="Ex: 4"
                        className="control"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label className="label">Nombre de chambres</label>
                      <input
                        type="number"
                        name="bedroom_count"
                        value={formData.bedroom_count}
                        onChange={handleChange}
                        placeholder="Ex: 3"
                        className="control"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label className="label">Nombre de salles de bain</label>
                      <input
                        type="number"
                        name="bathroom_count"
                        value={formData.bathroom_count}
                        onChange={handleChange}
                        placeholder="Ex: 2"
                        className="control"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label className="label">Étage</label>
                      <input
                        type="number"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        placeholder="Ex: 3"
                        className="control"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label className="label">Caractéristiques</label>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="terrace"
                            checked={formData.terrace}
                            onChange={handleChange}
                          />
                          <span>Terrasse</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="balcony"
                            checked={formData.balcony}
                            onChange={handleChange}
                          />
                          <span>Balcon</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="garden"
                            checked={formData.garden}
                            onChange={handleChange}
                          />
                          <span>Jardin</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="parking"
                            checked={formData.parking}
                            onChange={handleChange}
                          />
                          <span>Parking</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="elevator"
                            checked={formData.elevator}
                            onChange={handleChange}
                          />
                          <span>Ascenseur</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="furnished"
                            checked={formData.furnished}
                            onChange={handleChange}
                          />
                          <span>Meublé</span>
                        </label>
                      </div>
                    </div>

                    <div className="field">
                      <label className="label">Type de chauffage</label>
                      <select
                        name="heating_type"
                        value={formData.heating_type}
                        onChange={handleChange}
                        className="control"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="electric">Électrique</option>
                        <option value="gas">Gaz</option>
                        <option value="oil">Fioul</option>
                        <option value="heat_pump">Pompe à chaleur</option>
                        <option value="solar">Solaire</option>
                        <option value="collective">Collectif</option>
                        <option value="none">Aucun</option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="label">Classe énergétique</label>
                      <select
                        name="energy_class"
                        value={formData.energy_class}
                        onChange={handleChange}
                        className="control"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="label">Référence</label>
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
                        className="control"
                      />
                      {formErrors.reference_code ? <div className="error">{formErrors.reference_code}</div> : null}
                      <div className="help">Optionnel • Lettres MAJ, chiffres et tirets</div>
                    </div>
                  </div>

                  <div className="fields one" style={{ marginTop: 12 }}>
                    <div className="field">
                      <label className="label">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Décrivez le bien (optionnel)…"
                        className="control"
                        style={{ minHeight: 110, resize: "vertical" }}
                      />
                      <div className="help">Points forts, emplacement, spécificités…</div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="section">
                  <div className="sectionHead">
                    <h2 className="sectionTitle">
                      <MapPin size={16} />
                      Adresse
                    </h2>
                    <span className="pill">Obligatoire</span>
                  </div>

                  <div className="fields one">
                    <div className="field">
                      <label className="label">
                        Adresse <span className="req">*</span>
                      </label>
                      <input
                        ref={addressRef}
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="N° et nom de la rue"
                        className="control"
                      />
                      {formErrors.address ? <div className="error">{formErrors.address}</div> : null}
                    </div>
                  </div>

                  <div className="fields" style={{ marginTop: 12 }}>
                    <div className="field">
                      <label className="label">
                        Code postal <span className="req">*</span>
                      </label>
                      <input
                        ref={zipRef}
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                        placeholder="Ex: 75000"
                        className="control"
                      />
                      {formErrors.zip_code ? <div className="error">{formErrors.zip_code}</div> : null}
                    </div>

                    <div className="field">
                      <label className="label">
                        Ville <span className="req">*</span>
                      </label>
                      <input
                        ref={cityRef}
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ex: Paris"
                        className="control"
                      />
                      {formErrors.city ? <div className="error">{formErrors.city}</div> : null}
                    </div>
                  </div>

                  <div className="fields one" style={{ marginTop: 12 }}>
                    <div className="field">
                      <label className="label">Quartier / Arrondissement</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Ex: Le Marais, 4ème"
                        className="control"
                      />
                    </div>
                  </div>

                  <div className="section" style={{ marginTop: 14 }}>
                    <div className="sectionHead">
                      <h2 className="sectionTitle">
                        <Euro size={16} />
                        Financier
                      </h2>
                      <span className="pill">Optionnel</span>
                    </div>

                    <div className="fields one">
                      <div className="field">
                        <label className="label">Loyer mensuel (FCFA)</label>
                        <div className="iconInput">
                          <span className="iconLeft">
                            <Euro size={16} />
                          </span>
                          <input
                            type="number"
                            name="rent_amount"
                            value={formData.rent_amount}
                            onChange={handleChange}
                            placeholder="0,00"
                            className="control"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {formErrors.rent_amount ? <div className="error">{formErrors.rent_amount}</div> : null}
                        <div className="help">Tu peux laisser vide si tu veux.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="photosRow">
                <div className="uploadRow">
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <ImageIcon size={16} />
                      Photos du bien
                    </div>
                    <div className="help">Optionnel • Max 8 photos • 5MB max • Reste: {photosRemaining}</div>
                  </div>

                  <label className="uploadLabel">
                    <ImageIcon size={16} />
                    Ajouter des photos
                    <input type="file" accept="image/*" multiple onChange={handleFilesChange} style={{ display: "none" }} />
                  </label>
                </div>

                {formErrors.photos ? <div className="error" style={{ marginBottom: 10 }}>{formErrors.photos}</div> : null}

                {photoPreviews.length > 0 ? (
                  <div className="previews">
                    {photoPreviews.map((src, index) => (
                      <div className="thumb" key={index}>
                        <img src={src} alt={`Photo ${index + 1}`} />
                        <button type="button" className="remove" onClick={() => handleRemovePhoto(index)} aria-label="Supprimer">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="help">Aucune photo ajoutée.</div>
                )}
              </div>

              <div className="footer">
                <button className="btn btn-danger" onClick={handleCancel} disabled={isLoading}>
                  <X size={16} />
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AjouterBien;
