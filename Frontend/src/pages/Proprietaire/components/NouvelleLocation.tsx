import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText } from "lucide-react";

import {
  propertyService,
  tenantService,
  leaseService,
  type Property,
  type TenantIndexResponse,
} from "@/services/api";

// Styles réutilisés
const styles = `
  .form-container {
    min-height: 100vh;
    background: #ffffff;
    padding: 2rem;
  }
  
  .form-card {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  
  .form-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2.5rem;
    color: white;
  }
  
  .form-header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .form-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
  }
  
  .form-body {
    padding: 2.5rem;
  }
  
  .section {
    margin-bottom: 2.5rem;
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid #e9ecef;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #667eea;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .form-grid {
    display: grid;
    gap: 1.5rem;
  }
  
  .form-grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4a5568;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .required {
    color: #e53e3e;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    color: #2d3748;
    background: white;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .form-input::placeholder,
  .form-textarea::placeholder {
    color: #a0aec0;
  }
  
  .form-textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .top-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .top-actions-right {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .bottom-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 2rem;
    border-top: 2px solid #e2e8f0;
    flex-wrap: wrap;
  }
  
  .button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: inherit;
  }
  
  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .button-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .button-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }
  
  .button-secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }
  
  .button-secondary:hover {
    background: #f7fafc;
  }
  
  .button-danger {
    background: white;
    color: #e53e3e;
    border: 2px solid #feb2b2;
  }
  
  .button-danger:hover {
    background: #fff5f5;
  }
  
  .error-box {
    border-radius: 8px;
    border: 1px solid #fed7d7;
    background: #fff5f5;
    color: #c53030;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  
  .error-box ul {
    margin: 0.5rem 0 0 1.25rem;
    padding: 0;
  }
  
  @media (max-width: 768px) {
    .form-container {
      padding: 1rem;
    }
    
    .form-header {
      padding: 1.5rem;
    }
    
    .form-header h1 {
      font-size: 1.5rem;
    }
    
    .form-body {
      padding: 1.5rem;
    }
    
    .section {
      padding: 1.5rem;
    }
    
    .top-actions,
    .top-actions-right,
    .bottom-actions {
      width: 100%;
    }
    
    .button {
      flex: 1;
      justify-content: center;
    }
  }
`;

type PropertyOption = {
  id: number;
  label: string;
  suggestedRent?: number | null;
};

type TenantOption = {
  id: number;
  label: string;
};

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

export const NouvelleLocation: React.FC = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<BackendErrors | null>(null);

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

  // Chargement des biens + locataires du bailleur
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingLists(true);

        // Biens du bailleur (ton backend filtre déjà par bailleur)
        const propsRes = await propertyService.listProperties();
        const propsArray: Property[] = propsRes.data ?? [];

        const mappedProps: PropertyOption[] = propsArray.map((p) => ({
          id: p.id,
          label: `${p.address}${p.city ? `, ${p.city}` : ""}`.trim(),
          suggestedRent: p.rent_amount ? Number(p.rent_amount) : null,
        }));

        setProperties(mappedProps);

        // Locataires du bailleur
        const tenantsRes: TenantIndexResponse =
          await tenantService.listTenants();

        const mappedTenants: TenantOption[] = (tenantsRes.tenants ?? []).map(
          (t) => ({
            id: t.id,
            label:
              `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() ||
              t.email ||
              `Locataire #${t.id}`,
          })
        );

        setTenants(mappedTenants);
      } catch (error) {
        console.error("Erreur lors du chargement biens/locataires:", error);
      } finally {
        setIsLoadingLists(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

      setFormData((prev) => {
      const updated: FormData = {
        ...prev,
        [name]: value,
      };

      // Si on change de bien, on pré-remplit le loyer si vide
      if (name === "propertyId" && !prev.rent) {
        const selected = properties.find(
          (p) => p.id === Number(value ?? "0")
        );
        if (selected?.suggestedRent) {
          updated.rent = String(selected.suggestedRent);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setApiErrors(null);

    try {
      const payload = {
        property_id: Number(formData.propertyId),
        tenant_id: Number(formData.tenantId),
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        rent_amount: Number(formData.rent),
        deposit: formData.deposit ? Number(formData.deposit) : null,
        type: formData.type, // "nu" | "meuble"
        status: formData.status || "active",
        terms: formData.details ? [formData.details] : [], // array pour StoreLeaseRequest
      };

      console.log("Payload envoyé à /leases:", payload);

      await leaseService.createLease(payload);

      alert("Le bail a été créé avec succès !");
      navigate("/proprietaire");
    } catch (error: unknown) {
      console.error("Erreur API createLease:", error);

      const backend = error as { errors?: BackendErrors; message?: string };
      if (backend?.errors) {
        setApiErrors(backend.errors);
      }

      alert(
        backend?.message ||
          "Une erreur est survenue lors de la création du bail."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues."
      )
    ) {
      navigate("/proprietaire");
    }
  };

  const hasBackendErrors = apiErrors && Object.keys(apiErrors).length > 0;

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
                  <Save size={16} />
                  {isSubmitting
                    ? "Création en cours..."
                    : "Créer le contrat"}
                </button>
              </div>
            </div>

            {/* Erreurs backend */}
            {hasBackendErrors && (
              <div className="error-box">
                <div>Merci de corriger les erreurs suivantes :</div>
                <ul>
                  {Object.entries(apiErrors!).map(([field, messages]) =>
                    (messages as string[]).map((msg, i) => (
                      <li key={`${field}-${i}`}>
                        <strong>{field}</strong> : {msg}
                      </li>
                    ))
                  )}
                </ul>
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
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      className="form-select"
                      required
                      disabled={isLoadingLists}
                    >
                      {isLoadingLists ? (
                        <option value="">
                          Chargement des biens en cours...
                        </option>
                      ) : (
                        <>
                          <option value="">Sélectionner un bien</option>
                          {properties.map((bien) => (
                            <option
                              key={bien.id}
                              value={bien.id.toString()}
                            >
                              {bien.label}
                              {bien.suggestedRent
                                ? ` - ${bien.suggestedRent} €/mois`
                                : ""}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Locataire */}
                  <div className="form-group">
                    <label className="form-label">
                      Locataire <span className="required">*</span>
                    </label>
                    <select
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      className="form-select"
                      required
                      disabled={isLoadingLists}
                    >
                      {isLoadingLists ? (
                        <option value="">
                          Chargement des locataires en cours...
                        </option>
                      ) : tenants.length === 0 ? (
                        <option value="">
                          Aucun locataire confirmé pour le moment
                        </option>
                      ) : (
                        <>
                          <option value="">Sélectionner un locataire</option>
                          {tenants.map((locataire) => (
                            <option
                              key={locataire.id}
                              value={locataire.id.toString()}
                            >
                              {locataire.label}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Date de début */}
                  <div className="form-group">
                    <label className="form-label">
                      Date de début <span className="required">*</span>
                    </label>
                    <input
                      className="form-input"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Date de fin */}
                  <div className="form-group">
                    <label className="form-label">
                      Date de fin (facultatif)
                    </label>
                    <input
                      className="form-input"
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Loyer */}
                  <div className="form-group">
                    <label className="form-label">
                      Loyer mensuel (€) <span className="required">*</span>
                    </label>
                    <input
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
                  </div>

                  {/* Dépôt */}
                  <div className="form-group">
                    <label className="form-label">
                      Dépôt de garantie (€) <span className="required">*</span>
                    </label>
                    <input
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
                  </div>

                  {/* Type de bail */}
                  <div className="form-group">
                    <label className="form-label">
                      Type de bail <span className="required">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="nu">Bail nu</option>
                      <option value="meuble">Bail meublé</option>
                    </select>
                  </div>

                  {/* Statut */}
                  <div className="form-group">
                    <label className="form-label">
                      Statut du bail <span className="required">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="pending">En attente</option>
                      <option value="active">Actif</option>
                      <option value="terminated">Terminé</option>
                    </select>
                  </div>

                  {/* Détails */}
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">
                      Détails / conditions particulières
                    </label>
                    <textarea
                      className="form-textarea"
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      placeholder="Ex : Charges comprises, interdiction de fumer, etc."
                    />
                    <small style={{ fontSize: "0.8rem", color: "#718096" }}>
                      Ces informations seront envoyées dans le champ{" "}
                      <code>terms</code> (tableau de conditions) du bail.
                    </small>
                  </div>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="bottom-actions">
                <button
                  type="button"
                  className="button button-danger"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isSubmitting || isLoadingLists}
                >
                  <Save size={16} />
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

export default NouvelleLocation;
