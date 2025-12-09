import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  MapPin,
  Euro,
  Image as ImageIcon,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import {
  propertyService,
  Property,
  PaginatedResponse,
  uploadService,
} from '@/services/api';

const styles = `
  .properties-page {
    min-height: 100vh;
    background: #f3f4f6;
    padding: 2rem;
  }

  .properties-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .properties-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .properties-title-block {
    flex: 1;
    min-width: 220px;
  }

  .properties-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
  }

  .properties-subtitle {
    margin-top: 0.25rem;
    color: #6b7280;
    font-size: 0.95rem;
  }

  .properties-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 260px;
  }

  .search-wrapper {
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 0.65rem 1rem 0.65rem 2.5rem;
    border-radius: 999px;
    border: 1px solid #d1d5db;
    background: white;
    font-size: 0.9rem;
    color: #111827;
    outline: none;
    transition: all 0.15s ease;
  }

  .search-input::placeholder {
    color: #9ca3af;
  }

  .search-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .search-icon {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }

  .button {
    padding: 0.75rem 1.25rem;
    border-radius: 999px;
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-family: inherit;
    justify-content: center;
  }

  .button-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  }

  .button-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5);
  }

  .properties-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .property-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .property-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
  }

  .property-image-wrapper {
    position: relative;
    width: 100%;
    height: 180px;
    background: linear-gradient(135deg, #e5e7eb, #d1d5db);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .property-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .property-status-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    background: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .status-available { background: #16a34a; }
  .status-rented { background: #2563eb; }
  .status-maintenance { background: #ea580c; }
  .status-off_market { background: #6b7280; }

  .property-body {
    padding: 1.25rem 1.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .property-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .property-type {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    font-weight: 600;
  }

  .property-location {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: #4b5563;
    margin-top: 0.25rem;
  }

  .property-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: #4b5563;
  }

  .property-rent {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-weight: 700;
    color: #111827;
  }

  .property-rent span {
    font-size: 0.8rem;
    font-weight: 500;
    color: #6b7280;
  }

  .property-surface {
    font-size: 0.85rem;
    color: #4b5563;
  }

  .property-footer {
    padding: 0.85rem 1.5rem 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .property-photos-count {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .badge-muted {
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
    background: #f3f4f6;
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .empty-state,
  .error-state,
  .loading-state {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
    border: 1px solid #e5e7eb;
    margin-top: 1rem;
  }

  .empty-title,
  .error-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111827;
  }

  .empty-text,
  .error-text {
    font-size: 0.9rem;
    color: #6b7280;
    margin-bottom: 1.25rem;
  }

  .empty-text-margin {
    margin-top: 0.75rem;
  }

  .loading-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .properties-page {
      padding: 1.25rem;
    }
    .properties-actions {
      width: 100%;
    }
  }

  /* ========= MODALE EDIT BIEN ========= */

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
  }

  .modal-dialog {
    background: white;
    border-radius: 18px;
    max-width: 640px;
    width: 100%;
    box-shadow: 0 25px 70px rgba(15,23,42,0.4);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #111827;
  }

  .modal-section-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    font-weight: 600;
  }

  .modal-close-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    color: #6b7280;
    border-radius: 999px;
    padding: 0.25rem;
  }

  .modal-close-btn:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .modal-body {
    padding: 1rem 1.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-photo-wrapper {
    position: relative;
    border-radius: 0.75rem;
    overflow: hidden;
    background: #e5e7eb;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-photo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .modal-photo-overlay {
    position: absolute;
    inset: auto 0 0;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(to top, rgba(15,23,42,0.85), transparent);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-size: 0.8rem;
  }

  .modal-photo-upload-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: white;
    color: #111827;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .modal-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #4b5563;
  }

 .modal-input,
.modal-select {
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  background-color: #ffffff;   /* fond blanc */
  color: #111827;              /* texte noir */
}

.modal-input::placeholder {
  color: #9ca3af;              /* gris léger pour le placeholder */
}


  .modal-input:focus,
  .modal-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.15);
  }

  .modal-footer {
    padding: 0.85rem 1.5rem 1.1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .btn-ghost {
    border-radius: 999px;
    padding: 0.5rem 1rem;
    border: none;
    background: #f3f4f6;
    font-size: 0.85rem;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
  }

  .btn-ghost:hover {
    background: #e5e7eb;
  }

  .btn-primary-modal {
    border-radius: 999px;
    padding: 0.5rem 1rem;
    border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    font-size: 0.85rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(99,102,241,0.4);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .btn-primary-modal:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-primary-modal:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(99,102,241,0.5);
  }

  .hidden-input {
    display: none;
  }

  @media (max-width: 640px) {
    .modal-dialog {
      margin: 0 1rem;
    }
    .modal-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const formatPrice = (value: string | null) => {
  if (!value) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €';
};

const formatSurface = (value: string | null) => {
  if (!value) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `${num.toLocaleString('fr-FR')} m²`;
};

const statusLabel: Record<string, string> = {
  available: 'Disponible',
  rented: 'Loué',
  maintenance: 'En maintenance',
  off_market: 'Retiré du marché',
};

const typeLabel: Record<string, string> = {
  apartment: 'Appartement',
  house: 'Maison',
  office: 'Bureau',
  commercial: 'Local commercial',
  parking: 'Parking',
  land: 'Terrain',
  other: 'Autre',
};

export const MesBiens: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<Property> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Modale / édition
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form modale
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editSurface, setEditSurface] = useState('');
  const [editRent, setEditRent] = useState('');
  const [editStatus, setEditStatus] = useState<string>('available');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await propertyService.listProperties();
        setData(response);
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Erreur chargement propriétés:', err);
        setError(
          error?.message ||
            "Impossible de charger vos biens. Veuillez réessayer dans quelques instants."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const properties = useMemo(() => data?.data ?? [], [data]);

  // 🔎 Filtre côté frontend : nom, adresse, ville, référence
  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const term = search.toLowerCase();

    return (properties ?? []).filter((p) => {
      return (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.address && p.address.toLowerCase().includes(term)) ||
        (p.city && p.city.toLowerCase().includes(term)) ||
        (p.reference_code && p.reference_code.toLowerCase().includes(term))
      );
    });
  }, [properties, search]);

  const handleAddProperty = () => {
    navigate('/ajouter-bien');
  };

  const handleOpenProperty = (property: Property) => {
    setSelectedProperty(property);
    setEditName(property.name || '');
    setEditAddress(property.address || '');
    setEditCity(property.city || '');
    setEditZip(property.zip_code || '');
    setEditDistrict(property.district || '');
    setEditSurface(property.surface || '');
    setEditRent(property.rent_amount || '');
    setEditStatus(property.status || 'available');

    const photos = property.photos || [];
    setEditPhotos(photos);
    setPhotoPreview(photos.length ? photos[0] : null);

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handlePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsUploadingPhoto(true);
      const res = await uploadService.uploadPhoto(file);
      const url = res.url;

      setEditPhotos((prev) => {
        const next = [...(prev || [])];
        if (next.length === 0) next.push(url);
        else next[0] = url;
        return next;
      });

      setPhotoPreview(url);
    } catch (err) {
      console.error('Erreur upload photo:', err);
      alert("❌ Impossible d'uploader la photo. Réessayez.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProperty = async () => {
    if (!selectedProperty) return;

    try {
      setIsSaving(true);

      const payload: Record<string, unknown> = {
        type: selectedProperty.type,
        title: editName || selectedProperty.name || 'Bien immobilier',
        name: editName || selectedProperty.name,
        description: selectedProperty.description,
        address: editAddress,
        city: editCity,
        district: editDistrict || null,
        state: selectedProperty.state,
        zip_code: editZip || null,
        surface: editSurface ? parseFloat(editSurface) : null,
        room_count: selectedProperty.room_count,
        bedroom_count: selectedProperty.bedroom_count,
        bathroom_count: selectedProperty.bathroom_count,
        rent_amount: editRent
          ? parseFloat(editRent)
          : selectedProperty.rent_amount
          ? parseFloat(selectedProperty.rent_amount)
          : null,
        charges_amount: selectedProperty.charges_amount
          ? Number(selectedProperty.charges_amount)
          : 0,
        status: editStatus,
        reference_code: selectedProperty.reference_code,
        amenities: selectedProperty.amenities,
        photos: editPhotos,
        meta: selectedProperty.meta,
      };

      const updated = await propertyService.updateProperty(
        selectedProperty.id,
        payload
      );

      // Mettre à jour la liste locale
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((p) => (p.id === updated.id ? updated : p)),
        };
      });

      alert('✅ Bien mis à jour avec succès.');
      handleCloseModal();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, unknown[]>; message?: string } } };
      console.error('Erreur mise à jour bien:', err);
      if (error?.response?.data?.errors) {
        const msgs = Object.values(error.response?.data?.errors ?? {}).flat().join('\n');
        alert('❌ Erreur de validation :\n' + msgs);
      } else if (error?.response?.data?.message) {
        alert('❌ ' + error.response.data.message);
      } else {
        alert("❌ Une erreur est survenue lors de l'enregistrement.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="properties-page">
        <div className="properties-container">
          {/* Header + recherche + bouton */}
          <div className="properties-header">
            <div className="properties-title-block">
              <div className="properties-title">
                <Home size={28} />
                <span>Mes biens</span>
              </div>
              <p className="properties-subtitle">
                Gérez l’ensemble de vos biens : appartements, maisons, locaux
                professionnels…
              </p>
            </div>

            <div className="properties-actions">
              <div className="search-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher par nom, adresse, ville ou référence…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                className="button button-primary"
                type="button"
                onClick={handleAddProperty}
              >
                <Plus size={18} />
                Ajouter un bien
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="loading-state">
              <Loader2 className="loading-icon" size={32} />
              <p className="empty-text empty-text-margin">
                Chargement de vos biens en cours...
              </p>
            </div>
          )}

          {/* Erreur */}
          {!isLoading && error && (
            <div className="error-state">
              <AlertCircle size={28} color="#b91c1c" />
              <p className="error-title">Une erreur est survenue</p>
              <p className="error-text">{error}</p>
              <button
                className="button button-primary"
                type="button"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Aucun bien */}
          {!isLoading && !error && properties.length === 0 && (
            <div className="empty-state">
              <Home size={32} color="#9ca3af" />
              <p className="empty-title">Vous n’avez encore aucun bien enregistré</p>
              <p className="empty-text">
                Ajoutez votre premier bien pour commencer à suivre vos locations,
                loyers et locataires dans Gestiloc.
              </p>
              <button
                className="button button-primary"
                type="button"
                onClick={handleAddProperty}
              >
                <Plus size={18} />
                Ajouter mon premier bien
              </button>
            </div>
          )}

          {/* Liste filtrée vide */}
          {!isLoading && !error && properties.length > 0 && filtered.length === 0 && (
            <div className="empty-state">
              <Search size={28} color="#9ca3af" />
              <p className="empty-title">Aucun bien ne correspond à votre recherche</p>
              <p className="empty-text">
                Essayez avec un autre nom, une adresse ou une ville.
              </p>
            </div>
          )}

          {/* Liste filtrée */}
          {!isLoading && !error && filtered.length > 0 && (
            <div className="properties-grid">
              {filtered.map((property) => {
                const firstPhoto =
                  property.photos && property.photos.length > 0
                    ? property.photos[0]
                    : null;

                const statusKey = property.status ?? 'available';
                const statusClass = `property-status-badge status-${statusKey}`;

                return (
                  <div
                    className="property-card"
                    key={property.id}
                    onClick={() => handleOpenProperty(property)}
                  >
                    <div className="property-image-wrapper">
                      {firstPhoto ? (
                        <img
                          src={firstPhoto}
                          alt={property.name || 'Photo du bien'}
                          className="property-image"
                        />
                      ) : (
                        <ImageIcon size={40} color="#9ca3af" />
                      )}

                      <div className={statusClass}>
                        {statusLabel[statusKey] ?? property.status}
                      </div>
                    </div>

                    <div className="property-body">
                      <p className="property-type">
                        {typeLabel[property.type] ?? property.type}
                      </p>
                      <h3 className="property-title">
                        {property.name || property.reference_code || 'Bien sans titre'}
                      </h3>

                      <div className="property-location">
                        <MapPin size={15} />
                        <span>
                          {property.address}
                          {property.city ? `, ${property.city}` : ''}
                        </span>
                      </div>

                      <div className="property-meta">
                        <div className="property-rent">
                          <Euro size={14} />
                          <span>{formatPrice(property.rent_amount)}</span>
                          <span>/ mois</span>
                        </div>

                        <div className="property-surface">
                          {formatSurface(property.surface)}
                        </div>
                      </div>
                    </div>

                    <div className="property-footer">
                      <div className="property-photos-count">
                        <ImageIcon size={14} />
                        <span>
                          {property.photos?.length
                            ? `${property.photos.length} photo${
                                property.photos.length > 1 ? 's' : ''
                              }`
                            : 'Aucune photo'}
                        </span>
                      </div>
                      {property.reference_code && (
                        <span className="badge-muted">
                          Réf. {property.reference_code}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🪟 Modale fiche / édition bien */}
      {isModalOpen && selectedProperty && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-section-label">Fiche bien</p>
                <h3 className="modal-title">
                  {editName || selectedProperty.name || 'Bien immobilier'}
                </h3>
              </div>
              <button
                className="modal-close-btn"
                type="button"
                onClick={handleCloseModal}
                aria-label="Fermer la modale"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Photo principale */}
              <div className="modal-photo-wrapper">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Photo du bien"
                    className="modal-photo-img"
                  />
                ) : (
                  <ImageIcon size={40} color="#9ca3af" />
                )}
                <div className="modal-photo-overlay">
                  <span>Photo principale</span>
                  <label className="modal-photo-upload-label">
                    <ImageIcon size={14} />
                    {isUploadingPhoto ? 'Chargement…' : 'Changer la photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden-input"
                      onChange={handlePhotoChange}
                      disabled={isUploadingPhoto}
                    />
                  </label>
                </div>
              </div>

              {/* Infos principales */}
              <div>
                <p className="modal-section-label">Informations principales</p>
                <div className="modal-grid">
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-name">Nom / Titre du bien</label>
                    <input
                      id="edit-name"
                      className="modal-input"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ex: Appartement T3 centre-ville"
                      aria-label="Nom / Titre du bien"
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-status">Statut</label>
                    <select
                      id="edit-status"
                      className="modal-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="available">Disponible</option>
                      <option value="rented">Loué</option>
                      <option value="maintenance">En maintenance</option>
                      <option value="off_market">Retiré du marché</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <p className="modal-section-label">Adresse</p>
                <div className="modal-grid">
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-address">Adresse</label>
                    <input
                      id="edit-address"
                      className="modal-input"
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      title="Adresse"
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-city">Ville</label>
                    <input
                      id="edit-city"
                      className="modal-input"
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      title="Ville"
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-zip">Code postal</label>
                    <input
                      id="edit-zip"
                      className="modal-input"
                      type="text"
                      value={editZip}
                      onChange={(e) => setEditZip(e.target.value)}
                      title="Code postal"
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-district">Quartier</label>
                    <input
                      id="edit-district"
                      className="modal-input"
                      type="text"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      title="Quartier"
                    />
                  </div>
                </div>
              </div>

              {/* Caractéristiques */}
              <div>
                <p className="modal-section-label">Caractéristiques</p>
                <div className="modal-grid">
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-surface">Surface (m²)</label>
                    <input
                      id="edit-surface"
                      className="modal-input"
                      type="number"
                      min={0}
                      step={0.01}
                      value={editSurface}
                      onChange={(e) => setEditSurface(e.target.value)}
                      title="Surface (m²)"
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-rent">Loyer mensuel (€)</label>
                    <input
                      id="edit-rent"
                      className="modal-input"
                      type="number"
                      min={0}
                      step={1}
                      value={editRent}
                      onChange={(e) => setEditRent(e.target.value)}
                      title="Loyer mensuel (€)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-ghost"
                type="button"
                onClick={handleCloseModal}
              >
                Annuler
              </button>
              <button
                className="btn-primary-modal"
                type="button"
                onClick={handleSaveProperty}
                disabled={isSaving || isUploadingPhoto}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="loading-icon" />
                    Enregistrement…
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MesBiens;
