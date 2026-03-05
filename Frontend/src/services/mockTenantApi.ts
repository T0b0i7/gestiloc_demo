import { mockLease, mockIncidents } from './mockData';

export interface TenantLease {
  id: number;
  property_id: number;
  tenant_id: number;
  rent_amount: number;
  charges_amount: number;
  deposit_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  type: string;
  lease_number: string;
  created_at: string;
  updated_at: string;
  property?: any;
}

export interface TenantIncident {
  id: number;
  lease_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  property?: {
    id: number;
    name: string;
    address?: string;
  };
}

export const mockTenantApi = {
  getLeases: async (): Promise<TenantLease[]> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLease ? [mockLease] : [];
  },

  getIncidents: async (): Promise<TenantIncident[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockIncidents;
  },

  createIncident: async (incidentData: any): Promise<TenantIncident> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newIncident: TenantIncident = {
      id: mockIncidents.length + 1,
      lease_id: 1,
      title: incidentData.title,
      description: incidentData.description,
      status: 'open',
      priority: incidentData.priority || 'medium',
      created_at: new Date().toISOString()
    };
    mockIncidents.push(newIncident);
    return newIncident;
  }
};
