import React, { useEffect, useState } from 'react';
import {
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Home,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Card } from '../../Proprietaire/components/ui/Card';
import { coOwnerApi, CoOwnerProperty } from '../../../services/coOwnerApi';
import { PropertyModal } from './PropertyModal';
import { PropertyEditModal } from './PropertyEditModal';

interface DelegatedPropertiesProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const DelegatedProperties: React.FC<DelegatedPropertiesProps> = ({ onNavigate, notify }) => {
  const [properties, setProperties] = useState<CoOwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all');
  const [selectedProperty, setSelectedProperty] = useState<CoOwnerProperty | null>(null);
  const [selectedEditProperty, setSelectedEditProperty] = useState<CoOwnerProperty | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getDelegatedProperties();
      setProperties(data);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      notify('Erreur lors du chargement des biens délégués', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'rented':
        return <Users className="w-4 h-4" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'rented':
        return 'Loué';
      case 'maintenance':
        return 'En maintenance';
      default:
        return 'Inconnu';
    }
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return '—';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
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

  const handleDeleteProperty = async (propertyId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      return;
    }

    try {
      await coOwnerApi.deleteProperty(propertyId);
      setProperties(properties.filter(p => p.id !== propertyId));
      notify('Bien supprimé avec succès', 'success');
    } catch (error: any) {
      console.error('Error deleting property:', error);
      notify('Erreur lors de la suppression du bien', 'error');
    }
  };

  const handleViewProperty = (property: CoOwnerProperty) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const handleEditProperty = (property: CoOwnerProperty) => {
    setSelectedEditProperty(property);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProperty(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEditProperty(null);
  };

  const handlePropertyUpdated = () => {
    fetchProperties(); // Rafraîchir la liste
    notify('Modification envoyée au propriétaire pour approbation', 'info');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Biens délégués</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biens délégués</h1>
          <p className="text-gray-600 mt-1">
            Gérez les biens qui vous ont été délégués
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-xl font-bold text-gray-900">
                {properties.filter(p => p.status === 'available').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Loués</p>
              <p className="text-xl font-bold text-gray-900">
                {properties.filter(p => p.status === 'rented').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En maintenance</p>
              <p className="text-xl font-bold text-gray-900">
                {properties.filter(p => p.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un bien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="rented">Loué</option>
            <option value="maintenance">En maintenance</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card className="p-12 text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Aucun bien trouvé' : 'Aucun bien délégué'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Les biens qui vous seront délégués apparaîtront ici'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={getPropertyImage(property)}
                  alt={property.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400";
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {getStatusIcon(property.status)}
                    {getStatusLabel(property.status)}
                  </span>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {property.name}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">
                      {property.address}, {property.city}
                    </span>
                  </div>
                  
                  {property.rent_amount && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-gray-900">
                        {formatCurrency(property.rent_amount)}/mois
                      </span>
                    </div>
                  )}

                  {property.surface && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      <span>{property.surface} m²</span>
                    </div>
                  )}

                  {property.property_type && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{property.property_type}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProperty(property)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Détails
                  </Button>
                  {property.delegation?.permissions?.includes('edit') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProperty(property)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                  )}
                  {property.delegation?.permissions?.includes('delete') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Property View Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        notify={notify}
        onUpdate={handlePropertyUpdated}
      />

      {/* Property Edit Modal */}
      <PropertyEditModal
        property={selectedEditProperty}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        notify={notify}
        onUpdate={handlePropertyUpdated}
      />
    </div>
  );
};