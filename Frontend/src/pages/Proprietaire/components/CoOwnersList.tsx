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
  Building2,
  Briefcase,
  User,
  Hash,
  MapPin,
  Phone,
  Lock,
  Edit,
  MoreVertical,
  Star,
  Award,
  Sparkles,
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
  invitation_type: 'co_owner' | 'agency';
  license_number?: string;
  status: 'active' | 'inactive' | 'suspended';
  joined_at?: string;
  meta?: any;
  delegations?: Delegation[];
  ifu?: string;
  rccm?: string;
  vat_number?: string;
  created_at?: string;
  updated_at?: string;
  delegations_count?: number;
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
  invitation_type: 'co_owner' | 'agency';
  is_professional: boolean;
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
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCoOwner, setSelectedCoOwner] = useState<CoOwner | null>(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [expandedCoOwners, setExpandedCoOwners] = useState<Set<number>>(new Set());

  const fetchCoOwners = async () => {
    try {
      setLoading(true);
      console.log('=== DÉBUT FETCH CO-OWNERS ===');
      
      const response = await api.get('/co-owners');
      console.log('📥 Réponse API complète:', response.data);
      
      let coOwnersData: any[] = [];
      let invitationsData: any[] = [];
      
      if (response.data?.data?.co_owners) {
        console.log('✅ Structure détectée: response.data.data');
        coOwnersData = response.data.data.co_owners;
        invitationsData = response.data.data.invitations || [];
      }
      else if (response.data?.co_owners) {
        console.log('✅ Structure détectée: response.data');
        coOwnersData = response.data.co_owners;
        invitationsData = response.data.invitations || [];
      }
      else if (Array.isArray(response.data)) {
        console.log('✅ Structure détectée: array direct');
        coOwnersData = response.data;
      }
      else {
        console.error('❌ Structure non reconnue:', Object.keys(response.data || {}));
        notify('Format de réponse inattendu', 'error');
        coOwnersData = [];
      }
      
      console.log(`📊 ${coOwnersData.length} co-owners trouvés:`, coOwnersData);
      console.log(`📊 ${invitationsData.length} invitations trouvées`);
      
      const transformedCoOwners = coOwnersData.map((coOwner: any) => {
        console.log(`🔄 Transformation co-owner ${coOwner.id}:`, coOwner);
        
        const meta = coOwner.meta || {};
        const invitationType = coOwner.invitation_type || 
                             (coOwner.is_professional ? 'agency' : 'co_owner');
        
        const delegations: Delegation[] = coOwner.delegations || [];
        
        console.log(`✅ Délégations pour ${coOwner.id}:`, delegations.length, 'délégations');
        
        return {
          id: coOwner.id,
          user_id: coOwner.user_id,
          first_name: coOwner.first_name || '',
          last_name: coOwner.last_name || '',
          email: coOwner.email || '',
          company_name: coOwner.company_name || '',
          phone: coOwner.phone || meta.phone || '',
          address_billing: coOwner.address_billing || '',
          is_professional: coOwner.is_professional || false,
          invitation_type: invitationType as 'co_owner' | 'agency',
          license_number: coOwner.license_number || '',
          status: coOwner.status || 'active',
          joined_at: coOwner.joined_at || coOwner.created_at,
          meta: meta,
          ifu: coOwner.ifu || meta.ifu || '',
          rccm: coOwner.rccm || meta.rccm || '',
          vat_number: coOwner.vat_number || meta.vat_number || '',
          delegations: delegations,
          delegations_count: delegations.length || coOwner.delegations_count || 0,
          created_at: coOwner.created_at,
          updated_at: coOwner.updated_at
        };
      });
      
      console.log('✅ Co-owners transformés:', transformedCoOwners);
      setCoOwners(transformedCoOwners);
      
      const transformedInvitations = invitationsData.map((inv: any) => {
        const meta = inv.meta || {};
        return {
          id: inv.id,
          email: inv.email,
          name: inv.name,
          token: inv.token || '',
          expires_at: inv.expires_at,
          created_at: inv.created_at,
          invited_by_type: 'landlord',
          target_type: 'co_owner',
          is_professional: meta.is_professional || inv.is_professional || false,
          invitation_type: inv.invitation_type || 
                         (meta.is_professional || inv.is_professional ? 'agency' : 'co_owner'),
          meta: meta
        };
      });
      
      setInvitations(transformedInvitations);
      
      if (transformedCoOwners.length === 0 && transformedInvitations.length === 0) {
        notify('Aucun gestionnaire ou invitation trouvé', 'info');
      } else {
        console.log(`✅ Chargement terminé: ${transformedCoOwners.length} co-owners, ${transformedInvitations.length} invitations`);
        console.log(`📊 Total délégations: ${transformedCoOwners.reduce((sum, co) => sum + (co.delegations?.length || 0), 0)}`);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur fetchCoOwners:', error);
      notify(`Erreur: ${error.message || 'Impossible de charger les données'}`, 'error');
    } finally {
      setLoading(false);
      console.log('=== FIN FETCH CO-OWNERS ===');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agency':
        return <Building2 className="w-4 h-4" />;
      case 'co_owner':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'agency':
        return 'Agence';
      case 'co_owner':
        return 'Co-propriétaire';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agency':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'co_owner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'edit':
        return <Edit className="w-4 h-4" />;
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
      case 'view':
        return 'Voir';
      case 'edit':
        return 'Modifier';
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const filteredCoOwners = coOwners.filter(coOwner => {
    const matchesSearch = 
      (coOwner.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (coOwner.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (coOwner.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (coOwner.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (coOwner.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || coOwner.status === statusFilter;
    const matchesType = typeFilter === 'all' || coOwner.invitation_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = 
      (invitation.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (invitation.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || invitation.invitation_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    fetchCoOwners();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Co-propriétaires & Agences</h1>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Co-propriétaires & Agences</h2>
          <p className="text-gray-600 mt-1">
            Gérez vos gestionnaires et leurs délégations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {}}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Inviter un gestionnaire
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
            placeholder="Rechercher par nom, email, téléphone ou entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="co_owner">Co-propriétaires</option>
            <option value="agency">Agences</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="suspended">Suspendus</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{coOwners.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Co-propriétaires</p>
              <p className="text-2xl font-bold text-blue-600">
                {coOwners.filter(c => c.invitation_type === 'co_owner').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agences</p>
              <p className="text-2xl font-bold text-purple-600">
                {coOwners.filter(c => c.invitation_type === 'agency').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Délégations totales</p>
              <p className="text-2xl font-bold text-green-600">
                {coOwners.reduce((sum, co) => sum + (co.delegations_count || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Key className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des gestionnaires */}
      {filteredCoOwners.length === 0 && filteredInvitations.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Aucun gestionnaire trouvé' 
              : 'Aucun gestionnaire'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Essayez d\'ajuster vos filtres de recherche'
              : 'Commencez par inviter votre premier gestionnaire'
            }
          </p>
          <div className="mt-4">
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Inviter un gestionnaire
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCoOwners.map((coOwner) => (
            <Card key={coOwner.id} className="overflow-hidden">
              {/* En-tête */}
              <div className={`p-6 border-b border-gray-200 ${
                coOwner.invitation_type === 'agency' 
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      coOwner.invitation_type === 'agency' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {coOwner.invitation_type === 'agency' 
                        ? <Building2 className="w-6 h-6" />
                        : `${coOwner.first_name?.charAt(0) || ''}${coOwner.last_name?.charAt(0) || ''}`
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {coOwner.invitation_type === 'agency' 
                            ? coOwner.company_name || `${coOwner.first_name} ${coOwner.last_name}`
                            : `${coOwner.first_name} ${coOwner.last_name}`
                          }
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(coOwner.invitation_type)}`}>
                          {getTypeIcon(coOwner.invitation_type)}
                          {getTypeLabel(coOwner.invitation_type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{coOwner.email}</p>
                      {coOwner.invitation_type === 'co_owner' && coOwner.company_name && (
                        <p className="text-sm text-gray-500">{coOwner.company_name}</p>
                      )}
                      {coOwner.invitation_type === 'agency' && (
                        <p className="text-sm text-gray-500">
                          {coOwner.first_name} {coOwner.last_name}
                          {coOwner.phone && ` • ${coOwner.phone}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(coOwner.status)}`}>
                      {getStatusIcon(coOwner.status)}
                      {coOwner.status === 'active' ? 'Actif' : coOwner.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                    </span>
                    {coOwner.joined_at && (
                      <span className="text-xs text-gray-500">
                        Rejoint le {formatDate(coOwner.joined_at)}
                      </span>
                    )}
                    {coOwner.created_at && (
                      <span className="text-xs text-gray-400">
                        Créé le {formatDate(coOwner.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {coOwner.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {coOwner.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Key className="w-4 h-4" />
                      {coOwner.delegations_count || 0} {coOwner.delegations_count === 1 ? 'délégation' : 'délégations'}
                    </span>
                    {coOwner.address_billing && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{coOwner.address_billing}</span>
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
                          Masquer
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Détails
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
                <div className="p-6 space-y-8">
                  {/* Informations spécifiques au type */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations générales */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg pb-3 border-b">
                        <User className="w-5 h-5 text-blue-600" />
                        Informations {coOwner.invitation_type === 'agency' ? 'de l\'agence' : 'personnelles'}
                      </h5>
                      <div className="space-y-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nom complet</span>
                          <span className="text-gray-900 font-medium mt-1">{coOwner.first_name} {coOwner.last_name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
                          <span className="text-gray-900 mt-1 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {coOwner.email}
                          </span>
                        </div>
                        {coOwner.phone && (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Téléphone</span>
                            <span className="text-gray-900 mt-1 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {coOwner.phone}
                            </span>
                          </div>
                        )}
                        {coOwner.company_name && (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entreprise</span>
                            <span className="text-gray-900 mt-1">{coOwner.company_name}</span>
                          </div>
                        )}
                        {coOwner.address_billing && (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adresse</span>
                            <span className="text-gray-900 mt-1">{coOwner.address_billing}</span>
                          </div>
                        )}
                        {coOwner.joined_at && (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rejoint le</span>
                            <span className="text-gray-900 mt-1 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(coOwner.joined_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informations professionnelles (pour agences) */}
                    {coOwner.invitation_type === 'agency' && (
                      <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm">
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg pb-3 border-b">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                          Informations professionnelles
                        </h5>
                        <div className="space-y-4">
                          {coOwner.license_number && (
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Numéro de license</span>
                              <span className="text-gray-900 font-medium mt-1">{coOwner.license_number}</span>
                            </div>
                          )}
                          {coOwner.ifu && (
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">IFU</span>
                              <span className="text-gray-900 mt-1">{coOwner.ifu}</span>
                            </div>
                          )}
                          {coOwner.rccm && (
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">RCCM</span>
                              <span className="text-gray-900 mt-1">{coOwner.rccm}</span>
                            </div>
                          )}
                          {coOwner.vat_number && (
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Numéro TVA</span>
                              <span className="text-gray-900 mt-1">{coOwner.vat_number}</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</span>
                            <span className="text-gray-900 mt-1">
                              {coOwner.is_professional ? 
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  Professionnel
                                </span> : 
                                'Particulier'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Statistiques des délégations */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg pb-3 border-b">
                        <Key className="w-5 h-5 text-green-600" />
                        Délégations ({coOwner.delegations_count || 0})
                      </h5>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {coOwner.delegations?.filter(d => d.status === 'active').length || 0}
                              </p>
                              <p className="text-sm text-gray-600">Actives</p>
                            </div>
                          </div>
                        </div>
                        {coOwner.delegations?.some(d => d.status === 'expired') && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg">
                                <Clock className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {coOwner.delegations?.filter(d => d.status === 'expired').length || 0}
                                </p>
                                <p className="text-sm text-gray-600">Expirées</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {coOwner.delegations?.some(d => d.status === 'revoked') && (
                          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {coOwner.delegations?.filter(d => d.status === 'revoked').length || 0}
                                </p>
                                <p className="text-sm text-gray-600">Révoquées</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Délégations existantes */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg">
                          <Key className="w-6 h-6 text-white" />
                        </div>
                        Délégations des biens ({coOwner.delegations_count || 0})
                      </h4>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDelegate(coOwner)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      >
                        <Hand className="w-4 h-4" />
                        Ajouter une délégation
                      </Button>
                    </div>
                    
                    {coOwner.delegations && coOwner.delegations.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {coOwner.delegations.map((delegation) => (
                          <div 
                            key={delegation.id} 
                            className="relative bg-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-500 
                                     hover:shadow-2xl transition-all duration-300 
                                     bg-gradient-to-br from-white via-blue-50/30 to-white
                                     border-2 border-blue-200/50 hover:border-blue-400"
                            style={{
                              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
                              boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)',
                            }}
                          >
                            {/* Effet de bordure lumineuse */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl opacity-10 blur-sm"></div>
                            
                            {/* Contenu principal */}
                            <div className="relative">
                              {/* En-tête avec nom du bien et statut */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <div className="flex items-start gap-4">
                                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                    <Home className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-gray-900 text-xl mb-2">
                                      {delegation.property?.name || 'Bien sans nom'}
                                    </h5>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getDelegationStatusColor(delegation.status)}`}>
                                        {delegation.status === 'active' ? 
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="animate-pulse">●</span> Active
                                          </div> : 
                                          delegation.status === 'revoked' ? 'Révoquée' : 'Expirée'
                                        }
                                      </span>
                                      {delegation.property?.surface && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          {delegation.property.surface} m²
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {delegation.expires_at && (
                                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                                    <CalendarDays className="w-5 h-5 text-amber-600" />
                                    <div>
                                      <p className="text-xs text-amber-700 font-medium">Expire le</p>
                                      <p className="text-sm font-bold text-amber-900">{formatDate(delegation.expires_at)}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Informations du bien */}
                              <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl p-5 mb-6 border border-blue-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Adresse */}
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Adresse</p>
                                        <p className="text-gray-900 font-medium">
                                          {delegation.property?.address}, {delegation.property?.city}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Surface */}
                                    {delegation.property?.surface && (
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                                          <Building className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-700 mb-1">Surface</p>
                                          <p className="text-gray-900 font-medium">{delegation.property.surface} m²</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Dates */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Déléguée le</p>
                                        <p className="text-gray-900 font-medium">{formatDate(delegation.delegated_at)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Loyer */}
                                    {delegation.property?.rent_amount && (
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                                          <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-700 mb-1">Loyer mensuel</p>
                                          <p className="text-gray-900 font-medium">{delegation.property.rent_amount} €</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Notes */}
                              {delegation.notes && (
                                <div className="mb-6">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg">
                                      <FileText className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">Notes :</p>
                                  </div>
                                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200 shadow-sm">
                                    <p className="text-gray-700 leading-relaxed">{delegation.notes}</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Permissions */}
                              <div>
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                                    <Key className="w-5 h-5 text-green-600" />
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">Permissions accordées :</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {delegation.permissions?.map((permission) => (
                                    <div
                                      key={permission}
                                      className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-blue-50 
                                               text-center rounded-xl border-2 border-blue-100 hover:border-blue-300 
                                               hover:shadow-md transition-all duration-200 group"
                                    >
                                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                                        {getPermissionIcon(permission)}
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900">
                                        {getPermissionLabel(permission)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-2xl border-2 border-dashed border-blue-300">
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-30"></div>
                          <Building className="w-20 h-20 text-blue-400 relative mx-auto" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-3">Aucune délégation active</p>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                          Aucun bien n'a été délégué à ce gestionnaire pour le moment
                        </p>
                        <Button
                          variant="default"
                          onClick={() => handleDelegate(coOwner)}
                          className="flex items-center gap-3 mx-auto px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                        >
                          <Hand className="w-5 h-5" />
                          Déléguer un bien
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}

          {/* Section des invitations en attente */}
          {filteredInvitations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Invitations en attente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInvitations.map((invitation) => (
                  <Card key={invitation.id} className="p-5 border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-yellow-100 rounded-xl">
                        <Mail className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">{invitation.name}</p>
                            <p className="text-gray-600">{invitation.email}</p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium whitespace-nowrap">
                            En attente
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <UserCheck className="w-4 h-4" />
                            {getTypeLabel(invitation.invitation_type)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {invitation.is_professional ? 'Professionnel' : 'Particulier'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Expire le {formatDate(invitation.expires_at)}
                          </span>
                        </div>
                        
                        {invitation.meta && (
                          <div className="bg-white/80 border border-yellow-100 rounded-lg p-4 mb-4">
                            <h6 className="font-medium text-gray-900 mb-2">Informations supplémentaires :</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {invitation.meta.first_name && (
                                <div>
                                  <p className="text-xs text-gray-500">Prénom</p>
                                  <p className="font-medium text-gray-900">{invitation.meta.first_name}</p>
                                </div>
                              )}
                              {invitation.meta.last_name && (
                                <div>
                                  <p className="text-xs text-gray-500">Nom</p>
                                  <p className="font-medium text-gray-900">{invitation.meta.last_name}</p>
                                </div>
                              )}
                              {invitation.meta.company_name && (
                                <div className="sm:col-span-2">
                                  <p className="text-xs text-gray-500">Entreprise</p>
                                  <p className="font-medium text-gray-900">{invitation.meta.company_name}</p>
                                </div>
                              )}
                              {invitation.meta.phone && (
                                <div>
                                  <p className="text-xs text-gray-500">Téléphone</p>
                                  <p className="font-medium text-gray-900">{invitation.meta.phone}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              notify('Fonctionnalité à venir', 'info');
                            }}
                            className="flex-1"
                          >
                            Renvoyer l'invitation
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              notify('Fonctionnalité à venir', 'info');
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
            email: selectedCoOwner.email,
            invitation_type: selectedCoOwner.invitation_type
          }}
          notify={notify}
        />
      )}
    </div>
  );
};