import axios from 'axios';

// Utiliser l'instance axios du projet si disponible, sinon créer une nouvelle
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export interface Payment {
  id: string;
  invoice_number: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  paid_at?: string;
  tenant_name: string;
  property_name: string;
  email: string;
}

export interface PaymentStatistics {
  period: string;
  total_amount: number;
  completed_amount: number;
  failed_amount: number;
  refunded_amount: number;
  transaction_count: number;
  success_rate: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// API Service pour les paiements
export const paymentApi = {
  /**
   * Récupérer la liste des paiements
   */
  async getPayments(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
  }) {
    try {
      const response = await api.get<PaginatedResponse<Payment>>('/admin/payments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      throw error;
    }
  },

  /**
   * Récupérer les détails d'un paiement
   */
  async getPayment(id: string) {
    try {
      const response = await api.get<{ data: Payment }>(`/admin/payments/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors du chargement du paiement:', error);
      throw error;
    }
  },

  /**
   * Confirmer un paiement
   */
  async confirmPayment(id: string) {
    try {
      const response = await api.post<{ data: Payment }>(`/admin/payments/${id}/confirm`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la confirmation du paiement:', error);
      throw error;
    }
  },

  /**
   * Rejeter un paiement
   */
  async rejectPayment(id: string, reason?: string) {
    try {
      const response = await api.post<{ data: Payment }>(`/admin/payments/${id}/reject`, {
        reason,
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors du rejet du paiement:', error);
      throw error;
    }
  },

  /**
   * Rembourser un paiement
   */
  async refundPayment(id: string, reason?: string) {
    try {
      const response = await api.post<{ data: Payment }>(`/admin/payments/${id}/refund`, {
        reason,
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors du remboursement du paiement:', error);
      throw error;
    }
  },

  /**
   * Télécharger le reçu d'un paiement
   */
  async downloadReceipt(id: string) {
    try {
      const response = await api.get(`/admin/payments/${id}/receipt`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu:', error);
      throw error;
    }
  },

  /**
   * Obtenir les statistiques des paiements
   */
  async getStatistics(period: string = 'month') {
    try {
      const response = await api.get<{ data: PaymentStatistics }>('/admin/payments/statistics', {
        params: { period },
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      throw error;
    }
  },
};

export default paymentApi;
