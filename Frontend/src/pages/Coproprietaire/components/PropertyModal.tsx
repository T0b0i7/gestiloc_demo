import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, MapPin, Home, DollarSign, FileText, Building } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { coOwnerApi, CoOwnerProperty } from '@/services/coOwnerApi';

interface PropertyModalProps {
  property: CoOwnerProperty | null;
  isOpen: boolean;
  onClose: () => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
  onUpdate: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  notify,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CoOwnerProperty>>({});

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address,
        city: property.city,
        postal_code: property.postal_code,
        country: property.country,
        rent_amount: property.rent_amount,
        surface: property.surface,
        type: property.type,
        description: property.description,
      });
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleSave = async () => {
    if (!property) return;
    
    setLoading(true);
    try {
      await coOwnerApi.updateProperty(property.id, formData);
      notify('Bien mis à jour avec succès', 'success');
      setIsEditing(false);
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating property:', error);
      notify('Erreur lors de la mise à jour du bien', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CoOwnerProperty, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPropertyImage = (property: CoOwnerProperty) => {
    if (property.photos && property.photos.length > 0) {
      const firstPhoto = property.photos[0];
      if (typeof firstPhoto === 'string' && firstPhoto.startsWith('http')) {
        return firstPhoto;
      }
      if (typeof firstPhoto === 'string') {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${firstPhoto}`;
      }
    }
    return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier le bien' : 'Détails du bien'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image */}
              <div className="space-y-4">
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <img
                    src={getPropertyImage(property)}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                </div>
                
                {/* Gallery */}
                {property.photos && property.photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {property.photos.slice(1, 5).map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={typeof photo === 'string' && photo.startsWith('http') 
                            ? photo 
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${photo}`
                          }
                          alt={`Photo ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du bien
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ville
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal
                        </label>
                        <input
                          type="text"
                          value={formData.postal_code || ''}
                          onChange={(e) => handleInputChange('postal_code', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loyer (€/mois)
                        </label>
                        <input
                          type="number"
                          value={formData.rent_amount || ''}
                          onChange={(e) => handleInputChange('rent_amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surface (m²)
                        </label>
                        <input
                          type="number"
                          value={formData.surface || ''}
                          onChange={(e) => handleInputChange('surface', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de bien
                      </label>
                      <select
                        value={formData.type || ''}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="apartment">Appartement</option>
                        <option value="house">Maison</option>
                        <option value="studio">Studio</option>
                        <option value="loft">Loft</option>
                        <option value="villa">Villa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {property.address}, {property.postal_code} {property.city}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Loyer</p>
                            <p className="text-lg font-bold text-gray-900">
                              {property.rent_amount 
                                ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(property.rent_amount.toString()))
                                : '—'
                              }
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Home className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Surface</p>
                            <p className="text-lg font-bold text-gray-900">
                              {property.surface ? `${property.surface} m²` : '—'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Type de bien</p>
                          <p className="text-lg font-bold text-gray-900">
                            {property.property_type || 'Non spécifié'}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {property.description && (
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg mt-1">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">Description</p>
                            <p className="text-gray-900 whitespace-pre-wrap">
                              {property.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Home className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <p className="text-lg font-bold text-gray-900">
                            {property.status === 'rented' ? 'Loué' : 'Disponible'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
