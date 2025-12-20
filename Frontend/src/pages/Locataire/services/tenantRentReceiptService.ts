import api from "@/services/api";

export type RentReceiptType = "independent" | "invoice" | string;
export type RentReceiptStatus = "issued" | "draft" | string;

export type RentReceipt = {
  id: number;
  lease_id: number;
  property_id: number;
  landlord_id: number;
  tenant_id: number;

  type?: RentReceiptType | null;
  paid_month?: string | null;
  issued_date?: string | null;
  amount_paid?: number | string | null;

  reference?: string | null;
  status?: RentReceiptStatus | null;
  notes?: string | null;

  pdf_path?: string | null;

  property?: { id: number; address: string; city?: string | null } | null;
  lease?: any;
  landlord?: any;

  created_at?: string;
  updated_at?: string;
};

export const tenantRentReceiptService = {
  // ✅ On utilise ton endpoint existant (RentReceiptController@index)
  async list(params?: { type?: "independent" | "invoice" }) {
    const res = await api.get<RentReceipt[]>("/rent-receipts", { params });
    return res.data;
  },

  // ✅ On télécharge via l'endpoint PDF existant
  async downloadPdf(id: number): Promise<Blob> {
    const res = await api.get(`/quittance-independent/${id}`, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
      validateStatus: (s) => s >= 200 && s < 500,
    });

    const contentType = (res.headers?.["content-type"] || "").toLowerCase();

    // Si le backend renvoie JSON (Forbidden, Unauth…), on stoppe
    if (!contentType.includes("application/pdf")) {
      const text = await new Response(res.data).text();
      throw new Error(`Téléchargement refusé / réponse non PDF: ${text}`);
    }

    return new Blob([res.data], { type: "application/pdf" });
  },
};
