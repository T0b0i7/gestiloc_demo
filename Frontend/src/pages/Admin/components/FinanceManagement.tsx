import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, AlertCircle, Download, Filter, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { financeApi, FinanceDashboardData, FinanceAlert } from '../../../services/financeApi';
import styles from './Dashboard.module.css';
import FinancialAlerts from './FinancialAlerts.tsx';
import TransactionsList from './TransactionsList.tsx';
import ReportGenerator from './ReportGenerator.tsx';

type TabType = 'overview' | 'transactions' | 'alerts' | 'reports';

const FinanceManagement: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [dashboardData, setDashboardData] = useState<FinanceDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('month');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showRevenue, setShowRevenue] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await financeApi.getDashboard(period);
      setDashboardData(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } } | undefined;
      const errorMsg = error?.response?.data?.message || 'Erreur lors du chargement des données';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [period, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
    showToast('Données actualisées', 'success');
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const getPeriodLabel = () => {
    const labels: Record<string, string> = {
      day: "Aujourd'hui",
      week: 'Cette semaine',
      month: 'Ce mois-ci',
      quarter: 'Ce trimestre',
      year: 'Cette année',
    };
    return labels[period] || period;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Erreur</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="primary">
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Finances</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{getPeriodLabel()}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="secondary"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Sélecteur de période */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {['day', 'week', 'month', 'quarter', 'year'].map((p) => (
            <Button
              key={p}
              onClick={() => handlePeriodChange(p)}
              variant={period === p ? 'primary' : 'secondary'}
              className="px-4 py-2"
            >
              {getPeriodLabel()}
            </Button>
          ))}
        </div>
      </Card>

      {/* Onglets de navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-8">
          {(['overview', 'transactions', 'alerts', 'reports'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'overview' && 'Vue d\'ensemble'}
              {tab === 'transactions' && 'Transactions'}
              {tab === 'alerts' && 'Alertes'}
              {tab === 'reports' && 'Rapports'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : dashboardData ? (
            <>
              {/* Cartes de statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total des revenus */}
                <Card className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenus Totaux</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {formatCurrency(dashboardData.revenue.total_revenue)}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Période: {getPeriodLabel()}</p>
                    </div>
                    <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                </Card>

                {/* Commissions */}
                <Card className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Commissions ({dashboardData.revenue.commission_rate}%)</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {formatCurrency(dashboardData.revenue.total_commissions)}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reversement plateforme</p>
                    </div>
                  </div>
                </Card>

                {/* Revenus nets */}
                <Card className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenus Nets</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {formatCurrency(dashboardData.revenue.net_revenue)}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Après commissions</p>
                    </div>
                  </div>
                </Card>

                {/* Taux de succès des transactions */}
                <Card className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Taux de Succès</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {dashboardData.transactions.success_rate}%
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transactions réussies</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Transactions - statistiques */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Statistiques des Transactions</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(dashboardData.transactions.total_transactions)}</p>
                  </div>
                  <div className="border-l-4 border-green-600 pl-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Réussies</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(dashboardData.transactions.successful_transactions)}</p>
                  </div>
                  <div className="border-l-4 border-red-600 pl-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Échouées</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(dashboardData.transactions.failed_transactions)}</p>
                  </div>
                  <div className="border-l-4 border-yellow-600 pl-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">En attente</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(dashboardData.transactions.pending_transactions)}</p>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Montant moyen</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(dashboardData.transactions.average_amount)}</p>
                  </div>
                </div>
              </Card>

              {/* Graphiques des tendances */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tendance des revenus */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tendance des Revenus</h3>
                    <button
                      onClick={() => setShowRevenue(!showRevenue)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      {showRevenue ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  {showRevenue && (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dashboardData.trends.revenue_trend}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                {/* Tendance des transactions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tendance des Transactions</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.trends.transaction_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="transactions" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Alertes financières */}
              {dashboardData.alerts.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Alertes Financières</h3>
                  <div className="space-y-3">
                    {dashboardData.alerts.slice(0, 3).map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          alert.severity === 'critical'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                            : alert.severity === 'high'
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        }`}
                      >
                        <h4 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                  {dashboardData.alerts.length > 3 && (
                    <Button
                      onClick={() => setActiveTab('alerts')}
                      variant="secondary"
                      className="mt-4 w-full"
                    >
                      Voir toutes les alertes
                    </Button>
                  )}
                </Card>
              )}
            </>
          ) : null}
        </div>
      )}

      {activeTab === 'transactions' && <TransactionsList />}
      {activeTab === 'alerts' && <FinancialAlerts />}
      {activeTab === 'reports' && <ReportGenerator />}
    </div>
  );
};

export default FinanceManagement;
