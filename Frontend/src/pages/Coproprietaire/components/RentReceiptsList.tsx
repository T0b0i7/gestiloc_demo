import React, { useEffect, useState, useMemo } from 'react';
import { FileText, DollarSign, Download, Calendar, Search, Plus } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi, type CoOwnerRentReceipt } from '@/services/coOwnerApi';

interface RentReceiptsListProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

const money = (v: any) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);
};

export const RentReceiptsList: React.FC<RentReceiptsListProps> = ({ onNavigate, notify }) => {
  const [receipts, setReceipts] = useState<CoOwnerRentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getRentReceipts();
      setReceipts(data);
    } catch (error: any) {
      console.error('Error fetching rent receipts:', error);
      notify('Erreur lors du chargement des quittances', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchesSearch =
        (receipt.paid_month || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (receipt.property?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (receipt.lease?.tenant?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (receipt.lease?.tenant?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const handleGenerateReceipt = async (leaseId: number, month: string) => {
    try {
      await coOwnerApi.generateRentReceipt(leaseId, month);
      notify('Quittance générée avec succès', 'success');
    } catch (error: any) {
      console.error('Error generating receipt:', error);
      notify('Erreur lors de la génération de la quittance', 'error');
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
            Quittances de Loyer
          </h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">
            Suivez l'historique des paiements et téléchargez vos justificatifs officiels.
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-10 py-7 text-base font-black font-manrope shadow-[0_20px_50px_rgba(22,163,74,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none"
          onClick={() => onNavigate('receipts/generate')}
        >
          <Plus className="w-6 h-6" />
          <span>Générer Quittance</span>
        </Button>
      </div>

      {/* Search & Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <Card className="lg:col-span-8 p-3 rounded-[2.5rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-6 h-6 transition-colors group-focus-within:text-green-700" />
            <input
              type="text"
              placeholder="Chercher par mois, propriété ou locataire..."
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
            <option value="all">Tous les états</option>
            <option value="paid">Payées uniquement</option>
            <option value="pending">En attente</option>
            <option value="overdue">En retard</option>
          </select>
        </Card>
      </div>

      {/* Receipts Grid */}
      {filteredReceipts.length === 0 ? (
        <Card className="p-20 text-center rounded-[4rem] border-gray-100 shadow-inner bg-gray-50/20 border-dashed">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-200/50 relative">
            <div className="absolute inset-0 bg-green-50 rounded-[2.5rem] animate-ping opacity-20" />
            <FileText className="w-14 h-14 text-green-100 relative z-10" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 font-merriweather">
            Aucun document
          </h3>
          <p className="text-gray-400 font-manrope max-w-md mx-auto mb-10 text-lg leading-relaxed">
            {searchTerm
              ? `Aucune quittance ne correspond à la recherche "${searchTerm}".`
              : 'Votre historique de quittances est actuellement vide.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className="overflow-hidden rounded-[3.5rem] border-gray-100 shadow-xl shadow-green-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group relative border-t-8 border-t-green-600/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-50/30 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-green-100/40 transition-colors" />

              <div className="p-10 relative">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-gray-900 font-merriweather leading-tight">
                      Loyer {receipt.paid_month}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${getStatusColor(receipt.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${receipt.status === 'paid' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {getStatusLabel(receipt.status)}
                      </div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-manrope">Ref. #{receipt.id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => window.open(`/api/receipts/${receipt.id}/pdf`, '_blank')}
                    className="p-5 rounded-[1.5rem] bg-gray-900 text-white hover:bg-black transition-all shadow-xl shadow-gray-900/20 group-hover:scale-110"
                    title="Télécharger le PDF"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-50/50">
                  <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100/50">
                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Montant Perçu</p>
                    <div className="flex items-end gap-2 text-green-700">
                      <p className="text-2xl font-black font-manrope leading-none">{money(receipt.amount_paid)}</p>
                      <p className="text-xs font-black uppercase tracking-tighter mb-0.5">FCFA</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Date d'édition</p>
                      <p className="text-sm font-bold text-gray-600 font-manrope">{new Date(receipt.issued_date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope mb-4 bg-gray-50/50 py-1.5 px-4 rounded-full w-fit">
                      Contexte de location
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-200" />
                        <p className="text-xs font-bold text-gray-500 font-manrope truncate flex-1">
                          Locataire: <span className="text-gray-900 font-black ml-1">{receipt.lease?.tenant?.first_name} {receipt.lease?.tenant?.last_name}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-200" />
                        <p className="text-xs font-bold text-gray-500 font-manrope truncate flex-1">
                          Propriété: <span className="text-gray-900 font-black ml-1">{receipt.property?.name || 'Bien non spécifié'}</span>
                        </p>
                      </div>
                    </div>
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
