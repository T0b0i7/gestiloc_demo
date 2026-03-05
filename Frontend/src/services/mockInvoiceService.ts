import { mockInvoices } from './mockData';

export interface TenantInvoice {
  id: number;
  lease_id: number;
  amount: number;
  due_date: string;
  status: string;
  type: string;
  created_at: string;
}

export const mockInvoiceService = {
  list: async (): Promise<TenantInvoice[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockInvoices;
  },

  get: async (id: number): Promise<TenantInvoice | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockInvoices.find(i => i.id === id) || null;
  },

  pay: async (id: number, paymentData: any): Promise<{success: boolean, message: string}> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const invoice = mockInvoices.find(i => i.id === id);
    if (invoice) {
      invoice.status = 'paid';
      return { success: true, message: 'Paiement effectué avec succès' };
    }
    return { success: false, message: 'Facture non trouvée' };
  }
};
