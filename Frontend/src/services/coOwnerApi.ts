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
  latitude: string | null;
  longitude: string | null;

  surface: string | null;
  room_count: number | null;
  bedroom_count: number | null;
  bathroom_count: number | null;

  rent_amount: string | null;
  charges_amount: string | null;
  status: string;

  amenities: string[] | null;
  photos: string[] | null;
  meta: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

class CoOwnerApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Profil du co-propriétaire
  async getProfile(): Promise<CoOwner> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/profile`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      // Si l'endpoint n'existe pas encore (404), retourner un profil par défaut
      if (error.response?.status === 404) {
        console.log('getProfile: Endpoint not implemented yet, returning default profile');
        // Retourner un profil par défaut basé sur l'utilisateur connecté
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
      const response = await axios.put(`${API_BASE_URL}/co-owners/me`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating co-owner profile:', error);
      throw error;
    }
  }

  // Délégations
  async getDelegatedProperties(): Promise<CoOwnerProperty[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/delegated-properties`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error: any) {
      // Si l'endpoint n'existe pas encore (404), retourner un tableau vide sans erreur
      if (error.response?.status === 404) {
        console.log('getDelegatedProperties: Endpoint not implemented yet, returning empty array');
        return [];
      }
      console.error('Error fetching delegated properties:', error);
      // En cas d'erreur, retourner un tableau vide pour éviter les crashes
      return [];
    }
  }

  async getDelegations(): Promise<PropertyDelegation[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/delegations`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error: any) {
      // Si l'endpoint n'existe pas encore (404), retourner un tableau vide
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

  // Locataires
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

  // Baux
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

  // Quittances
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

  // Notifications
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

  // Rapports
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

  // Méthodes de paiement
  async getDelegatedLeases(): Promise<any[]> {
    try {
      // Utiliser le même service que le propriétaire mais pour les baux délégués
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/leases`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching delegated leases:', error);
      // En cas d'erreur, retourner un tableau vide pour éviter les crashes
      return [];
    }
  }

  async createInvoice(data: any): Promise<any> {
    try {
      // Utiliser le même endpoint que le propriétaire
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
      // Utiliser le même endpoint que le propriétaire
      const response = await axios.post(`${API_BASE_URL}/invoices/${invoiceId}/pay-link`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating pay link:', error);
      throw error;
    }
  }

  // Méthodes de retrait
  async getWithdrawalMethods(): Promise<any[]> {
    try {
      // Utiliser le endpoint FedaPay du co-propriétaire avec le bon préfixe
      const response = await axios.get(`${API_BASE_URL}/co-owners/me/fedapay`, {
        headers: this.getAuthHeaders(),
      });
      
      console.log("[coOwnerApi.getWithdrawalMethods] response =>", response.data);
      
      // Utiliser la même logique de mapping que landlordPayments
      const fedapayData = response.data;
      
      // Si FedaPay est configuré, retourner la méthode existante
      if (fedapayData.fedapay_subaccount_id && fedapayData.fedapay_meta && fedapayData.fedapay_meta.account_name) {
        const method = {
          id: 1,
          type: "fedapay",
          account_name: fedapayData.fedapay_meta.account_name || "",
          account_number: fedapayData.fedapay_meta.account_number || "",
          is_default: true,
          status: "active",
          created_at: new Date().toISOString(),
          // Ajouter les métadonnées complètes pour compatibilité
          fedapay_subaccount_id: fedapayData.fedapay_subaccount_id,
          fedapay_meta: fedapayData.fedapay_meta,
          is_ready: fedapayData.is_ready || true
        };
        
        console.log("[coOwnerApi.getWithdrawalMethods] method found =>", method);
        return [method];
      }
      
      console.log("[coOwnerApi.getWithdrawalMethods] no method found");
      // Si aucune méthode n'est configurée, retourner tableau vide
      return [];
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error);
      // En cas d'erreur, retourner tableau vide
      return [];
    }
  }

  async getBalance(): Promise<any> {
    try {
      // Pour le moment, retourner un solde par défaut
      // TODO: Implémenter un vrai endpoint de solde
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
      // Utiliser la même structure que landlordPayments pour le co-propriétaire
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
      // Utiliser la même structure que landlordPayments pour le co-propriétaire
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
      // Pour FedaPay, on ne supprime pas vraiment, on met à jour avec le bon préfixe
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
      // Pour FedaPay, toutes les méthodes sont par défaut
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
}

export const coOwnerApi = new CoOwnerApiService();
export default coOwnerApi;
