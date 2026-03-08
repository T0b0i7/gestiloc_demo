import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter, Search, CreditCard, PiggyBank, Receipt } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi } from '@/services/coOwnerApi';

interface FinancesProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  pendingPayments: number;
}

export const Finances: React.FC<FinancesProps> = ({ onNavigate, notify }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      // Récupérer les données financières
      const [receipts] = await Promise.all([
        coOwnerApi.getRentReceipts()
      ]);

      // Calculer le résumé financier
      const totalIncome = receipts.reduce((sum: number, receipt) => {
        const amount = parseFloat(receipt.amount_paid?.toString() || '0');
        return receipt.status === 'paid' ? sum + (amount || 0) : sum;
      }, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthReceipts = receipts.filter(receipt => {
        const receiptDate = new Date(receipt.payment_date || receipt.issued_date || '');
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
      });

      const currentMonthIncome = currentMonthReceipts.reduce((sum: number, receipt) => {
        const amount = parseFloat(receipt.amount_paid?.toString() || '0');
        return sum + (amount || 0);
      }, 0);

      const pendingPayments = receipts.filter(receipt => receipt.status === 'pending').length;

      setSummary({
        totalIncome,
        totalExpenses: 0, // À implémenter avec les dépenses
        netIncome: totalIncome,
        currentMonthIncome,
        currentMonthExpenses: 0,
        pendingPayments
      });

      // Transformer les reçus en transactions
      const transactionData = receipts.map(receipt => ({
        id: receipt.id,
        type: 'income',
        description: `Loyer ${receipt.paid_month}`,
        amount: parseFloat(receipt.amount_paid?.toString() || '0') || 0,
        date: receipt.payment_date || receipt.issued_date,
        status: receipt.status,
        property: receipt.property?.name,
        tenant: receipt.lease?.tenant
      }));

      setTransactions(transactionData);
    } catch (error: any) {
      console.warn('Error fetching financial data (silenced):', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch =
        (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.property || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.tenant?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.tenant?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (dateFilter === 'all') return matchesSearch;

      const transactionDate = new Date(transaction.date);
      const now = new Date();

      if (dateFilter === 'month') {
        return matchesSearch &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear();
      }

      if (dateFilter === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        const transactionQuarter = Math.floor(transactionDate.getMonth() / 3);
        return matchesSearch &&
          transactionQuarter === quarter &&
          transactionDate.getFullYear() === now.getFullYear();
      }

      if (dateFilter === 'year') {
        return matchesSearch && transactionDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch;
    });
  }, [transactions, searchTerm, dateFilter]);

  const formatCurrency = (amount: number) => {
    const n = Number(amount ?? 0);
    return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n) + " FCFA";
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-8 rounded-[2rem] border-gray-100 shadow-xl shadow-green-900/5 bg-white relative overflow-hidden">
              <div className="h-4 w-24 bg-gray-100 rounded-lg animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-50 rounded-lg animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-merriweather tracking-tight">Finances</h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">Suivez vos revenus et performances en temps réel pour vos actifs immobiliers.</p>
        </div>
        <Button
          onClick={() => onNavigate('quittances')}
          className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-10 py-7 text-base font-black font-manrope shadow-[0_20px_50px_rgba(22,163,74,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none"
        >
          <Receipt className="w-6 h-6" />
          <span>Gestion Quittances</span>
        </Button>
      </div>

      {/* Résumé financier - Premium Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-10 rounded-[3.5rem] border-gray-100 bg-white shadow-xl shadow-green-900/5 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-100/50 transition-colors" />
            <div className="relative space-y-6">
              <div className="p-5 bg-green-50 w-fit rounded-[1.5rem] shadow-inner transform group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] font-manrope">Revenus totaux</p>
                <div className="flex items-end gap-1 text-gray-900">
                  <p className="text-2xl font-black font-merriweather">{formatCurrency(summary.totalIncome).replace(' FCFA', '')}</p>
                  <p className="text-[10px] font-black mb-1.5 text-green-600">FCFA</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-10 rounded-[3.5rem] border-gray-100 bg-white shadow-xl shadow-green-900/5 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-100/50 transition-colors" />
            <div className="relative space-y-6">
              <div className="p-5 bg-green-50 w-fit rounded-[1.5rem] shadow-inner transform group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] font-manrope">Collecte ce mois</p>
                <div className="flex items-end gap-1 text-gray-900">
                  <p className="text-2xl font-black font-merriweather">{formatCurrency(summary.currentMonthIncome).replace(' FCFA', '')}</p>
                  <p className="text-[10px] font-black mb-1.5 text-green-600">FCFA</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-10 rounded-[3.5rem] border-gray-100 bg-white shadow-xl shadow-green-900/5 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-yellow-100/50 transition-colors" />
            <div className="relative space-y-6">
              <div className="p-5 bg-yellow-50 w-fit rounded-[1.5rem] shadow-inner transform group-hover:scale-110 transition-transform">
                <CreditCard className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] font-manrope">Paiements en attente</p>
                <p className="text-4xl font-black text-gray-900 font-merriweather leading-none">{summary.pendingPayments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-10 rounded-[3.5rem] border-gray-100 bg-gray-900 shadow-2xl shadow-green-900/20 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-600/20 transition-colors" />
            <div className="relative space-y-6">
              <div className="p-5 bg-green-600 w-fit rounded-[1.5rem] shadow-xl shadow-green-600/40 transform group-hover:scale-110 transition-transform">
                <PiggyBank className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] font-manrope">Solde Net Délégué</p>
                <div className="flex items-end gap-1 text-white">
                  <p className="text-2xl font-black font-merriweather">{formatCurrency(summary.netIncome).replace(' FCFA', '')}</p>
                  <p className="text-[10px] font-black mb-1.5 text-green-400">FCFA</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Advanced Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <Card className="lg:col-span-8 p-3 rounded-[2.5rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-6 h-6 transition-colors group-focus-within:text-green-700" />
            <input
              type="text"
              placeholder="Rechercher par description, propriété ou locataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 appearance-none shadow-sm"
            />
          </div>
        </Card>

        <Card className="lg:col-span-4 p-3 rounded-[2rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="flex items-center px-4">
            <Filter className="w-5 h-5 text-green-600 mr-2" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full py-5 bg-white border border-transparent rounded-[1.5rem] text-sm font-black text-gray-700 outline-none cursor-pointer font-manrope"
            >
              <option value="all">Historique Complet</option>
              <option value="month">Ce Mois-ci</option>
              <option value="quarter">Ce Trimestre</option>
              <option value="year">Cette Année</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="overflow-hidden rounded-[4rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-2xl font-black text-gray-900 font-merriweather tracking-tight">Historique des transactions</h3>
          <Button variant="outline" className="rounded-2xl border-gray-100 font-manrope font-black text-xs uppercase tracking-widest text-gray-400 hover:text-green-600 hover:border-green-100">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-32 text-center bg-gray-50/20">
            <div className="bg-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-200/50 relative">
              <DollarSign className="w-10 h-10 text-gray-100" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 rounded-full w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 font-merriweather tracking-tight">
              Aucun flux financier
            </h3>
            <p className="text-gray-400 font-manrope font-medium text-lg max-w-sm mx-auto leading-relaxed">
              {searchTerm ? `La recherche pour "${searchTerm}" n'a donné aucun résultat.` : 'Aucune transaction n\'est enregistrée pour cette période.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="pl-10 pr-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Période</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Objet du flux</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Origine / Bien</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Valeur</th>
                  <th className="pl-8 pr-10 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-green-50/30 transition-all duration-300 group">
                    <td className="pl-10 pr-8 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-black text-gray-900 font-manrope">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap">
                      <p className="text-sm font-black text-gray-900 font-manrope leading-tight group-hover:text-green-700 transition-colors uppercase tracking-tight">{transaction.description}</p>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.1em] font-manrope mt-2">Flux Entrant • GestiLoc</p>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-600 font-manrope">{transaction.property || 'Bien non défini'}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{transaction.tenant ? `${transaction.tenant.first_name} ${transaction.tenant.last_name}` : '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap text-right">
                      <div className="inline-flex items-end gap-1.5">
                        <span className="text-xl font-black text-green-600 font-manrope tracking-tighter group-hover:scale-110 transition-transform origin-right">
                          +{transaction.amount.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-[10px] font-black text-green-400 uppercase mb-1">FCFA</span>
                      </div>
                    </td>
                    <td className="pl-8 pr-10 py-8 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${transaction.status === 'paid'
                        ? 'bg-white text-green-600 border-green-100 shadow-green-900/5'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-100 shadow-yellow-900/5'
                        } font-manrope`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${transaction.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {transaction.status === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
