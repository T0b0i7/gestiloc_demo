// src/services/maintenanceService.ts
import api from "@/services/api";

export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "cancelled";
export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  tenant_id: number;
  landlord_id: number;

  title: string;
  category: string;
  description: string;

  status: MaintenanceStatus;
  priority: MaintenancePriority;

  preferred_slots?: {
    date: string;
    start_time: string;
    end_time: string;
  }[] | null;
  photos?: string[] | null;

  assigned_provider?: string | null;
  resolved_at?: string | null;

  created_at: string;
  updated_at: string;

  property?: {
    id: number;
    name?: string | null;
    address: string;
    city?: string | null;
    photos?: string[] | null;
  } | null;

  tenant?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    user?: { email?: string | null; phone?: string | null } | null;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// -------- helpers (Laravel Resource / Collection / plain array) --------
function unwrap<T>(payload: T | { data: T }): T {
  return (payload as { data?: T }).data ?? payload as T;
}

export const maintenanceService = {
  async list(params?: { status?: MaintenanceStatus; property_id?: number; page?: number }) {
    const res = await api.get<PaginatedResponse<MaintenanceRequest>>("/incidents", { params });

    // Cas paginate Laravel => { data: [...], ...meta }
    if (res.data && typeof res.data === "object" && Array.isArray(res.data.data)) {
      return res.data as PaginatedResponse<MaintenanceRequest>;
    }

    // Cas Resource collection => { data: [...] }
    if (res.data && typeof res.data === "object" && Array.isArray(res.data?.data)) {
      const arr = res.data.data as MaintenanceRequest[];
      return { data: arr, current_page: 1, last_page: 1, per_page: arr.length, total: arr.length };
    }

    // Cas array direct
    const arr = Array.isArray(res.data) ? (res.data as MaintenanceRequest[]) : [];
    return { data: arr, current_page: 1, last_page: 1, per_page: arr.length, total: arr.length };
  },

  async show(id: number | string) {
    const res = await api.get(`/incidents/${id}`);
    return unwrap<MaintenanceRequest>(res.data);
  },

  async update(id: number | string, payload: Partial<Pick<MaintenanceRequest, "status" | "assigned_provider">>) {
    const res = await api.put(`/incidents/${id}`, payload);
    return unwrap<MaintenanceRequest>(res.data);
  },
};
