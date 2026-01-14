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

// Types pour le module de finances
export interface FinanceAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  title: string;
  description: string;
  details?: Array<Record<string, number | string>>;
  threshold?: number;
  current_value?: number;
  average?: number;
  created_at: string;
}

export interface RevenueData {
  total_revenue: number;
  total_commissions: number;
  commission_rate: number;
  net_revenue: number;
}

export interface TransactionStats {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  success_rate: number;
  average_amount: number;
  total_volume: number;
}

export interface TrendData {
  date: string;
  label: string;
  revenue?: number;
  transactions?: number;
}

export interface FinanceDashboardData {
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  revenue: RevenueData;
  transactions: TransactionStats;
  alerts: FinanceAlert[];
  trends: {
    revenue_trend: TrendData[];
    transaction_trend: TrendData[];
  };
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending';
  payment_method: string;
  ip_address: string;
  created_at: string;
  invoice?: {
    invoice_number: string;
    amount_paid: number;
    paid_at: string;
    lease?: {
      property?: {
        name: string;
        landlord?: {
          user?: {
            email: string;
            first_name: string;
            last_name: string;
          };
        };
      };
      tenant?: {
        user?: {
          email: string;
          first_name: string;
          last_name: string;
        };
      };
    };
  };
}

export interface TransactionListResponse {
  data: PaymentTransaction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Service API pour les finances
export const financeApi = {
  // Récupérer le dashboard financier
  getDashboard: async (period: string = 'month'): Promise<FinanceDashboardData> => {
    try {
      const response = await api.get(`/admin/finance/dashboard?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard finances:', error);
      throw error;
    }
  },

  // Récupérer la liste des transactions
  getTransactions: async (filters: {
    page?: number;
    per_page?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
    transaction_id?: string;
    tenant_email?: string;
    landlord_email?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<TransactionListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const response = await api.get(`/admin/finance/transactions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  },

  // Récupérer les alertes financières
  getAlerts: async (period: string = 'week'): Promise<{ alerts: FinanceAlert[]; period: string; date_range: Record<string, string>; total_alerts: number; updated_at: string }> => {
    try {
      const response = await api.get(`/admin/finance/alerts?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  },

  // Générer un rapport
  generateReport: async (reportData: {
    type: 'revenue' | 'transactions' | 'commissions';
    format: 'csv' | 'pdf';
    period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    date_from?: string;
    date_to?: string;
  }): Promise<Blob> => {
    try {
      const response = await api.post('/admin/finance/reports', reportData, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  },

  // Fonction utilitaire pour télécharger un rapport
  downloadReport: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
