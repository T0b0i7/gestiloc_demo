import axios from 'axios';
import { PaymentSession, PaymentInitializePayload, PaymentConfirmation } from '../types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Add Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const paymentService = {
  /**
   * Initialise une session de paiement et retourne l'URL Fedapay
   * POST /api/tenant/invoices/{id}/pay
   */
  initializePayment: async (
    invoiceId: number,
    payload?: Partial<PaymentInitializePayload>
  ): Promise<{ payment_url: string; session_id: string; transaction_reference: string }> => {
    try {
      const response = await api.post(`/tenant/invoices/${invoiceId}/pay`, {
        ...payload,
      });
      
      // Backend retourne checkout_url au lieu de payment_url
      if (response.data?.checkout_url) {
        return {
          payment_url: response.data.checkout_url,
          session_id: response.data.payment_id?.toString() || '',
          transaction_reference: response.data.payment_id?.toString() || '',
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur API initializePayment:', error);
      throw error;
    }
  },

  /**
   * Vérifie le statut du paiement et retourne les détails de confirmation
   * TODO: Endpoint à créer : GET /api/invoices/{id}/payment/verify?transaction_id={transactionId}
   */
  verifyPayment: async (
    invoiceId: number,
    transactionId: string
  ): Promise<PaymentConfirmation> => {
    try {
      // Appeler l'endpoint de vérification serveur
      const response = await api.get(`/invoices/${invoiceId}/payment/verify`, {
        params: { transaction_id: transactionId }
      });

      const data = response.data;
      return {
        id: data.payment_id || invoiceId,
        invoice_id: invoiceId,
        transaction_id: data.transaction_id || transactionId,
        amount_paid: data.amount || 0,
        payment_method: data.provider || 'fedapay',
        paid_at: data.paid_at || new Date().toISOString(),
        status: data.status === 'completed' || data.status === 'paid' ? 'success' : (data.status ?? 'unknown'),
      };
    } catch (error) {
      console.error('Erreur API verifyPayment:', error);
      throw error;
    }
  },

  /**
   * Récupère le reçu PDF après paiement
   * TODO: Endpoint à créer : GET /api/invoices/{id}/receipt
   */
  downloadReceipt: async (invoiceId: number): Promise<Blob> => {
    try {
      const response = await api.get(
        `/invoices/${invoiceId}/pdf`,
        {
          responseType: 'blob',
        }
      );
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Erreur API downloadReceipt:', error);
      throw error;
    }
  },

  /**
   * Récupère la session de paiement en cours
   * TODO: Endpoint à créer : GET /api/invoices/{id}/payment/session
   */
  getPaymentSession: async (invoiceId: number): Promise<PaymentSession> => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      
      // Mapper la facture au format PaymentSession
      return {
        id: response.data.id?.toString() || '',
        invoice_id: response.data.id,
        amount: response.data.amount_total,
        currency: 'XOF',
        reference: response.data.id?.toString() || '',
        status: response.data.status === 'paid' ? 'completed' : 'pending',
        created_at: response.data.created_at,
      };
    } catch (error) {
      console.error('Erreur API getPaymentSession:', error);
      throw error;
    }
  },

  /**
   * Annule une session de paiement
   * TODO: Endpoint à créer : POST /api/invoices/{id}/payment/cancel
   */
  cancelPaymentSession: async (invoiceId: number): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/payment/cancel`, {});
      return response.data;
    } catch (error) {
      console.error('Erreur API cancelPaymentSession:', error);
      throw error;
    }
  },
};

export default paymentService;
