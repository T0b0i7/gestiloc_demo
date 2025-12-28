import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText, Loader2, AlertTriangle, X } from "lucide-react";

import {
  propertyService,
  tenantService,
  leaseService,
  type Property,
  type TenantIndexResponse,
} from "@/services/api";

// Styles réutilisés
const styles = `
  .form-container { min-height: 100vh; background:#fff; padding:2rem; }
  .form-card { max-width:1200px; margin:0 auto; background:#fff; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.3); overflow:hidden; }
  .form-header { background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:2.5rem; color:#fff; }
  .form-header h1{ font-size:2rem; font-weight:700; margin:0 0 .5rem 0; display:flex; align-items:center; gap:.75rem; }
  .form-header p{ margin:0; opacity:.9; font-size:1rem; }

  .form-body{ padding:2.5rem; }

  .section{ margin-bottom:2.5rem; background:#f8f9fa; padding:2rem; border-radius:12px; border:1px solid #e9ecef; }
  .section-title{ font-size:1.25rem; font-weight:600; color:#2d3748; margin:0 0 1.5rem 0; padding-bottom:.75rem; border-bottom:2px solid #667eea; display:flex; align-items:center; gap:.5rem; }

  .form-grid{ display:grid; gap:1.5rem; }
  .form-grid-2{ grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); }

  .form-group{ display:flex; flex-direction:column; gap:.5rem; }
  .form-label{ font-size:.875rem; font-weight:600; color:#4a5568; display:flex; align-items:center; gap:.25rem; }
  .required{ color:#e53e3e; }

  .form-input,.form-select,.form-textarea{
    width:100%; padding:.75rem 1rem; border:2px solid #e2e8f0; border-radius:8px;
    font-size:1rem; color:#2d3748; background:#fff; transition:all .2s ease; font-family:inherit;
  }
  .form-input:focus,.form-select:focus,.form-textarea:focus{
    outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,.1);
  }
  .form-input::placeholder,.form-textarea::placeholder{ color:#a0aec0; }
  .form-textarea{ min-height:100px; resize:vertical; }

  .top-actions{ display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
  .top-actions-right{ display:flex; gap:.75rem; flex-wrap:wrap; }

  .bottom-actions{ display:flex; justify-content:flex-end; gap:.75rem; padding-top:2rem; border-top:2px solid #e2e8f0; flex-wrap:wrap; }

  .button{
    padding:.75rem 1.5rem; border-radius:8px; font-weight:600; font-size:.875rem;
    cursor:pointer; transition:all .2s ease; border:none; display:inline-flex; align-items:center; gap:.5rem; font-family:inherit;
  }
  .button:disabled{ opacity:.6; cursor:not-allowed; }

  .button-primary{ background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; box-shadow:0 4px 12px rgba(102,126,234,.4); }
  .button-primary:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 6px 20px rgba(102,126,234,.5); }

  .button-secondary{ background:#fff; color:#667eea; border:2px solid #667eea; }
  .button-secondary:hover{ background:#f7fafc; }

  .button-danger{ background:#fff; color:#e53e3e; border:2px solid #feb2b2; }
  .button-danger:hover{ background:#fff5f5; }

  /* ✅ Banner user-friendly (pas de details techniques) */
  .banner{
    border-radius:12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.25rem;
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 12px;
    border: 1px solid rgba(102,126,234,.25);
    background: rgba(102,126,234,.08);
    color:#2d3748;
  }
  .banner-danger{ border-color:#fed7d7; background:#fff5f5; color:#742a2a; }
  .banner-success{ border-color:#c6f6d5; background:#f0fff4; color:#22543d; }
  .banner-title{ font-weight:800; display:flex; align-items:center; gap:10px; }
  .banner-text{ margin-top: 4px; font-size:.95rem; font-weight:600; opacity:.9; }
  .banner-close{ background:transparent; border:none; cursor:pointer; color:inherit; padding:.2rem; border-radius:8px; }
  .banner-close:hover{ background: rgba(0,0,0,0.06); }

  /* ✅ Erreur champ (simple) */
  .field-error{
    margin-top: 6px;
    border-radius: 8px;
    border: 1px solid #fed7d7;
    background: #fff5f5;
    color: #c53030;
    padding: 8px 10px;
    font-size: 0.85rem;
    font-weight: 700;
  }

  @media (max-width:768px){
    .form-container{ padding:1rem; }
    .form-header{ padding:1.5rem; }
    .form-header h1{ font-size:1.5rem; }
    .form-body{ padding:1.5rem; }
    .section{ padding:1.5rem; }
    .top-actions,.top-actions-right,.bottom-actions{ width:100%; }
    .button{ flex:1; justify-content:center; }
  }
`;

type PropertyOption = { id: number; label: string; suggestedRent?: number | null };
type TenantOption = { id: number; label: string };

interface FormData {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rent: string;
  deposit: string;
  type: "nu" | "meuble";
  status: "pending" | "active" | "terminated";
  details: string;
}

interface BackendErrors {
  [field: string]: string[];
}

type ApiErr = {
  response?: { status?: number; data?: any };
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
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";

  const d: any = err?.response?.data;
  const backendMsg = (typeof d === "string" ? d : null) || d?.message || d?.error || err?.message || "";
  const clean = String(backendMsg || "").trim();
  if (clean && !looksTechnical(clean)) return clean;

  return fallback;
}

/** ✅ On garde seulement des messages “humains” (pas de property_id etc.) */
function friendlyFieldLabel(field: string) {
  const f = field.toLowerCase();

  if (f.includes("property")) return "Bien";
  if (f.includes("tenant")) return "Locataire";
  if (f.includes("start")) return "Date de début";
  if (f.includes("end")) return "Date de fin";
  if (f.includes("rent")) return "Loyer";
  if (f.includes("deposit")) return "Dépôt";
  if (f.includes("type")) return "Type de bail";
  if (f.includes("status")) return "Statut";
  if (f.includes("terms") || f.includes("details")) return "Détails";

  return "Champ";
}

/** ✅ Transforme errors backend -> messages courts par champ, + liste “propre” */
function toUserErrors(errs: BackendErrors) {
  // mapping backend -> keys front
  const mapped: BackendErrors = {};

  Object.entries(errs || {}).forEach(([k, msgs]) => {
    const key = k;
    const list = Array.isArray(msgs) ? msgs : [String(msgs)];
    mapped[key] = list.map((m) => String(m));
  });

  return mapped;
}

export const NouvelleLocation: React.FC = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [apiErrors, setApiErrors] = useState<BackendErrors | null>(null);

  // ✅ 1 seul banner “humain” (pas de détails techniques)
  const [banner, setBanner] = useState<{ kind: "error" | "success" | "info"; title: string; text?: string } | null>(
    null
  );

  const [formData, setFormData] = useState<FormData>({
    propertyId: "",
    tenantId: "",
    startDate: "",
    endDate: "",
    rent: "",
    deposit: "",
    type: "nu",
    status: "active",
    details: "",
  });

  // refs focus
  const propertyRef = useRef<HTMLSelectElement | null>(null);
  const tenantRef = useRef<HTMLSelectElement | null>(null);
  const startRef = useRef<HTMLInputElement | null>(null);
  const rentRef = useRef<HTMLInputElement | null>(null);
  const depositRef = useRef<HTMLInputElement | null>(null);

  const clearFieldError = (field: string) => {
    setApiErrors((prev) => {
      if (!prev?.[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const fieldError = (field: string) => apiErrors?.[field]?.[0] || "";

  const focusFirstError = (errs: BackendErrors) => {
    // on check aussi les clés backend
    if (errs.property_id || errs.propertyId) propertyRef.current?.focus();
    else if (errs.tenant_id || errs.tenantId) tenantRef.current?.focus();
    else if (errs.start_date || errs.startDate) startRef.current?.focus();
    else if (errs.rent_amount || errs.rent) rentRef.current?.focus();
    else if (errs.deposit) depositRef.current?.focus();
  };

  // Chargement listes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingLists(true);
        setBanner(null);

        const propsRes = await propertyService.listProperties();
        const propsArray: Property[] = propsRes.data ?? [];

        setProperties(
          propsArray.map((p) => ({
            id: p.id,
            label: `${p.address}${p.city ? `, ${p.city}` : ""}`.trim(),
            suggestedRent: p.rent_amount ? Number(p.rent_amount) : null,
          }))
        );

        const tenantsRes: TenantIndexResponse = await tenantService.listTenants();
        setTenants(
          (tenantsRes.tenants ?? []).map((t) => ({
            id: t.id,
            label: `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || t.email || `Locataire #${t.id}`,
          }))
        );
      } catch (e: any) {
        console.error(e);
        const msg = normalizeApiError(e as ApiErr, "Impossible de charger les données.");
        setBanner({ kind: "error", title: "Impossible de charger", text: msg });
      } finally {
        setIsLoadingLists(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBanner(null);

    // clear erreurs front/back associées
    clearFieldError(name);
    if (name === "propertyId") clearFieldError("property_id");
    if (name === "tenantId") clearFieldError("tenant_id");
    if (name === "startDate") clearFieldError("start_date");
    if (name === "endDate") clearFieldError("end_date");
    if (name === "rent") clearFieldError("rent_amount");

    setFormData((prev) => {
      const updated = { ...prev, [name]: value } as FormData;

      // pré-remplir loyer si vide
      if (name === "propertyId" && !prev.rent) {
        const selected = properties.find((p) => p.id === Number(value ?? "0"));
        if (selected?.suggestedRent) updated.rent = String(selected.suggestedRent);
      }

      return updated;
    });
  };

  // ✅ validation client => erreurs “humaines”
  const validateClient = (): BackendErrors => {
    const errs: BackendErrors = {};

    if (!formData.propertyId) errs.property_id = ["Choisis un bien."];
    if (!formData.tenantId) errs.tenant_id = ["Choisis un locataire."];
    if (!formData.startDate) errs.start_date = ["Choisis une date de début."];

    const rentN = Number(formData.rent);
    if (!formData.rent || Number.isNaN(rentN) || rentN < 0) errs.rent_amount = ["Saisis un loyer valide."];

    const depN = Number(formData.deposit);
    if (!formData.deposit || Number.isNaN(depN) || depN < 0) errs.deposit = ["Saisis un dépôt valide."];

    if (formData.endDate && formData.startDate) {
      const sd = new Date(formData.startDate);
      const ed = new Date(formData.endDate);
      if (sd.toString() !== "Invalid Date" && ed.toString() !== "Invalid Date" && ed < sd) {
        errs.end_date = ["La date de fin doit être après la date de début."];
      }
    }

    return errs;
  };

  // ✅ liste courte “propre” (pas de property_id)
  const summaryList = useMemo(() => {
    if (!apiErrors) return [];
    const entries = Object.entries(apiErrors).filter(([, msgs]) => (msgs || []).length > 0);
    // on déduplique par label
    const labels = entries.map(([k]) => friendlyFieldLabel(k));
    return Array.from(new Set(labels));
  }, [apiErrors]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setApiErrors(null);
    setBanner(null);

    // validation client
    const clientErrs = validateClient();
    if (Object.keys(clientErrs).length > 0) {
      setApiErrors(clientErrs);
      setBanner({
        kind: "error",
        title: "Formulaire incomplet",
        text: "Merci de compléter les champs obligatoires.",
      });
      focusFirstError(clientErrs);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        property_id: Number(formData.propertyId),
        tenant_id: Number(formData.tenantId),
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        rent_amount: Number(formData.rent),
        deposit: formData.deposit ? Number(formData.deposit) : null,
        type: formData.type,
        status: formData.status || "active",
        terms: formData.details ? [formData.details] : [],
      };

      await leaseService.createLease(payload as any);

      setBanner({ kind: "success", title: "✅ Contrat créé", text: "Le bail a été créé avec succès." });
      navigate("/proprietaire");
    } catch (e: any) {
      console.error(e);
      const err = e as ApiErr;
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 422 && data?.errors) {
        const errs = toUserErrors(data.errors as BackendErrors);
        setApiErrors(errs);

        setBanner({
          kind: "error",
          title: "Informations à corriger",
          text: "Certaines informations ne sont pas valides. Vérifie les champs en rouge.",
        });

        focusFirstError(errs);
        return;
      }

      const msg = normalizeApiError(err, "Une erreur est survenue lors de la création du bail.");
      setBanner({ kind: "error", title: "Impossible de créer", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.")) {
      navigate("/proprietaire");
    }
  };

  // Mapping erreurs backend -> UI
  const propertyErr = fieldError("property_id") || fieldError("propertyId");
  const tenantErr = fieldError("tenant_id") || fieldError("tenantId");
  const startErr = fieldError("start_date") || fieldError("startDate");
  const endErr = fieldError("end_date") || fieldError("endDate");
  const rentErr = fieldError("rent_amount") || fieldError("rent");
  const depositErr = fieldError("deposit");
  const typeErr = fieldError("type");
  const statusErr = fieldError("status");
  const detailsErr = fieldError("terms") || fieldError("details");

  return (
    <>
      <style>{styles}</style>

      <div className="form-container">
        <div className="form-card">
          {/* Header */}
          <div className="form-header">
            <h1>
              <FileText size={32} />
              Nouveau contrat de location
            </h1>
            <p>Créez un nouveau contrat entre un bien et un locataire</p>
          </div>

          <div className="form-body">
            {/* Top actions */}
            <div className="top-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => navigate("/proprietaire")}
              >
                <ArrowLeft size={16} />
                Retour au tableau de bord
              </button>

              <div className="top-actions-right">
                <button
                  className="button button-danger"
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>

                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting || isLoadingLists}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSubmitting ? "Création en cours..." : "Créer le contrat"}
                </button>
              </div>
            </div>

            {/* ✅ Banner propre */}
            {banner && (
              <div
                className={[
                  "banner",
                  banner.kind === "error" ? "banner-danger" : "",
                  banner.kind === "success" ? "banner-success" : "",
                ].join(" ")}
              >
                <div>
                  <div className="banner-title">
                    {banner.kind === "error" ? <AlertTriangle size={18} /> : <CheckIcon />}
                    <span>{banner.title}</span>
                  </div>

                  {banner.text ? <div className="banner-text">{banner.text}</div> : null}

                  {/* ✅ Résumé simple (pas de property_id etc.) */}
                  {banner.kind === "error" && summaryList.length > 0 ? (
                    <div className="banner-text" style={{ marginTop: 8 }}>
                      À vérifier : <strong>{summaryList.join(" • ")}</strong>
                    </div>
                  ) : null}
                </div>

                <button className="banner-close" type="button" onClick={() => setBanner(null)} aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
              <div className="section">
                <h2 className="section-title">
                  <FileText size={20} />
                  Informations de location
                </h2>

                <div className="form-grid form-grid-2">
                  {/* Bien */}
                  <div className="form-group">
                    <label className="form-label">
                      Bien à louer <span className="required">*</span>
                    </label>

                    <select
                      ref={propertyRef}
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      className="form-select"
                      required
                      disabled={isLoadingLists}
                    >
                      {isLoadingLists ? (
                        <option value="">Chargement des biens en cours...</option>
                      ) : (
                        <>
                          <option value="">Sélectionner un bien</option>
                          {properties.map((bien) => (
                            <option key={bien.id} value={bien.id.toString()}>
                              {bien.label}
                              {bien.suggestedRent ? ` - ${bien.suggestedRent} FCFA/mois` : ""}
                            </option>
                          ))}
                        </>
                      )}
                    </select>

                    {propertyErr ? <div className="field-error">{propertyErr}</div> : null}
                  </div>

                  {/* Locataire */}
                  <div className="form-group">
                    <label className="form-label">
                      Locataire <span className="required">*</span>
                    </label>

                    <select
                      ref={tenantRef}
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      className="form-select"
                      required
                      disabled={isLoadingLists}
                    >
                      {isLoadingLists ? (
                        <option value="">Chargement des locataires en cours...</option>
                      ) : tenants.length === 0 ? (
                        <option value="">Aucun locataire confirmé pour le moment</option>
                      ) : (
                        <>
                          <option value="">Sélectionner un locataire</option>
                          {tenants.map((locataire) => (
                            <option key={locataire.id} value={locataire.id.toString()}>
                              {locataire.label}
                            </option>
                          ))}
                        </>
                      )}
                    </select>

                    {tenantErr ? <div className="field-error">{tenantErr}</div> : null}
                  </div>

                  {/* Date de début */}
                  <div className="form-group">
                    <label className="form-label">
                      Date de début <span className="required">*</span>
                    </label>

                    <input
                      ref={startRef}
                      className="form-input"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />

                    {startErr ? <div className="field-error">{startErr}</div> : null}
                  </div>

                  {/* Date de fin */}
                  <div className="form-group">
                    <label className="form-label">Date de fin (facultatif)</label>

                    <input
                      className="form-input"
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                    />

                    {endErr ? <div className="field-error">{endErr}</div> : null}
                  </div>

                  {/* Loyer */}
                  <div className="form-group">
                    <label className="form-label">
                      Loyer mensuel (FCFA) <span className="required">*</span>
                    </label>

                    <input
                      ref={rentRef}
                      className="form-input"
                      type="number"
                      name="rent"
                      value={formData.rent}
                      onChange={handleChange}
                      placeholder="850"
                      min="0"
                      step="0.01"
                      required
                    />

                    {rentErr ? <div className="field-error">{rentErr}</div> : null}
                  </div>

                  {/* Dépôt */}
                  <div className="form-group">
                    <label className="form-label">
                      Dépôt de garantie (FCFA) <span className="required">*</span>
                    </label>

                    <input
                      ref={depositRef}
                      className="form-input"
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      placeholder="850"
                      min="0"
                      step="0.01"
                      required
                    />

                    {depositErr ? <div className="field-error">{depositErr}</div> : null}
                  </div>

                  {/* Type de bail */}
                  <div className="form-group">
                    <label className="form-label">
                      Type de bail <span className="required">*</span>
                    </label>

                    <select name="type" value={formData.type} onChange={handleChange} className="form-select" required>
                      <option value="nu">Bail nu</option>
                      <option value="meuble">Bail meublé</option>
                    </select>

                    {typeErr ? <div className="field-error">{typeErr}</div> : null}
                  </div>

                  {/* Statut */}
                  <div className="form-group">
                    <label className="form-label">
                      Statut du bail <span className="required">*</span>
                    </label>

                    <select name="status" value={formData.status} onChange={handleChange} className="form-select" required>
                      <option value="pending">En attente</option>
                      <option value="active">Actif</option>
                      <option value="terminated">Terminé</option>
                    </select>

                    {statusErr ? <div className="field-error">{statusErr}</div> : null}
                  </div>

                  {/* Détails */}
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Détails / conditions particulières</label>

                    <textarea
                      className="form-textarea"
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      placeholder="Ex : Charges comprises, interdiction de fumer, etc."
                    />

                    {detailsErr ? <div className="field-error">{detailsErr}</div> : null}

                    <small style={{ fontSize: "0.8rem", color: "#718096" }}>
                      Ces informations seront envoyées dans le champ <code>terms</code> du bail.
                    </small>
                  </div>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="bottom-actions">
                <button type="button" className="button button-danger" onClick={handleCancel} disabled={isSubmitting}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary" disabled={isSubmitting || isLoadingLists}>
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSubmitting ? "Création en cours..." : "Créer le contrat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// petit icône inline
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default NouvelleLocation;
