import React, { useEffect, useState } from 'react';
import {
  Users,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Search,
  Filter,
  AlertTriangle,
  Check,
  X,
  User,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Card } from '../../Proprietaire/components/ui/Card';
import { coOwnerApi, PropertyDelegation } from '../../../services/coOwnerApi';

interface DelegationsManagementProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const DelegationsManagement: React.FC<DelegationsManagementProps> = ({ onNavigate, notify }) => {
  const [delegations, setDelegations] = useState<PropertyDelegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'expired' | 'revoked'>('all');
  const [selectedDelegation, setSelectedDelegation] = useState<PropertyDelegation | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getDelegations();
      setDelegations(data);
    } catch (error: any) {
      console.error('Error fetching delegations:', error);
      notify('Erreur lors du chargement des délégations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDelegations = delegations.filter(delegation => {
    const matchesSearch = 
      delegation.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegation.landlord?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegation.landlord?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegation.landlord?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delegation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      case 'revoked':
        return <X className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expirée';
      case 'revoked':
        return 'Révoquée';
      default:
        return 'Inconnu';
    }
  };

  const handleAcceptDelegation = async (delegationId: number) => {
    try {
      await coOwnerApi.acceptDelegation(delegationId);
      await fetchDelegations();
      notify('Délégation acceptée avec succès', 'success');
      setSelectedDelegation(null);
    } catch (error: any) {
      console.error('Error accepting delegation:', error);
      notify('Erreur lors de l\'acceptation de la délégation', 'error');
    }
  };

  const handleRejectDelegation = async () => {
    if (!selectedDelegation) return;

    try {
      await coOwnerApi.rejectDelegation(selectedDelegation.id, rejectReason);
      await fetchDelegations();
      notify('Délégation refusée avec succès', 'success');
      setShowRejectModal(false);
      setSelectedDelegation(null);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting delegation:', error);
      notify('Erreur lors du refus de la délégation', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionsList = (permissions: string[]) => {
    const permissionMap: { [key: string]: string } = {
      'view': 'Voir',
      'edit': 'Modifier',
      'rent': 'Gérer la location',
      'maintenance': 'Gérer la maintenance',
      'financial': 'Gérer les finances',
      'documents': 'Gérer les documents'
    };
    
    return permissions.map(p => permissionMap[p] || p).join(', ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des délégations</h1>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des délégations</h1>
          <p className="text-gray-600 mt-1">
            Gérez les demandes de délégation reçues
          </p>
        </div>
        <Button
          onClick={() => onNavigate('inviter-proprietaire')}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Inviter un propriétaire
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{delegations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-xl font-bold text-gray-900">
                {delegations.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Actives</p>
              <p className="text-xl font-bold text-gray-900">
                {delegations.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Révoquées</p>
              <p className="text-xl font-bold text-gray-900">
                {delegations.filter(d => d.status === 'revoked').length}
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
            placeholder="Rechercher une délégation..."
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
            <option value="pending">En attente</option>
            <option value="active">Active</option>
            <option value="expired">Expirée</option>
            <option value="revoked">Révoquée</option>
          </select>
        </div>
      </div>

      {/* Delegations List */}
      {filteredDelegations.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Aucune délégation trouvée' : 'Aucune délégation'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Les demandes de délégation apparaîtront ici'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => onNavigate('inviter-proprietaire')}>
              Inviter un propriétaire
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDelegations.map((delegation) => (
            <Card key={delegation.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Delegation Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {delegation.property?.name || 'Bien non spécifié'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delegation.status)}`}>
                          {getStatusIcon(delegation.status)}
                          {getStatusLabel(delegation.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Demandée le {formatDate(delegation.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Propriétaire:</span>
                      <span className="font-medium text-gray-900">
                        {delegation.landlord?.first_name} {delegation.landlord?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">
                        {delegation.landlord?.email}
                      </span>
                    </div>
                    {delegation.property?.address && (
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Adresse:</span>
                        <span className="font-medium text-gray-900">
                          {delegation.property.address}, {delegation.property.city}
                        </span>
                      </div>
                    )}
                    {delegation.expires_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Expire le:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(delegation.expires_at)}
                        </span>
                      </div>
                    )}
                    {delegation.permissions && delegation.permissions.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Permissions:</span>
                        <div className="mt-1">
                          <span className="text-sm font-medium text-gray-900">
                            {getPermissionsList(delegation.permissions)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                  {delegation.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleAcceptDelegation(delegation.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accepter
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedDelegation(delegation);
                          setShowRejectModal(true);
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => onNavigate(`delegation/${delegation.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedDelegation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Refuser la délégation</h3>
                <p className="text-sm text-gray-600">
                  {selectedDelegation.property?.name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif du refus
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Expliquez pourquoi vous refusez cette délégation..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedDelegation(null);
                    setRejectReason('');
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleRejectDelegation}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={!rejectReason.trim()}
                >
                  Refuser la délégation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
