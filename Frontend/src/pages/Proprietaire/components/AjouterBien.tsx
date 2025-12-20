import React, { useState } from 'react';
import { ArrowLeft, Save, Home, Building2, MapPin, Ruler, Euro, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { propertyService, uploadService } from '@/services/api';

// Styles intégrés (inchangés)
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
  
  .form-grid-4 {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  
  .form-input-icon input {
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
  
  .photos-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .photo-preview {
    position: relative;
    width: 100px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: #edf2f7;
  }
  
  .photo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .photo-remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    border: none;
    border-radius: 999px;
    width: 20px;
    height: 20px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
  }
  
  .upload-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 999px;
    border: 1px dashed #cbd5e0;
    cursor: pointer;
    color: #4a5568;
    font-size: 0.85rem;
    background: #fff;
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
  type: string;
  name: string;
  description: string;
  address: string;
  city: string;
  district: string;
  zip_code: string;
  surface: string;
  rent_amount: string;
  status: string;
  reference_code: string;
}

export const AjouterBien = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: 'apartment',
    name: '',
    description: '',
    address: '',
    city: '',
    district: '',
    zip_code: '',
    surface: '',
    rent_amount: '',
    status: 'available',
    reference_code: '',
  });

  // 🔹 Gestion des photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setPhotos(fileArray);

    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // 1️⃣ Upload des photos si présentes
      let uploadedPhotoUrls: string[] = [];

      if (photos.length > 0) {
        for (const file of photos) {
          const res = await uploadService.uploadPhoto(file);
          uploadedPhotoUrls.push(res.url);
        }
      }

      // 2️⃣ Préparer le payload pour la création du bien
      const payload: CreatePropertyPayload = {
        type: formData.type,
        // Pour le backend (validation)
  title: formData.name.trim(),

  // Pour être aligné avec le modèle Property (name dans $fillable)
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
        room_count: null,
        bedroom_count: null,
        bathroom_count: null,

        rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
        charges_amount: null,
        status: formData.status,

        reference_code: formData.reference_code || null,
        amenities: [],
        photos: uploadedPhotoUrls.length ? uploadedPhotoUrls : null,
        meta: null,
      };

      const property = await propertyService.createProperty(payload);

      console.log('Property created:', property);
      alert('✅ Le bien a été ajouté avec succès !');
      navigate('/proprietaire/biens');
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du bien:", error);

      // Erreurs de validation Laravel
      if (error?.errors) {
        const messages = Object.values(error.errors).flat().join('\n');
        alert('❌ Erreur de validation :\n' + messages);
      } else {
        const errorMessage =
          error?.message || "Une erreur est survenue lors de l'ajout du bien.";
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      navigate('/proprietaire/biens');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <h1>
              <Building2 size={32} />
              Nouveau bien immobilier
            </h1>
            <p>Remplissez les informations de votre bien pour l'ajouter à votre portefeuille</p>
          </div>

          <div className="form-body">
            <div className="top-actions">
              <button className="button button-secondary" onClick={handleCancel}>
                <ArrowLeft size={16} />
                Retour au tableau de bord
              </button>
              <div className="top-actions-right">
                <button className="button button-danger" onClick={handleCancel}>
                  <X size={16} />
                  Annuler
                </button>
                <button
                  className="button button-primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  <Save size={16} />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer le bien'}
                </button>
              </div>
            </div>

            <div>
              {/* Section Informations générales */}
              <div className="section">
                <h2 className="section-title">
                  <Home size={20} />
                  Informations générales
                </h2>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Type de bien <span className="required">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="apartment">Appartement</option>
                      <option value="house">Maison</option>
                      <option value="office">Bureau</option>
                      <option value="commercial">Local commercial</option>
                      <option value="parking">Parking</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Statut <span className="required">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="available">Disponible</option>
                      <option value="rented">Loué</option>
                      <option value="maintenance">En rénovation</option>
                      <option value="sold">Vendu</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Titre du bien <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Appartement T3 centre-ville"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Surface (m²) <span className="required">*</span>
                    </label>
                    <div className="form-input-icon">
                      <div className="icon-wrapper">
                        <Ruler size={16} />
                      </div>
                      <input
                        type="number"
                        name="surface"
                        value={formData.surface}
                        onChange={handleChange}
                        placeholder="Ex: 65"
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez le bien en détail..."
                    className="form-textarea"
                  />
                  <p className="helper-text">
                    Décrivez les points forts du bien, son emplacement, ses spécificités, etc.
                  </p>
                </div>
              </div>

              {/* Section Adresse */}
              <div className="section">
                <h2 className="section-title">
                  <MapPin size={20} />
                  Adresse
                </h2>
                <div className="form-grid form-grid-3">
                  <div className="form-group">
                    <label className="form-label">
                      Adresse <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="N° et nom de la rue"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Code postal <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      placeholder="Ex: 75000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Ville <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ex: Paris"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quartier/Arrondissement</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="Ex: Le Marais, 4ème"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Section Photos */}
              <div className="section">
                <h2 className="section-title">
                  <ImageIcon size={20} />
                  Photos du bien
                </h2>
                <div className="form-group">
                  <label className="upload-label">
                    <ImageIcon size={16} />
                    <span>Ajouter des photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p className="helper-text">
                    Vous pouvez sélectionner plusieurs photos (JPG, PNG, WEBP, max 5 Mo chacune).
                  </p>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="photos-grid">
                    {photoPreviews.map((src, index) => (
                      <div className="photo-preview" key={index}>
                        <img src={src} alt={`Photo ${index + 1}`} />
                        <button
                          type="button"
                          className="photo-remove-btn"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Financier */}
              <div className="section">
                <h2 className="section-title">
                  <Euro size={20} />
                  Informations financières
                </h2>
                <div className="form-grid form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Loyer mensuel par défaut (FCFA)</label>
                    <div className="form-input-icon">
                      <div className="icon-wrapper">
                        <Euro size={16} />
                      </div>
                      <input
                        type="number"
                        name="rent_amount"
                        value={formData.rent_amount}
                        onChange={handleChange}
                        placeholder="0,00"
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Référence</label>
                    <input
                      type="text"
                      name="reference_code"
                      value={formData.reference_code}
                      onChange={handleChange}
                      placeholder="Ex: APP-123"
                      className="form-input"
                      pattern="[-A-Z0-9]+"
                      title="Lettres majuscules, chiffres et tirets uniquement"
                    />
                    <p className="helper-text">
                      Une référence unique pour identifier ce bien (optionnel)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bottom-actions">
                <button className="button button-danger" onClick={handleCancel}>
                  <X size={16} />
                  Annuler
                </button>
                <button
                  className="button button-primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  <Save size={16} />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer le bien'}
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
