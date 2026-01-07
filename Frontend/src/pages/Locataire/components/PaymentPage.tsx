import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import paymentService from '../services/paymentService';

export interface PaymentPageProps {
  invoiceId?: number;
}

export default function PaymentPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      if (!invoiceId) {
        setError('Facture non trouvée');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await paymentService.initializePayment(parseInt(invoiceId));

        setPaymentUrl(result.payment_url);
        setSessionId(result.session_id);
        setTransactionRef(result.transaction_reference);

        // Redirection automatique vers Fedapay après 2 secondes
        setTimeout(() => {
          if (result.payment_url) {
            window.location.href = result.payment_url;
          }
        }, 2000);
      } catch (err) {
        console.error('Erreur initialisation paiement:', err);
        setError('Impossible d\'initialiser le paiement. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [invoiceId]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleCancel = () => {
    navigate('/locataire/factures');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/locataire/factures')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Paiement sécurisé</h1>
          <p className="text-gray-600 mt-2">Facture #{invoiceId}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader className="text-blue-600 animate-spin" size={48} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Préparation du paiement...
            </h2>
            <p className="text-gray-600 mb-4">
              Vous serez redirigé vers la page de paiement Fedapay.
            </p>
            <p className="text-sm text-gray-500">
              Cette opération peut prendre quelques secondes.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl shadow-sm border border-red-200 bg-red-50 p-8">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={32} />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Erreur</h2>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Success/Ready State */}
        {!loading && !error && paymentUrl && (
          <div className="rounded-2xl shadow-sm border border-green-200 bg-green-50 p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-green-900">
                Paiement prêt
              </h2>
            </div>

            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Facture</p>
                  <p className="font-semibold text-gray-900">#{invoiceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Référence</p>
                  <p className="font-semibold text-gray-900 text-xs break-all">
                    {transactionRef}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Session: {sessionId}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Vous serez redirigé automatiquement vers le portail de paiement Fedapay.
                <br />
                <span className="font-semibold">Suivez les instructions pour compléter votre paiement.</span>
              </p>

              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Aller vers le paiement
                </button>
              </a>

              <button
                onClick={handleCancel}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Annuler
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Vos données de paiement sont sécurisées par Fedapay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
