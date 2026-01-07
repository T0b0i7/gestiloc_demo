import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, AlertCircle, Download, ArrowLeft, Home } from 'lucide-react';
import paymentService from '../services/paymentService';
import tenantInvoiceService from '../services/tenantInvoiceService';
import { TenantInvoice, PaymentConfirmation } from '@/services/api';

export default function PaymentConfirmationPage() {
  const { invoiceId, transactionId } = useParams<{ invoiceId: string; transactionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<TenantInvoice | null>(null);
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!invoiceId || !transactionId) {
        setError('Paramètres de paiement invalides');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Vérifier le paiement
        const confirmationData = await paymentService.verifyPayment(
          parseInt(invoiceId),
          transactionId
        );
        setConfirmation(confirmationData);

        // Récupérer les détails de la facture
        const invoiceData = await tenantInvoiceService.getDetail(parseInt(invoiceId));
        setInvoice(invoiceData);
      } catch (err) {
        console.error('Erreur vérification paiement:', err);
        setError('Impossible de vérifier le paiement. Veuillez contacter le support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [invoiceId, transactionId]);

  const handleDownloadReceipt = async () => {
    if (!invoiceId) return;

    try {
      setDownloadingReceipt(true);
      const blob = await paymentService.downloadReceipt(parseInt(invoiceId));

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recue-facture-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement reçu:', err);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/locataire/factures')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Retour aux factures</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader className="text-blue-600 animate-spin" size={48} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Vérification du paiement...
            </h2>
            <p className="text-gray-600 mt-2">
              Veuillez patienter pendant que nous confirmons votre paiement.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl shadow-sm border border-red-200 bg-red-50 p-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={32} />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-900">Erreur de paiement</h2>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/locataire/factures')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Retour aux factures
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && confirmation && invoice && (
          <div className="space-y-6">
            {/* Success Badge */}
            <div className="rounded-2xl shadow-sm border border-green-200 bg-green-50 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-green-900">Paiement réussi!</h1>
                <p className="text-green-700 mt-2">
                  Votre facture a été payée avec succès.
                </p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Détails du paiement</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro de facture</p>
                  <p className="font-semibold text-gray-900">#{invoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type de facture</p>
                  <p className="font-semibold text-gray-900 capitalize">{invoice.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Montant payé</p>
                  <p className="font-semibold text-green-600 text-lg">
                    {formatAmount(confirmation.amount_paid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date du paiement</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(confirmation.paid_at)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Méthode de paiement</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {confirmation.payment_method}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">ID Transaction:</span>{' '}
                  <code className="text-xs break-all">{confirmation.transaction_id}</code>
                </p>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Résumé de la facture</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Facture pour la période</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(invoice.due_date)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Montant facturé</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(invoice.amount_total)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Statut</span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    <span>🟢</span> Payée
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                {downloadingReceipt ? 'Téléchargement...' : 'Télécharger le reçu'}
              </button>
              <button
                onClick={() => navigate('/locataire/factures')}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Retour aux factures
              </button>
            </div>

            {/* Info Message */}
            <div className="rounded-2xl shadow-sm border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                ✅ Un email de confirmation a été envoyé à votre adresse email. Vous pouvez télécharger le reçu ci-dessus.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
