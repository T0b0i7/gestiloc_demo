import React, { useEffect, useState } from 'react';
import {
  Building,
  Calendar,
  User,
  Eye,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Badge } from '../../Proprietaire/components/ui/Badge';

interface Delegation {
  id: number;
  property_id: number;
  property: {
    id: number;
    name: string;
    address: string;
    city: string;
    zip_code: string;
    rent_amount?: string;
  };
  landlord: {
    id: number;
    user: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
  };
  status: 'active' | 'revoked' | 'expired';
  delegated_at: string;
  expires_at?: string;
  permissions: string[];
  notes?: string;
}

interface DelegationsListProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const DelegationsList: React.FC<DelegationsListProps> = ({ notify }) => {
  const [loading, setLoading] = useState(true);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [filteredDelegations, setFilteredDelegations] = useState<Delegation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDelegation, setSelectedDelegation] = useState<Delegation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchDelegations = async () => {
    try {
      const response = await fetch('/api/co-owners/me/delegations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des délégations');
      }

      const data = await response.json();
      const delegationsData = data.delegations?.data || data.delegations || [];
      setDelegations(delegationsData);
      setFilteredDelegations(delegationsData);
    } catch (error) {
      console.error('Erreur:', error);
      notify('Erreur lors du chargement des délégations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelegations();
  }, []);

  useEffect(() => {
    let filtered = delegations;

    // Filtrage par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.landlord.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDelegations(filtered);
  }, [delegations, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'revoked': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'revoked': return 'Révoquée';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(num || 0);
  };

  const getPermissionBadge = (permission: string) => {
    const colors: Record<string, string> = {
      'manage_lease': 'bg-blue-100 text-blue-800',
      'collect_rent': 'bg-green-100 text-green-800',
      'manage_maintenance': 'bg-orange-100 text-orange-800',
      'send_invoices': 'bg-purple-100 text-purple-800'
    };

    const labels: Record<string, string> = {
      'manage_lease': 'Gérer baux',
      'collect_rent': 'Encaisser loyers',
      'manage_maintenance': 'Gérer maintenance',
      'send_invoices': 'Envoyer factures'
    };

    return (
      <span 
        key={permission}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[permission] || 'bg-gray-100 text-gray-800'}`}
      >
        {labels[permission] || permission}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Délégations</h1>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Délégations</h1>
          <p className="text-gray-600 mt-1">
            {filteredDelegations.length} délégation{filteredDelegations.length > 1 ? 's' : ''} trouvée{filteredDelegations.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={fetchDelegations}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une propriété, adresse ou propriétaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="revoked">Révoquées</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Liste des délégations */}
      <Card className="p-6">
        {filteredDelegations.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucune délégation trouvée' 
                : 'Aucune délégation'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Les propriétés qui vous sont déléguées apparaîtront ici'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDelegations.map((delegation) => (
              <div
                key={delegation.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {delegation.property.name}
                      </h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delegation.status)}`}>
                        {getStatusIcon(delegation.status)}
                        <span>{getStatusText(delegation.status)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span>{delegation.property.address}, {delegation.property.city}</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>
                          Propriétaire: {delegation.landlord.user.first_name} {delegation.landlord.user.last_name} 
                          ({delegation.landlord.user.email})
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Déléguée le {formatDate(delegation.delegated_at)}
                          {delegation.expires_at && ` • Expire le ${formatDate(delegation.expires_at)}`}
                        </span>
                      </p>
                      {delegation.property.rent_amount && (
                        <p className="font-medium text-green-600">
                          Loyer: {formatCurrency(delegation.property.rent_amount)}
                        </p>
                      )}
                    </div>

                    {/* Permissions */}
                    {delegation.permissions && delegation.permissions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {delegation.permissions.map(permission => getPermissionBadge(permission))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {delegation.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <p className="font-medium text-gray-700 mb-1">Notes:</p>
                        <p>{delegation.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDelegation(delegation);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de détails */}
      {showDetailsModal && selectedDelegation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Détails de la délégation
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Propriété</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedDelegation.property.name}</p>
                  <p className="text-sm text-gray-600">{selectedDelegation.property.address}</p>
                  <p className="text-sm text-gray-600">
                    {selectedDelegation.property.zip_code} {selectedDelegation.property.city}
                  </p>
                  {selectedDelegation.property.rent_amount && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Loyer: {formatCurrency(selectedDelegation.property.rent_amount)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations</h3>
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Statut:</span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDelegation.status)}`}>
                      {getStatusIcon(selectedDelegation.status)}
                      <span>{getStatusText(selectedDelegation.status)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Déléguée le:</span>
                    <span className="text-sm">{formatDate(selectedDelegation.delegated_at)}</span>
                  </div>
                  {selectedDelegation.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expire le:</span>
                      <span className="text-sm">{formatDate(selectedDelegation.expires_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Propriétaire</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">
                    {selectedDelegation.landlord.user.first_name} {selectedDelegation.landlord.user.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{selectedDelegation.landlord.user.email}</p>
                </div>
              </div>

              {selectedDelegation.permissions && selectedDelegation.permissions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Permissions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDelegation.permissions.map(permission => getPermissionBadge(permission))}
                  </div>
                </div>
              )}

              {selectedDelegation.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{selectedDelegation.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
