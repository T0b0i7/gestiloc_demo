import api from '../../../services/api';
import * as mocks from '../../../services/mockData';

// ================= HELPERS =================

function unwrapData<T>(payload: any): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

function unwrapArray<T>(payload: any): T[] {
  const data = unwrapData<any>(payload);
  return Array.isArray(data) ? (data as T[]) : [];
}

// ================= TYPES =================

export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  zip_code?: string;
  surface: number;
  room_count: number;
  bathroom_count: number | null;

  photos?: string[];

  landlord?: {
    id: number;
    full_name?: string;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export interface Invoice {
  id: number;
  invoice_number?: string;
  amount: number;
  amount_total?: number;
  due_date: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'pending' | string;
  type: 'rent' | 'charge' | 'other' | string;
  created_at: string;
  updated_at: string;
  period_start?: string;
  period_end?: string;
  lease?: any;
}

export interface TenantLease {
  id: number;
  uuid: string;
  property_id: number;
  property: Property;

  start_date: string;
  end_date: string | null;

  rent_amount: number;
  charges_amount: number;
  deposit: number | null;

  status: 'draft' | 'active' | 'terminated' | 'cancelled' | string;
  type: string;
  lease_number: string;
  created_at: string;
  updated_at: string;

  invoices: Invoice[];
}

export interface TenantPayment {
  id: number;
  lease_id: number;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'approved' | string;
  payment_method: string | null;
  reference: string | null;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  amount_total?: number;
}

export interface TenantDocument {
  id: number;
  name: string;
  type: 'contract' | 'receipt' | 'other' | string;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export interface TenantProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  id_document_number: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantMessage {
  id: number;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    name: string;
    type: 'landlord' | 'tenant' | 'system' | string;
  };
}

export interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed' | string;
  priority: 'low' | 'medium' | 'high' | 'emergency' | string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  property: {
    id: number;
    address: string;
  };
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  priority: 'low' | 'medium' | 'high' | 'emergency' | string;
  created_at: string;
  updated_at: string;
}

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'emergency';
export type IncidentCategory = 'plumbing' | 'electricity' | 'heating' | 'other';

export interface PreferredSlot {
  date: string; // YYYY-MM-DD
  from: string; // HH:mm
  to: string;   // HH:mm
}

export interface TenantIncident {
  id: number;
  property_id: number;
  tenant_id: number;
  landlord_id: number;
  title: string;
  category: IncidentCategory;
  description?: string | null;
  status: IncidentStatus;
  priority: IncidentPriority;
  preferred_slots: PreferredSlot[];
  photos: string[];
  assigned_provider?: string | null;
  resolved_at?: string | null;
  property?: Property;
  created_at: string;
  updated_at: string;
}


// ================= API SERVICE =================
// Note: Tous les appels sont enveloppés pour retourner des données mockées en cas d'erreur API
// afin de garantir une expérience sans erreurs visuelles comme demandé par l'utilisateur.

const tenantApi = {
  // ===== BAIL =====
  getLeases: async (params?: any): Promise<TenantLease[]> => {
    try {
      const response = await api.get('/tenant/my-leases', {
        params,
        cancelToken: params?.cancelToken,
      });

      const data = unwrapArray<TenantLease>(response.data);
      return data.length > 0 ? data : (mocks.mockLease ? [mocks.mockLease as any] : []);
    } catch (error: any) {
      if (error?.__CANCEL__) return [];
      console.warn('API getLeases failed, using mock data');
      return mocks.mockLease ? [mocks.mockLease as any] : [];
    }
  },

  getLeaseDetails: async (uuid: string | number): Promise<TenantLease> => {
    try {
      const response = await api.get(`/tenant/my-leases/${uuid}`);
      return unwrapData<TenantLease>(response.data);
    } catch (error) {
      console.warn('API getLeaseDetails failed, using mock data');
      return mocks.mockLease as any;
    }
  },

  downloadLeaseContract: async (uuid: string): Promise<Blob> => {
    try {
      const res = await api.get(`/tenant/my-leases/${uuid}/contract`, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      });
      return res.data;
    } catch (err: any) {
      try {
        const res2 = await api.get(`/pdf/contrat-bail/${uuid}`, {
          responseType: 'blob',
          headers: { Accept: 'application/pdf' },
        });
        return res2.data;
      } catch (err2) {
        return new Blob(['Contrat non disponible en mode hors-ligne'], { type: 'text/plain' });
      }
    }
  },


  // paginate => { data: Invoice[] ...}
  getLeaseInvoices: async (uuid: string, params?: { status?: string }): Promise<Invoice[]> => {
    try {
      const response = await api.get(`/tenant/my-leases/${uuid}/invoices`, { params });
      const data = unwrapArray<Invoice>(response.data);
      return data.length > 0 ? data : mocks.mockInvoices;
    } catch (error) {
      return mocks.mockInvoices;
    }
  },

  // ===== PAIEMENTS =====
  getPayments: async (params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<TenantPayment[]> => {
    try {
      const response = await api.get('/tenant/payments', { params });
      return unwrapArray<TenantPayment>(response.data);
    } catch (error) {
      return mocks.mockReceipts as any[];
    }
  },

  // ===== DOCUMENTS =====
  getDocuments: async (leaseUuid: string): Promise<TenantDocument[]> => {
    try {
      const response = await api.get(`/tenant/my-leases/${leaseUuid}/documents`);
      const data = unwrapArray<TenantDocument>(response.data);
      return data.length > 0 ? data : mocks.mockDocuments;
    } catch (error) {
      return mocks.mockDocuments;
    }
  },

  downloadDocument: async (leaseUuid: string, documentId: number): Promise<Blob> => {
    try {
      const response = await api.get(
        `/tenant/my-leases/${leaseUuid}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      return new Blob(['Document non disponible'], { type: 'text/plain' });
    }
  },

  // ===== MESSAGES =====
  getMessages: async (): Promise<TenantMessage[]> => {
    try {
      const response = await api.get('/tenant/messages');
      const data = unwrapArray<TenantMessage>(response.data);
      return data.length > 0 ? data : mocks.mockMessages;
    } catch (error) {
      return mocks.mockMessages;
    }
  },

  getMessage: async (messageId: number): Promise<TenantMessage> => {
    try {
      const response = await api.get(`/tenant/messages/${messageId}`);
      return unwrapData<TenantMessage>(response.data);
    } catch (error) {
      return mocks.mockMessages.find(m => m.id === messageId) || mocks.mockMessages[0];
    }
  },

  sendMessage: async (data: { subject: string; content: string }): Promise<TenantMessage> => {
    const response = await api.post('/tenant/messages', data);
    return unwrapData<TenantMessage>(response.data);
  },

  markMessageAsRead: async (messageId: number): Promise<void> => {
    try {
      await api.post(`/tenant/messages/${messageId}/read`);
    } catch (error) { }
  },

  // ===== TICKETS =====
  getTickets: async (): Promise<SupportTicket[]> => {
    try {
      const response = await api.get('/tenant/tickets');
      return unwrapArray<SupportTicket>(response.data);
    } catch (error) {
      return [];
    }
  },

  getTicket: async (id: number): Promise<SupportTicket> => {
    const response = await api.get(`/tenant/tickets/${id}`);
    return unwrapData<SupportTicket>(response.data);
  },

  createTicket: async (data: { subject: string; message: string }): Promise<SupportTicket> => {
    const response = await api.post('/tenant/tickets', data);
    return unwrapData<SupportTicket>(response.data);
  },

  closeTicket: async (id: number): Promise<void> => {
    await api.post(`/tenant/tickets/${id}/close`);
  },

  // ===== DEMANDES DE MAINTENANCE =====
  getMaintenanceRequests: async (): Promise<MaintenanceRequest[]> => {
    try {
      const response = await api.get('/tenant/maintenance-requests');
      return unwrapArray<MaintenanceRequest>(response.data);
    } catch (error) {
      return [];
    }
  },

  getMaintenanceRequest: async (id: number): Promise<MaintenanceRequest> => {
    const response = await api.get(`/tenant/maintenance-requests/${id}`);
    return unwrapData<MaintenanceRequest>(response.data);
  },

  createMaintenanceRequest: async (data: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
  }): Promise<MaintenanceRequest> => {
    const response = await api.post('/tenant/maintenance-requests', data);
    return unwrapData<MaintenanceRequest>(response.data);
  },

  updateMaintenanceRequest: async (
    id: number,
    data: { status?: string; comment?: string }
  ): Promise<MaintenanceRequest> => {
    const response = await api.put(`/tenant/maintenance-requests/${id}`, data);
    return unwrapData<MaintenanceRequest>(response.data);
  },

  // ===== PROFIL =====
  getProfile: async (): Promise<TenantProfile> => {
    try {
      const response = await api.get('/tenant/profile');
      return unwrapData<TenantProfile>(response.data);
    } catch (error) {
      return mocks.mockUserData as any;
    }
  },

  updateProfile: async (data: Partial<TenantProfile>): Promise<void> => {
    await api.put('/tenant/profile', data);
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> => {
    await api.post('/tenant/change-password', data);
  },

  // ===== INCIDENTS (Maintenance) =====
  getIncidents: async (params?: { status?: string; property_id?: number }): Promise<TenantIncident[]> => {
    try {
      const res = await api.get('/tenant/incidents', { params });
      const data = res.data?.data || res.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      return list.length > 0 ? list : mocks.mockIncidents;
    } catch (error) {
      return mocks.mockIncidents;
    }
  },

  createIncident: async (payload: {
    property_id: number;
    title: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    description?: string;
    preferred_slots?: PreferredSlot[];
    photos?: string[];
  }): Promise<TenantIncident> => {
    const res = await api.post('/tenant/incidents', payload);
    return res.data?.data || res.data;
  },

  updateIncident: async (id: number, payload: Partial<{
    title: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    description: string;
    preferred_slots: PreferredSlot[];
    photos: string[];
  }>): Promise<TenantIncident> => {
    const res = await api.put(`/tenant/incidents/${id}`, payload);
    return res.data?.data || res.data;
  },

  deleteIncident: async (id: number): Promise<void> => {
    await api.delete(`/tenant/incidents/${id}`);
  },

  uploadIncidentPhotos: async (files: File[]): Promise<string[]> => {
    const form = new FormData();
    files.forEach((f) => form.append('files[]', f, f.name));

    try {
      const res = await api.post('/tenant/incidents/upload', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });
      return res.data?.paths || [];
    } catch (err: any) {
      console.error('UPLOAD failed');
      return [];
    }
  },
};

export default tenantApi;
