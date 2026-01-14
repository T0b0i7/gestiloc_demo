import React, { useState } from 'react';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppContext } from '../context/AppContext';
import { financeApi } from '../../../services/financeApi';

interface ReportRequest {
  type: 'revenue' | 'transactions' | 'commissions';
  format: 'csv' | 'pdf';
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  date_from?: string;
  date_to?: string;
}

const ReportGenerator: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [reportRequest, setReportRequest] = useState<ReportRequest>({
    type: 'revenue',
    format: 'csv',
    period: 'month',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Array<{
    id: string;
    type: string;
    format: string;
    period: string;
    timestamp: string;
    filename: string;
  }>>([]);

  const handleReportChange = (field: keyof ReportRequest, value: string) => {
    setReportRequest(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateReportRequest = (): boolean => {
    if (reportRequest.period === 'custom') {
      if (!reportRequest.date_from || !reportRequest.date_to) {
        showToast('Veuillez sélectionner les dates pour une période personnalisée', 'error');
        return false;
      }
      if (new Date(reportRequest.date_from) > new Date(reportRequest.date_to)) {
        showToast('La date de fin doit être après la date de début', 'error');
        return false;
      }
    }
    return true;
  };

  const generateReport = async () => {
    if (!validateReportRequest()) {
      return;
    }

    try {
      setIsGenerating(true);

      const filename = `${reportRequest.type}_${reportRequest.period}_${new Date().toISOString().slice(0, 10)}.${reportRequest.format}`;

      const blob = await financeApi.generateReport(reportRequest);

      // Télécharger le fichier
      financeApi.downloadReport(blob, filename);

      // Ajouter à l'historique
      setGeneratedReports(prev => [{
        id: Date.now().toString(),
        type: reportRequest.type,
        format: reportRequest.format,
        period: reportRequest.period,
        timestamp: new Date().toISOString(),
        filename,
      }, ...prev]);

      showToast('Rapport généré et téléchargé avec succès', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg = error?.response?.data?.message || 'Erreur lors de la génération du rapport';
      showToast(errorMsg as string, 'error');
      console.error('Erreur:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      revenue: 'Revenus',
      transactions: 'Transactions',
      commissions: 'Commissions',
    };
    return labels[type] || type;
  };

  const getReportTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      revenue: 'Rapport détaillé des revenus générés par les locations',
      transactions: 'Historique complet des transactions FedaPay',
      commissions: 'Détail des commissions par propriétaire',
    };
    return descriptions[type] || '';
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      day: "Aujourd'hui",
      week: 'Cette semaine',
      month: 'Ce mois-ci',
      quarter: 'Ce trimestre',
      year: 'Cette année',
      custom: 'Période personnalisée',
    };
    return labels[period] || period;
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

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Générateur de Rapports</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Générez des rapports financiers détaillés au format CSV ou PDF</p>
      </div>

      {/* Panneau de configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Créer un nouveau rapport</h3>

        <div className="space-y-6">
          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Type de Rapport
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['revenue', 'transactions', 'commissions'] as const).map((type) => (
                <div
                  key={type}
                  onClick={() => handleReportChange('type', type)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    reportRequest.type === type
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={20} className={reportRequest.type === type ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'} />
                    <h4 className="font-semibold text-slate-900 dark:text-white">{getReportTypeLabel(type)}</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{getReportTypeDescription(type)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Période
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['day', 'week', 'month', 'quarter', 'year', 'custom'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => handleReportChange('period', period)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    reportRequest.period === period
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>

          {/* Dates personnalisées */}
          {reportRequest.period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={reportRequest.date_from || ''}
                  onChange={(e) => handleReportChange('date_from', e.target.value)}
                  max={reportRequest.date_to}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={reportRequest.date_to || ''}
                  onChange={(e) => handleReportChange('date_to', e.target.value)}
                  min={reportRequest.date_from}
                />
              </div>
            </div>
          )}

          {/* Format */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Format de fichier
            </label>
            <div className="flex gap-4">
              {(['csv', 'pdf'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => handleReportChange('format', format)}
                  className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                    reportRequest.format === format
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {reportRequest.format === 'csv' 
                ? 'Format tableau (Excel/Sheets compatible)'
                : 'Format document (nécessite une configuration additionnelle)'}
            </p>
          </div>

          {/* Bouton de génération */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Générer le rapport
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Historique des rapports générés */}
      {generatedReports.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Historique des rapports</h3>
          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {getReportTypeLabel(report.type)} - {getPeriodLabel(report.period)}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {report.filename} • {formatDate(report.timestamp)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    showToast('Le fichier a été téléchargé précédemment', 'info');
                  }}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Download size={18} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Information sur les rapports PDF */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-4">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">À propos des rapports</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Les rapports CSV sont disponibles immédiatement. Pour les rapports PDF, une configuration additionnelle avec une librairie comme DomPDF est requise. 
              Veuillez contacter l'administration pour plus de détails.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportGenerator;
