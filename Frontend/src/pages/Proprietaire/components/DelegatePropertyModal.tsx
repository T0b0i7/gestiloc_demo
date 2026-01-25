import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Home, Calendar, MessageSquare, Shield, AlertCircle, Building2, UserCheck, MapPin, DollarSign, Maximize } from 'lucide-react';
import { Button } from './ui/Button';
import api from '@/services/api';

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  rent_amount?: string;
  surface?: number;
  property_type?: string;
  status?: string;
}

interface CoOwner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  invitation_type: 'co_owner' | 'agency';
}

interface DelegatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coOwner: CoOwner;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view', label: 'Voir', description: 'Peut voir les détails du bien', icon: '👁️' },
  { id: 'edit', label: 'Modifier', description: 'Peut modifier les informations du bien', icon: '✏️' },
  { id: 'manage_lease', label: 'Gérer les baux', description: 'Peut gérer les contrats de location', icon: '📝' },
  { id: 'collect_rent', label: 'Collecter les loyers', description: 'Peut collecter les paiements de loyer', icon: '💰' },
  { id: 'manage_maintenance', label: 'Gérer la maintenance', description: 'Peut gérer les demandes de maintenance', icon: '🔧' },
  { id: 'send_invoices', label: 'Envoyer les factures', description: 'Peut envoyer les factures et quittances', icon: '📧' },
  { id: 'manage_tenants', label: 'Gérer les locataires', description: 'Peut gérer les locataires et les informations', icon: '👥' },
  { id: 'view_documents', label: 'Voir les documents', description: 'Peut voir les documents du bien', icon: '📄' },
];

export const DelegatePropertyModal: React.FC<DelegatePropertyModalProps> = ({
  isOpen,
  onClose,
  coOwner,
  notify
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['view', 'edit', 'manage_lease']);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const isAgency = coOwner.invitation_type === 'agency';

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      setSelectedPropertyId(null);
      setExpiresAt('');
      setNotes('');
      setSelectedPermissions(['view', 'edit', 'manage_lease']);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await api.get('/properties');
      
      let propertiesData: any[] = [];
      if (response.data?.data) {
        propertiesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        propertiesData = response.data;
      } else if (response.data?.properties) {
        propertiesData = response.data.properties;
      }
      
      setProperties(propertiesData);
      
      if (propertiesData.length === 0) {
        notify('Aucun bien disponible pour la délégation', 'info');
      }
    } catch (error: any) {
      console.error('Erreur chargement propriétés:', error);
      notify(`Erreur: ${error.message || 'Impossible de charger les biens'}`, 'error');
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const handlePropertySelect = (propertyId: number, e: React.MouseEvent) => {
    // Empêche la propagation si on clique sur la case à cocher
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    
    setSelectedPropertyId(propertyId === selectedPropertyId ? null : propertyId);
  };

  const handleCheckboxClick = (propertyId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // IMPORTANT : Stop la propagation
    setSelectedPropertyId(propertyId === selectedPropertyId ? null : propertyId);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedPropertyId) {
    notify('Veuillez sélectionner un bien', 'error');
    return;
  }

  if (!isAgency && selectedPermissions.length === 0) {
    notify('Veuillez sélectionner au moins une permission', 'error');
    return;
  }

  try {
    setLoading(true);

    const payload: any = {
      property_id: selectedPropertyId,
      co_owner_id: coOwner.id,
      expires_at: expiresAt || null,
    };

    if (!isAgency) {
      payload.permissions = selectedPermissions;
      payload.notes = notes || null;
    }
    
    const response = await api.post('/property-delegations', payload);
    notify('Bien délégué avec succès', 'success');
    onClose();
  } catch (error: any) {
    console.error('❌ Erreur délégation:', error);
    
    // Gestion améliorée des erreurs
    if (error.response?.status === 409) {
      // Conflit : bien déjà délégué
      const existingName = error.response?.data?.existing_delegation?.co_owner_name || 'un gestionnaire';
      notify(`Ce bien est déjà délégué à ${existingName}`, 'error');
    } else {
      const message = error.response?.data?.message || 'Erreur lors de la délégation';
      notify(message, 'error');
    }
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '56rem',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #2563eb, #4f46e5)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              borderRadius: '12px'
            }}>
              {isAgency ? (
                <Building2 className="w-6 h-6 text-white" />
              ) : (
                <UserCheck className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0
              }}>
                Déléguer un bien
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'rgba(191, 219, 254, 1)',
                margin: '4px 0 0 0'
              }}>
                à {coOwner.first_name} {coOwner.last_name} • {isAgency ? 'Agence immobilière' : 'Copropriétaire'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content - Scroll */}
        <form onSubmit={handleSubmit} style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="p-6 space-y-6">
            {/* Alerte agence */}
            {isAgency && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-2 text-lg">
                      ⚠️ Délégation complète à une agence
                    </h4>
                    <div className="space-y-2 text-sm text-amber-800">
                      <p className="font-medium">
                        Cette agence aura <span className="font-bold underline">tous les droits de gestion</span> sur ce bien.
                      </p>
                      <p>
                        Vous ne pourrez plus gérer ce bien, uniquement le <strong>consulter en lecture seule</strong>.
                      </p>
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="font-semibold mb-1">Permissions automatiques :</p>
                        <div className="flex flex-wrap gap-2">
                          {['Visualisation', 'Modification', 'Baux', 'Loyers', 'Maintenance', 'Factures', 'Locataires', 'Documents'].map(perm => (
                            <span key={perm} className="px-2 py-1 bg-amber-100 text-amber-900 rounded-md text-xs font-medium">
                              ✓ {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sélection du bien */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Sélectionner un bien à déléguer *
              </label>

              {loadingProperties ? (
                <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center border-2 border-dashed border-gray-300">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600 font-medium">Chargement des biens disponibles...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center border-2 border-dashed border-gray-300">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-2">Aucun bien disponible</p>
                  <p className="text-sm text-gray-500 mb-4">Vous devez d'abord créer un bien pour le déléguer</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchProperties}
                  >
                    Rafraîchir
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={(e) => handlePropertySelect(property.id, e)}
                      className={`
                        p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${selectedPropertyId === property.id
                          ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`
                              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                              ${selectedPropertyId === property.id ? 'bg-blue-600' : 'bg-gray-200'}
                            `}>
                              <Home className={`w-5 h-5 ${selectedPropertyId === property.id ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-lg truncate">
                                {property.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{property.address}, {property.city}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {property.rent_amount && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                                <DollarSign className="w-3 h-3" />
                                {property.rent_amount} €/mois
                              </span>
                            )}
                            {property.surface && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold">
                                <Maximize className="w-3 h-3" />
                                {property.surface} m²
                              </span>
                            )}
                          </div>
                        </div>

                        <div 
                          className="ml-4 flex-shrink-0"
                          onClick={(e) => handleCheckboxClick(property.id, e)}
                        >
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer
                            ${selectedPropertyId === property.id
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 hover:border-blue-400'
                            }
                          `}>
                            {selectedPropertyId === property.id && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedProperty && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-sm font-semibold text-blue-900">
                    ✓ Bien sélectionné : <span className="font-bold">{selectedProperty.name}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Permissions */}
            {!isAgency && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Permissions à accorder *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <label
                      key={permission.id}
                      className={`
                        flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${selectedPermissions.includes(permission.id)
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handleTogglePermission(permission.id)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <span className="text-lg">{permission.icon}</span>
                          <span className="truncate">{permission.label}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedPermissions.length === 0 && (
                  <p className="text-sm text-red-600 mt-3 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Vous devez sélectionner au moins une permission
                  </p>
                )}
              </div>
            )}

            {/* Date d'expiration */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Date d'expiration (optionnel)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                💡 Si non renseignée, la délégation n'expirera pas
              </p>
            </div>

            {/* Message */}
            {!isAgency && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Message (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Ajoutez une note ou un message pour cette délégation..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {notes.length}/1000 caractères
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedPropertyId || (!isAgency && selectedPermissions.length === 0)}
              className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Délégation en cours...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Déléguer le bien
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};