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
  status?: string;
  invoice_number?: string;
  currency?: string;
  [key: string]: any;
}

export interface LeaseLite {
  id: number;
  uuid: string;
  status?: string;
  is_active?: boolean;
  [key: string]: any;
}

const normalizeArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export const tenantPayments = {
  // ✅ 1) Récupère les baux du locataire
  async listMyLeases(): Promise<LeaseLite[]> {
    const { data } = await api.get("/tenant/my-leases");
    return normalizeArray(data) as LeaseLite[];
  },

  // ✅ 2) Lister les factures du bail actif
  async listInvoices(): Promise<Invoice[]> {
    const leases = await this.listMyLeases();

    if (!leases.length) return [];

    // essaie de trouver un bail actif sinon le 1er
    const active =
      leases.find((l) => l.is_active) ||
      leases.find((l) => String(l.status || "").toLowerCase() === "active") ||
      leases[0];

    if (!active?.uuid) throw new Error("Aucun bail actif (uuid manquant).");

    const { data } = await api.get(`/tenant/my-leases/${active.uuid}/invoices`);
    return normalizeArray(data) as Invoice[];
  },

  // ✅ 3) Init paiement (AUTH)
  async initInvoicePayment(invoiceId: number): Promise<{ checkout_url: string }> {
    const { data } = await api.post(`/tenant/invoices/${invoiceId}/pay`, {});
    const checkout_url = data?.checkout_url || data?.url || data?.checkoutUrl;
    if (!checkout_url) throw new Error("checkout_url introuvable (backend).");
    return { checkout_url };
  },

  // ✅ 4) Vérifier statut paiement (AUTH)
  async verifyInvoicePayment(invoiceId: number): Promise<any> {
    const { data } = await api.get(`/invoices/${invoiceId}/payment/verify`);
    return data;
  },

  // ✅ 5) Télécharger quittance (AUTH)
  async downloadReceipt(invoiceId: number): Promise<Blob> {
    const res = await api.get(`/tenant/invoices/${invoiceId}/receipt`, {
      responseType: "blob",
    });
    return new Blob([res.data], { type: "application/pdf" });
  },
};
