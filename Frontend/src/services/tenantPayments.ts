// src/services/tenantPayments.ts
import api from "./api";

export interface Invoice {
  id: number;
  type?: string;
  due_date?: string;
  period_start?: string | null;
  period_end?: string | null;

  amount_total?: number;
  amount_paid?: number;
  paid_amount?: number;

  status?: string;
  invoice_number?: string;

  currency?: string;
  meta?: Record<string, string | number | boolean | null> & { currency?: string };

  paid_at?: string | null;
  paidAt?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface LeaseLite {
  id: number;
  uuid: string;
  status?: string;
  is_active?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

export type NormalizedInvoice = Invoice & {
  _total: number;
  _paid: number;
  _remaining: number;
  _currency: string;
  _paidAt: string | null;
};

export type PayLinkInfo = {
  token: string;
  invoice?: Invoice;
  used_at?: string | null;
  expires_at?: string | null;
  property?: {
    title?: string;
    name?: string;
    address?: string;
  };
  lease?: {
    property_title?: string;
    property_address?: string;
  };
  tenant?: {
    name?: string;
    full_name?: string;
    email?: string;
  };
};

const normalizeArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) {
    return (data as { data: unknown[] }).data;
  }
  return [];
};

const safeString = (v: unknown) => (v == null ? "" : String(v));
const isNonEmpty = (s?: string) => typeof s === "string" && s.trim().length > 0;

const safeNumber = (v: unknown) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export const tenantPayments = {
  /* =========================
     HELPERS (used by UI)
  ========================= */
  pickCurrency(inv: Partial<Invoice> | Record<string, unknown>, fallback = "XOF"): string {
    const cur =
      safeString(inv?.currency) ||
      safeString((inv as { meta?: { currency?: string } })?.meta?.currency) ||
      safeString((inv as { lease?: { currency?: string } })?.lease?.currency) ||
      safeString((inv as { payment?: { currency?: string } })?.payment?.currency) ||
      "";

    const normalized = cur.trim().toUpperCase();
    return isNonEmpty(normalized) ? normalized : fallback;
  },

  pickPaidAmount(inv: Partial<Invoice> | Record<string, unknown>): number {
    return safeNumber(inv?.amount_paid ?? inv?.paid_amount ?? 0);
  },

  pickTotalAmount(inv: Partial<Invoice> | Record<string, unknown>): number {
    return safeNumber(inv?.amount_total ?? (inv as { amount?: number })?.amount ?? 0);
  },

  pickPaidAt(inv: Partial<Invoice> | Record<string, unknown>): string | null {
    return (inv?.paid_at as string | undefined) ?? (inv?.paidAt as string | undefined) ?? (inv?.updated_at as string | undefined) ?? null;
  },

  normalizeInvoice(inv: Invoice): NormalizedInvoice {
    const total = this.pickTotalAmount(inv);
    const paid = this.pickPaidAmount(inv);
    const remaining = Math.max(0, total - paid);
    const currency = this.pickCurrency(inv, "XOF");
    const paidAt = this.pickPaidAt(inv);

    return {
      ...inv,
      _total: total,
      _paid: paid,
      _remaining: remaining,
      _currency: currency,
      _paidAt: paidAt,
    };
  },

  normalizeInvoices(invoices: Invoice[]): NormalizedInvoice[] {
    return (Array.isArray(invoices) ? invoices : []).map((i) => this.normalizeInvoice(i));
  },

  /* =========================
     API (routes inchangées)
  ========================= */

  // ✅ Liste factures tenant (route: GET api/tenant/invoices)
  async listTenantInvoices(): Promise<Invoice[]> {
    const { data } = await api.get("/tenant/invoices");
    return normalizeArray(data) as Invoice[];
  },

  // ✅ (si tu utilises encore la route my-leases)
  async listMyLeases(): Promise<LeaseLite[]> {
    const { data } = await api.get("/tenant/my-leases");
    return normalizeArray(data) as LeaseLite[];
  },

  async listInvoicesFromActiveLease(): Promise<Invoice[]> {
    const leases = await this.listMyLeases();
    if (!leases.length) return [];

    const active =
      leases.find((l) => l.is_active) ||
      leases.find((l) => safeString(l.status).toLowerCase() === "active") ||
      leases[0];

    if (!active?.uuid) throw new Error("Aucun bail actif (uuid manquant).");

    const { data } = await api.get(`/tenant/my-leases/${active.uuid}/invoices`);
    return normalizeArray(data) as Invoice[];
  },

  // ✅ Paiement tenant (route: POST api/tenant/invoices/{invoice}/pay)
  async initInvoicePayment(invoiceId: number): Promise<{ checkout_url: string; payment_id?: number }> {
    const { data } = await api.post(`/tenant/invoices/${invoiceId}/pay`, {});
    const checkout_url = data?.checkout_url || data?.url || data?.checkoutUrl;
    if (!checkout_url) throw new Error("checkout_url introuvable (backend).");
    return { checkout_url, payment_id: data?.payment_id };
  },

  // ✅ Vérif (route existante: GET /invoices/{id}/payment/verify)
  async verifyInvoicePayment(invoiceId: number): Promise<any> {
    const { data } = await api.get(`/invoices/${invoiceId}/payment/verify`);
    return data;
  },

  // ✅ Quittance (route: GET /tenant/invoices/{invoice}/receipt)
  async downloadReceipt(invoiceId: number): Promise<Blob> {
    const res = await api.get(`/tenant/invoices/${invoiceId}/receipt`, {
      responseType: "blob",
    });
    return new Blob([res.data], { type: "application/pdf" });
  },

  // ✅ Récupérer infos d'un lien de paiement
  async getPayLink(token: string): Promise<PayLinkInfo> {
    const { data } = await api.get(`/tenant/pay-link/${token}`);
    return data as PayLinkInfo;
  },

  // ✅ Initier paiement via lien
  async initPayment(token: string): Promise<{ checkout_url: string; payment_id?: number }> {
    const { data } = await api.post(`/tenant/pay-link/${token}/pay`, {});
    const checkout_url = data?.checkout_url || data?.url || data?.checkoutUrl;
    if (!checkout_url) throw new Error("checkout_url introuvable (backend).");
    return { checkout_url, payment_id: data?.payment_id };
  },
};
