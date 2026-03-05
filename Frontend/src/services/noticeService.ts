import api from "@/services/api";

export type NoticeStatus = "pending" | "confirmed" | "cancelled";
export type NoticeType = "tenant" | "landlord";

export type Notice = {
  id: number;
  property_id: number;
  landlord_id: number;
  tenant_id: number;

  type: NoticeType;
  reason: string;
  notice_date: string;
  end_date: string;
  status: NoticeStatus;
  notes?: string | null;

  created_at?: string;

  property?: { id: number; address?: string; city?: string | null } | null;

  tenant?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    user?: { email?: string | null; phone?: string | null } | null;
  } | null;

  landlord?: {
    id: number;
    email?: string | null;
    phone?: string | null;
  } | null;
};

function unwrap<T>(payload: T | { data: T }): T {
  // Ton controller renvoie un tableau brut et un objet brut
  return (payload as { data?: T }).data ?? payload as T;
}

export const noticeService = {
  async list(): Promise<Notice[]> {
    const res = await api.get("/notices");
    return unwrap<Notice[]>(res.data) ?? [];
  },

  // ✅ Locataire: { lease_id, end_date, reason, notes? }
  // ✅ Bailleur: { property_id, lease_id?, tenant_id?, reason, notice_date, end_date, notes? }
  async create(payload: {
    lease_id?: number;
    property_id?: number;
    tenant_id?: number;
    end_date: string;
    reason: string;
    notes?: string;
    notice_date?: string;
  }): Promise<Notice> {
    const res = await api.post("/notices", payload);
    return unwrap<Notice>(res.data);
  },

  async update(id: number, payload: Partial<Pick<Notice, "status" | "notes">>): Promise<Notice> {
    const res = await api.put(`/notices/${id}`, payload);
    return unwrap<Notice>(res.data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/notices/${id}`);
  },
};
