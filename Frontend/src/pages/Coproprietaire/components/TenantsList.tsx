import React, { useEffect, useState, useMemo } from 'react';
import { Building, Users, Mail, Phone, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi, type CoOwnerTenant } from '@/services/coOwnerApi';

interface TenantsListProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const TenantsList: React.FC<TenantsListProps> = ({ onNavigate, notify }) => {
  const [tenants, setTenants] = useState<CoOwnerTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getTenants();
      setTenants(data);
    } catch (error: any) {
      console.warn('Error fetching tenants (silenced):', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant =>
      (tenant.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  const handleDelete = async (tenantId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?')) {
      return;
    }

    try {
      await coOwnerApi.deleteTenant(tenantId);
      setTenants(tenants.filter(t => t.id !== tenantId));
      notify('Locataire supprimé avec succès', 'success');
    } catch (error: any) {
      console.warn('Error deleting tenant (silenced):', error);
      notify('Erreur lors de la suppression du locataire', 'error');
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
          <div className="h-14 w-32 bg-gray-100 rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-10 rounded-[3rem] border-gray-100 shadow-xl shadow-green-900/5 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="space-y-6 relative">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-32 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-10 w-10 bg-gray-50 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-50 rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-50 rounded-lg animate-pulse" />
                </div>
                <div className="pt-4 border-t border-gray-50">
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
            Locataires
          </h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">
            Gestion centralisée de tous les occupants de vos propriétés sous délégation.
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-10 py-7 text-base font-black font-manrope shadow-[0_20px_50px_rgba(22,163,74,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-6 h-6" />
          <span>Nouveau Locataire</span>
        </Button>
      </div>

      {/* Search & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <Card className="lg:col-span-8 p-3 rounded-[2.5rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="relative group">
            <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-6 h-6 transition-colors group-focus-within:text-green-700" />
            <input
              type="text"
              placeholder="Chercher par nom, email ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 appearance-none shadow-sm"
            />
          </div>
        </Card>

        <div className="lg:col-span-4 flex justify-end gap-3 px-2">
          <div className="px-6 py-4 bg-green-50 rounded-[1.5rem] border border-green-100/50 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">Total</p>
              <p className="text-lg font-black text-gray-900 font-manrope leading-tight">{filteredTenants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      {filteredTenants.length === 0 ? (
        <Card className="p-20 text-center rounded-[4rem] border-gray-100 shadow-inner bg-gray-50/20 border-dashed">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-200/50 relative">
            <div className="absolute inset-0 bg-green-50 rounded-[2.5rem] animate-ping opacity-20" />
            <Users className="w-14 h-14 text-green-100 relative z-10" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 font-merriweather">
            Aucun locataire
          </h3>
          <p className="text-gray-400 font-manrope max-w-md mx-auto mb-10 text-lg leading-relaxed">
            {searchTerm
              ? `Nous n'avons trouvé aucun résultat correspondant à "${searchTerm}".`
              : 'Commencez par ajouter votre premier locataire pour lancer la gestion de vos baux.'
            }
          </p>
          <Button
            variant="outline"
            className="rounded-[1.5rem] border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-10 py-6 font-black font-manrope transition-all shadow-xl shadow-green-600/10"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-5 h-5 mr-3" />
            Créer un dossier
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="overflow-hidden rounded-[3.5rem] border-gray-100 shadow-xl shadow-green-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-50/30 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-green-100/40 transition-colors" />

              <div className="p-10 relative">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gray-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-gray-900/20 group-hover:scale-110 transition-transform">
                      {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                    </div>
                    <div className="pt-4 min-w-0">
                      <h3 className="text-2xl font-black text-gray-900 font-merriweather leading-tight truncate">
                        {tenant.first_name} {tenant.last_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest font-manrope">Actif</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => onNavigate(`tenants/${tenant.id}/edit`)}
                      className="p-4 rounded-2xl bg-white text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all shadow-sm border border-gray-50 hover:border-green-100"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id)}
                      className="p-4 rounded-2xl bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm border border-gray-50 hover:border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-50/50">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover/item:text-green-600 group-hover/item:bg-green-50 transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-gray-600 font-manrope truncate">{tenant.email || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover/item:text-green-600 group-hover/item:bg-green-50 transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Téléphone</p>
                      <p className="text-sm font-bold text-gray-900 font-manrope">{tenant.phone || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover/item:text-green-600 group-hover/item:bg-green-50 transition-all">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Adresse</p>
                      <p className="text-sm font-bold text-gray-600 font-manrope truncate">{tenant.address || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal - Design refined */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-xl rounded-[3.5rem] border-none shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden bg-white animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="p-16 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

              <div className="relative">
                <div className="w-24 h-24 bg-green-600 text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-green-600/30">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-4 font-merriweather tracking-tight">Nouveau Dossier</h3>
                <p className="text-gray-400 mb-12 font-manrope font-medium text-lg leading-relaxed">
                  Voulez-vous procéder à l'ajout d'un nouveau locataire ? Vous serez redirigé vers le formulaire d'enregistrement complet.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="py-6 px-10 rounded-2xl bg-gray-50 text-gray-500 font-black text-base hover:bg-gray-100 transition-all font-manrope border border-gray-100"
                  >
                    Plus tard
                  </button>
                  <button
                    onClick={() => { setShowAddModal(false); onNavigate('tenants/add'); }}
                    className="py-6 px-10 rounded-2xl bg-green-600 text-white font-black text-base hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 font-manrope"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
