import axios from 'axios';

export interface TenantInvoice {
  id: number;
  lease_id: number;
  type: 'rent' | 'deposit' | 'charge' | 'repair';
  due_date: string;
  amount_total: number;
  paid_amount?: number;
  status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'failed';
  paid_date?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

const API_URL = 'https://wheat-skunk-120710.hostingersite.com/api';

const tenantInvoiceService = {
  // Récupérer les factures du locataire
  list: async (): Promise<TenantInvoice[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<TenantInvoice[]>(`${API_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as Record<string, unknown>).data)) {
        return ((data as Record<string, unknown>).data as TenantInvoice[]);
      }
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des factures du locataire:', error);
      throw error;
    }
  },

  // Récupérer le détail d'une facture
  getDetail: async (id: number): Promise<TenantInvoice> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<TenantInvoice>(`${API_URL}/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la facture:', error);
      throw error;
    }
  },

  // Télécharger la facture en PDF
  downloadPdf: async (id: number): Promise<Blob> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/invoices/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
      throw error;
    }
  },
};

export default tenantInvoiceService;
