/**
 * Service pour gérer les webhooks et callbacks Fedapay
 * Webhook Fedapay pour mettre à jour le statut des factures après paiement
 */

import axios from 'axios';

const API_URL = 'https://wheat-skunk-120710.hostingersite.com/api';

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

export interface FedapayCallbackPayload {
  event: string; // 'transaction.completed', 'transaction.failed', etc.
  transaction_id: string;
  invoice_id: number;
  amount: number;
  status: 'completed' | 'failed' | 'cancelled';
  timestamp?: string;
}

export const fedapayWebhookService = {
  /**
   * Traiter le callback Fedapay pour mettre à jour le statut de la facture
   * POST /api/webhooks/fedapay
   */
  handleCallback: async (payload: FedapayCallbackPayload): Promise<{ message: string }> => {
    try {
      const response = await api.post('/webhooks/fedapay', payload);
      return response.data;
    } catch (error) {
      console.error('Erreur API handleFedapayCallback:', error);
      throw error;
    }
  },

  /**
   * Déclencher manuellement la vérification du paiement
   * Utile si le webhook n'a pas été reçu
   * POST /api/tenant/invoices/{id}/payment/check-status
   */
  checkPaymentStatus: async (invoiceId: number): Promise<{ status: string; updated: boolean }> => {
    try {
      const response = await api.post(`/tenant/invoices/${invoiceId}/payment/check-status`, {});
      return response.data;
    } catch (error) {
      console.error('Erreur API checkPaymentStatus:', error);
      throw error;
    }
  },
};

export default fedapayWebhookService;
