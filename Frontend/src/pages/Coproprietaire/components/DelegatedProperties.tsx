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
  ChevronRight,
  ChevronLeft,
  Star,
  Shield,
  Layers,
  Ruler,
  Bath,
  Bed,
  Car,
  Sofa,
  Building2,
  ExternalLink,
} from 'lucide-react';
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
        return 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 border border-emerald-200 shadow-emerald-100';
      case 'rented':
        return 'bg-gradient-to-r from-blue-50 to-white text-blue-700 border border-blue-200 shadow-blue-100';
      case 'maintenance':
        return 'bg-gradient-to-r from-amber-50 to-white text-amber-700 border border-amber-200 shadow-amber-100';
      default:
        return 'bg-gradient-to-r from-slate-50 to-white text-slate-700 border border-slate-200 shadow-slate-100';
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
    return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600";
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
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Biens délégués</h1>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-blue-100 shadow-xl overflow-hidden animate-pulse">
                <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-1/2"></div>
                  <div className="h-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
        }
        
        .stats-card {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .stats-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          z-index: 1;
        }
        
        .stats-card:hover {
          transform: translateY(-8px);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.2);
          animation: glow 2s infinite;
        }
        
        .property-card {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.15);
          border-radius: 24px;
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.1);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .property-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
          background-size: 200% 100%;
          animation: gradient 3s linear infinite;
          z-index: 1;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .property-card:hover {
          transform: translateY(-12px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 25px 70px rgba(59, 130, 246, 0.25);
          animation: float 3s ease-in-out infinite;
        }
        
        .search-input {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 12px 40px rgba(59, 130, 246, 0.15);
        }
        
        .filter-select {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
        }
        
        .filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 12px 40px rgba(59, 130, 246, 0.15);
        }
        
        .action-btn {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .action-btn:hover {
          transform: translateY(-3px);
          border-color: #3b82f6;
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.2);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
        }
        
        .action-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          color: white;
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .action-btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: 0.5s;
        }
        
        .action-btn-primary:hover::before {
          left: 100%;
        }
        
        .action-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
        
        .empty-state {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.15);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.1);
        }
        
        .icon-circle {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15);
        }
        
        .image-overlay {
          background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 70%);
        }
        
        .status-badge {
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .info-item {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.03));
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .info-item:hover {
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header avec titre et description */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-3">
            Biens délégués
          </h1>
          <p className="text-xl text-gray-700">
            Gérez les biens qui vous ont été délégués
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total</p>
                <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <Home className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Disponibles</p>
                <p className="text-3xl font-bold text-gray-900">
                  {properties.filter(p => p.status === 'available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Loués</p>
                <p className="text-3xl font-bold text-gray-900">
                  {properties.filter(p => p.status === 'rented').length}
                </p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">En maintenance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {properties.filter(p => p.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-500 w-6 h-6" />
            <input
              type="text"
              placeholder="Rechercher un bien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input w-full pl-16 pr-6 py-4 text-lg focus:outline-none placeholder-gray-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="icon-circle p-3 rounded-xl">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="filter-select px-6 py-4 text-lg focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="available">Disponible</option>
              <option value="rented">Loué</option>
              <option value="maintenance">En maintenance</option>
            </select>
          </div>
        </div>

        {/* Grille des biens */}
        {filteredProperties.length === 0 ? (
          <div className="empty-state p-16 text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full icon-circle flex items-center justify-center">
              <Building className="w-16 h-16 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'Aucun bien trouvé' : 'Aucun bien délégué'}
            </h3>
            <p className="text-gray-700 mb-10 max-w-lg mx-auto text-lg">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Les biens qui vous seront délégués apparaîtront ici'
              }
            </p>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="action-btn px-8 py-4 inline-flex items-center gap-3 font-semibold text-lg text-blue-600"
            >
              <ExternalLink className="w-6 h-6" />
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProperties.map((property) => (
              <div key={property.id} className="property-card">
                {/* Image du bien */}
                <div className="h-72 relative overflow-hidden">
                  <img
                    src={getPropertyImage(property)}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute inset-0 image-overlay"></div>
                  <div className="absolute top-5 right-5">
                    <span className={`status-badge inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold ${getStatusColor(property.status)}`}>
                      {getStatusIcon(property.status)}
                      {getStatusLabel(property.status)}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-bold bg-white/95 backdrop-blur-sm text-gray-900 border border-blue-100">
                      <Star className="w-5 h-5 text-amber-500" />
                      {property.reference_code || 'REF-' + property.id}
                    </span>
                  </div>
                </div>

                {/* Informations du bien */}
                <div className="p-7">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5 line-clamp-1">
                    {property.name}
                  </h3>
                  
                  <div className="space-y-5 mb-7">
                    <div className="info-item p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                          <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg line-clamp-1">{property.address}</p>
                          <p className="text-gray-700">{property.city}, {property.zip_code}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {property.rent_amount && (
                        <div className="info-item p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                              <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Loyer</p>
                              <p className="font-bold text-gray-900 text-lg">{formatCurrency(property.rent_amount)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {property.surface && (
                        <div className="info-item p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                              <Ruler className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Surface</p>
                              <p className="font-bold text-gray-900 text-lg">{property.surface} m²</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {property.bedroom_count && (
                        <span className="info-item inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-gray-800">
                          <Bed className="w-4 h-4 text-blue-600" />
                          {property.bedroom_count} chambre(s)
                        </span>
                      )}
                      {property.bathroom_count && (
                        <span className="info-item inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-gray-800">
                          <Bath className="w-4 h-4 text-blue-600" />
                          {property.bathroom_count} sdb
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-6 border-t border-blue-100">
                    <button
                      onClick={() => handleViewProperty(property)}
                      className="action-btn flex-1 py-4 px-6 flex items-center justify-center gap-3 font-bold text-gray-800"
                    >
                      <Eye className="w-6 h-6" />
                      Détails
                    </button>
                    
                    {property.delegation?.permissions?.includes('edit') && (
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="action-btn-primary flex-1 py-4 px-6 flex items-center justify-center gap-3 font-bold"
                      >
                        <Edit className="w-6 h-6" />
                        Modifier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PropertyModal
        property={selectedProperty}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        notify={notify}
        onUpdate={handlePropertyUpdated}
      />

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