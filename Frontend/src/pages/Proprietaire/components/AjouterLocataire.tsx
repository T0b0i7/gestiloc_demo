import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '@/services/api';
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
} from 'lucide-react';

// Styles réutilisés depuis AjouterBien (+ ajout pour les onglets)
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
  
  .form-grid-3 {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  
  .form-input-icon {
    position: relative;
  }
  
  .form-input-icon input,
  .form-input-icon textarea,
  .form-input-icon select {
    padding-left: 2.75rem;
  }
  
  .icon-wrapper {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    pointer-events: none;
  }
  
  .form-textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .helper-text {
    font-size: 0.75rem;
    color: #718096;
    margin-top: 0.25rem;
  }
  
  .switch-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .switch-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .switch {
    position: relative;
    width: 48px;
    height: 24px;
    background: #cbd5e0;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .switch.active {
    background: #667eea;
  }
  
  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .switch.active .switch-thumb {
    transform: translateX(24px);
  }
  
  .switch-label {
    font-size: 0.875rem;
    color: #4a5568;
    font-weight: 500;
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
  
  /* Onglets */
  .tab-nav {
    display: flex;
    gap: 1.5rem;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 2rem;
    overflow-x: auto;
  }
  
  .tab-button {
    padding: 0.75rem 0;
    border: none;
    background: transparent;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    color: #718096;
    white-space: nowrap;
  }
  
  .tab-button.active {
    color: #667eea;
    border-color: #667eea;
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

export const AjouterLocataire: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'infos' | 'contact' | 'pro' | 'garant'>('infos');

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    profession: '',
    employer: '',
    annualIncome: '',
    maritalStatus: 'single',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
    hasGuarantor: false,
    guarantorName: '',
    guarantorPhone: '',
    guarantorEmail: '',
    guarantorAddress: '',
    guarantorProfession: '',
    guarantorIncome: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setIsLoading(true);

  try {
    // Toutes les infos détaillées (pour un futur endpoint si tu veux les persister côté Tenant.meta)
    const tenantData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      birth_date: formData.birthDate,
      birth_place: formData.birthPlace,
      address: `${formData.address}, ${formData.zipCode} ${formData.city}, ${formData.country}`,
      profession: formData.profession,
      employer: formData.employer,
      annual_income: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
      marital_status: formData.maritalStatus,
      emergency_contact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
      },
      notes: formData.notes,
      guarantor: formData.hasGuarantor
        ? {
            name: formData.guarantorName,
            phone: formData.guarantorPhone,
            email: formData.guarantorEmail,
            address: formData.guarantorAddress,
            profession: formData.guarantorProfession,
            income: formData.guarantorIncome ? parseFloat(formData.guarantorIncome) : null,
          }
        : null,
    };

    console.log('Données complètes du locataire (front) :', tenantData);

    // Payload minimal pour /tenants/invite
    const invitePayload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
    };

    const response = await tenantService.inviteTenant(invitePayload);
    console.log('Réponse API inviteTenant :', response);

    alert(
      `Invitation envoyée à ${formData.email}.
Le locataire recevra un email pour créer son mot de passe et activer son compte.`
    );

    navigate('/proprietaire');
  } catch (error: any) {
    console.error("Erreur lors de l'invitation du locataire :", error);

    const msg =
      error?.message ||
      error?.error ||
      (error?.errors && Object.values(error.errors)[0]?.[0]) ||
      "Une erreur est survenue lors de l'invitation du locataire.";

    alert(msg);
  } finally {
    setIsLoading(false);
  }
};


  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      navigate('/proprietaire');
    }
  };

  const toggleGuarantor = () => {
    setFormData(prev => ({
      ...prev,
      hasGuarantor: !prev.hasGuarantor,
    }));
  };

  return (
    <>
      <style>{styles}</style>
      <div className="form-container">
        <div className="form-card">
          {/* Header identique au style AjouterBien */}
          <div className="form-header">
            <h1>
              <UserPlus size={32} />
              Nouveau locataire
            </h1>
            <p>Renseignez les informations du locataire pour l&apos;ajouter à votre portefeuille</p>
          </div>

          <div className="form-body">
            {/* Top actions identiques */}
            <div className="top-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => navigate('/proprietaire')}
              >
                <ArrowLeft size={16} />
                Retour au tableau de bord
              </button>
              <div className="top-actions-right">
                <button
                  className="button button-danger"
                  type="button"
                  onClick={handleCancel}
                >
                  <X size={16} />
                  Annuler
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isLoading}
                >
                  <Save size={16} />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer le locataire'}
                </button>
              </div>
            </div>

            {/* Navigation par onglets */}
            <div className="tab-nav">
              <button
                type="button"
                className={`tab-button ${activeTab === 'infos' ? 'active' : ''}`}
                onClick={() => setActiveTab('infos')}
              >
                Informations personnelles
              </button>
              <button
                type="button"
                className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Coordonnées
              </button>
              <button
                type="button"
                className={`tab-button ${activeTab === 'pro' ? 'active' : ''}`}
                onClick={() => setActiveTab('pro')}
              >
                Situation professionnelle
              </button>
              <button
                type="button"
                className={`tab-button ${activeTab === 'garant' ? 'active' : ''}`}
                onClick={() => setActiveTab('garant')}
              >
                Garant
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Onglet Informations personnelles */}
              {activeTab === 'infos' && (
                <div className="section">
                  <h2 className="section-title">
                    <User size={20} />
                    Informations personnelles
                  </h2>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        Prénom <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Jean"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Nom <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Dupont"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Date de naissance <span className="required">*</span>
                      </label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <Calendar size={16} />
                        </div>
                        <input
                          className="form-input"
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Lieu de naissance <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleChange}
                        placeholder="Ville, Pays"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Situation familiale</label>
                      <select
                        className="form-select"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                      >
                        <option value="single">Célibataire</option>
                        <option value="married">Marié(e)</option>
                        <option value="divorced">Divorcé(e)</option>
                        <option value="widowed">Veuf/Veuve</option>
                        <option value="pacs">PACS</option>
                        <option value="concubinage">Concubinage</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 className="form-label" style={{ marginBottom: '0.75rem' }}>
                      Personne à prévenir en cas d&apos;urgence
                    </h3>
                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Nom et prénom</label>
                        <input
                          className="form-input"
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          placeholder="Nom et prénom"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Téléphone</label>
                        <div className="form-input-icon">
                          <div className="icon-wrapper">
                            <Phone size={16} />
                          </div>
                          <input
                            className="form-input"
                            type="tel"
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                            placeholder="06 12 34 56 78"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Notes et commentaires</label>
                    <textarea
                      className="form-textarea"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Informations complémentaires sur le locataire..."
                      rows={3}
                    />
                  </div>

                  <div className="bottom-actions" style={{ borderTop: 'none', paddingTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setActiveTab('contact')}
                    >
                      Suivant : Coordonnées
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet Coordonnées */}
              {activeTab === 'contact' && (
                <div className="section">
                  <h2 className="section-title">
                    <Mail size={20} />
                    Coordonnées
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
                        <input
                          className="form-input"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jean.dupont@exemple.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Téléphone <span className="required">*</span>
                      </label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <Phone size={16} />
                        </div>
                        <input
                          className="form-input"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="06 12 34 56 78"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Adresse <span className="required">*</span>
                      </label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <MapPin size={16} />
                        </div>
                        <input
                          className="form-input"
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="123 Rue de la Paix"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Code postal <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="75000"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Ville <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Paris"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Pays <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="France"
                        required
                      />
                    </div>
                  </div>

                  <div className="bottom-actions" style={{ borderTop: 'none', paddingTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setActiveTab('infos')}
                    >
                      <ArrowLeft size={16} />
                      Précédent
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setActiveTab('pro')}
                    >
                      Suivant : Situation professionnelle
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet Situation professionnelle */}
              {activeTab === 'pro' && (
                <div className="section">
                  <h2 className="section-title">
                    <Briefcase size={20} />
                    Situation professionnelle
                  </h2>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        Profession <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        placeholder="Ex: Développeur web"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Employeur</label>
                      <input
                        className="form-input"
                        type="text"
                        name="employer"
                        value={formData.employer}
                        onChange={handleChange}
                        placeholder="Nom de l'entreprise"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Revenu annuel (FCFA)</label>
                      <div className="form-input-icon">
                        <div className="icon-wrapper">
                          <Euro size={16} />
                        </div>
                        <input
                          className="form-input"
                          type="number"
                          name="annualIncome"
                          value={formData.annualIncome}
                          onChange={handleChange}
                          placeholder="45000"
                          min="0"
                          step="0.01"
                        />
                      </div>
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

                  <div className="bottom-actions" style={{ borderTop: 'none', paddingTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setActiveTab('contact')}
                    >
                      <ArrowLeft size={16} />
                      Précédent
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setActiveTab('garant')}
                    >
                      Suivant : Garant
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet Garant */}
              {activeTab === 'garant' && (
                <div className="section">
                  <h2 className="section-title">
                    <User size={20} />
                    Garant
                  </h2>

                  <div className="switch-item" style={{ marginBottom: '1.5rem' }}>
                    <div
                      className={`switch ${formData.hasGuarantor ? 'active' : ''}`}
                      onClick={toggleGuarantor}
                    >
                      <div className="switch-thumb" />
                    </div>
                    <span className="switch-label">Le locataire a-t-il un garant ?</span>
                  </div>

                  {formData.hasGuarantor && (
                    <div
                      style={{
                        background: '#edf2f7',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <h3 className="form-label" style={{ marginBottom: '1rem' }}>
                        Informations du garant
                      </h3>

                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label className="form-label">
                            Nom et prénom <span className="required">*</span>
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            name="guarantorName"
                            value={formData.guarantorName}
                            onChange={handleChange}
                            placeholder="Nom et prénom du garant"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Téléphone <span className="required">*</span>
                          </label>
                          <div className="form-input-icon">
                            <div className="icon-wrapper">
                              <Phone size={16} />
                            </div>
                            <input
                              className="form-input"
                              type="tel"
                              name="guarantorPhone"
                              value={formData.guarantorPhone}
                              onChange={handleChange}
                              placeholder="06 12 34 56 78"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Email <span className="required">*</span>
                          </label>
                          <div className="form-input-icon">
                            <div className="icon-wrapper">
                              <Mail size={16} />
                            </div>
                            <input
                              className="form-input"
                              type="email"
                              name="guarantorEmail"
                              value={formData.guarantorEmail}
                              onChange={handleChange}
                              placeholder="garant@exemple.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Profession <span className="required">*</span>
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            name="guarantorProfession"
                            value={formData.guarantorProfession}
                            onChange={handleChange}
                            placeholder="Profession du garant"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Revenu annuel (FCFA) <span className="required">*</span>
                          </label>
                          <div className="form-input-icon">
                            <div className="icon-wrapper">
                              <Euro size={16} />
                            </div>
                            <input
                              className="form-input"
                              type="number"
                              name="guarantorIncome"
                              value={formData.guarantorIncome}
                              onChange={handleChange}
                              placeholder="60000"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">
                            Adresse <span className="required">*</span>
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            name="guarantorAddress"
                            value={formData.guarantorAddress}
                            onChange={handleChange}
                            placeholder="Adresse complète du garant"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bottom-actions" style={{ borderTop: 'none', paddingTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setActiveTab('pro')}
                    >
                      <ArrowLeft size={16} />
                      Précédent
                    </button>

                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setActiveTab('infos')}
                    >
                      <Home size={16} />
                      Retour au début
                    </button>

                    <button
                      type="submit"
                      className="button button-primary"
                      disabled={isLoading}
                    >
                      <Save size={16} />
                      {isLoading ? 'Enregistrement...' : 'Enregistrer le locataire'}
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
