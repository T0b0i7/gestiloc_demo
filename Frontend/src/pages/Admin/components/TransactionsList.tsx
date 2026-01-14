import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle, Download } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppContext } from '../context/AppContext';
import { financeApi, PaymentTransaction, TransactionListResponse } from '../../../services/financeApi';

interface FilterState {
  status: string;
  date_from: string;
  date_to: string;
  amount_min: string;
  amount_max: string;
  transaction_id: string;
  tenant_email: string;
  landlord_email: string;
  sort_by: string;
  sort_order: string;
}

const TransactionsList: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
    transaction_id: '',
    tenant_email: '',
    landlord_email: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const activeFilters: Record<string, string | number> = { page: currentPage, per_page: 25 };
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          activeFilters[key] = value;
        }
      });

      const response = await financeApi.getTransactions(activeFilters as Parameters<typeof financeApi.getTransactions>[0]);
      setTransactions(response.data);
      setTotalPages(response.meta.last_page);
      setTotalTransactions(response.meta.total);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors du chargement des transactions';
      setError(errorMsg as string);
      showToast(errorMsg as string, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, currentPage, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters, fetchTransactions]);

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: '',
      transaction_id: '',
      tenant_email: '',
      landlord_email: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      showToast('Export en cours...', 'info');
      const activeFilters: Record<string, string | number> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          activeFilters[key] = value;
        }
      });

      // TODO: Implémenter l'export des transactions
      showToast('Export non disponible pour le moment', 'info');
    } catch (err) {
      showToast('Erreur lors de l\'export', 'error');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Réussie';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échouée';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Erreur</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={() => fetchTransactions()} variant="primary">
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions FedaPay</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Total: {totalTransactions} transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Filter size={18} />
            Filtres
          </Button>
          <Button
            onClick={handleExport}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Exporter
          </Button>
        </div>
      </div>

      {/* Panneaux de filtres */}
      {showFilters && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Tous les statuts</option>
                <option value="completed">Réussies</option>
                <option value="pending">En attente</option>
                <option value="failed">Échouées</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ID Transaction
              </label>
              <Input
                type="text"
                placeholder="Rechercher..."
                value={filters.transaction_id}
                onChange={(e) => handleFilterChange('transaction_id', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Locataire
              </label>
              <Input
                type="email"
                placeholder="locataire@example.com"
                value={filters.tenant_email}
                onChange={(e) => handleFilterChange('tenant_email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Propriétaire
              </label>
              <Input
                type="email"
                placeholder="proprietaire@example.com"
                value={filters.landlord_email}
                onChange={(e) => handleFilterChange('landlord_email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Montant Min (XOF)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.amount_min}
                onChange={(e) => handleFilterChange('amount_min', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Montant Max (XOF)
              </label>
              <Input
                type="number"
                placeholder="999999"
                value={filters.amount_max}
                onChange={(e) => handleFilterChange('amount_max', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Du
              </label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Au
              </label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Trier par
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="created_at">Date</option>
                <option value="amount">Montant</option>
                <option value="status">Statut</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleResetFilters} variant="secondary">
              Réinitialiser les filtres
            </Button>
          </div>
        </Card>
      )}

      {/* Tableau des transactions */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">ID Transaction</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Montant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Locataire</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Propriétaire</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                      {transaction.transaction_id.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {transaction.invoice?.lease?.tenant?.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {transaction.invoice?.lease?.property?.landlord?.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-slate-600 dark:text-slate-400">Aucune transaction trouvée</p>
            </div>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="secondary"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="secondary"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
