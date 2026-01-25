import React from 'react';
import {
  X,
  Building,
  MapPin,
  DollarSign,
  Home,
  Users,
  Calendar,
  Ruler,
  DoorOpen,
  Bath,
  Bed,
  Car,
  Sofa,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../Proprietaire/components/ui/Button';

interface PropertyModalProps {
  property: any | null;
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
  onUpdate,
}) => {
  if (!isOpen || !property) return null;

  const formatCurrency = (amount?: string) => {
    if (!amount) return '—';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const getPropertyImage = () => {
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
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {property.address}, {property.city}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Image principale */}
            <div className="mb-6">
              <img
                src={getPropertyImage()}
                alt={property.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Grille d'informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonne gauche */}
              <div className="space-y-6">
                {/* Informations générales */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Informations générales
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type de bien</span>
                      <span className="font-medium">{property.property_type || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Référence</span>
                      <span className="font-medium">{property.reference_code || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description</span>
                      <span className="font-medium text-right">{property.description || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Localisation
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adresse</span>
                      <span className="font-medium">{property.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ville</span>
                      <span className="font-medium">{property.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code postal</span>
                      <span className="font-medium">{property.zip_code || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pays</span>
                      <span className="font-medium">{property.country || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-6">
                {/* Caractéristiques */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Caractéristiques
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Surface</span>
                      <span className="font-medium">{property.surface || '—'} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Étage</span>
                      <span className="font-medium">{property.floor || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Année construction</span>
                      <span className="font-medium">{property.construction_year || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Composition */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DoorOpen className="w-5 h-5" />
                    Composition
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-gray-400" />
                      <span>{property.bedroom_count || '0'} chambre(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-4 h-4 text-gray-400" />
                      <span>{property.bathroom_count || '0'} salle(s) de bain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-gray-400" />
                      <span>{property.room_count || '0'} pièce(s)</span>
                    </div>
                  </div>
                </div>

                {/* Tarification */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Tarification
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loyer mensuel</span>
                      <span className="font-medium">{formatCurrency(property.rent_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Charges mensuelles</span>
                      <span className="font-medium">{formatCurrency(property.charges_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Équipements */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sofa className="w-5 h-5" />
                    Équipements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {property.has_garage && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                        <Car className="w-3 h-3" /> Garage
                      </span>
                    )}
                    {property.has_parking && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                        <Car className="w-3 h-3" /> Parking
                      </span>
                    )}
                    {property.is_furnished && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                        <Sofa className="w-3 h-3" /> Meublé
                      </span>
                    )}
                    {property.has_elevator && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                        <Building className="w-3 h-3" /> Ascenseur
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Délégation */}
            {property.delegation && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Informations de délégation</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Statut</span>
                      <p className="font-medium">{property.delegation.status}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Permissions</span>
                      <p className="font-medium">{property.delegation.permissions?.join(', ') || '—'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Expire le</span>
                      <p className="font-medium">
                        {property.delegation.expires_at 
                          ? new Date(property.delegation.expires_at).toLocaleDateString('fr-FR')
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            {property.delegation?.permissions?.includes('edit') && (
              <Button
                onClick={() => {
                  // Cette fonctionnalité sera gérée par le parent
                  onClose();
                  notify('Utilisez le bouton "Modifier" sur la carte du bien', 'info');
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier ce bien
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};