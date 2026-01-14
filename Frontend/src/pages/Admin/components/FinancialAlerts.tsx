import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, AlertTriangle, AlertOctagon, Info, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { financeApi, FinanceAlert } from '../../../services/financeApi';

interface SuspiciousDetail {
  ip_address: string;
  attempt_count: number;
}

const FinancialAlerts: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [alerts, setAlerts] = useState<FinanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('week');
  const [filteredAlerts, setFilteredAlerts] = useState<FinanceAlert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filterAlerts = useCallback(() => {
    if (selectedSeverity === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.severity === selectedSeverity));
    }
  }, [alerts, selectedSeverity]);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await financeApi.getAlerts(period);
      setAlerts(response.alerts);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg = error?.response?.data?.message || 'Erreur lors du chargement des alertes';
      setError(errorMsg as string);
      showToast(errorMsg as string, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [period, showToast]);

  useEffect(() => {
    fetchAlerts();
  }, [period, fetchAlerts]);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedSeverity, filterAlerts]);

  const handleRefresh = () => {
    fetchAlerts();
    showToast('Alertes actualisées', 'success');
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="text-red-600 dark:text-red-400" size={24} />;
      case 'high':
        return <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />;
      case 'medium':
        return <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />;
      default:
        return <Info className="text-blue-600 dark:text-blue-400" size={24} />;
    }
  };

  const getAlertBgClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500 border-l-4';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 border-l-4';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 border-l-4';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 border-l-4';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Critique';
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return 'Info';
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (error && alerts.length === 0) {
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alertes Financières</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Total: {filteredAlerts.length} alerte(s)</p>
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
          {['day', 'week', 'month', 'quarter', 'year'].map((p) => {
            const labels: Record<string, string> = {
              day: "Aujourd'hui",
              week: 'Cette semaine',
              month: 'Ce mois-ci',
              quarter: 'Ce trimestre',
              year: 'Cette année',
            };
            return (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                variant={period === p ? 'primary' : 'secondary'}
                className="px-4 py-2"
              >
                {labels[p]}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Filtres par sévérité */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Filtrer par sévérité</h3>
        <div className="flex flex-wrap gap-2">
          {['all', 'critical', 'high', 'medium', 'low', 'info'].map((severity) => {
            const labels: Record<string, string> = {
              all: 'Toutes les alertes',
              critical: 'Critique',
              high: 'Élevée',
              medium: 'Moyenne',
              low: 'Faible',
              info: 'Info',
            };
            return (
              <Button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                variant={selectedSeverity === severity ? 'primary' : 'secondary'}
                className="px-4 py-2"
              >
                {labels[severity]}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Liste des alertes */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert, idx) => (
            <Card key={idx} className={`p-6 ${getAlertBgClass(alert.severity)}`}>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.severity)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">
                        {alert.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getSeverityBadgeClass(alert.severity)}`}>
                      {getSeverityLabel(alert.severity)}
                    </span>
                  </div>

                  {/* Détails additionnels */}
                  <div className="mt-4 space-y-2">
                    {alert.threshold !== undefined && (
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Seuil: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {alert.type === 'high_failed_payments' || alert.type === 'old_pending_transactions'
                            ? alert.threshold
                            : formatCurrency(alert.threshold)}
                        </span>
                      </div>
                    )}
                    {alert.current_value !== undefined && (
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Valeur actuelle: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {alert.type === 'high_failed_payments' || alert.type === 'old_pending_transactions'
                            ? alert.current_value
                            : formatCurrency(alert.current_value)}
                        </span>
                      </div>
                    )}
                    {alert.type === 'transaction_volume_anomaly' && alert.average !== undefined && (
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Moyenne: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {Math.round(alert.average as number)} transactions
                        </span>
                      </div>
                    )}
                    {alert.type === 'suspicious_activity' && alert.details && (
                      <div className="mt-3 p-3 bg-black/10 dark:bg-white/10 rounded">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">IP Suspectes:</p>
                        <div className="space-y-1">
                          {alert.details.map((detail: Record<string, string | number>, i: number) => (
                            <div key={i} className="text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-mono">{detail.ip_address}</span> - {detail.attempt_count} tentatives
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    {formatDate(alert.created_at)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Info className="mx-auto mb-4 text-blue-500" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucune alerte</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Tout va bien! Il n'y a pas d'alerte financière pour cette période.
          </p>
        </Card>
      )}
    </div>
  );
};

export default FinancialAlerts;
