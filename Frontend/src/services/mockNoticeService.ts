import { mockNotices } from './mockData';

export interface Notice {
  id: number;
  property_id: number;
  tenant_id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  notice_date: string;
  end_date: string;
  notice_number?: string;
  effective_date?: string;
  reason?: string;
}

export const mockNoticeService = {
  list: async (): Promise<Notice[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockNotices;
  },

  get: async (id: number): Promise<Notice | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNotices.find(n => n.id === id) || null;
  }
};
