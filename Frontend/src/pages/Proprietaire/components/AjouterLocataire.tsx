import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tenantService } from "@/services/api";
import {
  ArrowLeft,
  Save,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  User,
  MapPin,
  Briefcase,
  Home,
  X,
  ArrowRight,
  Euro,
  AlertCircle,
  CheckCircle2,
  Info,
  BadgeCheck,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

/**
 * ✅ EXACTEMENT ton composant (structure / largeur identiques)
 * ✅ PAS d'emojis
 * ✅ Même style & mêmes couleurs que ton exemple (667eea -> 764ba2 + accents vert)
 * ✅ Logique inchangée
 */

type TabKey = "infos" | "contact" | "pro" | "garant";
type ToastType = "success" | "error" | "info";

const styles = `
  :root{
    --gradA: #667eea;
    --gradB: #764ba2;
    --indigo: #4f46e5;
    --violet: #7c3aed;
    --emerald: #10b981;

    --ink: #0f172a;
    --muted: #64748b;
    --muted2:#94a3b8;

    --line: rgba(15,23,42,.10);
    --line2: rgba(15,23,42,.08);
    --shadow: 0 22px 70px rgba(0,0,0,.18);
  }

  .form-container {
    min-height: 100vh;
    background: #ffffff;
    padding: 2rem;
    position: relative;
  }

  /* ✅ fond discret moderne (mêmes couleurs) */
  .form-container::before{
    content:"";
    position: fixed;
    inset: 0;
    background:
      radial-gradient(900px 520px at 12% -8%, rgba(102,126,234,.16) 0%, rgba(102,126,234,0) 62%),
      radial-gradient(900px 520px at 92% 8%, rgba(118,75,162,.14) 0%, rgba(118,75,162,0) 64%),
      radial-gradient(700px 420px at 40% 110%, rgba(16,185,129,.10) 0%, rgba(16,185,129,0) 60%);
    pointer-events: none;
    z-index: -2;
  }

  .form-card {
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255,255,255,.92);
    border-radius: 22px;
    box-shadow: var(--shadow);
    overflow: hidden;
    border: 1px solid rgba(102,126,234,.18);
    position: relative;
    backdrop-filter: blur(10px);
  }

  /* ✅ micro texture (mêmes couleurs) */
  .form-card::before{
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

  .form-header {
    background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
    padding: 2.5rem;
    color: white;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  /* ✅ SVG décoratifs header */
  .header-art {
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

  .form-header h1 {
    font-size: 2rem;
    font-weight: 900;
    margin: 0 0 0.6rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    letter-spacing: -0.02em;
    position: relative;
    z-index: 1;
  }

  .header-row{
    display:flex;
    align-items:center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }

  .form-header p {
    margin: 0;
    opacity: 0.94;
    font-size: 1rem;
    font-weight: 650;
    position: relative;
    z-index: 1;
    max-width: 72ch;
  }

  .badge-row{
    display:flex;
    gap: .6rem;
    align-items:center;
    flex-wrap: wrap;
  }

  .pill{
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

  .form-body {
    padding: 2.5rem;
    position: relative;
    z-index: 1;
  }

  .section {
    margin-bottom: 2.5rem;
    background: rgba(255,255,255,.72);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.08);
    box-shadow: 0 10px 30px rgba(17,24,39,.06);
    backdrop-filter: blur(10px);
  }

  .section-title {
    font-size: 1.05rem;
    font-weight: 950;
    color: var(--ink);
    margin: 0 0 1.25rem 0;
    padding-bottom: 0.85rem;
    border-bottom: 2px solid rgba(102,126,234,.28);
    display: flex;
    align-items: center;
    gap: 0.6rem;
    letter-spacing: -0.01em;
  }

  .section-title .step{
    margin-left: auto;
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
  }

  .form-grid { display: grid; gap: 1.25rem; }
  .form-grid-2 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
  .form-grid-3 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }

  .form-group { display: flex; flex-direction: column; gap: 0.5rem; }

  .form-label {
    font-size: 0.85rem;
    font-weight: 900;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .required { color: #e11d48; }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 2px solid rgba(148,163,184,.35);
    border-radius: 12px;
    font-size: 1rem;
    color: var(--ink);
    background: rgba(255,255,255,.92);
    transition: all 0.2s ease;
    font-family: inherit;
    font-weight: 700;
    box-shadow: 0 2px 10px rgba(15,23,42,.04);
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: rgba(79,70,229,.75);
    box-shadow: 0 0 0 4px rgba(79,70,229,0.14);
  }

  .form-input::placeholder, .form-textarea::placeholder {
    color: #94a3b8;
    font-weight: 650;
  }

  .input-error{
    border-color: rgba(225,29,72,.72) !important;
    box-shadow: 0 0 0 4px rgba(225,29,72,.10) !important;
  }

  .field-error{
    display:flex;
    gap: 8px;
    align-items:flex-start;
    color: #be123c;
    font-weight: 900;
    font-size: .8rem;
    line-height: 1.2;
    margin-top: 2px;
  }

  .form-input-icon { position: relative; }
  .form-input-icon input, .form-input-icon textarea, .form-input-icon select { padding-left: 2.85rem; }

  .icon-wrapper {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
  }

  .form-textarea { min-height: 100px; resize: vertical; }

  .helper-text {
    font-size: 0.78rem;
    color: #64748b;
    margin-top: 0.25rem;
    font-weight: 650;
  }

  .switch-item { display: flex; align-items: center; gap: 0.75rem; }
  .switch {
    position: relative;
    width: 52px;
    height: 28px;
    background: rgba(148,163,184,.55);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.25s ease;
    border: 1px solid rgba(15,23,42,.10);
  }
  .switch.active { background: rgba(79,70,229,.85); }
  .switch-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: transform 0.25s ease;
    box-shadow: 0 8px 18px rgba(0,0,0,0.20);
  }
  .switch.active .switch-thumb { transform: translateX(24px); }
  .switch-label { font-size: 0.9rem; color: var(--ink); font-weight: 850; }

  .button{
    padding: 0.9rem 1.35rem;
    border-radius: 14px;
    font-weight: 950;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: inherit;
    white-space: nowrap;
  }
  .button:disabled{ opacity: .65; cursor:not-allowed; }

  .button-primary{
    background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
    color: #fff;
    box-shadow: 0 14px 30px rgba(79,70,229,.22);
  }
  .button-primary:hover:not(:disabled){
    transform: translateY(-1px);
    box-shadow: 0 18px 34px rgba(79,70,229,.28);
  }

  .button-secondary{
    background: rgba(255,255,255,.92);
    color: #4338ca;
    border: 2px solid rgba(67,56,202,.20);
  }
  .button-secondary:hover{ background: rgba(67,56,202,.06); }

  .button-danger{
    background: rgba(255,255,255,.92);
    color: #e11d48;
    border: 2px solid rgba(225,29,72,.18);
  }
  .button-danger:hover{ background: rgba(225,29,72,.06); }

  .top-actions{
    display:flex;
    justify-content: space-between;
    align-items:center;
    margin-bottom: 2rem;
    flex-wrap:wrap;
    gap: 1rem;
  }
  .top-actions-right{ display:flex; gap:.75rem; flex-wrap:wrap; }

  .bottom-actions{
    display:flex;
    justify-content:flex-end;
    gap: .75rem;
    padding-top: 1.5rem;
    border-top: 2px solid rgba(148,163,184,.35);
    flex-wrap:wrap;
  }

  /* ✅ tabs (mêmes couleurs) */
  .tab-nav{
    display:flex;
    gap: 1.2rem;
    border-bottom: 2px solid rgba(148,163,184,.35);
    margin-bottom: 2rem;
    overflow-x:auto;
    padding-bottom: .2rem;
  }

  .tab-button{
    padding: 0.95rem 0;
    border: none;
    background: transparent;
    font-size: .92rem;
    font-weight: 950;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    color: #64748b;
    white-space: nowrap;
    transition: color .15s ease, border-color .15s ease;
    display:flex;
    align-items:center;
    gap: .55rem;
  }

  .tab-button .tab-dot{
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(100,116,139,.45);
    box-shadow: 0 0 0 4px rgba(100,116,139,.12);
    flex: 0 0 auto;
  }

  .tab-button.active{
    color:#4338ca;
    border-color:#4338ca;
  }
  .tab-button.active .tab-dot{
    background: rgba(67,56,202,.95);
    box-shadow: 0 0 0 4px rgba(67,56,202,.18);
  }

  /* ✅ Toasts */
  .toast-wrap{
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 9999;
    display:flex;
    flex-direction: column;
    gap: 10px;
  }
  .toast{
    width: min(420px, calc(100vw - 32px));
    color: var(--ink);
    border-radius: 16px;
    padding: 12px 12px;
    border: 1px solid rgba(15,23,42,.10);
    box-shadow: 0 18px 44px rgba(0,0,0,.18);
    display:flex;
    align-items:flex-start;
    gap: 10px;
    backdrop-filter: blur(12px);
    background: rgba(255,255,255,.86);
  }
  .toast .t-title{ font-weight: 950; font-size: .9rem; margin:0; line-height: 1.2; }
  .toast .t-msg{ margin: 4px 0 0 0; opacity: .92; font-weight: 750; font-size: .82rem; }
  .toast .t-icon{ margin-top: 1px; flex: 0 0 auto; }
  .toast .t-close{
    margin-left: auto;
    background: rgba(15,23,42,.06);
    border: 1px solid rgba(15,23,42,.10);
    color: var(--ink);
    border-radius: 12px;
    padding: 6px;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
  }
  .toast.success{ border-color: rgba(16,185,129,.30); background: rgba(236,253,245,.92); }
  .toast.error{ border-color: rgba(244,63,94,.30); background: rgba(255,241,242,.92); }
  .toast.info{ border-color: rgba(99,102,241,.30); background: rgba(238,242,255,.92); }

  @media (max-width: 768px){
    .form-container{ padding: 1rem; }
    .form-header{ padding: 1.5rem; }
    .form-header h1{ font-size: 1.5rem; }
    .form-body{ padding: 1.25rem; }
    .section{ padding: 1.25rem; }
    .top-actions, .top-actions-right, .bottom-actions{ width: 100%; }
    .button{ flex: 1; justify-content:center; }
    .header-art .blob{ right:-240px; top:-260px; width: 740px; height: 740px; opacity:.85; }
    .header-art .ring{ left:-220px; bottom:-240px; width: 620px; height: 620px; opacity:.40; }
  }
`;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  profession: string;
  employer: string;
  annualIncome: string;
  maritalStatus: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
  hasGuarantor: boolean;
  guarantorName: string;
  guarantorPhone: string;
  guarantorEmail: string;
  guarantorAddress: string;
  guarantorProfession: string;
  guarantorIncome: string;
}

type FieldKey = keyof FormData;

export const AjouterLocataire: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("infos");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    birthPlace: "",
    address: "",
    city: "",
    zipCode: "",
    country: "France",
    profession: "",
    employer: "",
    annualIncome: "",
    maritalStatus: "single",
    emergencyContactName: "",
    emergencyContactPhone: "",
    notes: "",
    hasGuarantor: false,
    guarantorName: "",
    guarantorPhone: "",
    guarantorEmail: "",
    guarantorAddress: "",
    guarantorProfession: "",
    guarantorIncome: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<{ id: string; type: ToastType; title: string; message?: string }[]>([]);

  const pushToast = (type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, type, title, message }, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const clearErrors = () => {
    setGlobalError(null);
    setFieldErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete (next as any)[name];
      return next;
    });
    setGlobalError(null);
  };

  const toggleGuarantor = () => {
    setFormData((prev) => ({
      ...prev,
      hasGuarantor: !prev.hasGuarantor,
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (formData.hasGuarantor) {
        delete next.guarantorName;
        delete next.guarantorPhone;
        delete next.guarantorEmail;
        delete next.guarantorAddress;
        delete next.guarantorProfession;
        delete next.guarantorIncome;
      }
      return next;
    });
  };

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validateTab = (tab: TabKey) => {
    const next: Partial<Record<FieldKey, string>> = {};
    const req = (k: FieldKey, label: string) => {
      if (!String(formData[k] ?? "").trim()) next[k] = `${label} est requis.`;
    };

    if (tab === "infos") {
      req("firstName", "Prénom");
      req("lastName", "Nom");
      req("birthDate", "Date de naissance");
      req("birthPlace", "Lieu de naissance");
    }

    if (tab === "contact") {
      req("email", "Email");
      if (formData.email.trim() && !isEmail(formData.email.trim())) next.email = "Email invalide.";
      req("phone", "Téléphone");
      req("address", "Adresse");
      req("zipCode", "Code postal");
      req("city", "Ville");
      req("country", "Pays");
    }

    if (tab === "pro") {
      req("profession", "Profession");
    }

    if (tab === "garant") {
      if (formData.hasGuarantor) {
        req("guarantorName", "Nom du garant");
        req("guarantorPhone", "Téléphone du garant");
        req("guarantorEmail", "Email du garant");
        if (formData.guarantorEmail.trim() && !isEmail(formData.guarantorEmail.trim())) {
          next.guarantorEmail = "Email du garant invalide.";
        }
        req("guarantorProfession", "Profession du garant");
        req("guarantorIncome", "Revenu du garant");
        req("guarantorAddress", "Adresse du garant");
      }
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const goTab = (tab: TabKey) => setActiveTab(tab);

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.")) {
      navigate("/proprietaire");
    }
  };

  const FieldError = ({ name }: { name: FieldKey }) =>
    fieldErrors[name] ? (
      <div className="field-error">
        <AlertCircle size={16} />
        <span>{fieldErrors[name]}</span>
      </div>
    ) : null;

  const inputClass = (name: FieldKey, base: string) => `${base} ${fieldErrors[name] ? "input-error" : ""}`;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const ok = validateTab("infos") && validateTab("contact") && validateTab("pro") && validateTab("garant");

      if (!ok) {
        pushToast("error", "Champs manquants", "Merci de compléter les champs requis.");
        const errKeys = Object.keys(fieldErrors);
        if (errKeys.length) {
          const k = errKeys[0];
          if (["firstName", "lastName", "birthDate", "birthPlace"].includes(k)) setActiveTab("infos");
          else if (["email", "phone", "address", "zipCode", "city", "country"].includes(k)) setActiveTab("contact");
          else if (["profession"].includes(k)) setActiveTab("pro");
          else setActiveTab("garant");
        }
        setIsLoading(false);
        return;
      }

      const invitePayload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      };

      console.log('📋 FormData before sending:', formData);
      console.log('📞 Phone in formData:', formData.phone);
      console.log('📦 InvitePayload before sending:', invitePayload);
      console.log('📞 Phone in invitePayload:', invitePayload.phone);

      const response = await tenantService.inviteTenant(invitePayload);
      console.log("Réponse API inviteTenant :", response);

      pushToast("success", "Invitation envoyée", `Un email a été envoyé à ${formData.email.trim()} pour activer le compte.`);
      navigate("/proprietaire");
    } catch (error: any) {
      console.error("Erreur lors de l'invitation du locataire :", error);

      const apiMsg =
        error?.response?.data?.message || error?.message || "Une erreur est survenue lors de l'invitation du locataire.";

      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        const map: Record<string, FieldKey> = {
          first_name: "firstName",
          last_name: "lastName",
          email: "email",
          phone: "phone",
        };

        const next: Partial<Record<FieldKey, string>> = {};
        Object.keys(apiErrors).forEach((k) => {
          const frontKey = map[k] || (k as any);
          const msg = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : String(apiErrors[k]);
          if (frontKey && (frontKey as any in formData)) next[frontKey as FieldKey] = msg;
        });

        if (Object.keys(next).length) {
          setFieldErrors(next);
          pushToast("error", "Validation", "Corrige les champs en rouge.");
          const first = Object.keys(next)[0] as FieldKey;
          if (["firstName", "lastName", "birthDate", "birthPlace"].includes(first)) setActiveTab("infos");
          else if (["email", "phone", "address", "zipCode", "city", "country"].includes(first)) setActiveTab("contact");
          else if (["profession"].includes(first)) setActiveTab("pro");
          else setActiveTab("garant");
          return;
        }
      }

      setGlobalError(apiMsg);
      pushToast("error", "Erreur", apiMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toastIcon = useMemo(
    () => ({
      success: <CheckCircle2 className="t-icon" size={18} />,
      error: <AlertCircle className="t-icon" size={18} />,
      info: <Info className="t-icon" size={18} />,
    }),
    []
  );

  return (
    <>
      <style>{styles}</style>

      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {toastIcon[t.type]}
            <div>
              <p className="t-title">{t.title}</p>
              {t.message ? <p className="t-msg">{t.message}</p> : null}
            </div>
            <button
              type="button"
              className="t-close"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div className="header-art" aria-hidden="true">
              <svg className="blob" viewBox="0 0 600 600" fill="none">
                <defs>
                  <linearGradient id="h1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="rgba(255,255,255,.65)" />
                    <stop offset="1" stopColor="rgba(255,255,255,.08)" />
                  </linearGradient>
                </defs>
                <path
                  d="M420 70C500 110 560 190 560 290C560 420 460 520 320 540C190 560 70 490 50 360C30 240 110 140 240 90C310 62 360 44 420 70Z"
                  fill="url(#h1)"
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
                    id="h2"
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
                <circle cx="240" cy="240" r="210" fill="url(#h2)" />
              </svg>
            </div>

            <div className="header-row">
              <div>
                <h1>
                  <UserPlus size={32} />
                  Nouveau locataire
                </h1>
                <p>Renseignez les informations du locataire pour l&apos;ajouter à votre portefeuille</p>
              </div>

              <div className="badge-row">
                <span className="pill">
                  <Sparkles size={16} />
                  Formulaire moderne
                </span>
                <span className="pill">
                  <ShieldCheck size={16} />
                  Validation & feedback
                </span>
                <span className="pill">
                  <BadgeCheck size={16} />
                  Invitation email
                </span>
              </div>
            </div>
          </div>

          <div className="form-body">
            <div className="top-actions">
              <button className="button button-secondary" type="button" onClick={() => navigate("/proprietaire")}>
                <ArrowLeft size={16} />
                Retour au tableau de bord
              </button>
              <div className="top-actions-right">
                <button className="button button-danger" type="button" onClick={handleCancel}>
                  <X size={16} />
                  Annuler
                </button>
                <button className="button button-primary" type="button" onClick={() => handleSubmit()} disabled={isLoading}>
                  <Save size={16} />
                  {isLoading ? "Enregistrement..." : "Enregistrer le locataire"}
                </button>
              </div>
            </div>

            {globalError && (
              <div
                style={{
                  marginBottom: "1rem",
                  background: "rgba(255,241,242,.92)",
                  border: "1px solid rgba(244,63,94,.30)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  color: "#9f1239",
                  fontWeight: 950,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <AlertCircle size={18} />
                <span>{globalError}</span>
              </div>
            )}

            <div className="tab-nav">
              <button type="button" className={`tab-button ${activeTab === "infos" ? "active" : ""}`} onClick={() => goTab("infos")}>
                <span className="tab-dot" />
                Informations personnelles
              </button>
              <button type="button" className={`tab-button ${activeTab === "contact" ? "active" : ""}`} onClick={() => goTab("contact")}>
                <span className="tab-dot" />
                Coordonnées
              </button>
              <button type="button" className={`tab-button ${activeTab === "pro" ? "active" : ""}`} onClick={() => goTab("pro")}>
                <span className="tab-dot" />
                Situation professionnelle
              </button>
              <button type="button" className={`tab-button ${activeTab === "garant" ? "active" : ""}`} onClick={() => goTab("garant")}>
                <span className="tab-dot" />
                Garant
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === "infos" && (
                <div className="section">
                  <h2 className="section-title">
                    <User size={20} />
                    Informations personnelles
                    <span className="step">
                      Étape 1
                      <ChevronRight size={14} />
                      4
                    </span>
                  </h2>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        Prénom <span className="required">*</span>
                      </label>
                      <input className={inputClass("firstName", "form-input")} type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" />
                      <FieldError name="firstName" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Nom <span className="required">*</span>
                      </label>
                      <input className={inputClass("lastName", "form-input")} type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" />
                      <FieldError name="lastName" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Date de naissance <span className="required">*</span>
                      </label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <Calendar size={16} />
                        </div>
                        <input className={inputClass("birthDate", "form-input")} type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                      </div>
                      <FieldError name="birthDate" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Lieu de naissance <span className="required">*</span>
                      </label>
                      <input className={inputClass("birthPlace", "form-input")} type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} placeholder="Ville, Pays" />
                      <FieldError name="birthPlace" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Situation familiale</label>
                      <select className="form-select" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                        <option value="single">Célibataire</option>
                        <option value="married">Marié(e)</option>
                        <option value="divorced">Divorcé(e)</option>
                        <option value="widowed">Veuf/Veuve</option>
                        <option value="pacs">PACS</option>
                        <option value="concubinage">Concubinage</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: "1.5rem" }}>
                    <h3 className="form-label" style={{ marginBottom: "0.75rem" }}>
                      Contact d&apos;urgence
                    </h3>
                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Nom et prénom</label>
                        <input className="form-input" type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Nom et prénom" />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Téléphone</label>
                        <div className="form-input-icon">
                          <div className="icon-wrapper">
                            <Phone size={16} />
                          </div>
                          <input className="form-input" type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="06 12 34 56 78" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "1.5rem" }}>
                    <label className="form-label">Notes et commentaires</label>
                    <textarea className="form-textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Informations complémentaires sur le locataire..." rows={3} />
                  </div>

                  <div className="bottom-actions" style={{ borderTop: "none", paddingTop: "1.5rem" }}>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        if (!validateTab("infos")) {
                          pushToast("error", "Champs manquants", "Complète les champs requis.");
                          return;
                        }
                        setActiveTab("contact");
                      }}
                    >
                      Suivant : Coordonnées
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="section">
                  <h2 className="section-title">
                    <Mail size={20} />
                    Coordonnées
                    <span className="step">
                      Étape 2
                      <ChevronRight size={14} />
                      4
                    </span>
                  </h2>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        Email <span className="required">*</span>
                      </label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <Mail size={16} />
                        </div>
                        <input className={inputClass("email", "form-input")} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jean.dupont@exemple.com" />
                      </div>
                      <FieldError name="email" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Téléphone <span className="required">*</span>
                      </label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <Phone size={16} />
                        </div>
                        <input className={inputClass("phone", "form-input")} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="06 12 34 56 78" />
                      </div>
                      <FieldError name="phone" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Adresse <span className="required">*</span>
                      </label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <MapPin size={16} />
                        </div>
                        <input className={inputClass("address", "form-input")} type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Rue de la Paix" />
                      </div>
                      <FieldError name="address" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Code postal <span className="required">*</span>
                      </label>
                      <input className={inputClass("zipCode", "form-input")} type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="75000" />
                      <FieldError name="zipCode" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Ville <span className="required">*</span>
                      </label>
                      <input className={inputClass("city", "form-input")} type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Paris" />
                      <FieldError name="city" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Pays <span className="required">*</span>
                      </label>
                      <input className={inputClass("country", "form-input")} type="text" name="country" value={formData.country} onChange={handleChange} placeholder="France" />
                      <FieldError name="country" />
                    </div>
                  </div>

                  <div className="bottom-actions" style={{ borderTop: "none", paddingTop: "1.5rem" }}>
                    <button type="button" className="button button-secondary" onClick={() => setActiveTab("infos")}>
                      <ArrowLeft size={16} />
                      Précédent
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        if (!validateTab("contact")) {
                          pushToast("error", "Champs manquants", "Complète les champs requis.");
                          return;
                        }
                        setActiveTab("pro");
                      }}
                    >
                      Suivant : Situation professionnelle
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "pro" && (
                <div className="section">
                  <h2 className="section-title">
                    <Briefcase size={20} />
                    Situation professionnelle
                    <span className="step">
                      Étape 3
                      <ChevronRight size={14} />
                      4
                    </span>
                  </h2>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        Profession <span className="required">*</span>
                      </label>
                      <input className={inputClass("profession", "form-input")} type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="Ex: Développeur web" />
                      <FieldError name="profession" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Employeur</label>
                      <input className="form-input" type="text" name="employer" value={formData.employer} onChange={handleChange} placeholder="Nom de l'entreprise" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Revenu annuel (FCFA)</label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <Euro size={16} />
                        </div>
                        <input className="form-input" type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} placeholder="45000" min="0" step="0.01" />
                      </div>
                      <p className="helper-text">Optionnel</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Type de contrat</label>
                      <select className="form-select" name="contractType" onChange={() => {}}>
                        <option value="">Sélectionner un type de contrat</option>
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

                  <div className="bottom-actions" style={{ borderTop: "none", paddingTop: "1.5rem" }}>
                    <button type="button" className="button button-secondary" onClick={() => setActiveTab("contact")}>
                      <ArrowLeft size={16} />
                      Précédent
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        if (!validateTab("pro")) {
                          pushToast("error", "Champs manquants", "Complète les champs requis.");
                          return;
                        }
                        setActiveTab("garant");
                      }}
                    >
                      Suivant : Garant
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "garant" && (
                <div className="section">
                  <h2 className="section-title">
                    <User size={20} />
                    Garant
                    <span className="step">
                      Étape 4
                      <ChevronRight size={14} />
                      4
                    </span>
                  </h2>

                  <div className="switch-item" style={{ marginBottom: "1.5rem" }}>
                    <div className={`switch ${formData.hasGuarantor ? "active" : ""}`} onClick={toggleGuarantor}>
                      <div className="switch-thumb" />
                    </div>
                    <span className="switch-label">Le locataire a-t-il un garant ?</span>
                  </div>

                  {formData.hasGuarantor && (
                    <div
                      style={{
                        background: "rgba(99,102,241,.08)",
                        padding: "1.5rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(99,102,241,.18)",
                        marginBottom: "1.5rem",
                        boxShadow: "0 10px 30px rgba(99,102,241,.08)",
                      }}
                    >
                      <h3 className="form-label" style={{ marginBottom: "1rem" }}>
                        Informations du garant
                      </h3>

                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label className="form-label">
                            Nom et prénom <span className="required">*</span>
                          </label>
                          <input className={inputClass("guarantorName", "form-input")} type="text" name="guarantorName" value={formData.guarantorName} onChange={handleChange} placeholder="Nom et prénom du garant" />
                          <FieldError name="guarantorName" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Téléphone <span className="required">*</span>
                          </label>
                          <div className="form-input-icon">
                            <div className="icon-wrapper">
                              <Phone size={16} />
                            </div>
                            <input className={inputClass("guarantorPhone", "form-input")} type="tel" name="guarantorPhone" value={formData.guarantorPhone} onChange={handleChange} placeholder="06 12 34 56 78" />
                          </div>
                          <FieldError name="guarantorPhone" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Email <span className="required">*</span>
                          </label>
                          <div className="form-input-icon">
                            <div className="icon-wrapper">
                              <Mail size={16} />
                            </div>
                            <input className={inputClass("guarantorEmail", "form-input")} type="email" name="guarantorEmail" value={formData.guarantorEmail} onChange={handleChange} placeholder="garant@exemple.com" />
                          </div>
                          <FieldError name="guarantorEmail" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Profession <span className="required">*</span>
                          </label>
                          <input className={inputClass("guarantorProfession", "form-input")} type="text" name="guarantorProfession" value={formData.guarantorProfession} onChange={handleChange} placeholder="Profession du garant" />
                          <FieldError name="guarantorProfession" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Revenu annuel (FCFA) <span className="required">*</span>
                          </label>
                          <div className="form-input-icon">
                            <div className="icon-wrapper">
                              <Euro size={16} />
                            </div>
                            <input className={inputClass("guarantorIncome", "form-input")} type="number" name="guarantorIncome" value={formData.guarantorIncome} onChange={handleChange} placeholder="60000" min="0" step="0.01" />
                          </div>
                          <FieldError name="guarantorIncome" />
                        </div>

                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                          <label className="form-label">
                            Adresse <span className="required">*</span>
                          </label>
                          <input className={inputClass("guarantorAddress", "form-input")} type="text" name="guarantorAddress" value={formData.guarantorAddress} onChange={handleChange} placeholder="Adresse complète du garant" />
                          <FieldError name="guarantorAddress" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bottom-actions" style={{ borderTop: "none", paddingTop: "1.5rem" }}>
                    <button type="button" className="button button-secondary" onClick={() => setActiveTab("pro")}>
                      <ArrowLeft size={16} />
                      Précédent
                    </button>

                    <button type="button" className="button button-secondary" onClick={() => setActiveTab("infos")}>
                      <Home size={16} />
                      Retour au début
                    </button>

                    <button type="submit" className="button button-primary" disabled={isLoading}>
                      <Save size={16} />
                      {isLoading ? "Enregistrement..." : "Enregistrer le locataire"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AjouterLocataire;
