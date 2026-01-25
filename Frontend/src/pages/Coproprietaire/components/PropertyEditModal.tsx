import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  MapPin,
  DollarSign,
  Home,
  Save,
  Send,
  AlertCircle,
  Image as ImageIcon,
  Layers,
  Car,
  Sofa,
  Building2,
  Bath,
  Bed,
  DoorOpen,
  Ruler,
  Calendar,
  Hash,
  Globe,
} from 'lucide-react';
import { Button } from '../../Proprietaire/components/ui/Button';
import { coOwnerApi } from '../../../services/coOwnerApi';

interface PropertyEditModalProps {
  property: any | null;
  isOpen: boolean;
  onClose: () => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
  onUpdate: () => void;
}

export const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
  property,
  isOpen,
  onClose,
  notify,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        address: property.address || '',
        district: property.district || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        country: property.country || '',
        surface: property.surface || '',
        floor: property.floor || '',
        total_floors: property.total_floors || '',
        room_count: property.room_count || '',
        bedroom_count: property.bedroom_count || '',
        bathroom_count: property.bathroom_count || '',
        wc_count: property.wc_count || '',
        construction_year: property.construction_year || '',
        rent_amount: property.rent_amount || '',
        charges_amount: property.charges_amount || '',
        description: property.description || '',
        property_type: property.property_type || 'office',
        
        // Équipements
        has_garage: property.has_garage || false,
        has_parking: property.has_parking || false,
        is_furnished: property.is_furnished || false,
        has_elevator: property.has_elevator || false,
        has_balcony: property.has_balcony || false,
        has_terrace: property.has_terrace || false,
        has_cellar: property.has_cellar || false,
        
        // Latitude/Longitude
        latitude: property.latitude || '',
        longitude: property.longitude || '',
        
        // Métadonnées
        reference_code: property.reference_code || '',
        amenities: property.amenities || [],
      });
      
      // Initialiser les images
      if (property.photos && property.photos.length > 0) {
        setPreviewImages(property.photos.map((photo: string) => 
          photo.startsWith('http') ? photo : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${photo}`
        ));
      }
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value),
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setNewImages(prev => [...prev, ...fileArray]);

    // Créer des URLs de prévisualisation
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    if (index < previewImages.length - newImages.length) {
      // C'est une image existante - juste la retirer de la prévisualisation
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // C'est une nouvelle image - la retirer des deux listes
      const newIndex = index - (previewImages.length - newImages.length);
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      setLoading(true);

      // Préparer les données pour l'envoi
      const submissionData = {
        ...formData,
        photos: property.photos || [],
        // Les nouvelles images seront gérées séparément
      };

      // Appeler l'API pour mettre à jour la propriété
      const response = await coOwnerApi.updateProperty(property.id, submissionData);

      // Si on a de nouvelles images, les uploader
      if (newImages.length > 0) {
        const formDataImages = new FormData();
        newImages.forEach(file => {
          formDataImages.append('photos[]', file);
        });
        formDataImages.append('property_id', property.id.toString());
        
        await coOwnerApi.uploadPropertyPhotos(property.id, formDataImages);
      }

      notify('Modification envoyée au propriétaire pour approbation', 'info');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating property:', error);
      notify(error.message || 'Erreur lors de la mise à jour du bien', 'error');
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes = [
    { value: 'office', label: 'Bureau' },
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'parking', label: 'Parking' },
    { value: 'warehouse', label: 'Entrepôt' },
    { value: 'commercial', label: 'Local commercial' },
    { value: 'land', label: 'Terrain' },
  ];

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Modifier le bien : {property.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Les modifications seront soumises au propriétaire pour approbation
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne de gauche */}
                <div className="space-y-6">
                  {/* Section 1: Informations de base */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Informations de base
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du bien *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type de bien *
                        </label>
                        <select
                          name="property_type"
                          value={formData.property_type || 'office'}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {propertyTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description || ''}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Localisation */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Localisation
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ville *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Code postal *
                          </label>
                          <input
                            type="text"
                            name="zip_code"
                            value={formData.zip_code || ''}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pays *
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country || ''}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quartier
                          </label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Caractéristiques */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      Caractéristiques
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surface (m²) *
                        </label>
                        <input
                          type="number"
                          name="surface"
                          value={formData.surface || ''}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Année de construction
                        </label>
                        <input
                          type="number"
                          name="construction_year"
                          value={formData.construction_year || ''}
                          onChange={handleChange}
                          min="1800"
                          max={new Date().getFullYear()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Étage
                        </label>
                        <input
                          type="number"
                          name="floor"
                          value={formData.floor || ''}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre total d'étages
                        </label>
                        <input
                          type="number"
                          name="total_floors"
                          value={formData.total_floors || ''}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne de droite */}
                <div className="space-y-6">
                  {/* Section 4: Pièces */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <DoorOpen className="w-5 h-5" />
                      Composition
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pièces totales
                        </label>
                        <input
                          type="number"
                          name="room_count"
                          value={formData.room_count || ''}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chambres
                        </label>
                        <input
                          type="number"
                          name="bedroom_count"
                          value={formData.bedroom_count || ''}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Salles de bain
                        </label>
                        <input
                          type="number"
                          name="bathroom_count"
                          value={formData.bathroom_count || ''}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          WC
                        </label>
                        <input
                          type="number"
                          name="wc_count"
                          value={formData.wc_count || ''}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Tarifs */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Tarification
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loyer mensuel (€) *
                        </label>
                        <input
                          type="number"
                          name="rent_amount"
                          value={formData.rent_amount || ''}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Charges mensuelles (€)
                        </label>
                        <input
                          type="number"
                          name="charges_amount"
                          value={formData.charges_amount || ''}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Équipements */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Sofa className="w-5 h-5" />
                      Équipements
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="has_garage"
                          checked={formData.has_garage || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Garage</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="has_parking"
                          checked={formData.has_parking || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Parking</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="is_furnished"
                          checked={formData.is_furnished || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Meublé</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="has_elevator"
                          checked={formData.has_elevator || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Ascenseur</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="has_balcony"
                          checked={formData.has_balcony || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Balcon</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="has_terrace"
                          checked={formData.has_terrace || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Terrasse</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="has_cellar"
                          checked={formData.has_cellar || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Cave</span>
                      </label>
                    </div>
                  </div>

                  {/* Section 7: Photos */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Photos
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {previewImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Property ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ajouter des photos
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Formats acceptés : JPG, PNG, WEBP. Max 5 Mo par image.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations techniques */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Informations techniques
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code référence
                    </label>
                    <input
                      type="text"
                      name="reference_code"
                      value={formData.reference_code || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer au propriétaire
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};