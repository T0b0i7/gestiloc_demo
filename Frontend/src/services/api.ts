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
    landlord?: Record<string, unknown>;
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
  meta: Record<string, unknown> | null;

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
  meta?: Record<string, unknown> | null;
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
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
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
      const fallbackData = response.data as { token?: string; user?: User };
      if (fallbackData.token) {
        localStorage.setItem('token', fallbackData.token);
        if (fallbackData.user) {
          localStorage.setItem('user', JSON.stringify(fallbackData.user));
        }
      }

      return response.data;
    } catch (error: unknown) {
      console.error('Login error:', error);
      const apiError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; message?: string };

      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      } else if (apiError.response?.data?.errors) {
        const validationErrors = Object.values(
          apiError.response.data.errors
        ).flat();
        throw new Error(validationErrors[0] || 'Érreur de validation');
      } else {
        throw new Error(
          apiError.message || 'Une erreur est survenue lors de la connexion'
        );
      }
    }
  },

  register: async (userData: {
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation?: string;
    confirmPassword?: string;
    role?: string;
  }): Promise<RegisterResponse> => {
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
    } catch (error: unknown) {
      console.error('API - Register error:', error);
      const apiError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string }; status?: number; statusText?: string } };

      if (apiError.response) {
        if (apiError.response.data) {
          if (apiError.response.data.errors) {
            const validationErrors = Object.values(
              apiError.response.data.errors
            ).flat();
            const errorMessage =
              validationErrors && validationErrors.length > 0
                ? (validationErrors as string[]).join('\n')
                : 'Une erreur de validation est survenue';
            const errorWithResponse = Object.assign(new Error(errorMessage), { response: apiError.response });
            throw errorWithResponse;
          }
          if (apiError.response.data.message) {
            const errorWithResponse = Object.assign(new Error(apiError.response.data.message), { response: apiError.response });
            throw errorWithResponse;
          }
        }

        const statusError = Object.assign(
          new Error(`Erreur ${apiError.response.status}: ${apiError.response.statusText}`),
          { response: apiError.response }
        );
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
    } catch (error: unknown) {
      console.error('Erreur API createProperty:', error);
      const apiError = error as { response?: { data?: unknown } };
      if (apiError.response?.data) throw apiError.response.data;
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
    } catch (error: unknown) {
      console.error('Erreur API updateProperty:', error);
      const apiError = error as { response?: { data?: unknown } };
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // 🔹 Suppression (soft delete côté backend si tu as SoftDeletes)
  deleteProperty: async (id: number | string): Promise<void> => {
    try {
      await initializeCsrfToken();
      await api.delete(`/properties/${id}`);
    } catch (error: unknown) {
      console.error('Erreur API deleteProperty:', error);
      const apiError = error as { response?: { data?: unknown } };
      if (apiError.response?.data) throw apiError.response.data;
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
    } catch (error: unknown) {
      console.error('Erreur API uploadPhoto:', (error as { response?: { data?: unknown } }).response?.data || error);
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
    } catch (error: unknown) {
      console.error('Erreur API inviteTenant:', error);
      const apiError = error as { response?: { data?: unknown } };

      if (apiError.response?.data) {
        throw apiError.response.data;
      }
      throw error;
    }
  },

  listTenants: async (): Promise<TenantIndexResponse> => {
    try {
      await initializeCsrfToken();

      const response = await api.get<TenantIndexResponse>('/tenants');
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur API listTenants:', error);
      const apiError = error as { response?: { data?: unknown } };

      if (apiError.response?.data) {
        throw apiError.response.data;
      }
      throw error;
    }
  },

  completeTenantRegistration: async (
    payload: CompleteTenantRegistrationPayload
  ): Promise<{
    message: string;
    token: string;
    user: User;
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
    } catch (error: unknown) {
      console.error('Erreur API completeTenantRegistration:', error);
      const apiError = error as { response?: { data?: unknown } };

      if (apiError.response?.data) {
        throw apiError.response.data;
      }
      throw error;
    }
  },
};

// ================= LEASES SERVICE =================

export interface Lease {
  id: number;
  uuid?: string;
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
    } catch (error: unknown) {
      console.error('Erreur API createLease:', error);
      const apiError = error as { response?: { data?: unknown } };
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  listLeases: async (): Promise<Lease[]> => {
    try {
      const response = await api.get<Lease[]>('/leases');
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur API listLeases:', error);
      const apiError = error as { response?: { data?: unknown } };
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  getLease: async (id: number | string): Promise<Lease> => {
    try {
      const response = await api.get<Lease>(`/leases/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur API getLease:', error);
      const apiError = error as { response?: { data?: unknown } };
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  terminateLease: async (uuid: string): Promise<Lease> => {
    try {
      await initializeCsrfToken();

      const response = await api.post<Lease>(`/leases/${uuid}/terminate`, {});
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur API terminateLease:', error);
      const apiError = error as { response?: { data?: unknown } };
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};


export default api;
