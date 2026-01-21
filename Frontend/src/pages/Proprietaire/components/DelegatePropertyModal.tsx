import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Check,
  X,
  Search,
  Filter,
  Home,
  Users,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import api from '@/services/api'; // Importer l'instance API configurée

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  rent_amount?: string;
  surface?: number;
  property_type?: string;
  type?: string; // Champ de l'API
  status: 'available' | 'rented' | 'maintenance' | 'off_market';
  photos?: string[];
  description?: string;
  amenities?: any;
  meta?: any;
  [key: string]: any; // Permet les champs supplémentaires
}

interface DelegatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coOwner: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const DelegatePropertyModal: React.FC<DelegatePropertyModalProps> = ({
  isOpen,
  onClose,
  coOwner,
  notify,
}) => {
  console.log('DelegatePropertyModal render - isOpen:', isOpen, 'coOwner:', coOwner); // Debug
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented' | 'maintenance' | 'off_market'>('all');
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [permissions, setPermissions] = useState({
    manage_lease: false,      // Gérer les baux
    collect_rent: false,      // Collecter les loyers
    manage_maintenance: false, // Gérer la maintenance
    send_invoices: false,     // Envoyer les factures
    manage_tenants: false,    // Gérer les locataires
    view_documents: false,    // Voir les documents
  });
  const [expiryDate, setExpiryDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('useEffect triggered - isOpen:', isOpen); // Debug
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        notify('Erreur: non authentifié', 'error');
        return;
      }

      console.log('Fetching properties with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug
        
        // Gérer la réponse paginée de Laravel
        const propertiesList = data.data?.data || data.data || data.properties?.data || data.properties || [];
        console.log('Properties extracted:', propertiesList); // Debug
        
        setProperties(propertiesList);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText);
        console.error('Error body:', errorText);
        notify('Erreur lors du chargement des biens', 'error');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      notify('Erreur lors du chargement des biens', 'error');
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
      case 'off_market':
        return 'bg-gray-100 text-gray-800';
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
        return <Calendar className="w-4 h-4" />;
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
      case 'off_market':
        return 'Hors marché';
      default:
        return status;
    }
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return '—';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const togglePropertySelection = (propertyId: number) => {
    console.log('togglePropertySelection called with ID:', propertyId); // Debug
    setSelectedProperties(prev => {
      const newSelection = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      console.log('New selection:', newSelection); // Debug
      return newSelection;
    });
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  const handleSubmit = async () => {
    if (selectedProperties.length === 0) {
      notify('Veuillez sélectionner au moins un bien', 'error');
      return;
    }

    const activePermissions = Object.entries(permissions)
      .filter(([_, enabled]) => enabled)
      .map(([permission]) => permission);

    console.log('Active permissions:', activePermissions);
    console.log('Selected properties:', selectedProperties);
    console.log('Co-owner ID:', coOwner.id);

    if (activePermissions.length === 0) {
      notify('Veuillez sélectionner au moins une permission', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notify('Erreur: non authentifié', 'error');
        return;
      }

      // Créer une délégation pour chaque bien sélectionné
      const delegationPromises = selectedProperties.map(propertyId => {
        const payload = {
          co_owner_id: coOwner.id,
          co_owner_type: 'co_owner', // Type de co-propriétaire
          permissions: activePermissions,
          expires_at: expiryDate || null,
          notes: message || null
        };
        
        console.log('Creating delegation for property:', propertyId, 'with payload:', payload);
        
        return api.post(`/properties/${propertyId}/delegate`, payload)
        .then(response => {
          console.log('Delegation successful for property:', propertyId, 'Response:', response.data);
          return { status: 'fulfilled', value: response.data };
        })
        .catch(error => {
          console.error('Delegation failed for property:', propertyId, 'Error:', error);
          return { status: 'rejected', reason: error };
        });
      });

      const results = await Promise.allSettled(delegationPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        notify(`${successful} délégation(s) créée(s) avec succès${failed > 0 ? ` (${failed} échec(s))` : ''}`, 'success');
        // Attendre un peu pour que la BD soit à jour
        setTimeout(() => {
          onClose();
          // Reset form
          setSelectedProperties([]);
          setPermissions({
            manage_lease: false,
            collect_rent: false,
            manage_maintenance: false,
            send_invoices: false,
            manage_tenants: false,
            view_documents: false,
          });
          setExpiryDate('');
          setMessage('');
        }, 500);
      } else {
        notify('Erreur lors de la création des délégations', 'error');
      }
    } catch (error) {
      console.error('Error creating delegations:', error);
      notify('Erreur lors de la création des délégations', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-[10000] m-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Déléguer des biens à {coOwner.first_name} {coOwner.last_name}
              </h2>
              <p className="text-gray-600 mt-1">
                Sélectionnez les biens et les permissions à déléguer
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Properties List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Biens disponibles</h3>
                <span className="text-sm text-gray-500">
                  {selectedProperties.length} sélectionné(s)
                </span>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
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
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="available">Disponible</option>
                  <option value="rented">Loué</option>
                  <option value="maintenance">En maintenance</option>
                  <option value="off_market">Hors marché</option>
                </select>
              </div>

              {/* Properties Grid */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Aucun bien trouvé' 
                        : 'Aucun bien disponible'
                      }
                    </p>
                  </Card>
                ) : (
                  filteredProperties.map((property: Property) => (
                    <div
                      key={property.id}
                      className={`bg-surface rounded-xl shadow-sm border cursor-pointer transition-all pointer-events-auto p-4 ${
                        selectedProperties.includes(property.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Card clicked - Property ID:', property.id); // Debug
                        togglePropertySelection(property.id);
                      }}
                      onMouseDown={(e) => {
                        console.log('Mouse down on property:', property.id); // Debug
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className={`w-4 h-4 rounded border-2 ${
                            selectedProperties.includes(property.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedProperties.includes(property.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{property.name}</h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                              {getStatusIcon(property.status)}
                              {getStatusLabel(property.status)}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span>{property.address}, {property.city}</span>
                            </div>
                            {property.rent_amount && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-3 h-3" />
                                <span>{formatCurrency(property.rent_amount)}/mois</span>
                              </div>
                            )}
                            {property.surface && (
                              <div className="flex items-center gap-2">
                                <Home className="w-3 h-3" />
                                <span>{property.surface} m²</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Permissions and Settings */}
            <div className="space-y-6">
              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manage_lease}
                      onChange={(e) => handlePermissionChange('manage_lease', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Gérer les baux</span>
                      </div>
                      <p className="text-sm text-gray-600">Peut gérer les contrats de location</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.collect_rent}
                      onChange={(e) => handlePermissionChange('collect_rent', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Collecter les loyers</span>
                      </div>
                      <p className="text-sm text-gray-600">Peut collecter les paiements de loyer</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manage_maintenance}
                      onChange={(e) => handlePermissionChange('manage_maintenance', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Gérer la maintenance</span>
                      </div>
                      <p className="text-sm text-gray-600">Peut gérer les demandes de maintenance</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.send_invoices}
                      onChange={(e) => handlePermissionChange('send_invoices', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Envoyer les factures</span>
                      </div>
                      <p className="text-sm text-gray-600">Peut envoyer les factures et quittances</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manage_tenants}
                      onChange={(e) => handlePermissionChange('manage_tenants', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Gérer les locataires</span>
                      </div>
                      <p className="text-sm text-gray-600">Peut gérer les locataires et les informations</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.view_documents}
                      onChange={(e) => handlePermissionChange('view_documents', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Voir les documents</span>
                      </div>
                      <p className="text-sm text-gray-600">Peut voir les documents du bien</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'expiration (optionnel)
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Ajoutez un message pour le co-propriétaire..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedProperties.length} bien(s) sélectionné(s)
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedProperties.length === 0 || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Délégation...
                  </div>
                ) : (
                  `Déléguer ${selectedProperties.length} bien(s)`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
