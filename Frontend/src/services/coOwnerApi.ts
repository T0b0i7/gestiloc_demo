import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types pour les co-propriétaires
export interface CoOwner {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  company_name?: string;
  address_billing?: string;
  phone?: string;
  license_number?: string;
  is_professional: boolean;
  ifu?: string;
  rccm?: string;
  vat_number?: string;
  status: 'active' | 'inactive' | 'suspended';
  joined_at?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    email: string;
  };
}

export interface PropertyDelegation {
  id: number;
  property_id: number;
  delegated_by: number;
  delegated_to: number;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at?: string;
  property?: {
    id: number;
    name: string;
    address: string;
    city: string;
    type: string;
  };
  delegator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CoOwnerTenant {
  id: number;
  co_owner_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_document?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    email: string;
  };
}

export interface CoOwnerLease {
  id: number;
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  deposit_amount?: number;
  status: 'active' | 'terminated' | 'expired';
  created_at?: string;
  updated_at?: string;
  property?: {
    id: number;
    name: string;
    address: string;
    city: string;
    type: string;
  };
  tenant?: CoOwnerTenant;
}

export interface CoOwnerRentReceipt {
  id: number;
  lease_id: number;
  tenant_id: number;
  paid_month: string;
  amount_paid: string;
  payment_date: string;
  issued_date: string;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
  property?: {
    id: number;
    name: string;
  };
  lease?: {
    id: number;
    tenant: CoOwnerTenant;
  };
}

export interface CoOwnerNotice {
  id: number;
  co_owner_id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface CoOwnerProperty {
  id: number;
  uuid: string;
  landlord_id: number;
  type: string;
  name: string;
  description: string | null;
  reference_code: string | null;
  address: string;
  district: string | null;
  city: string;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  surface: string | null;
  floor: number | null;
  total_floors: number | null;
  room_count: number | null;
  bedroom_count: number | null;
  bathroom_count: number | null;
  wc_count: number | null;
  construction_year: number | null;
  rent_amount: string | null;
  charges_amount: string | null;
  property_type: string;
  has_garage: boolean | null;
  has_parking: boolean | null;
  is_furnished: boolean | null;
  has_elevator: boolean | null;
  has_balcony: boolean | null;
  has_terrace: boolean | null;
  has_cellar: boolean | null;
  status: string;
  amenities: string[] | null;
  photos: string[] | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  delegation?: {
    id: number;
    status: string;
    permissions: string[];
    expires_at: string;
  };
}

class CoOwnerApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ============ PROFIL ============
  async getProfile(): Promise<CoOwner> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/profile`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('getProfile: Endpoint not implemented yet, returning default profile');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return {
            id: user.id,
            user_id: user.id,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            company_name: undefined,
            address_billing: undefined,
            phone: user.phone || undefined,
            license_number: undefined,
            is_professional: false,
            ifu: undefined,
            rccm: undefined,
            vat_number: undefined,
            status: 'active' as const,
            joined_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
        }
      }
      console.error('Error fetching co-owner profile:', error);
      throw error;
    }
  }

  async updateProfile(data: Partial<CoOwner>): Promise<CoOwner> {
    try {
      const response = await axios.put(`${API_BASE_URL}/co-owners/me/profile`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating co-owner profile:', error);
      throw error;
    }
  }

  // ============ PROPRIÉTÉS DÉLÉGUÉES ============
  async getDelegatedProperties(): Promise<CoOwnerProperty[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/delegated-properties`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('getDelegatedProperties: Endpoint not implemented yet, returning empty array');
        return [];
      }
      console.error('Error fetching delegated properties:', error);
      return [];
    }
  }

  async updateProperty(propertyId: number, data: any): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/co-owners/me/properties/${propertyId}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async uploadPropertyPhotos(propertyId: number, formData: FormData): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/properties/${propertyId}/photos`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading property photos:', error);
      throw error;
    }
  }

  async deleteProperty(propertyId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/co-owners/me/properties/${propertyId}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  // ============ DÉLÉGATIONS ============
  async getDelegations(): Promise<PropertyDelegation[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/delegations`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('getDelegations: Endpoint not implemented yet, returning empty array');
        return [];
      }
      console.error('Error fetching delegations:', error);
      return [];
    }
  }

  async acceptDelegation(delegationId: number): Promise<PropertyDelegation> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/delegations/${delegationId}/accept`, {}, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error accepting delegation:', error);
      throw error;
    }
  }

  async rejectDelegation(delegationId: number, reason?: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/co-owners/me/delegations/${delegationId}/reject`, 
        { reason }, 
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error rejecting delegation:', error);
      throw error;
    }
  }

  async requestDelegation(propertyId: number, message?: string): Promise<PropertyDelegation> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/request-delegation`, 
        { property_id: propertyId, message }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error requesting delegation:', error);
      throw error;
    }
  }

  // ============ LOCATAIRES ============
  async getTenants(): Promise<CoOwnerTenant[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/tenants`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  async createTenant(tenantData: Partial<CoOwnerTenant>): Promise<CoOwnerTenant> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/tenants`, tenantData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: number, tenantData: Partial<CoOwnerTenant>): Promise<CoOwnerTenant> {
    try {
      const response = await axios.put(`${API_BASE_URL}/co-owners/me/tenants/${id}`, tenantData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/co-owners/me/tenants/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  // ============ BAUX ============
  async getLeases(): Promise<CoOwnerLease[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/leases`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching leases:', error);
      throw error;
    }
  }

  async createLease(leaseData: Partial<CoOwnerLease>): Promise<CoOwnerLease> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/leases`, leaseData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating lease:', error);
      throw error;
    }
  }

  async terminateLease(leaseId: number, terminationDate: string): Promise<CoOwnerLease> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/leases/${leaseId}/terminate`, 
        { termination_date: terminationDate }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error terminating lease:', error);
      throw error;
    }
  }

  async getDelegatedLeases(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/leases`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching delegated leases:', error);
      return [];
    }
  }

  // ============ QUITTANCES ============
  async getRentReceipts(): Promise<CoOwnerRentReceipt[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/receipts`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching rent receipts:', error);
      throw error;
    }
  }

  async generateRentReceipt(leaseId: number, month: string): Promise<CoOwnerRentReceipt> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/receipts/generate`, 
        { lease_id: leaseId, month }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error generating rent receipt:', error);
      throw error;
    }
  }

  // ============ NOTIFICATIONS ============
  async getNotices(): Promise<CoOwnerNotice[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/notices`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  }

  async createNotice(noticeData: Partial<CoOwnerNotice>): Promise<CoOwnerNotice> {
    try {
      const response = await axios.post(`${API_BASE_URL}/co-owners/me/notices`, noticeData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  async updateNoticeStatus(noticeId: number, status: string): Promise<CoOwnerNotice> {
    try {
      const response = await axios.put(`${API_BASE_URL}/co-owners/me/notices/${noticeId}/status`, 
        { status }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating notice status:', error);
      throw error;
    }
  }

  // ============ FACTURES ET PAIEMENTS ============
  async createInvoice(data: any): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async createPayLink(invoiceId: number, data: any): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/${invoiceId}/pay-link`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating pay link:', error);
      throw error;
    }
  }

  // ============ RAPPORTS ============
  async getFinancialReport(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/reports/financial`, {
        params: { start_date: startDate, end_date: endDate },
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  async getOccupancyReport(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/reports/occupancy`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error generating occupancy report:', error);
      throw error;
    }
  }

  // ============ MÉTHODES DE RETRAIT ============
  async getWithdrawalMethods(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/fedapay`, {
        headers: this.getAuthHeaders(),
      });
      
      console.log("[coOwnerApi.getWithdrawalMethods] response =>", response.data);
      
      const fedapayData = response.data;
      
      if (fedapayData.fedapay_subaccount_id && fedapayData.fedapay_meta && fedapayData.fedapay_meta.account_name) {
        const method = {
          id: 1,
          type: "fedapay",
          account_name: fedapayData.fedapay_meta.account_name || "",
          account_number: fedapayData.fedapay_meta.account_number || "",
          is_default: true,
          status: "active",
          created_at: new Date().toISOString(),
          fedapay_subaccount_id: fedapayData.fedapay_subaccount_id,
          fedapay_meta: fedapayData.fedapay_meta,
          is_ready: fedapayData.is_ready || true
        };
        
        console.log("[coOwnerApi.getWithdrawalMethods] method found =>", method);
        return [method];
      }
      
      console.log("[coOwnerApi.getWithdrawalMethods] no method found");
      return [];
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error);
      return [];
    }
  }

  async getBalance(): Promise<any> {
    try {
      return {
        balance: 0,
        available_balance: 0,
        pending_balance: 0
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async createWithdrawalMethod(data: any): Promise<any> {
    try {
      const body = {
        subaccount_reference: data.subaccount_reference || `acc_${Date.now().toString(36)}`,
        payout_type: data.payout_type || "bank",
        country: data.country || "CI",
        currency: data.currency || "XOF",
        account_name: data.account_name || "",
        bank_name: data.bank_name || null,
        iban: data.iban || null,
        account_number: data.account_number || null,
        provider: data.provider || null,
        phone: data.phone || null,
        card_token: data.card_token || null,
        card_last4: data.card_last4 || null,
        card_brand: data.card_brand || null,
        card_exp_month: data.card_exp_month || null,
        card_exp_year: data.card_exp_year || null,
      };

      console.log("[coOwnerApi.createWithdrawalMethod] payload =>", data);
      console.log("[coOwnerApi.createWithdrawalMethod] body =>", body);

      const response = await axios.post(`${API_BASE_URL}/co-owners/me/fedapay/subaccount`, body, {
        headers: this.getAuthHeaders(),
      });
      
      console.log("[coOwnerApi.createWithdrawalMethod] success =>", response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating withdrawal method:', error);
      throw error;
    }
  }

  async updateWithdrawalMethod(id: number, data: any): Promise<any> {
    try {
      const body = {
        subaccount_reference: data.subaccount_reference || `acc_${Date.now().toString(36)}`,
        payout_type: data.payout_type || "bank",
        country: data.country || "CI",
        currency: data.currency || "XOF",
        account_name: data.account_name || "",
        bank_name: data.bank_name || null,
        iban: data.iban || null,
        account_number: data.account_number || null,
        provider: data.provider || null,
        phone: data.phone || null,
        card_token: data.card_token || null,
        card_last4: data.card_last4 || null,
        card_brand: data.card_brand || null,
        card_exp_month: data.card_exp_month || null,
        card_exp_year: data.card_exp_year || null,
      };

      console.log("[coOwnerApi.updateWithdrawalMethod] payload =>", data);
      console.log("[coOwnerApi.updateWithdrawalMethod] body =>", body);

      const response = await axios.post(`${API_BASE_URL}/co-owners/me/fedapay/subaccount`, body, {
        headers: this.getAuthHeaders(),
      });
      
      console.log("[coOwnerApi.updateWithdrawalMethod] success =>", response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating withdrawal method:', error);
      throw error;
    }
  }

  async deleteWithdrawalMethod(id: number): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/co-owners/me/fedapay/subaccount`, {
        account_number: "",
        account_name: "Méthode supprimée"
      }, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting withdrawal method:', error);
      throw error;
    }
  }

  async setDefaultWithdrawalMethod(id: number): Promise<any> {
    try {
      return {
        id,
        is_default: true,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error setting default withdrawal method:', error);
      throw error;
    }
  }

  // ============ NOUVELLES MÉTHODES POUR L'AUDIT ============
  async getPropertyModificationAudits(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/modification-audits`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('getPropertyModificationAudits: Endpoint not implemented yet');
        return [];
      }
      console.error('Error fetching modification audits:', error);
      return [];
    }
  }

  async getAuditDetails(auditId: number): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/modification-audits/${auditId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching audit details:', error);
      throw error;
    }
  }

  async cancelModification(auditId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/co-owners/me/modification-audits/${auditId}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error cancelling modification:', error);
      throw error;
    }
  }

  // ============ MÉTHODES UTILITAIRES ============
  async getPropertyTypes(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/property-types`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching property types:', error);
      return ['office', 'apartment', 'house', 'parking', 'warehouse', 'commercial', 'land'];
    }
  }

  async getAmenities(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/amenities`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching amenities:', error);
      return [];
    }
  }
}

export const coOwnerApi = new CoOwnerApiService();
export default coOwnerApi;