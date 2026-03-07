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
  RefreshCw,
  MapPin
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
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(num || 0) + ' FCFA';
  };

  const getPermissionBadge = (permission: string) => {
    const colors: Record<string, string> = {
      'manage_lease': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'collect_rent': 'bg-green-50 text-green-600 border-green-100',
      'manage_maintenance': 'bg-orange-50 text-orange-600 border-orange-100',
      'send_invoices': 'bg-purple-50 text-purple-600 border-purple-100'
    };

    const labels: Record<string, string> = {
      'manage_lease': 'Gestion des baux',
      'collect_rent': 'Encaisser loyers',
      'manage_maintenance': 'Maintenance',
      'send_invoices': 'Facturation'
    };

    return (
      <span
        key={permission}
        className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${colors[permission] || 'bg-gray-50 text-gray-400 border-gray-100'} font-manrope`}
      >
        {labels[permission] || permission}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-4 w-64 bg-gray-50 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-10 rounded-[3rem] border-gray-100 shadow-xl shadow-green-900/5 bg-white relative overflow-hidden">
              <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse mb-6" />
              <div className="h-6 w-full bg-gray-50 rounded-lg animate-pulse mb-4" />
              <div className="h-4 w-2/3 bg-gray-50 rounded-lg animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-merriweather tracking-tight">Délégations</h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">
            {filteredDelegations.length} propriété{filteredDelegations.length > 1 ? 's' : ''} sous votre gestion déléguée.
          </p>
        </div>
        <Button
          onClick={fetchDelegations}
          className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-10 py-7 text-xs font-black font-manrope shadow-[0_20px_50px_rgba(22,163,74,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none uppercase tracking-widest"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-3 rounded-[2.5rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-6 h-6 transition-colors group-focus-within:text-green-700" />
            <input
              type="text"
              placeholder="Rechercher une propriété, adresse ou propriétaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-transparent rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:bg-gray-50/50 transition-all font-manrope placeholder:text-gray-300"
            />
          </div>
          <div className="flex items-center gap-3 px-6 lg:border-l border-gray-50">
            <Filter className="w-5 h-5 text-green-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-5 bg-white border border-transparent rounded-[1.5rem] text-sm font-black text-gray-700 outline-none cursor-pointer font-manrope min-w-[180px]"
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
      {filteredDelegations.length === 0 ? (
        <Card className="p-32 text-center bg-gray-50/20 rounded-[5rem] border-dashed border-gray-200">
          <div className="bg-white w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-200/50 relative">
            <Building className="w-10 h-10 text-green-100" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 rounded-full w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 font-merriweather tracking-tight">
            Aucun patrimoine
          </h3>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-sm mx-auto leading-relaxed">
            {searchTerm
              ? `Votre recherche pour "${searchTerm}" n'a donné aucun résultat.`
              : 'Les propriétés qui vous sont déléguées apparaîtront ici dès leur activation.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredDelegations.map((delegation) => (
            <Card
              key={delegation.id}
              className="overflow-hidden rounded-[3.5rem] border-gray-100 shadow-xl shadow-green-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group flex flex-col h-full relative border-t-8 border-t-green-600/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 opacity-20 group-hover:opacity-100 rounded-full -mr-16 -mt-16 blur-2xl transition-all" />

              <div className="p-10 flex-grow relative">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                    <div className={`inline-flex items-center space-x-2 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusColor(delegation.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                      {getStatusIcon(delegation.status)}
                      <span>{getStatusText(delegation.status)}</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID Délég. #{delegation.id}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDelegation(delegation);
                      setShowDetailsModal(true);
                    }}
                    className="p-5 rounded-[1.5rem] bg-gray-900 text-white hover:bg-green-600 transition-all shadow-xl shadow-gray-900/10 group-hover:scale-110 active:scale-90"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4 font-merriweather leading-tight group-hover:text-green-700 transition-colors">
                  {delegation.property.name}
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-sm font-black text-gray-900 bg-green-50/50 p-4 rounded-2xl border border-green-100/50 font-manrope">
                    <Building className="w-5 h-5 text-green-600" />
                    <span className="truncate">{delegation.property.address}, {delegation.property.city}</span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 font-manrope">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-[10px] uppercase">
                      {delegation.landlord.user.first_name?.[0]}{delegation.landlord.user.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Propriétaire Mandant</p>
                      <p className="text-sm font-bold">{delegation.landlord.user.first_name} {delegation.landlord.user.last_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Mandat activé le</p>
                      <p className="text-xs font-bold text-gray-600 font-manrope">{formatDate(delegation.delegated_at)}</p>
                    </div>
                    {delegation.property.rent_amount && (
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Loyer Actuel</p>
                        <p className="text-xs font-black text-green-600 font-manrope">{formatCurrency(delegation.property.rent_amount)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Section */}
                {delegation.permissions && delegation.permissions.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 font-manrope">Actions Autorisées</p>
                    <div className="flex flex-wrap gap-2">
                      {delegation.permissions.map(permission => getPermissionBadge(permission))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Expiry */}
              <div className="p-10 bg-gray-50/50 flex items-center justify-between border-t border-white overflow-hidden relative group-hover:bg-green-600 transition-colors duration-500">
                <div className="relative z-10 flex items-center gap-4 text-gray-400 group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                  <p className="text-[10px] font-black uppercase tracking-widest font-manrope">
                    {delegation.expires_at
                      ? `Expire le ${formatDate(delegation.expires_at)}`
                      : 'Contrat à durée indéterminée'}
                  </p>
                </div>
                <button className="relative z-10 text-[10px] font-black text-green-600 group-hover:text-white uppercase tracking-widest flex items-center gap-2 group/btn">
                  <span>Gérer</span>
                  <Settings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de détails - Premium Design */}
      {showDetailsModal && selectedDelegation && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <Card className="bg-white rounded-[4rem] p-12 max-w-3xl w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-none relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

            <div className="relative">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-gray-900 font-merriweather">Détails du Mandat</h2>
                  <p className="text-gray-400 font-manrope font-black text-[10px] uppercase tracking-widest">Réf. Archive #DL-{selectedDelegation.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-5 rounded-3xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4 font-manrope">Actif Immobilier</p>
                    <div className="bg-green-50/30 p-8 rounded-[2.5rem] border border-green-100/50 space-y-4">
                      <p className="text-xl font-black text-gray-900 font-merriweather">{selectedDelegation.property.name}</p>
                      <div className="flex items-start gap-4 text-sm font-bold text-gray-500 font-manrope">
                        <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                        <p>{selectedDelegation.property.address}<br />{selectedDelegation.property.zip_code} {selectedDelegation.property.city}</p>
                      </div>
                      {selectedDelegation.property.rent_amount && (
                        <p className="text-2xl font-black text-green-600 font-manrope mt-4">
                          {formatCurrency(selectedDelegation.property.rent_amount)} <span className="text-[10px] uppercase text-gray-400">/ mois</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4 font-manrope">Propriétaire Mandant</p>
                    <div className="bg-green-50/30 p-8 rounded-[2.5rem] border border-green-100/50">
                      <p className="text-xl font-black text-gray-900 font-merriweather">
                        {selectedDelegation.landlord.user.first_name} {selectedDelegation.landlord.user.last_name}
                      </p>
                      <p className="text-sm font-bold text-green-600 font-manrope mt-2">{selectedDelegation.landlord.user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 font-manrope">Statut Juridique</p>
                    <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                      <div className="flex justify-between items-center group">
                        <span className="text-xs font-black text-gray-400 uppercase font-manrope">État actuel</span>
                        <div className={`flex items-center space-x-2 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(selectedDelegation.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                          {getStatusIcon(selectedDelegation.status)}
                          <span>{getStatusText(selectedDelegation.status)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-black text-gray-400 uppercase font-manrope">Début du mandat</span>
                        <span className="text-sm font-black text-gray-900">{formatDate(selectedDelegation.delegated_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-black text-gray-400 uppercase font-manrope">Échéance prévue</span>
                        <span className="text-sm font-black text-yellow-600">{selectedDelegation.expires_at ? formatDate(selectedDelegation.expires_at) : 'Reuconductible'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedDelegation.permissions && selectedDelegation.permissions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 font-manrope">Domaines de gestion</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDelegation.permissions.map(permission => getPermissionBadge(permission))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-[2rem] px-16 py-7 text-xs font-black uppercase tracking-[0.2em] font-manrope shadow-2xl transition-all active:scale-95 border-none"
                >
                  Clore la fiche
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
