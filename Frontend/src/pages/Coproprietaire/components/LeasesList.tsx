import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Home, Users, Calendar, DollarSign, Edit, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi, type CoOwnerLease } from '@/services/coOwnerApi';

interface LeasesListProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

const money = (v: any) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);
};

export const LeasesList: React.FC<LeasesListProps> = ({ onNavigate, notify }) => {
  const [leases, setLeases] = useState<CoOwnerLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getLeases();
      setLeases(data);
    } catch (error: any) {
      console.warn('Error fetching leases (silenced):', error);
      setLeases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const filteredLeases = useMemo(() => {
    return leases.filter(lease => {
      const matchesSearch =
        (lease.property?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lease.tenant?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lease.tenant?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lease.tenant?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leases, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'terminated': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'expired': return 'Expiré';
      case 'terminated': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const handleTerminateLease = async (leaseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir résilier ce bail ?')) {
      return;
    }

    try {
      await coOwnerApi.terminateLease(leaseId, new Date().toISOString().split('T')[0]);
      setLeases(leases.map(l =>
        l.id === leaseId ? { ...l, status: 'terminated' } : l
      ));
      notify('Bail résilié avec succès', 'success');
    } catch (error: any) {
      console.error('Error terminating lease:', error);
      notify('Erreur lors de la résiliation du bail', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-4 w-64 bg-gray-50 rounded-lg animate-pulse" />
          </div>
          <div className="h-14 w-40 bg-gray-100 rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-10 rounded-[3rem] border-gray-100 shadow-xl shadow-green-900/5 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="space-y-6 relative">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-32 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-10 w-10 bg-gray-50 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="h-4 w-full bg-gray-50 rounded-lg animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-50 rounded-lg animate-pulse" />
                  <div className="h-10 w-full bg-gray-50 rounded-xl animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-merriweather tracking-tight">
            Contrats de Bail
          </h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">
            Suivi et gestion des engagements locatifs pour vos propriétés déléguées.
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-10 py-7 text-base font-black font-manrope shadow-[0_20px_50px_rgba(22,163,74,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none"
          onClick={() => onNavigate('leases/add')}
        >
          <Plus className="w-6 h-6" />
          <span>Rédiger un Bail</span>
        </Button>
      </div>

      {/* Search & Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <Card className="lg:col-span-8 p-3 rounded-[2.5rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="relative group">
            <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-6 h-6 transition-colors group-focus-within:text-green-700" />
            <input
              type="text"
              placeholder="Chercher par propriété, locataire ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 appearance-none shadow-sm"
            />
          </div>
        </Card>

        <Card className="lg:col-span-4 p-3 rounded-[2rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-6 py-5 bg-white border border-transparent rounded-[1.5rem] text-sm font-black text-gray-700 outline-none cursor-pointer font-manrope"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Baux Actifs</option>
            <option value="expired">Baux Expirés</option>
            <option value="terminated">Baux Terminés</option>
          </select>
        </Card>
      </div>

      {/* Leases Grid */}
      {filteredLeases.length === 0 ? (
        <Card className="p-20 text-center rounded-[4rem] border-gray-100 shadow-inner bg-gray-50/20 border-dashed">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-200/50 relative">
            <div className="absolute inset-0 bg-green-50 rounded-[2.5rem] animate-ping opacity-20" />
            <FileText className="w-14 h-14 text-green-100 relative z-10" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 font-merriweather">
            Aucun contrat trouvé
          </h3>
          <p className="text-gray-400 font-manrope max-w-md mx-auto mb-10 text-lg leading-relaxed">
            {searchTerm
              ? `Nous n'avons trouvé aucun bail correspondant à "${searchTerm}".`
              : 'Aucun contrat de bail n\'est encore enregistré pour vos propriétés déléguées.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLeases.map((lease) => (
            <Card key={lease.id} className="overflow-hidden rounded-[3.5rem] border-gray-100 shadow-xl shadow-green-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group relative border-t-8 border-t-green-600/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-50/30 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-green-100/40 transition-colors" />

              <div className="p-10 relative">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-manrope">Ref. #{lease.id}</p>
                    </div>
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${getStatusColor(lease.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${lease.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {getStatusLabel(lease.status)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => onNavigate(`leases/${lease.id}/edit`)}
                      className="p-4 rounded-2xl bg-white text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all shadow-sm border border-gray-50 hover:border-green-100"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {lease.status === 'active' && (
                      <button
                        onClick={() => handleTerminateLease(lease.id)}
                        className="p-4 rounded-2xl bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm border border-gray-50 hover:border-red-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-50/50">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <Home className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Propriété</p>
                      <p className="text-sm font-black text-gray-900 font-manrope truncate">{lease.property?.name || 'Bien #' + lease.property_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Locataire</p>
                      <p className="text-sm font-bold text-gray-600 font-manrope truncate">{lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : '—'}</p>
                    </div>
                  </div>

                  <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100/50 group-hover:bg-green-600 transition-all duration-500">
                    <p className="text-[9px] font-black text-green-600 group-hover:text-green-200 uppercase tracking-widest mb-1 transition-colors">Loyer Mensuel</p>
                    <div className="flex items-end gap-2 text-green-700 group-hover:text-white transition-colors">
                      <p className="text-2xl font-black font-manrope leading-none">{money(lease.rent_amount)}</p>
                      <p className="text-xs font-black uppercase tracking-tighter mb-0.5">FCFA</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Calendar className="w-4 h-4 text-gray-300" />
                    <p className="text-[10px] font-black text-gray-400 font-manrope uppercase tracking-wider">
                      Du {new Date(lease.start_date).toLocaleDateString('fr-FR')} {lease.end_date ? `au ${new Date(lease.end_date).toLocaleDateString('fr-FR')}` : '(Indéterminé)'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
