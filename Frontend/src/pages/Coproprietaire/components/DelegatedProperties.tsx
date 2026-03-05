import React, { useEffect, useState } from 'react';
import {
  Building,
  MapPin,
  Search,
  Plus,
  Home,
} from 'lucide-react';
import { coOwnerApi, CoOwnerProperty } from '../../../services/coOwnerApi';
import { PropertyEditModal } from './PropertyEditModal';

interface DelegatedPropertiesProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const DelegatedProperties: React.FC<DelegatedPropertiesProps> = ({ onNavigate, notify }) => {
  const [properties, setProperties] = useState<CoOwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'rented' | 'available' | 'maintenance' | 'off_market'>('all');
  const [selectedEditProperty, setSelectedEditProperty] = useState<CoOwnerProperty | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getDelegatedProperties();
      console.log('Propriétés récupérées:', data);
      setProperties(data);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      notify('Erreur lors du chargement des biens délégués', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtre combiné (recherche principale + recherche rapide)
  const filteredProperties = properties.filter(property => {
    const searchLower = (searchTerm || quickSearch).toLowerCase();
    const matchesSearch = 
      property.name.toLowerCase().includes(searchLower) ||
      property.address.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower) ||
      property.reference_code?.toLowerCase().includes(searchLower) ||
      property.property_type?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Grouper les propriétés par statut
  const rentedProperties = filteredProperties.filter(p => p.status === 'rented');
  const availableProperties = filteredProperties.filter(p => p.status === 'available');
  const maintenanceProperties = filteredProperties.filter(p => p.status === 'maintenance');
  const offMarketProperties = filteredProperties.filter(p => p.status === 'off_market');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[#70AE48] text-white';
      case 'rented':
        return 'bg-[#8BC34A] text-white';
      case 'maintenance':
        return 'bg-amber-500 text-white';
      case 'off_market':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'rented':
        return 'Loué';
      case 'maintenance':
        return 'En travaux';
      case 'off_market':
        return 'Préavis';
      default:
        return 'Inconnu';
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment':
      case 'appartement':
        return 'APPARTEMENT';
      case 'house':
      case 'maison':
        return 'MAISON';
      case 'office':
      case 'local_professional':
        return 'LOCAL PROFESSIONNEL';
      case 'commercial':
        return 'COMMERCIAL';
      default:
        return 'BIEN IMMOBILIER';
    }
  };

  const formatCurrency = (amount?: string | number) => {
    if (!amount) return '—';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      currencyDisplay: 'narrowSymbol'
    }).format(num).replace('CFA', 'FCFA');
  };

  const getPropertyImage = (property: CoOwnerProperty) => {
    if (property.photos && property.photos.length > 0) {
      const firstPhoto = property.photos[0];
      if (typeof firstPhoto === 'string' && firstPhoto.startsWith('http')) {
        return firstPhoto;
      }
      if (typeof firstPhoto === 'string') {
        return `${import.meta.env.VITE_API_URL || 'https://wheat-skunk-120710.hostingersite.com'}/storage/${firstPhoto}`;
      }
    }
    return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600";
  };

  const handleEditProperty = (property: CoOwnerProperty) => {
    setSelectedEditProperty(property);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEditProperty(null);
  };

  const handlePropertyUpdated = () => {
    fetchProperties();
    notify('Modification envoyée au propriétaire pour approbation', 'info');
  };

  const PropertyCard = ({ property }: { property: CoOwnerProperty }) => (
    <div 
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => handleEditProperty(property)}
    >
      {/* Image du bien */}
      <div className="relative h-56">
        <img 
          src={getPropertyImage(property)} 
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* Badge de statut */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(property.status)}`}>
            {getStatusLabel(property.status)}
          </span>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-6">
        {/* Type de bien */}
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {getPropertyTypeLabel(property.property_type || '')}
          </span>
        </div>

        {/* Nom du bien */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {property.name}
        </h3>

        {/* Adresse */}
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{property.address}, {property.city}</span>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-2xl font-bold text-[#70AE48]">
              {formatCurrency(property.rent_amount)}
            </p>
            <p className="text-xs text-gray-500">/mois</p>
          </div>
          
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {property.surface} m²
            </p>
            <p className="text-xs text-gray-500">Surface</p>
          </div>
        </div>

        {/* Footer avec référence et nombre de photos */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <div className="flex -space-x-2 mr-2">
              {[...Array(Math.min(property.photos?.length || 0, 3))].map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#70AE48] to-[#8BC34A] border-2 border-white flex items-center justify-center"
                >
                  <Home className="w-4 h-4 text-white" />
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">
              {property.photos?.length || 0} Photo{property.photos?.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <span className="text-xs text-gray-500">
            Réf. {property.reference_code}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes biens</h1>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Bouton Retour */}
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
        </div>

        {/* Header avec titre et barre de recherche à droite */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Building className="w-8 h-8 mr-3 text-[#70AE48]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mes biens
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez l'ensemble de vos biens : appartements, maisons, locaux professionnels...
              </p>
            </div>
          </div>
          
          {/* Barre de recherche rapide à droite */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un bien..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70AE48] focus:border-transparent shadow-sm"
            />
            {quickSearch && (
              <button
                onClick={() => setQuickSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtres horizontaux - changés en vert */}
        <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#70AE48] text-white'
                : 'bg-white text-gray-700 hover:bg-[#70AE48]/10 border border-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setStatusFilter('rented')}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'rented'
                ? 'bg-[#70AE48] text-white'
                : 'bg-white text-gray-700 hover:bg-[#70AE48]/10 border border-gray-200'
            }`}
          >
            Loué
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'available'
                ? 'bg-[#70AE48] text-white'
                : 'bg-white text-gray-700 hover:bg-[#70AE48]/10 border border-gray-200'
            }`}
          >
            Disponible
          </button>
          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'maintenance'
                ? 'bg-[#70AE48] text-white'
                : 'bg-white text-gray-700 hover:bg-[#70AE48]/10 border border-gray-200'
            }`}
          >
            En travaux
          </button>
          <button
            onClick={() => setStatusFilter('off_market')}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'off_market'
                ? 'bg-[#70AE48] text-white'
                : 'bg-white text-gray-700 hover:bg-[#70AE48]/10 border border-gray-200'
            }`}
          >
            Préavis
          </button>
          <button className="px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap bg-white text-gray-700 hover:bg-[#70AE48]/10 border border-gray-200 transition-colors">
            Meublé
          </button>
        </div>

        {/* Résultats de recherche */}
        {quickSearch && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredProperties.length} résultat{filteredProperties.length !== 1 ? 's' : ''} pour "{quickSearch}"
          </div>
        )}

        {/* Sections par statut */}
        {(statusFilter === 'all' || statusFilter === 'rented') && rentedProperties.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Loué</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {(statusFilter === 'all' || statusFilter === 'available') && availableProperties.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Disponible</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {(statusFilter === 'all' || statusFilter === 'maintenance') && maintenanceProperties.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">En travaux</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {maintenanceProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {(statusFilter === 'all' || statusFilter === 'off_market') && offMarketProperties.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Préavis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offMarketProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {/* Message vide */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-[#70AE48]/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="w-12 h-12 text-[#70AE48]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {quickSearch || statusFilter !== 'all' ? 'Aucun bien trouvé' : 'Aucun bien délégué'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {quickSearch || statusFilter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les biens qui vous seront délégués apparaîtront ici'
              }
            </p>
            {quickSearch && (
              <button
                onClick={() => setQuickSearch('')}
                className="px-6 py-3 bg-[#70AE48] text-white rounded-xl font-semibold hover:bg-[#5d8f3a] transition-colors"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal d'édition */}
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