import { mockReceipts } from './mockData';

export interface RentReceipt {
  property?: {
    id: number;
    name: string;
    address?: string;
  };
  id: number;
  lease_id: number;
  paid_month: string;
  amount_paid: number;
  payment_date: string;
  issued_date: string;
  status: string;
  pdf_url?: string;
}

export const mockRentReceiptService = {
  list: async (filters?: any): Promise<RentReceipt[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockReceipts;
  },

  get: async (id: number): Promise<RentReceipt | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockReceipts.find(r => r.id === id) || null;
  },

  create: async (data: any): Promise<RentReceipt> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newReceipt: RentReceipt = {
      id: mockReceipts.length + 1,
      lease_id: data.lease_id || 1,
      paid_month: data.paid_month,
      amount_paid: data.amount_paid,
      payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      issued_date: new Date().toISOString().split('T')[0],
      status: 'paid',
      property: data.property
    };
    mockReceipts.push(newReceipt);
    return newReceipt;
  }
};
