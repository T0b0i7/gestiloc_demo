import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'locataire' | 'proprietaire' | 'admin';
  email_verified_at?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    user: {
      id: number;
      email: string;
      first_name: string | null;
      last_name: string | null;
      phone: string;
      roles: string[];
      default_role: string | null;
    };
  };
}

export interface RegisterResponse {
  status: string;
  message: string;
  data?: {
    token: string;
    user: User;
    landlord?: any;
  };
  token?: string;
  user?: User;
}

/**
 * Modèle Property aligné avec App\Models\Property
 */
export interface Property {
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
  meta: Record<string, any> | null;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Payload pour la création / mise à jour d'un bien
 * (adapté à StorePropertyRequest côté Laravel)
 */
export interface CreatePropertyPayload {
  type: string;

  // On garde name pour coller à la colonne "name" en base
  name?: string | null;

  // On garde title tant que ton StorePropertyRequest le demande
  title: string;

  description?: string | null;

  address: string;
  district?: string | null;
  city: string;
  state?: string | null;
  zip_code?: string | null;
  latitude?: string | null;
  longitude?: string | null;

  surface?: number | null;
  room_count?: number | null;
  bedroom_count?: number | null;
  bathroom_count?: number | null;

  rent_amount?: number | null;
  charges_amount?: number | null;
  status: string;

  reference_code?: string | null;
  amenities?: string[] | null;
  photos?: string[] | null;
  meta?: Record<string, any> | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// 🔹 baseURL = http://localhost:8000/api
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// ================= CSRF / SANCTUM =================

const getCsrfToken = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    return true;
  } catch (error) {
    console.error('Erreur CSRF:', error);
    return false;
  }
};

let csrfTokenInitialized = false;

const initializeCsrfToken = async () => {
  if (!csrfTokenInitialized) {
    csrfTokenInitialized = true;
    return await getCsrfToken();
  }
  return true;
};

initializeCsrfToken().catch(console.error);

// Intercepteur réponses (CSRF 419)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 419 && !originalRequest._retry) {
      (originalRequest as any)._retry = true;
      await getCsrfToken();
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Intercepteur requêtes (Bearer token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= AUTH SERVICE =================

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      await initializeCsrfToken();

      const response = await api.post<LoginResponse>(
        '/auth/login',
        {
          email: email.toLowerCase().trim(),
          password,
          device_name: 'web-browser',
        },
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );

      // 1️⃣ Cas : backend renvoie { status, message, data: { access_token, user } }
      if (response.data?.data?.access_token) {
        const token = response.data.data.access_token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      // 2️⃣ Cas fallback : backend renvoie { token, user } à la racine
      if ((response.data as any).token) {
        const anyData: any = response.data;
        localStorage.setItem('token', anyData.token);
        if (anyData.user) {
          localStorage.setItem('user', JSON.stringify(anyData.user));
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const validationErrors = Object.values(
          error.response.data.errors
        ).flat();
        throw new Error(validationErrors[0] || 'Erreur de validation');
      } else {
        throw new Error(
          error.message || 'Une erreur est survenue lors de la connexion'
        );
      }
    }
  },

  register: async (userData: any): Promise<RegisterResponse> => {
    try {
      await initializeCsrfToken();

      const requestData = {
        first_name: userData.first_name || userData.firstName,
        last_name: userData.last_name || userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        password_confirmation:
          userData.password_confirmation || userData.confirmPassword,
        role: userData.role || 'proprietaire',
      };

      const response = await api.post<RegisterResponse>(
        '/auth/register/landlord',
        requestData
      );

      const responseData = response.data;

      if (responseData.token || responseData.data?.token) {
        const token = responseData.token || responseData.data?.token;
        const user = responseData.user || responseData.data?.user;

        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }

      return responseData;
    } catch (error: any) {
      console.error('API - Register error:', error);

      if (error.response) {
        if (error.response.data) {
          if (error.response.data.errors) {
            const validationErrors = Object.values(
              error.response.data.errors
            ).flat();
            const errorMessage =
              validationErrors && validationErrors.length > 0
                ? (validationErrors as string[]).join('\n')
                : 'Une erreur de validation est survenue';
            const errorWithResponse = new Error(errorMessage);
            (errorWithResponse as any).response = error.response;
            throw errorWithResponse;
          }
          if (error.response.data.message) {
            const errorWithResponse = new Error(error.response.data.message);
            (errorWithResponse as any).response = error.response;
            throw errorWithResponse;
          }
        }

        const statusError = new Error(
          `Erreur ${error.response.status}: ${error.response.statusText}`
        );
        (statusError as any).response = error.response;
        throw statusError;
      }

      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await api.get<User>('/auth/user');

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },
};

// ================= PROPERTIES SERVICE =================

export const propertyService = {
  createProperty: async (
    payload: CreatePropertyPayload
  ): Promise<Property> => {
    try {
      await initializeCsrfToken();

      // Sécurité côté front : éviter `null` explicite sur charges_amount
      const safePayload: CreatePropertyPayload = {
        ...payload,
        charges_amount:
          payload.charges_amount === null || payload.charges_amount === undefined
            ? 0
            : payload.charges_amount,
      };

      const response = await api.post<Property>('/properties', safePayload);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API createProperty:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },

  listProperties: async (): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedResponse<Property>>('/properties');
    return response.data;
  },

  getProperty: async (id: number | string): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  // 🔹 Update d’un bien (utilisé par la modale d’édition)
  updateProperty: async (
    id: number | string,
    payload: Partial<CreatePropertyPayload>
  ): Promise<Property> => {
    try {
      await initializeCsrfToken();

      const safePayload: Partial<CreatePropertyPayload> = {
        ...payload,
      };

      const response = await api.put<Property>(
        `/properties/${id}`,
        safePayload
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur API updateProperty:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },

  // 🔹 Suppression (soft delete côté backend si tu as SoftDeletes)
  deleteProperty: async (id: number | string): Promise<void> => {
    try {
      await initializeCsrfToken();
      await api.delete(`/properties/${id}`);
    } catch (error: any) {
      console.error('Erreur API deleteProperty:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },
};

// ================= UPLOAD SERVICE =================

export const uploadService = {
  uploadPhoto: async (
    file: File
  ): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<{ path: string; url: string }>(
        '/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur API uploadPhoto:', error.response?.data || error);
      throw error;
    }
  },
};

// ================= TENANT SERVICE =================

export interface InviteTenantPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface CompleteTenantRegistrationPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Types pour /tenants (index bailleur)

export interface TenantApiProperty {
  id: number;
  name: string | null;
  address: string;
  city: string | null;
}

export interface TenantApiLease {
  id: number;
  uuid: string | null;
  status: string;
  // current_balance?: number | null; // à activer si le backend le renvoie
}

export interface TenantApi {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone?: string | null;
  status?: string | null;
  solvency_score?: number | null;
  property?: TenantApiProperty | null;
  lease?: TenantApiLease | null;
}

export interface TenantInvitationApi {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  expires_at: string;
  created_at: string;
}

export interface TenantIndexResponse {
  tenants: TenantApi[];
  invitations: TenantInvitationApi[];
}

export const tenantService = {
  inviteTenant: async (payload: InviteTenantPayload): Promise<{
    message: string;
    invitation: {
      id: number;
      email: string;
      expires_at: string;
    };
  }> => {
    try {
      await initializeCsrfToken();

      const response = await api.post('/tenants/invite', payload);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API inviteTenant:', error);

      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  listTenants: async (): Promise<TenantIndexResponse> => {
    try {
      await initializeCsrfToken();

      const response = await api.get<TenantIndexResponse>('/tenants');
      return response.data;
    } catch (error: any) {
      console.error('Erreur API listTenants:', error);

      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  completeTenantRegistration: async (
    payload: CompleteTenantRegistrationPayload
  ): Promise<{
    message: string;
    token: string;
    user: any;
  }> => {
    try {
      await initializeCsrfToken();

      const response = await api.post(
        '/auth/tenant/complete-registration',
        payload
      );

      // On stocke le token comme au login
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      console.error('Erreur API completeTenantRegistration:', error);

      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};

// ================= LEASES SERVICE =================

export interface Lease {
  id: number;
  uuid: string;
  property_id: number;
  tenant_id: number;

  start_date: string;         // 'YYYY-MM-DD'
  end_date: string | null;

  rent_amount: string;        // Laravel renvoie souvent en string
  deposit: string | null;

  type: string;               // 'nu' | 'meuble'
  status: string;             // 'pending' | 'active' | 'terminated'

  terms: string[] | null;     // <-- tableau de strings côté backend

  created_at: string;
  updated_at: string;
}

export interface CreateLeasePayload {
  property_id: number;
  tenant_id: number;
  start_date: string;            // format 'YYYY-MM-DD'
  end_date?: string | null;

  rent_amount: number;
  deposit?: number | null;

  type: "nu" | "meuble";
  status?: "pending" | "active" | "terminated";
  terms?: string[];              // <-- array comme dans StoreLeaseRequest
}

export const leaseService = {
  createLease: async (payload: CreateLeasePayload): Promise<Lease> => {
    try {
      await initializeCsrfToken();

      const response = await api.post<Lease>('/leases', payload);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API createLease:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },

  listLeases: async (): Promise<Lease[]> => {
    try {
      const response = await api.get<Lease[]>('/leases');
      return response.data;
    } catch (error: any) {
      console.error('Erreur API listLeases:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },

  getLease: async (id: number | string): Promise<Lease> => {
    try {
      const response = await api.get<Lease>(`/leases/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API getLease:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },

  terminateLease: async (uuid: string): Promise<Lease> => {
    try {
      await initializeCsrfToken();

      const response = await api.post<Lease>(`/leases/${uuid}/terminate`, {});
      return response.data;
    } catch (error: any) {
      console.error('Erreur API terminateLease:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },
};

// ================= ETATS DES LIEUX (PROPERTY CONDITION REPORTS) =================

// Statut de condition d’une photo
export type ConditionStatus = 'good' | 'satisfactory' | 'poor' | 'damaged';

export interface PropertyConditionPhoto {
  id: number;
  report_id: number;
  path: string;
  original_filename: string | null;
  mime_type: string | null;
  size: number;
  condition_status: ConditionStatus | null;
  condition_notes?: string | null;
  taken_at: string;
  caption?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyConditionReport {
  id: number;
  property_id: number;
  lease_id: number;
  created_by: number;
  type: 'entry' | 'exit' | 'intermediate';
  report_date: string;
  notes?: string | null;
  signature_data?: string | null;
  signed_by?: string | null;
  signed_at?: string | null;

  photos?: PropertyConditionPhoto[];
  lease?: any | null;      // ← ton backend peut renvoyer lease + tenant, on garde souple
  property?: any | null;
}

// Item photo côté form
export type CreateConditionReportPhotoItem = {
  file: File;
  condition_status?: ConditionStatus; // (info front pour UI)
  condition_notes?: string;           // (info front pour UI)
  caption?: string;                   // ✅ si tu veux l’envoyer au backend
  taken_at?: string;                  // optionnel : sinon on utilise report_date
};

export interface CreateConditionReportPayload {
  lease_id: number;
  type: 'entry' | 'exit' | 'intermediate';
  report_date: string; // 'YYYY-MM-DD'
  notes?: string | null;
  photos: CreateConditionReportPhotoItem[];
  signature_data?: string;
  signed_by?: string; // ✅ requis si signature_data est présent côté backend
}

export const conditionReportService = {
  /**
   * GET /properties/{property}/condition-reports
   * Backend renvoie un tableau direct
   */
  listForProperty: async (
    propertyId: number | string
  ): Promise<PropertyConditionReport[]> => {
    await initializeCsrfToken();

    const response = await api.get<PropertyConditionReport[]>(
      `/properties/${propertyId}/condition-reports`
    );

    return response.data;
  },

  /**
   * GET /properties/{property}/condition-reports/{report}
   * Pour ouvrir le détail (photos + lease + tenant...)
   */
  getForProperty: async (
    propertyId: number | string,
    reportId: number | string
  ): Promise<PropertyConditionReport> => {
    await initializeCsrfToken();

    const response = await api.get<PropertyConditionReport>(
      `/properties/${propertyId}/condition-reports/${reportId}`
    );

    return response.data;
  },

  /**
   * POST /properties/{property}/condition-reports
   * Champs attendus backend (store):
   * - lease_id
   * - type
   * - report_date
   * - notes (nullable)
   * - photos[] (required array)
   * - photo_dates[] (required array, same size)
   * - photo_captions[] (optional)
   * - signature_data (optional) + signed_by (required_with)
   */
  createForProperty: async (
    propertyId: number | string,
    payload: CreateConditionReportPayload
  ): Promise<PropertyConditionReport> => {
    await initializeCsrfToken();

    const formData = new FormData();

    formData.append('lease_id', String(payload.lease_id));
    formData.append('type', payload.type);
    formData.append('report_date', payload.report_date);

    if (payload.notes) formData.append('notes', payload.notes);

    if (payload.signature_data) {
      formData.append('signature_data', payload.signature_data);
      // ⚠️ backend: signed_by required_with signature_data
      formData.append('signed_by', payload.signed_by || 'Signature');
    }

    payload.photos.forEach((p, index) => {
      if (!(p?.file instanceof File)) {
        throw new Error(`Photo invalide à l’index ${index} (file manquant).`);
      }

      // ✅ Laravel: photos.* => image
      formData.append(`photos[${index}]`, p.file);

      // ✅ Laravel: photo_dates required array size = photos count
      formData.append(
        `photo_dates[${index}]`,
        (p.taken_at || payload.report_date) as string
      );

      // ✅ optionnel si tu veux l’utiliser côté backend
      if (p.caption) {
        formData.append(`photo_captions[${index}]`, p.caption);
      }
    });

    const response = await api.post(
      `/properties/${propertyId}/condition-reports`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    // ton store renvoie { message, report }
    const data: any = response.data;
    return data.report ?? data.data ?? data;
  },

  /**
   * POST /properties/{property}/condition-reports/{report}/photos
   * Pour ajouter des photos plus tard (optionnel).
   * Backend attend:
   * - photos[]
   * - photo_dates[]
   * - photo_captions[] (optional)
   * - condition_status[] (optional, selon ton controller)
   * - condition_notes[] (optional)
   */
  addPhotos: async (
    propertyId: number | string,
    reportId: number | string,
    items: CreateConditionReportPhotoItem[],
    defaultDate?: string
  ): Promise<{ message: string; photos: PropertyConditionPhoto[] }> => {
    await initializeCsrfToken();

    const formData = new FormData();

    items.forEach((p, index) => {
      if (!(p?.file instanceof File)) {
        throw new Error(`Photo invalide à l’index ${index} (file manquant).`);
      }

      formData.append(`photos[${index}]`, p.file);
      formData.append(`photo_dates[${index}]`, p.taken_at || defaultDate || new Date().toISOString().slice(0, 10));

      if (p.caption) formData.append(`photo_captions[${index}]`, p.caption);
      if (p.condition_status) formData.append(`condition_status[${index}]`, p.condition_status);
      if (p.condition_notes) formData.append(`condition_notes[${index}]`, p.condition_notes);
    });

    const response = await api.post(
      `/properties/${propertyId}/condition-reports/${reportId}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

};

// ================= CONTRACT SERVICE =================

export interface RentalContractData {
  landlord: {
    name: string;
    address: string;
    phone: string;
    email: string;
    id_type: string;
    id_number: string;
  };
  tenant: {
    name: string;
    address: string;
    phone: string;
    email: string;
    id_type: string;
    id_number: string;
  };
  property: {
    address: string;
    floor?: string;
    type: string;
    area: string;
    rooms: string;
    has_parking: boolean;
    equipment?: string[];
  };
  contract: {
    start_date: string;
    end_date: string | null;
    rent_amount: number;
    deposit_amount: number;
    included_charges?: string[];
    payment_frequency?: "monthly" | "quarterly";
    payment_method?: "cash" | "bank_transfer" | "mobile_money";
    notice_period?: number;
    duration?: string;
  };
}

export const contractService = {
  /**
   * ✅ NOUVEAU (recommandé) :
   * Télécharge le contrat généré côté backend à partir du UUID du bail
   * Route: GET /api/pdf/contrat-bail/{uuid}
   */
  async downloadLeaseContract(uuid: string): Promise<Blob> {
    try {
      const response = await api.get(`/pdf/contrat-bail/${uuid}`, {
        responseType: "blob",
      });

      return new Blob([response.data], { type: "application/pdf" });
    } catch (error) {
      console.error("Erreur lors du téléchargement du contrat (UUID):", error);
      throw error;
    }
  },

  /**
   * (optionnel) Compat : ton endpoint existant qui génère un contrat depuis un JSON
   * Route: POST /api/pdf/generate-rental-contract
   */
  async generateRentalContract(data: RentalContractData): Promise<Blob> {
    try {
      const response = await api.post("/pdf/generate-rental-contract", data, {
        responseType: "blob",
      });

      return new Blob([response.data], { type: "application/pdf" });
    } catch (error) {
      console.error("Erreur lors de la génération du contrat (JSON):", error);
      throw error;
    }
  },

  /**
   * Télécharge un fichier Blob (PDF) dans le navigateur
   */
  downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

// ================= NOTICES SERVICE =================

export interface Notice {
  id: number;
  property_id: number;
  landlord_id: number;
  tenant_id: number;
  type: "landlord" | "tenant";
  reason: string;
  notice_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string | null;
  created_at: string;

  property?: {
    id: number;
    address: string;
  };

  tenant?: {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface CreateNoticePayload {
  property_id: number;
  lease_id?: number; // ✅ recommandé
  tenant_id?: number; // optionnel (si tu veux forcer)
  type: "landlord" | "tenant";
  reason: string;
  notice_date: string;
  end_date: string;
  notes?: string;
}

export const noticeService = {
  list: async (): Promise<Notice[]> => {
    const response = await api.get<Notice[]>("/notices");
    return response.data;
  },

  create: async (payload: CreateNoticePayload): Promise<Notice> => {
    const response = await api.post<Notice>("/notices", payload);
    return response.data;
  },

  update: async (
    id: number,
    payload: Partial<Pick<Notice, "status" | "notes">>
  ): Promise<Notice> => {
    const response = await api.put<Notice>(`/notices/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notices/${id}`);
  },
};

// ================= RENT RECEIPTS (QUITTANCES) SERVICE =================

export type RentReceiptType = "independent" | "invoice";

export interface RentReceipt {
  id: number;
  lease_id: number;
  property_id: number;
  landlord_id: number;
  tenant_id: number;

  type: RentReceiptType;
  status: "issued" | "draft";

  paid_month: string;   // YYYY-MM
  issued_date: string;  // YYYY-MM-DD

  amount_paid: number;
  currency?: string | null;
  notes?: string | null;

  created_at: string;

  lease?: any;
  property?: { id: number; address: string; city?: string | null };
  tenant?: { id: number; first_name?: string | null; last_name?: string | null; email?: string | null };
}

export interface CreateRentReceiptPayload {
  lease_id: number;
  paid_month: string;    // "2025-12"
  issued_date?: string;  // optionnel
  notes?: string | null;
}

export const rentReceiptService = {
  // ✅ liste uniquement les quittances indépendantes
  listIndependent: async (): Promise<RentReceipt[]> => {
    await initializeCsrfToken();
    const response = await api.get<RentReceipt[]>("/rent-receipts", {
      params: { type: "independent" },
    });
    return response.data;
  },

  // ✅ création quittance indépendante
  createIndependent: async (payload: CreateRentReceiptPayload): Promise<RentReceipt> => {
    await initializeCsrfToken();
    const response = await api.post<RentReceipt>("/rent-receipts", {
      ...payload,
      type: "independent",
    });
    return response.data;
  },

  // ✅ PDF quittance indépendante
downloadPdf: async (id: number): Promise<Blob> => {
  await initializeCsrfToken();
  const response = await api.get(`/quittance-independent/${id}`, {
    responseType: "blob",
  });
  return new Blob([response.data], { type: "application/pdf" });
},

};


export default api;
