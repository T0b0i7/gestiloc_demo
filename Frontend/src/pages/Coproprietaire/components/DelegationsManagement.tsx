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
  ChevronRight,
  Shield,
  Key,
  DollarSign,
  Home,
  Star,
  ExternalLink,
  FileText,
  Settings,
  RefreshCw,
  Zap,
} from 'lucide-react';
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
      delegation.landlord?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegation.landlord?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegation.landlord?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delegation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-amber-50 to-white text-amber-700 border border-amber-200 shadow-amber-100';
      case 'active':
        return 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 border border-emerald-200 shadow-emerald-100';
      case 'expired':
        return 'bg-gradient-to-r from-gray-50 to-white text-gray-700 border border-gray-200 shadow-gray-100';
      case 'revoked':
        return 'bg-gradient-to-r from-rose-50 to-white text-rose-700 border border-rose-200 shadow-rose-100';
      default:
        return 'bg-gradient-to-r from-gray-50 to-white text-gray-700 border border-gray-200 shadow-gray-100';
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
      notify('✅ Délégation acceptée avec succès', 'success');
      setSelectedDelegation(null);
    } catch (error: any) {
      console.error('Error accepting delegation:', error);
      notify('❌ Erreur lors de l\'acceptation de la délégation', 'error');
    }
  };

  const handleRejectDelegation = async () => {
    if (!selectedDelegation) return;

    try {
      await coOwnerApi.rejectDelegation(selectedDelegation.id, rejectReason);
      await fetchDelegations();
      notify('✅ Délégation refusée avec succès', 'success');
      setShowRejectModal(false);
      setSelectedDelegation(null);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting delegation:', error);
      notify('❌ Erreur lors du refus de la délégation', 'error');
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
    const permissionMap: { [key: string]: { label: string, color: string } } = {
      'view': { label: 'Voir', color: 'bg-gradient-to-r from-blue-50 to-white text-blue-700 border border-blue-200 shadow-blue-100' },
      'edit': { label: 'Modifier', color: 'bg-gradient-to-r from-violet-50 to-white text-violet-700 border border-violet-200 shadow-violet-100' },
      'manage_lease': { label: 'Gérer baux', color: 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 border border-emerald-200 shadow-emerald-100' },
      'rent': { label: 'Gérer location', color: 'bg-gradient-to-r from-amber-50 to-white text-amber-700 border border-amber-200 shadow-amber-100' },
      'maintenance': { label: 'Maintenance', color: 'bg-gradient-to-r from-orange-50 to-white text-orange-700 border border-orange-200 shadow-orange-100' },
      'financial': { label: 'Finances', color: 'bg-gradient-to-r from-green-50 to-white text-green-700 border border-green-200 shadow-green-100' },
      'documents': { label: 'Documents', color: 'bg-gradient-to-r from-purple-50 to-white text-purple-700 border border-purple-200 shadow-purple-100' }
    };
    
    return permissions.map(p => permissionMap[p] || { label: p, color: 'bg-gradient-to-r from-gray-50 to-white text-gray-700 border border-gray-200 shadow-gray-100' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .shimmer {
            position: relative;
            overflow: hidden;
          }
          .shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
            animation: shimmer 2s infinite;
          }
        `}</style>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Gestion des délégations
          </h1>
        </div>
        <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-2 border-blue-50 rounded-xl p-4 shimmer">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full w-48"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full w-32"></div>
                  </div>
                  <div className="h-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
        }
        
        .delegation-card {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.15);
          border-radius: 20px;
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.1);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .delegation-card::before {
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
        
        .delegation-card:hover {
          transform: translateY(-8px);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 25px 70px rgba(59, 130, 246, 0.25);
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
        
        .action-btn-success {
          background: linear-gradient(135deg, #10b981, #34d399);
          border: none;
          color: white;
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.3);
        }
        
        .action-btn-success:hover {
          background: linear-gradient(135deg, #059669, #10b981);
          transform: translateY(-3px);
          box-shadow: 0 20px 50px rgba(16, 185, 129, 0.4);
        }
        
        .action-btn-danger {
          background: linear-gradient(135deg, #ef4444, #f87171);
          border: none;
          color: white;
          box-shadow: 0 15px 40px rgba(239, 68, 68, 0.3);
        }
        
        .action-btn-danger:hover {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          transform: translateY(-3px);
          box-shadow: 0 20px 50px rgba(239, 68, 68, 0.4);
        }
        
        .stats-card {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.15);
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
          transform: translateY(-6px);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.2);
        }
        
        .icon-circle {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15);
        }
        
        .modal-card {
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-radius: 24px;
          box-shadow: 0 25px 80px rgba(59, 130, 246, 0.25);
        }
        
        .info-section {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.03));
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .info-section:hover {
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
        }
        
        .permission-badge {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .delegation-item {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-3">
            Gestion des délégations
          </h1>
          <p className="text-xl text-gray-700">
            Gérez les demandes de délégation reçues
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total</p>
                <p className="text-3xl font-bold text-gray-900">{delegations.length}</p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">En attente</p>
                <p className="text-3xl font-bold text-gray-900">
                  {delegations.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Actives</p>
                <p className="text-3xl font-bold text-gray-900">
                  {delegations.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6">
            <div className="flex items-center gap-5">
              <div className="icon-circle p-4 rounded-2xl">
                <XCircle className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Révoquées</p>
                <p className="text-3xl font-bold text-gray-900">
                  {delegations.filter(d => d.status === 'revoked').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions et recherche */}
        <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-500 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Rechercher une délégation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input w-full pl-16 pr-6 py-4 text-lg focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="icon-circle p-3 rounded-xl">
                <Filter className="w-6 h-6 text-blue-600" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="filter-select px-6 py-4 text-lg focus:outline-none w-full md:w-auto"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="active">Active</option>
                <option value="expired">Expirée</option>
                <option value="revoked">Révoquée</option>
              </select>
              
              <button
                onClick={() => onNavigate('inviter-proprietaire')}
                className="action-btn-primary px-6 py-4 flex items-center gap-3 font-bold whitespace-nowrap"
              >
                <Users className="w-5 h-5" />
                <span>Inviter un propriétaire</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header de résultats */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {filteredDelegations.length} délégation{filteredDelegations.length > 1 ? 's' : ''} trouvée{filteredDelegations.length > 1 ? 's' : ''}
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez les délégations accordées et en attente
            </p>
          </div>
          <button
            onClick={fetchDelegations}
            className="action-btn px-6 py-3 flex items-center space-x-3 font-bold text-blue-600"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Liste des délégations */}
        {filteredDelegations.length === 0 ? (
          <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl p-16 text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full icon-circle flex items-center justify-center">
              <Users className="w-16 h-16 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'Aucune délégation trouvée' : 'Aucune délégation'}
            </h3>
            <p className="text-gray-700 mb-10 max-w-lg mx-auto text-lg">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Les demandes de délégation apparaîtront ici'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => onNavigate('inviter-proprietaire')}
                className="action-btn-primary px-8 py-4 inline-flex items-center gap-3 font-bold text-lg"
              >
                <Users className="w-6 h-6" />
                Inviter un propriétaire
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDelegations.map((delegation, index) => {
              const permissionsList = getPermissionsList(delegation.permissions || []);
              
              return (
                <div 
                  key={delegation.id} 
                  className="delegation-card delegation-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    {/* Header avec titre et statut */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {delegation.property?.name || 'Bien non spécifié'}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${getStatusColor(delegation.status)}`}>
                              {getStatusIcon(delegation.status)}
                              <span>{getStatusLabel(delegation.status)}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Demandée le {formatDate(delegation.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {delegation.property?.rent_amount && (
                        <div className="info-section px-4 py-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-emerald-600">
                              {parseFloat(delegation.property.rent_amount).toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Grille d'informations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Propriétaire */}
                      <div className="info-section p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <h4 className="font-semibold text-gray-900">Propriétaire</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Nom :</span>
                            <span className="font-medium text-gray-900">
                              {delegation.landlord?.first_name} {delegation.landlord?.last_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {delegation.landlord?.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Propriété */}
                      <div className="info-section p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Home className="w-5 h-5 text-gray-500" />
                          <h4 className="font-semibold text-gray-900">Propriété</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {delegation.property?.address}, {delegation.property?.city}
                            </span>
                          </div>
                          {delegation.expires_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <span className="text-sm text-gray-600">Expire le : </span>
                                <span className="font-medium text-gray-900">
                                  {formatDate(delegation.expires_at)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Permissions */}
                      {permissionsList.length > 0 && (
                        <div className="info-section p-4 lg:col-span-2">
                          <div className="flex items-center gap-3 mb-3">
                            <Key className="w-5 h-5 text-gray-500" />
                            <h4 className="font-semibold text-gray-900">Permissions accordées</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {permissionsList.map((permission, idx) => (
                              <span 
                                key={idx}
                                className={`permission-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${permission.color}`}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                              >
                                <Star className="w-3 h-3" />
                                {permission.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-blue-100">
                      <button
                        onClick={() => onNavigate(`delegation/${delegation.id}`)}
                        className="action-btn flex-1 py-3 px-4 flex items-center justify-center gap-3 font-bold text-gray-800"
                      >
                        <Eye className="w-5 h-5" />
                        Voir les détails
                      </button>
                      
                      {delegation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptDelegation(delegation.id)}
                            className="action-btn-success flex-1 py-3 px-4 flex items-center justify-center gap-3 font-bold"
                          >
                            <Check className="w-5 h-5" />
                            Accepter la délégation
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDelegation(delegation);
                              setShowRejectModal(true);
                            }}
                            className="action-btn-danger flex-1 py-3 px-4 flex items-center justify-center gap-3 font-bold"
                          >
                            <X className="w-5 h-5" />
                            Refuser
                          </button>
                        </>
                      )}
                      
                
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de refus */}
      {showRejectModal && selectedDelegation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-card max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
                  <XCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Refuser la délégation</h2>
                  <p className="text-sm text-gray-600">
                    {selectedDelegation.property?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Motif du refus
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="search-input w-full px-4 py-3 focus:outline-none"
                    placeholder="Expliquez pourquoi vous refusez cette délégation..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Le propriétaire recevra cette explication
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedDelegation(null);
                      setRejectReason('');
                    }}
                    className="action-btn flex-1 py-3 font-bold text-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRejectDelegation}
                    className="action-btn-danger flex-1 py-3 font-bold"
                    disabled={!rejectReason.trim()}
                  >
                    Refuser la délégation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};