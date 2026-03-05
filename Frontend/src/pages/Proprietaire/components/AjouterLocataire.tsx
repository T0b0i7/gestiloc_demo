import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tenantService } from "@/services/api";
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  Calendar,
  User,
  MapPin,
  Briefcase,
  Home,
  X,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Camera,
  FileText,
  Loader2,
} from "lucide-react";

/* ─── Types ─── */

type TabKey = "infos" | "pro" | "garant" | "documents";
type ToastType = "success" | "error" | "info";

interface FormData {
  tenantType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  city: string;
  country: string;
  maritalStatus: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  notes: string;
  profession: string;
  employer: string;
  contractType: string;
  monthlyIncome: string;
  annualIncome: string;
  hasGuarantor: boolean;
  guarantorName: string;
  guarantorPhone: string;
  guarantorEmail: string;
  guarantorProfession: string;
  guarantorMonthlyIncome: string;
  guarantorAnnualIncome: string;
  guarantorAddress: string;
  guarantorBirthInfo: string;
  documentType: string;
}

type FieldKey = keyof FormData;

/* ─── Tab config ─── */

const tabs: { key: TabKey; label: string }[] = [
  { key: "infos", label: "Informations personnelles" },
  { key: "pro", label: "Situation professionnelle" },
  { key: "garant", label: "Garant" },
  { key: "documents", label: "Documents" },
];

/* ─── Component ─── */

export const AjouterLocataire: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("infos");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<FormData>({
    tenantType: "particulier",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    birthPlace: "",
    address: "",
    city: "Cotonou",
    country: "Bénin",
    maritalStatus: "single",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    notes: "",
    profession: "",
    employer: "",
    contractType: "",
    monthlyIncome: "",
    annualIncome: "",
    hasGuarantor: false,
    guarantorName: "",
    guarantorPhone: "",
    guarantorEmail: "",
    guarantorProfession: "",
    guarantorMonthlyIncome: "",
    guarantorAnnualIncome: "",
    guarantorAddress: "",
    guarantorBirthInfo: "",
    documentType: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [toasts, setToasts] = useState<{ id: string; type: ToastType; title: string; message?: string }[]>([]);

  const pushToast = (type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, type, title, message }, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name as FieldKey];
      return next;
    });
  };

  const toggleGuarantor = () => {
    setFormData((prev) => ({ ...prev, hasGuarantor: !prev.hasGuarantor }));
  };

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validateTab = (tab: TabKey): boolean => {
    const errs: Partial<Record<FieldKey, string>> = {};
    const req = (k: FieldKey, label: string) => {
      if (!String(formData[k] ?? "").trim()) errs[k] = `${label} est requis.`;
    };

    if (tab === "infos") {
      req("lastName", "Nom");
      req("firstName", "Prénoms");
      req("birthDate", "Date de naissance");
      req("birthPlace", "Lieu de naissance");
      req("phone", "Téléphone");
      req("email", "Email");
      if (formData.email.trim() && !isEmail(formData.email.trim())) errs.email = "Email invalide.";
      req("address", "Adresse");
    }

    if (tab === "pro") {
      req("profession", "Profession");
    }

    if (tab === "garant" && formData.hasGuarantor) {
      req("guarantorName", "Nom du garant");
      req("guarantorPhone", "Téléphone du garant");
      req("guarantorEmail", "Email du garant");
      if (formData.guarantorEmail.trim() && !isEmail(formData.guarantorEmail.trim())) errs.guarantorEmail = "Email du garant invalide.";
      req("guarantorProfession", "Profession du garant");
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.size <= 15 * 1024 * 1024);
    setUploadedFiles((prev) => [...prev, ...arr]);
  };

  const handleSubmit = async () => {
    const ok = validateTab("infos") && validateTab("pro") && validateTab("garant");
    if (!ok) {
      pushToast("error", "Champs manquants", "Merci de compléter les champs requis.");
      return;
    }

    setIsLoading(true);
    try {
      const invitePayload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      };
      await tenantService.inviteTenant(invitePayload);
      pushToast("success", "Invitation envoyée", `Un email a été envoyé à ${formData.email.trim()}.`);
      navigate("/proprietaire");
    } catch (error: any) {
      console.error("Erreur:", error);
      const apiMsg = error?.response?.data?.message || "Une erreur est survenue.";
      pushToast("error", "Erreur", apiMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const tabIndex = tabs.findIndex((t) => t.key === activeTab);

  const goNext = () => {
    if (!validateTab(activeTab)) {
      pushToast("error", "Champs manquants", "Complète les champs requis.");
      return;
    }
    const nextIdx = tabIndex + 1;
    if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx].key);
  };

  const goPrev = () => {
    const prevIdx = tabIndex - 1;
    if (prevIdx >= 0) setActiveTab(tabs[prevIdx].key);
  };

  const hasError = (name: FieldKey) => !!fieldErrors[name];

  const toastIcon = useMemo(
    () => ({
      success: <CheckCircle2 size={18} />,
      error: <AlertCircle size={18} />,
      info: <Info size={18} />,
    }),
    []
  );

  /* ─── Render ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');

        .al-page {
          padding: 1.5rem 2.5rem 3rem;
          font-family: 'Manrope', sans-serif;
          color: #1a1a1a;
        }

        /* Back button */
        .al-btn-back {
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
          margin-bottom: 1.5rem;
        }
        .al-btn-back:hover { background: #f9fafb; border-color: #9ca3af; }

        /* Title */
        .al-title {
          font-family: 'Merriweather', serif;
          font-size: 1.65rem;
          font-weight: 900;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }
        .al-subtitle {
          font-size: 0.85rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 1.25rem 0;
        }

        /* Step indicators */
        .al-steps {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .al-step {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.15s;
          background: none;
          border: none;
          padding: 0;
          font-family: 'Manrope', sans-serif;
        }
        .al-step.active { color: #e68a00; }
        .al-step.completed { color: #e68a00; }
        .al-step-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d1d5db;
          flex-shrink: 0;
        }
        .al-step.active .al-step-dot,
        .al-step.completed .al-step-dot { background: #e68a00; }

        /* Card */
        .al-card {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 18px;
          padding: 1.75rem;
        }

        /* Fields */
        .al-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .al-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .al-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .al-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .al-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #374151;
        }
        .al-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1.5px solid #d1d5db;
          border-radius: 0.5rem;
          background: transparent;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .al-input:focus { border-color: #83C757; box-shadow: 0 0 0 3px rgba(131,199,87,0.12); }
        .al-input::placeholder { color: #9ca3af; font-weight: 400; }
        .al-input.error { border-color: #dc2626; }

        select.al-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 2.2rem;
          cursor: pointer;
        }

        textarea.al-input {
          min-height: 100px;
          resize: vertical;
        }

        .al-input-icon {
          position: relative;
        }
        .al-input-icon input { padding-left: 2.5rem; }
        .al-input-icon .al-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
        }

        .al-input-prefix {
          position: relative;
        }
        .al-input-prefix input { padding-left: 3rem; }
        .al-input-prefix .al-prefix {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #1a1a1a;
          font-weight: 700;
          font-size: 0.82rem;
          pointer-events: none;
        }

        .al-error-msg {
          font-size: 0.72rem;
          font-weight: 600;
          color: #dc2626;
        }

        /* Section label */
        .al-section-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 16px 0 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Switch */
        .al-switch-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.25rem;
        }
        .al-switch {
          position: relative;
          width: 48px;
          height: 26px;
          background: #d1d5db;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.25s;
        }
        .al-switch.on { background: #7c3aed; }
        .al-switch-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.25s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .al-switch.on .al-switch-thumb { transform: translateX(22px); }
        .al-switch-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* Buttons */
        .al-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 1.5rem;
        }
        .al-btn-prev {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 32px;
          border-radius: 10px;
          border: none;
          background: #83C757;
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.18s ease;
          min-width: 140px;
        }
        .al-btn-prev:hover { background: #72b44a; }

        .al-btn-next {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 32px;
          border-radius: 10px;
          border: 1.5px solid #e68a00;
          background: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.18s ease;
          min-width: 140px;
        }
        .al-btn-next:hover { background: #fff8ef; }

        .al-btn-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 32px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #e68a00 0%, #f5a623 100%);
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.18s ease;
          min-width: 140px;
        }
        .al-btn-submit:hover { box-shadow: 0 4px 14px rgba(230,138,0,0.3); }
        .al-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Upload zone */
        .al-upload-zone {
          background: #e8eaed;
          border-radius: 14px;
          padding: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-bottom: 8px;
          transition: background 0.15s;
        }
        .al-upload-zone:hover { background: #dee0e3; }
        .al-upload-hint {
          font-size: 0.72rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Toast */
        .al-toast-wrap {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .al-toast {
          width: min(380px, calc(100vw - 32px));
          border-radius: 14px;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fff;
          font-family: 'Manrope', sans-serif;
        }
        .al-toast.success { border-color: #a7f3d0; background: #ecfdf5; }
        .al-toast.error { border-color: #fca5a5; background: #fef2f2; }
        .al-toast.info { border-color: #c7d2fe; background: #eef2ff; }
        .al-toast-title { font-weight: 800; font-size: 0.85rem; margin: 0; }
        .al-toast-msg { font-size: 0.78rem; color: #6b7280; margin: 2px 0 0; }
        .al-toast-close {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 2px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .al-grid-3 { grid-template-columns: 1fr; }
          .al-grid-2 { grid-template-columns: 1fr; }
          .al-grid-4 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Toasts */}
      <div className="al-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`al-toast ${t.type}`}>
            {toastIcon[t.type]}
            <div>
              <p className="al-toast-title">{t.title}</p>
              {t.message && <p className="al-toast-msg">{t.message}</p>}
            </div>
            <button className="al-toast-close" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="al-page">
        {/* Back */}
        <button className="al-btn-back" onClick={() => navigate("/proprietaire/dashboard")}>
          <ArrowLeft size={15} />
          ← Retour au tableau de bord
        </button>

        {/* Title */}
        <h1 className="al-title">Nouveau locataire</h1>
        <p className="al-subtitle">Renseignez les informations du locataire pour l'ajouter à votre portefeuille</p>

        {/* Step indicators */}
        <div className="al-steps">
          {tabs.map((tab, i) => {
            const isActive = tab.key === activeTab;
            const isCompleted = i < tabIndex;
            return (
              <button
                key={tab.key}
                className={`al-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                <span className="al-step-dot" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ═══════════════ STEP 1: Informations personnelles ═══════════════ */}
        {activeTab === "infos" && (
          <div className="al-card">
            {/* Type de locataire */}
            <div className="al-field" style={{ maxWidth: 240, marginBottom: 20 }}>
              <label className="al-label">Type de locataire</label>
              <select name="tenantType" value={formData.tenantType} onChange={handleChange} className="al-input">
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>

            {/* Nom, Prénoms, Date de naissance */}
            <div className="al-grid-3">
              <div className="al-field">
                <label className="al-label">Nom</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="DUPONT" className={`al-input ${hasError("lastName") ? "error" : ""}`} />
                {hasError("lastName") && <span className="al-error-msg">{fieldErrors.lastName}</span>}
              </div>
              <div className="al-field">
                <label className="al-label">Prénoms</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" className={`al-input ${hasError("firstName") ? "error" : ""}`} />
                {hasError("firstName") && <span className="al-error-msg">{fieldErrors.firstName}</span>}
              </div>
              <div className="al-field">
                <label className="al-label">Date de naissance</label>
                <div className="al-input-icon">
                  <span className="al-icon"><Calendar size={15} /></span>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`al-input ${hasError("birthDate") ? "error" : ""}`} />
                </div>
                {hasError("birthDate") && <span className="al-error-msg">{fieldErrors.birthDate}</span>}
              </div>
            </div>

            {/* Lieu de naissance, Situation familiale, Téléphone */}
            <div className="al-grid-3">
              <div className="al-field">
                <label className="al-label">Lieu de naissance</label>
                <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} placeholder="Cotonou" className={`al-input ${hasError("birthPlace") ? "error" : ""}`} />
                {hasError("birthPlace") && <span className="al-error-msg">{fieldErrors.birthPlace}</span>}
              </div>
              <div className="al-field">
                <label className="al-label">Situation familiale</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="al-input">
                  <option value="single">Célibataire</option>
                  <option value="married">Marié(e)</option>
                  <option value="divorced">Divorcé(e)</option>
                  <option value="widowed">Veuf/Veuve</option>
                  <option value="pacs">PACS</option>
                </select>
              </div>
              <div className="al-field">
                <label className="al-label">Téléphone</label>
                <div className="al-input-icon">
                  <span className="al-icon"><Phone size={15} /></span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="01 00 00 00 00" className={`al-input ${hasError("phone") ? "error" : ""}`} />
                </div>
                {hasError("phone") && <span className="al-error-msg">{fieldErrors.phone}</span>}
              </div>
            </div>

            {/* Email, Adresse, Ville, Pays */}
            <div className="al-grid-4">
              <div className="al-field">
                <label className="al-label">Email</label>
                <div className="al-input-icon">
                  <span className="al-icon"><Mail size={15} /></span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jean.dupont@example.com" className={`al-input ${hasError("email") ? "error" : ""}`} />
                </div>
                {hasError("email") && <span className="al-error-msg">{fieldErrors.email}</span>}
              </div>
              <div className="al-field">
                <label className="al-label">Adresse</label>
                <div className="al-input-icon">
                  <span className="al-icon"><MapPin size={15} /></span>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 / 5 /890" className={`al-input ${hasError("address") ? "error" : ""}`} />
                </div>
                {hasError("address") && <span className="al-error-msg">{fieldErrors.address}</span>}
              </div>
              <div className="al-field">
                <label className="al-label">Ville</label>
                <select name="city" value={formData.city} onChange={handleChange} className="al-input">
                  <option value="Cotonou">Cotonou</option>
                  <option value="Porto-Novo">Porto-Novo</option>
                  <option value="Parakou">Parakou</option>
                  <option value="Abomey-Calavi">Abomey-Calavi</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="al-field">
                <label className="al-label">Pays</label>
                <select name="country" value={formData.country} onChange={handleChange} className="al-input">
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="France">France</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Contact d'urgence */}
            <div className="al-section-label">• Contact d'urgence</div>
            <div className="al-grid-3" style={{ marginBottom: 0 }}>
              <div className="al-field">
                <label className="al-label">Nom & Prénoms</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Jean Dupont" className="al-input" />
              </div>
              <div className="al-field">
                <label className="al-label">Téléphone</label>
                <div className="al-input-icon">
                  <span className="al-icon"><Phone size={15} /></span>
                  <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="01 00 00 00 00" className="al-input" />
                </div>
              </div>
            </div>
            <div className="al-grid-3" style={{ marginBottom: 16 }}>
              <div className="al-field">
                <label className="al-label">Email</label>
                <div className="al-input-icon">
                  <span className="al-icon"><Mail size={15} /></span>
                  <input type="email" name="emergencyContactEmail" value={formData.emergencyContactEmail} onChange={handleChange} placeholder="jean.dupont@example.com" className="al-input" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="al-field" style={{ marginBottom: 0 }}>
              <label className="al-label">Notes et commentaires</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Informations complémentaires sur le locataire..." className="al-input" />
            </div>

            {/* Actions */}
            <div className="al-actions">
              <button type="button" className="al-btn-next" onClick={goNext}>
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 2: Situation professionnelle ═══════════════ */}
        {activeTab === "pro" && (
          <div className="al-card">
            <div className="al-grid-3">
              <div className="al-field">
                <label className="al-label">Profession</label>
                <input type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="EX: Médecin" className={`al-input ${hasError("profession") ? "error" : ""}`} />
                {hasError("profession") && <span className="al-error-msg">{fieldErrors.profession}</span>}
              </div>
              <div className="al-field">
                <label className="al-label">Employeur</label>
                <input type="text" name="employer" value={formData.employer} onChange={handleChange} placeholder="Nom de l'employeur" className="al-input" />
              </div>
              <div className="al-field">
                <label className="al-label">Type de contrat</label>
                <select name="contractType" value={formData.contractType} onChange={handleChange} className="al-input">
                  <option value="">Sélectionnez un contrat</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="interim">Intérim</option>
                  <option value="independant">Indépendant</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="retraite">Retraité</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="al-grid-2">
              <div className="al-field">
                <label className="al-label">Revenu mensuel (FCFA)</label>
                <div className="al-input-prefix">
                  <span className="al-prefix">XOF</span>
                  <input type="text" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="al-input" />
                </div>
              </div>
              <div className="al-field">
                <label className="al-label">Revenu annuel (FCFA)</label>
                <div className="al-input-prefix">
                  <span className="al-prefix">XOF</span>
                  <input type="text" name="annualIncome" value={formData.annualIncome} onChange={handleChange} className="al-input" />
                </div>
              </div>
            </div>

            <div className="al-actions">
              <button type="button" className="al-btn-prev" onClick={goPrev}>Précédent</button>
              <button type="button" className="al-btn-next" onClick={goNext}>Suivant</button>
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 3: Garant ═══════════════ */}
        {activeTab === "garant" && (
          <div className="al-card">
            <div className="al-switch-row">
              <div className={`al-switch ${formData.hasGuarantor ? "on" : ""}`} onClick={toggleGuarantor}>
                <div className="al-switch-thumb" />
              </div>
              <span className="al-switch-label">Le locataire a-t-il un garant ?</span>
            </div>

            {formData.hasGuarantor && (
              <>
                <div className="al-grid-3">
                  <div className="al-field">
                    <label className="al-label">Nom et prénom</label>
                    <input type="text" name="guarantorName" value={formData.guarantorName} onChange={handleChange} placeholder="Nom et prénom du garant" className={`al-input ${hasError("guarantorName") ? "error" : ""}`} />
                    {hasError("guarantorName") && <span className="al-error-msg">{fieldErrors.guarantorName}</span>}
                  </div>
                  <div className="al-field">
                    <label className="al-label">Téléphone</label>
                    <div className="al-input-icon">
                      <span className="al-icon"><Phone size={15} /></span>
                      <input type="tel" name="guarantorPhone" value={formData.guarantorPhone} onChange={handleChange} placeholder="01 00 00 00 00" className={`al-input ${hasError("guarantorPhone") ? "error" : ""}`} />
                    </div>
                    {hasError("guarantorPhone") && <span className="al-error-msg">{fieldErrors.guarantorPhone}</span>}
                  </div>
                  <div className="al-field">
                    <label className="al-label">Email</label>
                    <div className="al-input-icon">
                      <span className="al-icon"><Mail size={15} /></span>
                      <input type="email" name="guarantorEmail" value={formData.guarantorEmail} onChange={handleChange} placeholder="garant@example.com" className={`al-input ${hasError("guarantorEmail") ? "error" : ""}`} />
                    </div>
                    {hasError("guarantorEmail") && <span className="al-error-msg">{fieldErrors.guarantorEmail}</span>}
                  </div>
                </div>

                <div className="al-grid-3">
                  <div className="al-field">
                    <label className="al-label">Profession du garant</label>
                    <input type="text" name="guarantorProfession" value={formData.guarantorProfession} onChange={handleChange} placeholder="EX: Médecin" className={`al-input ${hasError("guarantorProfession") ? "error" : ""}`} />
                    {hasError("guarantorProfession") && <span className="al-error-msg">{fieldErrors.guarantorProfession}</span>}
                  </div>
                  <div className="al-field">
                    <label className="al-label">Revenu mensuel (FCFA)</label>
                    <div className="al-input-prefix">
                      <span className="al-prefix">XOF</span>
                      <input type="text" name="guarantorMonthlyIncome" value={formData.guarantorMonthlyIncome} onChange={handleChange} placeholder="200.000" className="al-input" />
                    </div>
                  </div>
                  <div className="al-field">
                    <label className="al-label">Revenu annuel (FCFA)</label>
                    <div className="al-input-prefix">
                      <span className="al-prefix">XOF</span>
                      <input type="text" name="guarantorAnnualIncome" value={formData.guarantorAnnualIncome} onChange={handleChange} placeholder="200.000" className="al-input" />
                    </div>
                  </div>
                </div>

                <div className="al-grid-2">
                  <div className="al-field">
                    <label className="al-label">Adresse</label>
                    <input type="text" name="guarantorAddress" value={formData.guarantorAddress} onChange={handleChange} placeholder="Adresse complète du garant" className="al-input" />
                  </div>
                  <div className="al-field">
                    <label className="al-label">Date et Lieu de naissance</label>
                    <input type="text" name="guarantorBirthInfo" value={formData.guarantorBirthInfo} onChange={handleChange} placeholder="Date et lieu de naissance du garant" className="al-input" />
                  </div>
                </div>
              </>
            )}

            <div className="al-actions">
              <button type="button" className="al-btn-prev" onClick={goPrev}>Précédent</button>
              <button type="button" className="al-btn-next" onClick={goNext}>Suivant</button>
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 4: Documents ═══════════════ */}
        {activeTab === "documents" && (
          <div className="al-card">
            <div className="al-section-label" style={{ marginTop: 0 }}>Documents</div>

            <div className="al-field" style={{ maxWidth: 320, marginBottom: 20 }}>
              <select name="documentType" value={formData.documentType} onChange={handleChange} className="al-input">
                <option value="">Sélectionnez le type de documents</option>
                <option value="cni">Carte nationale d'identité</option>
                <option value="passeport">Passeport</option>
                <option value="permis">Permis de conduire</option>
                <option value="justificatif_domicile">Justificatif de domicile</option>
                <option value="bulletin_salaire">Bulletin de salaire</option>
                <option value="contrat_travail">Contrat de travail</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="al-section-label">Ajouter le fichier</div>
            <div className="al-upload-zone" onClick={() => fileInputRef.current?.click()}>
              <Camera size={28} color="#9ca3af" />
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.xls,.xlsx,.pdf,.gif,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: "none" }}
                multiple
              />
            </div>
            <p className="al-upload-hint">
              Formats acceptés: Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale: 15 Mo
            </p>

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {uploadedFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#374151", marginBottom: 4 }}>
                    <FileText size={14} />
                    <span>{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 2 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="al-actions">
              <button type="button" className="al-btn-prev" onClick={goPrev}>Précédent</button>
              <button type="button" className="al-btn-submit" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AjouterLocataire;
