import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Plus, RefreshCw, Download, Eye, X, CheckCircle2, Loader2 } from "lucide-react";
import { leaseService, rentReceiptService, contractService } from "@/services/api";

type LeaseLite = any;

const todayIso = () => new Date().toISOString().slice(0, 10);
const monthIso = () => new Date().toISOString().slice(0, 7);

type RentReceipt = {
  id: number;
  lease_id: number;
  type: "independent" | "invoice";
  status: "issued" | "draft";
  paid_month: string;
  issued_date: string;
  amount_paid: number;
  notes?: string | null;
  created_at: string;

  property?: { id: number; address: string; city?: string | null };
  tenant?: { id: number; first_name?: string | null; last_name?: string | null; email?: string | null };
  lease?: any;
};

type ApiErr = {
  response?: { status?: number; data?: any };
  request?: unknown;
  message?: string;
};

function looksTechnical(msg?: string) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("sql") ||
    m.includes("exception") ||
    m.includes("stack") ||
    m.includes("trace") ||
    m.includes("undefined") ||
    m.includes("vendor/") ||
    m.includes("laravel") ||
    m.includes("symfony")
  );
}

function extractBackendMessage(err: ApiErr): string {
  const d: any = err?.response?.data;
  const msg = (typeof d === "string" ? d : null) || d?.message || d?.error || err?.message || "";
  return String(msg || "").trim();
}

function isDuplicateReceiptError(err: ApiErr): boolean {
  // Cas typiques Laravel/MySQL/Postgres quand le backend renvoie 500 au lieu de 409/422
  const msg = extractBackendMessage(err).toLowerCase();
  return (
    msg.includes("duplicate") || // MySQL "Duplicate entry"
    msg.includes("unique constraint") || // Postgres
    msg.includes("integrity constraint") || // SQLSTATE
    msg.includes("sqlstate[23000]") || // MySQL
    msg.includes("already exists") || // generic
    msg.includes("existe déjà") || // FR
    msg.includes("paid_month") || // champ
    msg.includes("quittance") // mot métier
  );
}

function normalizeApiError(err: ApiErr, fallback: string) {
  // ✅ Doublon quittance -> message propre (même si status 500)
  if (isDuplicateReceiptError(err)) {
    return "Une quittance pour ce bail et ce mois existe déjà. Choisis un autre mois ou ouvre celle déjà créée.";
  }

  if (err?.request && !err?.response) return "Le serveur ne répond pas. Vérifie ta connexion puis réessaie.";
  const status = err?.response?.status;

  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 404) return "Ressource introuvable.";
  if (status === 409) return "Cette quittance existe déjà pour ce mois.";
  if (status === 413) return "Fichiers trop volumineux.";
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";

  const backendMsg = extractBackendMessage(err);
  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;

  return fallback;
}

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(children, document.body);
}

export function QuittancesIndependantes() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // ✅ Error global (page) + errors modals
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [leases, setLeases] = useState<LeaseLite[]>([]);
  const [receipts, setReceipts] = useState<RentReceipt[]>([]);

  // create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | "">("");
  const [paidMonth, setPaidMonth] = useState<string>(monthIso());
  const [notes, setNotes] = useState<string>("");

  // preview/download
  const [previewing, setPreviewing] = useState<RentReceipt | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const selectedLease = useMemo(() => {
    if (!selectedLeaseId) return null;
    return leases.find((l: any) => Number(l.id) === Number(selectedLeaseId)) || null;
  }, [selectedLeaseId, leases]);

  const propertyLabel = useMemo(() => {
    const p = selectedLease?.property;
    if (!p) return "—";
    const city = p.city ? `, ${p.city}` : "";
    return `${p.address || "Sans adresse"}${city}`;
  }, [selectedLease]);

  const tenantLabel = useMemo(() => {
    const t = selectedLease?.tenant;
    if (!t) return "—";
    const name = `${t.first_name || ""} ${t.last_name || ""}`.trim();
    return name || t.email || "Locataire";
  }, [selectedLease]);

  const rentAmount = useMemo(() => {
    const raw = selectedLease?.rent_amount ?? selectedLease?.rentAmount ?? selectedLease?.lease?.rent_amount;
    const n = Number.parseFloat(String(raw ?? "0"));
    return Number.isFinite(n) ? n : 0;
  }, [selectedLease]);

  const resetCreate = () => {
    setSelectedLeaseId("");
    setPaidMonth(monthIso());
    setNotes("");
    setCreateError(null);
  };

  const closePreview = () => {
    setPreviewing(null);
    setPreviewError(null);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const fetchAll = async () => {
    try {
      setError(null);
      setLoading(true);

      const [leasesRes, receiptsRes] = await Promise.all([
        leaseService.listLeases(),
        rentReceiptService.listIndependent(),
      ]);

      setLeases(Array.isArray(leasesRes) ? leasesRes : []);
      setReceipts(Array.isArray(receiptsRes) ? (receiptsRes as any) : []);
    } catch (e: any) {
      console.error(e);
      const msg = normalizeApiError(e as ApiErr, "Erreur lors du chargement");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadPdfPreview = async (receiptId: number) => {
    setBusy(true);
    setPreviewError(null);
    try {
      const blob = await rentReceiptService.downloadPdf(receiptId);
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
    } catch (e: any) {
      console.error(e);
      const msg = normalizeApiError(e as ApiErr, "Impossible de charger le PDF");
      setPreviewError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    setCreateError(null);

    if (!selectedLeaseId) {
      setCreateError("Choisis une location (bail).");
      return;
    }
    if (!paidMonth || paidMonth.length !== 7) {
      setCreateError("Choisis un mois valide (YYYY-MM).");
      return;
    }

    setBusy(true);

    try {
      const created = await rentReceiptService.createIndependent({
        lease_id: Number(selectedLeaseId),
        paid_month: paidMonth,
        issued_date: todayIso(),
        notes: notes || null,
      });

      setOpenCreate(false);
      resetCreate();
      await fetchAll();

      // ouvre preview auto
      setPreviewing(created as any);
      await loadPdfPreview((created as any).id);
    } catch (e: any) {
      const err = e as ApiErr;
      console.error(err);

      // ✅ 422 avec errors -> message précis si possible
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const be = err.response.data.errors;
        const msg =
          be.lease_id?.[0] ||
          be.paid_month?.[0] ||
          be.issued_date?.[0] ||
          be.notes?.[0] ||
          err.response.data.message ||
          "Champs invalides. Vérifie le formulaire.";
        setCreateError(msg);
        return;
      }

      // ✅ tout le reste (y compris doublon qui arrive en 500)
      const msg = normalizeApiError(err, "Erreur lors de la création");
      setCreateError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (receipt: RentReceipt) => {
    setBusy(true);
    setPreviewError(null);
    try {
      const blob = await rentReceiptService.downloadPdf(receipt.id);
      contractService.downloadBlob(blob, `quittance-${receipt.paid_month}-lease-${receipt.lease_id}.pdf`);
    } catch (e: any) {
      console.error(e);
      const msg = normalizeApiError(e as ApiErr, "Téléchargement impossible");
      setPreviewError(msg);
    } finally {
      setBusy(false);
    }
  };

  // Mount + cleanup url
  useEffect(() => {
    fetchAll();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Lock scroll + ESC close
  useEffect(() => {
    const opened = openCreate || !!previewing;
    if (!opened) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openCreate) {
          setOpenCreate(false);
          resetCreate();
        }
        if (previewing) closePreview();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreate, previewing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quittances indépendantes</h1>
          <p className="text-slate-600 mt-1">Génère une quittance de paiement (indépendante) par location et par mois.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>

          <button
            onClick={() => {
              setOpenCreate(true);
              setCreateError(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter une quittance
          </button>
        </div>
      </div>

      {/* Error (page) */}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {/* Create Modal */}
      {openCreate && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Nouvelle quittance</h2>
                  <p className="text-sm text-slate-600">Choisis une location et le mois payé.</p>
                </div>
                <button
                  onClick={() => {
                    setOpenCreate(false);
                    resetCreate();
                  }}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ✅ Error in modal */}
              {createError && (
                <div className="px-6 pt-5">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{createError}</div>
                </div>
              )}

              <div className="space-y-5 px-6 py-5">
                {/* Lease Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Location (bail)</label>
                  <select
                    value={selectedLeaseId}
                    onChange={(e) => setSelectedLeaseId(e.target.value ? Number(e.target.value) : "")}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">— Choisir une location —</option>
                    {leases.map((l: any) => {
                      const addr = l.property?.address || `Bien #${l.property_id}`;
                      const t = l.tenant ? `${l.tenant.first_name || ""} ${l.tenant.last_name || ""}`.trim() : "";
                      const label = `${addr}${t ? ` — ${t}` : ""}`;
                      return (
                        <option key={l.id} value={l.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>

                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-xs text-slate-500">Bien</div>
                      <div className="text-sm font-medium text-slate-900">{propertyLabel}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-xs text-slate-500">Locataire</div>
                      <div className="text-sm font-medium text-slate-900">{tenantLabel}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-xs text-slate-500">Loyer</div>
                      <div className="text-sm font-medium text-slate-900">{rentAmount.toLocaleString("fr-FR")} FCFA</div>
                    </div>
                  </div>
                </div>

                {/* Paid Month */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mois payé</label>
                  <input
                    type="month"
                    value={paidMonth}
                    onChange={(e) => setPaidMonth(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    La quittance sera émise avec <span className="font-medium text-slate-700">issued_date = aujourd’hui</span>.
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Notes (optionnel)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Ex : paiement cash, référence virement, info complémentaire…"
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
                <button
                  onClick={() => {
                    setOpenCreate(false);
                    resetCreate();
                  }}
                  disabled={busy}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreate}
                  disabled={busy || !selectedLeaseId}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Créer & Prévisualiser
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Preview Modal */}
      {previewing && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Quittance — {previewing.paid_month}</h2>
                  <p className="text-sm text-slate-600">Prévisualisation du PDF</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(previewing)}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger PDF
                  </button>
                  <button
                    onClick={closePreview}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {/* ✅ Error in preview modal */}
              {previewError && (
                <div className="px-6 pt-5">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{previewError}</div>
                </div>
              )}

              <div className="h-[78vh] bg-slate-50">
                {pdfUrl ? (
                  <iframe title="Quittance PDF" src={pdfUrl} className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Chargement du PDF…
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-slate-900">{receipts.length} quittance(s) indépendante(s)</p>
            <p className="text-xs text-slate-500">Suppression désactivée (comme demandé).</p>
          </div>
        </div>

        {receipts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Eye className="h-5 w-5" />
            </div>
            <p className="font-medium text-slate-900">Aucune quittance pour le moment</p>
            <p className="text-sm text-slate-600 mt-1">Clique sur “Ajouter une quittance”.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {receipts.map((r) => (
              <div key={r.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">Quittance {r.paid_month} — Bail #{r.lease_id}</div>
                  <div className="text-xs text-slate-600">
                    Émise le {String(r.issued_date).slice(0, 10)} • Montant:{" "}
                    <span className="font-medium text-slate-900">
                      {(r.amount_paid ?? 0).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  {r.notes ? (
                    <div className="text-sm text-slate-700 mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                      {r.notes}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {r.type}
                  </span>

                  <button
                    onClick={async () => {
                      setPreviewing(r);
                      setPreviewError(null);
                      await loadPdfPreview(r.id);
                    }}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4" />
                    Voir
                  </button>

                  <button
                    onClick={() => handleDownload(r)}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuittancesIndependantes;
