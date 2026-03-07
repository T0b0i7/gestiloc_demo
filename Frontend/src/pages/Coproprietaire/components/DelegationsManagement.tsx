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
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';

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
      console.warn('Error fetching delegations (silenced):', error);
      setDelegations([]);
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
      'view': { label: 'Voir', color: 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 border border-emerald-200 shadow-emerald-100' },
      'edit': { label: 'Modifier', color: 'bg-gradient-to-r from-amber-50 to-white text-amber-700 border border-amber-200 shadow-amber-100' },
      'manage_lease': { label: 'Gérer baux', color: 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 border border-emerald-200 shadow-emerald-100' },
      'rent': { label: 'Gérer location', color: 'bg-gradient-to-r from-amber-50 to-white text-amber-700 border border-amber-200 shadow-amber-100' },
      'maintenance': { label: 'Maintenance', color: 'bg-gradient-to-r from-orange-50 to-white text-orange-700 border border-orange-200 shadow-orange-100' },
      'financial': { label: 'Finances', color: 'bg-gradient-to-r from-green-50 to-white text-green-700 border border-green-200 shadow-green-100' },
      'documents': { label: 'Documents', color: 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 border border-emerald-200 shadow-emerald-100' }
    };

    return permissions.map(p => permissionMap[p] || { label: p, color: 'bg-gradient-to-r from-gray-50 to-white text-gray-700 border border-gray-200 shadow-gray-100' });
  };

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: "'Merriweather', serif" }}>
        <h1 className="text-3xl font-black text-gray-900 font-merriweather">
          Délégations reçues
        </h1>
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl p-10">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-50 rounded-[2rem] p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-6 bg-gray-100 rounded-full w-48" />
                    <Skeleton className="h-3 bg-gray-100 rounded-full w-32" />
                  </div>
                  <Skeleton className="h-8 bg-gray-100 rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-merriweather">
            Délégations reçues
          </h1>
          <p className="text-sm font-medium text-gray-500 font-manrope mt-2">
            Gérez les demandes de gestion déléguée de vos clients propriétaires.
          </p>
        </div>
        <Button
          onClick={() => onNavigate('inviter-proprietaire')}
          className="bg-green-600 hover:bg-green-700 rounded-[1.5rem] px-8 py-6 text-base font-black font-manrope shadow-xl shadow-green-600/20"
        >
          <Users className="w-5 h-5 mr-3" />
          Nouveau Propriétaire
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-8 rounded-[2.5rem] border-gray-50 bg-white shadow-xl shadow-gray-200/40 border-t-4 border-t-green-500">
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-green-50 w-fit rounded-2xl shadow-inner">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Total demandes</p>
              <p className="text-2xl font-black text-gray-900 font-merriweather mt-1">{delegations.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-gray-50 bg-white shadow-xl shadow-gray-200/40 border-t-4 border-t-amber-500">
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-amber-50 w-fit rounded-2xl shadow-inner">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">En attente</p>
              <p className="text-2xl font-black text-gray-900 font-merriweather mt-1">
                {delegations.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-gray-50 bg-white shadow-xl shadow-gray-200/40 border-t-4 border-t-emerald-500">
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-emerald-50 w-fit rounded-2xl shadow-inner text-emerald-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Actives</p>
              <p className="text-2xl font-black text-gray-900 font-merriweather mt-1">
                {delegations.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-gray-50 bg-white shadow-xl shadow-gray-200/40 border-t-4 border-t-rose-500">
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-rose-100 w-fit rounded-2xl shadow-inner text-rose-700">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Révoquées</p>
              <p className="text-2xl font-black text-gray-900 font-merriweather mt-1">
                {delegations.filter(d => d.status === 'revoked').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ACTIONS ET RECHERCHE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6 rounded-[2rem] border-gray-50 shadow-xl shadow-gray-200/50 bg-white">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par propriété, propriétaire ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-400 shadow-sm appearance-none"
            />
          </div>
        </Card>

        <Card className="p-4 rounded-[2rem] border-gray-50 shadow-xl shadow-gray-200/50 bg-white flex items-center">
          <Filter className="w-5 h-5 text-green-600 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-transparent p-2 text-sm font-black text-gray-700 outline-none font-manrope cursor-pointer appearance-none"
          >
            <option value="all">Satus : Tous</option>
            <option value="pending">En attente</option>
            <option value="active">Actives</option>
            <option value="expired">Expirées</option>
            <option value="revoked">Révoquées</option>
          </select>
        </Card>
      </div>

      {/* LISTE DES RÉSULTATS */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-gray-900 font-merriweather">
          {filteredDelegations.length} résultat{filteredDelegations.length > 1 ? 's' : ''}
        </h2>
        <Button
          onClick={fetchDelegations}
          className="rounded-2xl w-12 h-12 p-0 bg-white border border-gray-100 text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 shadow-sm transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {filteredDelegations.length === 0 ? (
        <Card className="p-20 text-center rounded-[2.5rem] border-gray-100 shadow-inner bg-gray-50/30">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
            <Users className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2 font-merriweather">
            Aucune demande trouvée
          </h3>
          <p className="text-gray-400 font-manrope max-w-sm mx-auto font-medium">
            {searchTerm || statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres de recherche pour trouver ce que vous cherchez.'
              : 'Vous n\'avez pas encore reçu de demande de délégation.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredDelegations.map((delegation) => {
            const permissionsList = getPermissionsList(delegation.permissions || []);
            const rentVal = Number(delegation.property?.rent_amount ?? 0);

            return (
              <Card key={delegation.id} className="overflow-hidden rounded-[2.5rem] border-gray-50 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all bg-white group flex flex-col h-full">
                <div className="p-8 flex-grow space-y-6">
                  <div className="flex justify-between items-start">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border font-manrope ${delegation.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      delegation.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-rose-100 text-rose-700 border-rose-200'
                      }`}>
                      {getStatusLabel(delegation.status)}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Demandé le {formatDate(delegation.created_at)}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100 group-hover:bg-green-600 group-hover:border-green-600 transition-all shadow-sm">
                        <Building className="w-7 h-7 text-green-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 font-merriweather leading-tight">
                          {delegation.property?.name || 'Bien non identifié'}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 font-manrope mt-1">
                          <MapPin className="w-4 h-4 inline mr-1 text-green-600" />
                          {delegation.property?.address}, {delegation.property?.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-6 rounded-[2rem] bg-gray-50 border border-white shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Propriétaire</p>
                      <p className="text-sm font-black text-gray-900 font-manrope truncate">
                        {delegation.landlord?.first_name} {delegation.landlord?.last_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Rent Amount</p>
                      <p className="text-sm font-black text-green-600 font-manrope">
                        {new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(rentVal)} FCFA/mois
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Permissions de gestion</p>
                    <div className="flex flex-wrap gap-2">
                      {permissionsList.map((p, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-700 font-manrope shadow-sm">
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-gray-50 flex gap-4">
                  <Button
                    onClick={() => onNavigate(`delegation/${delegation.id}`)}
                    className="flex-1 rounded-2xl bg-white border border-gray-100 text-gray-900 font-black font-manrope hover:bg-gray-50 hover:shadow-md transition-all py-6"
                  >
                    <Eye className="w-5 h-5 mr-2 text-green-600" />
                    Détails
                  </Button>

                  {delegation.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleAcceptDelegation(delegation.id)}
                        className="flex-1 rounded-2xl bg-green-600 text-white font-black font-manrope hover:bg-green-700 shadow-xl shadow-green-600/20 py-6"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Accepter
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedDelegation(delegation);
                          setShowRejectModal(true);
                        }}
                        className="rounded-2xl w-14 h-14 p-0 bg-white border border-gray-100 text-rose-600 hover:bg-rose-50 transition-all font-black text-xl"
                      >
                        ×
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL DE REFUS - REVISITED */}
      {showRejectModal && selectedDelegation && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl space-y-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 font-merriweather">
                Refuser la demande
              </h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center text-2xl font-black"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100">
                <p className="text-xs font-black text-rose-700 uppercase tracking-widest font-manrope underline underline-offset-4 decoration-rose-200">Propriété</p>
                <p className="text-base font-black text-rose-900 font-manrope mt-2 italic">"{selectedDelegation.property?.name}"</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Motif du refus (obligatoire)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-manrope placeholder:text-gray-300 shadow-inner"
                  placeholder="Ex: Conditions non remplies, bien non éligible..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-[1.5rem] py-6 text-base font-black font-manrope transition-all"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRejectDelegation}
                disabled={!rejectReason.trim()}
                className="flex-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[1.5rem] py-6 text-base font-black font-manrope shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                Confirmer le refus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};