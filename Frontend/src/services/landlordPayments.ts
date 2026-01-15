// src/services/landlordPayments.ts
import api from "./api";
import axios from "axios";

export type InvoiceType = "rent" | "deposit" | "charge" | "repair";

/* =========================
   INVOICES
========================= */

export interface CreateInvoicePayload {
  lease_id: number;
  type: InvoiceType;
  due_date: string; // YYYY-MM-DD
  period_start?: string; // YYYY-MM-DD
  period_end?: string; // YYYY-MM-DD
  amount_total: number;

  // backend required
  payment_method: string; // ex: "fedapay"
}

export interface Invoice {
  id: number;
  lease_id: number;
  type: InvoiceType;
  due_date: string;
  period_start?: string | null;
  period_end?: string | null;
  amount_total: number;
  amount_paid?: number;
  status?: string;
  invoice_number?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface PayLinkResponse {
  url: string;
  expires_at: string;
}

/* =========================
   FEDEPAY (WITHDRAWAL)
========================= */

export interface LandlordFedapayProfile {
  // ✅ côté front on garde ce nom (compat)
  fedapay_subaccount_id: string | null;
  fedapay_meta: any | null;

  // ✅ bonus: dispo si tu veux afficher is_ready
  is_ready?: boolean;
}

export type PayoutType = "bank" | "mobile_money" | "bank_card";

/**
 * IMPORTANT:
 * Ton backend actuel ne valide QUE subaccount_reference (acc_xxx)
 * et ignore le reste.
 * On peut quand même garder les champs “payout” pour futur.
 */
export interface UpsertSubaccountPayload {
  subaccount_reference: string; // required by backend (acc_xxx)

  payout_type?: PayoutType;

  country?: string;
  currency?: string;
  account_name?: string;

  provider?: string;
  phone?: string;

  bank_name?: string;
  iban?: string;
  account_number?: string;

  card_token?: string;
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: string;
  card_exp_year?: string;
}

/* =========================
   LOGS & HELPERS
========================= */

const logAxiosError = (label: string, err: unknown, extra?: Record<string, any>) => {
  if (!axios.isAxiosError(err)) {
    console.error(`[${label}] non-axios error`, err, extra ?? {});
    return;
  }

  const status = err.response?.status;
  const data = err.response?.data;

  console.error(`[${label}] AxiosError`, {
    status,
    message: data?.message ?? err.message,
    errors: data?.errors ?? null,
    data,
    config: {
      url: err.config?.url,
      method: err.config?.method,
      baseURL: err.config?.baseURL,
      withCredentials: err.config?.withCredentials,
    },
    ...extra,
  });
};

const isYYYYMMDD = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isNonEmpty = (s?: string) => typeof s === "string" && s.trim().length > 0;

const extractApiMessage = (err: unknown): string | null => {
  if (!axios.isAxiosError(err)) return null;

  const data: any = err.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const first = (Object.values<string[]>(data.errors)?.flat?.() ?? [])[0];
    if (first) return String(first);
  }

  if (data?.message) return String(data.message);
  return null;
};

/* =========================
   SUBACCOUNT_REFERENCE (backend regex: ^acc_[A-Za-z0-9]+$)
========================= */

const ACC_REF_REGEX = /^acc_[A-Za-z0-9]+$/;

const normalizeAccRef = (raw: string) => {
  const v = String(raw ?? "").trim();

  // déjà bon
  if (ACC_REF_REGEX.test(v)) return v;

  // si on a "acc_1" => ok, sinon on fabrique "acc_<alnum>"
  // on garde uniquement alphanum
  const only = v.replace(/[^A-Za-z0-9]/g, "");
  const token = only.length ? only : Date.now().toString(36);

  return `acc_${token}`;
};

const validateAccRef = (ref: string) => ACC_REF_REGEX.test(ref);

/* =========================
   INVOICE NORMALIZATION
========================= */

const normalizeCreateInvoicePayload = (payload: CreateInvoicePayload): CreateInvoicePayload => {
  const clean: CreateInvoicePayload = {
    lease_id: Number(payload.lease_id),
    type: payload.type,
    due_date: String(payload.due_date),
    amount_total: Number(payload.amount_total),
    payment_method: isNonEmpty(payload.payment_method) ? payload.payment_method.trim() : "fedapay",
  };

  if (payload.period_start) clean.period_start = String(payload.period_start);
  if (payload.period_end) clean.period_end = String(payload.period_end);

  return clean;
};

const validateCreateInvoicePayload = (p: CreateInvoicePayload) => {
  const errors: string[] = [];

  if (!p.lease_id || Number.isNaN(Number(p.lease_id))) errors.push("lease_id invalide");
  if (!p.type) errors.push("type manquant");
  if (!isYYYYMMDD(p.due_date)) errors.push("due_date doit être au format YYYY-MM-DD");

  if (typeof p.amount_total !== "number" || Number.isNaN(p.amount_total) || p.amount_total <= 0) {
    errors.push("amount_total doit être un nombre > 0");
  }

  if (!isNonEmpty(p.payment_method)) errors.push("payment_method est requis (ex: fedapay)");

  if (p.period_start && !isYYYYMMDD(p.period_start)) errors.push("period_start doit être YYYY-MM-DD");
  if (p.period_end && !isYYYYMMDD(p.period_end)) errors.push("period_end doit être YYYY-MM-DD");

  if (p.period_start && p.period_end && p.period_start > p.period_end) {
    errors.push("period_start ne peut pas être après period_end");
  }

  if (errors.length) {
    const e = new Error(errors.join(" | "));
    (e as any).code = "FRONT_VALIDATION";
    throw e;
  }
};

/* =========================
   PROFILE MAPPING (fix “Aucun moyen enregistré”)
========================= */

const mapFedapayProfile = (data: any): LandlordFedapayProfile => {
  // Ton backend: { subaccount_reference, is_ready, fedapay_meta }
  // Ancien front: { fedapay_subaccount_id, fedapay_meta }
  const ref =
    data?.fedapay_subaccount_id ??
    data?.subaccount_reference ??
    data?.subaccount_id ??
    null;

  return {
    fedapay_subaccount_id: ref ? String(ref) : null,
    fedapay_meta: data?.fedapay_meta ?? null,
    is_ready: typeof data?.is_ready === "boolean" ? data.is_ready : undefined,
  };
};

/* =========================
   EXPORT SERVICE
========================= */

export const landlordPayments = {
  // 1) Create invoice
  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    const normalized = normalizeCreateInvoicePayload(payload);

    console.log("[landlordPayments.createInvoice] payload(raw) =>", payload);
    console.log("[landlordPayments.createInvoice] payload(normalized) =>", normalized);

    validateCreateInvoicePayload(normalized);

    try {
      const { data } = await api.post("/invoices", normalized);
      console.log("[landlordPayments.createInvoice] success =>", data);
      return data;
    } catch (err) {
      const nice = extractApiMessage(err);
      logAxiosError("landlordPayments.createInvoice", err, { payload: normalized });
      if (nice) throw new Error(nice);
      throw err;
    }
  },

  // 2) List invoices
  async listInvoices(): Promise<Invoice[]> {
    console.log("[landlordPayments.listInvoices] calling GET /invoices");

    try {
      const { data } = await api.get("/invoices");
      console.log("[landlordPayments.listInvoices] raw response =>", data);

      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    } catch (err) {
      const nice = extractApiMessage(err);
      logAxiosError("landlordPayments.listInvoices", err);
      if (nice) throw new Error(nice);
      throw err;
    }
  },

  // 3) Create pay-link
  async createPayLink(
    invoiceId: number,
    options?: { hours?: number; send_email?: boolean }
  ): Promise<PayLinkResponse> {
    const body = {
      hours: options?.hours ?? 24,
      send_email: options?.send_email ?? true,
    };

    console.log("[landlordPayments.createPayLink] POST =>", { invoiceId, body });

    try {
      const { data } = await api.post(`/invoices/${invoiceId}/pay-link`, body);
      console.log("[landlordPayments.createPayLink] success =>", data);
      return data;
    } catch (err) {
      const nice = extractApiMessage(err);
      logAxiosError("landlordPayments.createPayLink", err, { invoiceId, body });
      if (nice) throw new Error(nice);
      throw err;
    }
  },

  // 4) Get fedapay profile (✅ fixed mapping)
  async getFedapayProfile(): Promise<LandlordFedapayProfile> {
    console.log("[landlordPayments.getFedapayProfile] GET /landlord/fedapay");

    try {
      const { data } = await api.get("/landlord/fedapay");
      const mapped = mapFedapayProfile(data);
      console.log("[landlordPayments.getFedapayProfile] success(mapped) =>", mapped);
      return mapped;
    } catch (err) {
      const nice = extractApiMessage(err);
      logAxiosError("landlordPayments.getFedapayProfile", err);
      if (nice) throw new Error(nice);
      throw err;
    }
  },

  // 5) Save / update subaccount_reference (✅ avoid 422 format invalid)
  async createOrUpdateSubaccount(payload: UpsertSubaccountPayload): Promise<any> {
    const normalizedRef = normalizeAccRef(payload.subaccount_reference);

    if (!validateAccRef(normalizedRef)) {
      throw new Error("subaccount_reference invalide (attendu: acc_XXXX)");
    }

    // ⚠️ Ton backend ne valide que subaccount_reference.
    // On envoie seulement ça => zéro risque de validation future.
    const body = { subaccount_reference: normalizedRef };

    console.log("[landlordPayments.createOrUpdateSubaccount] payload(raw) =>", payload);
    console.log("[landlordPayments.createOrUpdateSubaccount] body(sent) =>", body);

    try {
      const { data } = await api.post("/landlord/fedapay/subaccount", body);
      console.log("[landlordPayments.createOrUpdateSubaccount] success =>", data);
      return data;
    } catch (err) {
      const nice = extractApiMessage(err);
      logAxiosError("landlordPayments.createOrUpdateSubaccount", err, { body });
      if (nice) throw new Error(nice);
      throw err;
    }
  },
};
