import React, { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  Building,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Hand,
  Shield,
  Key,
  FileText,
  DollarSign,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarDays,
  Home,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DelegatePropertyModal } from './DelegatePropertyModal';
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

interface Delegation {
  id: number;
  property_id: number;
  property: Property;
  status: 'active' | 'revoked' | 'expired';
  permissions: string[];
  delegated_at: string;
  expires_at?: string;
  notes?: string;
}

interface CoOwner {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  phone?: string;
  address_billing?: string;
  is_professional: boolean;
  license_number?: string;
  status: 'active' | 'inactive' | 'suspended';
  joined_at?: string;
  meta?: any;
  delegations?: Delegation[];
}

interface CoOwnerInvitation {
  id: number;
  email: string;
  name: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  invited_by_type: 'landlord' | 'co_owner';
  target_type: 'co_owner' | 'landlord';
  meta?: any;
}

interface CoOwnersListProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const CoOwnersList: React.FC<CoOwnersListProps> = ({ notify }) => {
  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
  const [invitations, setInvitations] = useState<CoOwnerInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'coowners' | 'invitations'>('coowners');
  const [selectedCoOwner, setSelectedCoOwner] = useState<CoOwner | null>(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [expandedCoOwners, setExpandedCoOwners] = useState<Set<number>>(new Set());

  const fetchCoOwners = async () => {
    try {
      setLoading(true);
      console.log('=== DÉBUT FETCH CO-OWNERS ===');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ Pas de token trouvé');
        notify('Erreur: non authentifié', 'error');
        return;
      }

      console.log('✅ Token trouvé:', token.substring(0, 20) + '...');
      
      // Récupérer les co-propriétaires avec leurs délégations
      const coOwnersResponse = await api.get('/co-owners');
      console.log('📥 Co-owners response complète:', coOwnersResponse);
      console.log('📥 Co-owners response data:', coOwnersResponse.data);

      if (coOwnersResponse.data?.co_owners) {
        console.log('✅ Structure correcte, co_owners trouvés:', coOwnersResponse.data.co_owners.length);
        const coOwnersWithDelegations = await Promise.all(
          coOwnersResponse.data.co_owners.map(async (coOwner: CoOwner) => {
            console.log(`🔄 Récupération délégations pour co-owner ${coOwner.id}...`);
            try {
              const delegationsResponse = await api.get(`/landlords/co-owners/${coOwner.id}/delegations`);
              console.log(`📥 Délegations response pour ${coOwner.id}:`, delegationsResponse.data);
              console.log(`📊 Structure complète:`, JSON.stringify(delegationsResponse.data, null, 2));
              console.log(`📊 Type de delegationsResponse.data:`, typeof delegationsResponse.data);
              console.log(`📊 delegationsResponse.data.data:`, delegationsResponse.data.data);
              console.log(`📊 Type de data.data:`, typeof delegationsResponse.data.data);
              console.log(`📊 delegationsResponse.data.data.data:`, delegationsResponse.data.data?.data);
              console.log(`📊 Type de data.data.data:`, typeof delegationsResponse.data.data?.data);
              console.log(`📊 Est data.data.data un array?`, Array.isArray(delegationsResponse.data.data?.data));
              console.log(`📊 Longueur de data.data.data:`, delegationsResponse.data.data?.data?.length || 0);
              return {
                ...coOwner,
                delegations: delegationsResponse.data.data?.data || []
              };
            } catch (error) {
              console.error(`❌ Erreur délégations pour co-owner ${coOwner.id}:`, error);
              return {
                ...coOwner,
                delegations: []
              };
            }
          })
        );
        
        console.log('✅ Co-owners avec délégations:', coOwnersWithDelegations);
        setCoOwners(coOwnersWithDelegations);
      } else {
        console.error('❌ Structure incorrecte:', coOwnersResponse.data);
        setCoOwners([]);
        
        if (coOwnersResponse.statusText) {
          notify(`Erreur ${coOwnersResponse.status}: ${coOwnersResponse.statusText}`, 'error');
        } else {
          notify('Erreur lors de la récupération des données', 'error');
        }
      }

    } catch (error) {
      console.error('❌ Erreur générale fetchCoOwners:', error);
      
      if (error instanceof SyntaxError) {
        notify('Erreur de format de réponse du serveur', 'error');
      } else if (error instanceof Error) {
        notify(`Erreur: ${error.message}`, 'error');
      } else {
        notify('Erreur lors du chargement des données', 'error');
      }
    } finally {
      setLoading(false);
      console.log('=== FIN FETCH CO-OWNERS ===');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <Clock className="w-4 h-4" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'manage_lease':
        return <FileText className="w-4 h-4" />;
      case 'collect_rent':
        return <DollarSign className="w-4 h-4" />;
      case 'manage_maintenance':
        return <Settings className="w-4 h-4" />;
      case 'send_invoices':
        return <Mail className="w-4 h-4" />;
      case 'manage_tenants':
        return <Users className="w-4 h-4" />;
      case 'view_documents':
        return <Eye className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'manage_lease':
        return 'Gérer les baux';
      case 'collect_rent':
        return 'Collecter les loyers';
      case 'manage_maintenance':
        return 'Gérer la maintenance';
      case 'send_invoices':
        return 'Envoyer les factures';
      case 'manage_tenants':
        return 'Gérer les locataires';
      case 'view_documents':
        return 'Voir les documents';
      default:
        return permission;
    }
  };

  const getDelegationStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleExpanded = (coOwnerId: number) => {
    const newExpanded = new Set(expandedCoOwners);
    if (newExpanded.has(coOwnerId)) {
      newExpanded.delete(coOwnerId);
    } else {
      newExpanded.add(coOwnerId);
    }
    setExpandedCoOwners(newExpanded);
  };

  const handleDelegate = (coOwner: CoOwner) => {
    setSelectedCoOwner(coOwner);
    setShowDelegateModal(true);
  };

  const handleCloseDelegateModal = () => {
    setShowDelegateModal(false);
    setSelectedCoOwner(null);
    fetchCoOwners();
  };

  const filteredCoOwners = coOwners.filter(coOwner => {
    const matchesSearch = coOwner.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          coOwner.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          coOwner.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || coOwner.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchCoOwners();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Co-propriétaires</h1>
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
          <h2 className="text-2xl font-bold text-gray-900">Co-propriétaires</h2>
          <p className="text-gray-600 mt-1">
            Gérez vos co-propriétaires et leurs délégations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {}}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Inviter un co-propriétaire
          </Button>
          <Button
            variant="outline"
            onClick={fetchCoOwners}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un co-propriétaire..."
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
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="suspended">Suspendus</option>
        </select>
      </div>

      {/* Liste des co-propriétaires */}
      {filteredCoOwners.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Aucun co-propriétaire trouvé' : 'Aucun co-propriétaire'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez d\'ajuster vos filtres de recherche'
              : 'Commencez par inviter votre premier co-propriétaire'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCoOwners.map((coOwner) => (
            <Card key={coOwner.id} className="overflow-hidden">
              {/* En-tête du co-propriétaire */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {coOwner.first_name.charAt(0)}{coOwner.last_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {coOwner.first_name} {coOwner.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{coOwner.email}</p>
                      {coOwner.company_name && (
                        <p className="text-sm text-gray-500">{coOwner.company_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(coOwner.status)}`}>
                      {getStatusIcon(coOwner.status)}
                      {coOwner.status === 'active' ? 'Actif' : coOwner.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                    </span>
                    {coOwner.is_professional && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        Pro
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {coOwner.phone && (
                      <span className="flex items-center gap-1">
                        <Hand className="w-4 h-4" />
                        {coOwner.phone}
                      </span>
                    )}
                    {coOwner.joined_at && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        Rejoint le {new Date(coOwner.joined_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(coOwner.id)}
                      className="flex items-center gap-2"
                    >
                      {expandedCoOwners.has(coOwner.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Masquer les détails
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Voir les détails
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDelegate(coOwner)}
                      className="flex items-center gap-2"
                    >
                      <Hand className="w-4 h-4" />
                      Déléguer un bien
                    </Button>
                  </div>
                </div>
              </div>

              {/* Détails développés */}
              {expandedCoOwners.has(coOwner.id) && (
                <div className="p-6 space-y-6">
                  {/* Délégations existantes */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-600" />
                      Délégations actives ({coOwner.delegations?.length || 0})
                    </h4>
                    
                    {coOwner.delegations && coOwner.delegations.length > 0 ? (
                      <div className="space-y-3">
                        {coOwner.delegations.map((delegation) => (
                          <div key={delegation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Home className="w-4 h-4 text-blue-600" />
                                  <h5 className="font-medium text-gray-900">
                                    {delegation.property.name}
                                  </h5>
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDelegationStatusColor(delegation.status)}`}>
                                    {delegation.status === 'active' ? 'Active' : delegation.status === 'revoked' ? 'Révoquée' : 'Expirée'}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><strong>Adresse:</strong> {delegation.property.address}, {delegation.property.city}</p>
                                  {delegation.property.surface && (
                                    <p><strong>Surface:</strong> {delegation.property.surface} m²</p>
                                  )}
                                  {delegation.property.rent_amount && (
                                    <p><strong>Loyer:</strong> {delegation.property.rent_amount} €/mois</p>
                                  )}
                                  <p><strong>Déléguée le:</strong> {new Date(delegation.delegated_at).toLocaleDateString('fr-FR')}</p>
                                  {delegation.expires_at && (
                                    <p><strong>Expire le:</strong> {new Date(delegation.expires_at).toLocaleDateString('fr-FR')}</p>
                                  )}
                                  {delegation.notes && (
                                    <p><strong>Notes:</strong> {delegation.notes}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Permissions */}
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                                <div className="flex flex-wrap gap-2">
                                  {delegation.permissions.map((permission) => (
                                    <span
                                      key={permission}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                    >
                                      {getPermissionIcon(permission)}
                                      {getPermissionLabel(permission)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p>Aucune délégation active</p>
                        <p className="text-sm mt-1">Utilisez le bouton "Déléguer un bien" pour commencer</p>
                      </div>
                    )}
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Informations personnelles</h5>
                      <div className="space-y-1 text-sm">
                        {coOwner.phone && (
                          <p><strong>Téléphone:</strong> {coOwner.phone}</p>
                        )}
                        {coOwner.company_name && (
                          <p><strong>Entreprise:</strong> {coOwner.company_name}</p>
                        )}
                        {coOwner.license_number && (
                          <p><strong>License:</strong> {coOwner.license_number}</p>
                        )}
                        {coOwner.address_billing && (
                          <p><strong>Adresse:</strong> {coOwner.address_billing}</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Statistiques</h5>
                      <div className="space-y-1 text-sm">
                        <p><strong>Biens délégués:</strong> {coOwner.delegations?.length || 0}</p>
                        <p><strong>Type:</strong> {coOwner.is_professional ? 'Professionnel' : 'Particulier'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal de délégation */}
      {selectedCoOwner && (
        <DelegatePropertyModal
          isOpen={showDelegateModal}
          onClose={handleCloseDelegateModal}
          coOwner={{
            id: selectedCoOwner.id,
            first_name: selectedCoOwner.first_name,
            last_name: selectedCoOwner.last_name,
            email: selectedCoOwner.email
          }}
          notify={notify}
        />
      )}
    </div>
  );
};
