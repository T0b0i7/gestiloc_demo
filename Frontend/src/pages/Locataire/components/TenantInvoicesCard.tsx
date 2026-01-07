import React from 'react';
import { Download, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TenantInvoice } from '@/services/api';

interface TenantInvoicesCardProps {
  invoices: TenantInvoice[];
  isLoading: boolean;
  error?: string | null;
  onDownload?: (id: number) => void;
}

export const TenantInvoicesCard: React.FC<TenantInvoicesCardProps> = ({
  invoices,
  isLoading,
  error,
  onDownload,
}) => {
  const navigate = useNavigate();
  // Fonction pour obtenir la couleur et l'icône du statut
  const getStatusBadge = (status: TenantInvoice['status']) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          label: '🟢 Payée',
          icon: CheckCircle,
        };
      case 'partially_paid':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          label: '🔵 En cours de paiement',
          icon: Clock,
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          label: '🟡 En attente',
          icon: AlertCircle,
        };
      case 'overdue':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          label: '🟠 En retard',
          icon: AlertCircle,
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: '🔴 Échouée',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          label: status,
          icon: AlertCircle,
        };
    }
  };

  // Fonction pour formater la date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Fonction pour formater le montant
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  // Extraire le mois/année de la facture
  const getInvoiceMonth = (invoice: TenantInvoice): string => {
    // Utiliser la due_date pour extraire le mois
    return formatDate(invoice.due_date);
  };

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Factures</h3>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Factures</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Factures</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune facture pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Factures</h3>

      {/* Tableau/Liste des factures */}
      <div className="space-y-3">
        {invoices.map((invoice) => {
          const statusBadge = getStatusBadge(invoice.status);
          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {/* Colonne gauche : Mois et détails */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {getInvoiceMonth(invoice)}
                </p>
                <p className="text-xs text-gray-500">
                  Facture #{invoice.id}
                </p>
              </div>

              {/* Colonne milieu : Montant */}
              <div className="flex-1 text-center">
                <p className="text-sm font-semibold text-gray-900">
                  {formatAmount(invoice.amount_total)}
                </p>
                {invoice.paid_amount && invoice.paid_amount > 0 && (
                  <p className="text-xs text-green-600">
                    {formatAmount(invoice.paid_amount)} payé
                  </p>
                )}
              </div>

              {/* Colonne droite : Statut et action */}
              <div className="flex items-center gap-3">
                {/* Badge de statut */}
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusBadge.bg}`}
                >
                  <StatusIcon size={14} className={statusBadge.text} />
                  <span className={`text-xs font-medium ${statusBadge.text}`}>
                    {statusBadge.label.split(' ')[1] || statusBadge.label}
                  </span>
                </div>

                {/* Bouton Payer - visible seulement si pending ou overdue */}
                {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                  <button
                    onClick={() => navigate(`/locataire/payer/${invoice.id}`)}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm font-medium"
                    title="Payer cette facture"
                  >
                    <CreditCard size={16} />
                    <span className="hidden sm:inline">Payer</span>
                  </button>
                )}

                {/* Bouton de téléchargement */}
                {onDownload && (
                  <button
                    onClick={() => onDownload(invoice.id)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Télécharger le PDF"
                  >
                    <Download size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
