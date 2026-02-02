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
      console.error('Error fetching financial data:', error);
      notify('Erreur lors du chargement des données financières', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.property?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tenant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tenant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
        <Button onClick={() => onNavigate('quittances')}>
          <Receipt className="w-4 h-4 mr-2" />
          Voir les quittances
        </Button>
      </div>

      {/* Résumé financier */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenus totaux</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(summary.currentMonthIncome)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paiements en attente</p>
                <p className="text-xl font-bold text-gray-900">
                  {summary.pendingPayments}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <PiggyBank className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenu net</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(summary.netIncome)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les périodes</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des transactions</h3>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune transaction trouvée
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Aucune transaction ne correspond à votre recherche.' : 'Aucune transaction enregistrée.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propriété
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.property}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.tenant ? `${transaction.tenant.first_name} ${transaction.tenant.last_name}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      +{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
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
