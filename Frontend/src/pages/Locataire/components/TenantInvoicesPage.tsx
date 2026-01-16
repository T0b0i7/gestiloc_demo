import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Loader2,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { tenantPayments, type Invoice } from "@/services/tenantPayments";

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

const formatMoney = (amount: any, currency?: string) => {
  const n = Number(amount ?? 0);
  const cur = (currency || "XOF").toUpperCase();
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(n);
  } catch {
    return `${n.toFixed(0)} ${cur}`;
  }
};

const safeString = (v: any) => (v == null ? "" : String(v));

const isPaid = (inv: Invoice) => {
  const s = safeString(inv.status).toLowerCase();
  return s === "paid" || s === "paye" || s === "payé";
};
const isPartial = (inv: Invoice) => safeString(inv.status).toLowerCase() === "partially_paid";
const isOverdue = (inv: Invoice) => {
  const s = safeString(inv.status).toLowerCase();
  return s === "overdue" || s.includes("retard") || s.includes("late");
};

const statusInfo = (inv: Invoice) => {
  const s = safeString(inv.status).toLowerCase();

  if (isPaid(inv)) return { label: "Payée", tone: "ok" as const };
  if (isPartial(inv)) return { label: "Paiement partiel", tone: "warn" as const };
  if (isOverdue(inv)) return { label: "En retard", tone: "warn" as const };
  if (s === "pending") return { label: "En attente", tone: "idle" as const };
  if (s === "failed") return { label: "Échouée", tone: "warn" as const };

  return { label: inv.status ? String(inv.status) : "À payer", tone: "idle" as const };
};

const getDueKey = (inv: Invoice) => safeString(inv.due_date || inv.period_end || inv.created_at || "");
const getPaidKey = (inv: Invoice) => safeString(inv.paid_at || (inv as any).paidAt || inv.updated_at || inv.created_at || "");

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
      {children}
    </span>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "idle";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={cx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold", cls)}>
      {children}
    </span>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "info" | "ok" | "error";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-blue-200 bg-blue-50 text-blue-800";

  return (
    <div className={cx("rounded-3xl border p-5 text-sm font-bold", cls)}>
      {children}
    </div>
  );
}

export default function TenantInvoicesPage({
  notify,
}: {
  notify?: (message: string, type?: "success" | "error" | "info") => void;
}) {
  const pushNotify = (message: string, type: "success" | "error" | "info" = "info") => {
    if (notify) notify(message, type);
    else alert(message);
  };

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<Invoice[]>([]);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [showPaid, setShowPaid] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      const list = await tenantPayments.listTenantInvoices();
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErr(e?.message || "Impossible de charger les factures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const normalized = useMemo(() => {
    return tenantPayments.normalizeInvoices(items || []);
  }, [items]);

  const { payable, paid } = useMemo(() => {
    const p1: typeof normalized = [];
    const p2: typeof normalized = [];

    for (const inv of normalized) {
      if (isPaid(inv)) p2.push(inv);
      else p1.push(inv);
    }

    // À payer: échéance la + proche en haut (ASC) => plus logique pour locataire
    p1.sort((a, b) => getDueKey(a).localeCompare(getDueKey(b)));
    // Payées: paiement le + récent en haut (DESC)
    p2.sort((a, b) => getPaidKey(b).localeCompare(getPaidKey(a)));

    return { payable: p1, paid: p2 };
  }, [normalized]);

  const stats = useMemo(() => {
    const cur = tenantPayments.pickCurrency(normalized[0] || {}, "XOF");
    const totalToPay = payable.reduce((s, inv: any) => s + (inv._remaining ?? inv._total ?? 0), 0);
    const totalPaid = paid.reduce((s, inv: any) => s + (inv._total ?? 0), 0);

    return {
      cur,
      payableCount: payable.length,
      paidCount: paid.length,
      totalToPay,
      totalPaid,
    };
  }, [normalized, payable, paid]);

  const handlePay = async (invoiceId: number) => {
    setPayingId(invoiceId);
    setErr(null);

    try {
      pushNotify("Redirection vers le paiement…", "info");
      const { checkout_url } = await tenantPayments.initInvoicePayment(invoiceId);
      window.location.href = checkout_url;
    } catch (e: any) {
      const m = e?.message || "Erreur lors de l'initialisation du paiement.";
      pushNotify(m, "error");
      setErr(m);
    } finally {
      setPayingId(null);
    }
  };

  const handleReceipt = async (invoiceId: number) => {
    try {
      const blob = await tenantPayments.downloadReceipt(invoiceId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e: any) {
      pushNotify(e?.message || "Impossible de télécharger la quittance.", "error");
    }
  };

  return (
    <div className="py-8">
      {/* Header (même esprit que CreatePaymentRequest) */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
            <CreditCard size={14} />
            Paiements
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Mes factures</h1>

          <p className="mt-1 text-sm font-semibold text-gray-600">
            Consulte tes loyers/charges et paie en 1 clic via FedaPay.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            type="button"
            onClick={() => setShowPaid((v) => !v)}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-blue-200 bg-white px-4 py-3
              text-sm font-extrabold text-gray-800
              hover:bg-blue-50 hover:text-blue-700
              transition
            "
          >
            <FileText size={18} />
            {showPaid ? "Masquer les payées" : "Afficher les payées"}
          </button>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-blue-200 bg-white px-4 py-3
              text-sm font-extrabold text-gray-800
              hover:bg-blue-50 hover:text-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Actualiser
          </button>
        </div>
      </div>

      {/* Centrage identique */}
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-3xl space-y-4">
          {/* Stats row (chips) */}
          <div className="flex flex-wrap gap-2">
            <Chip>À payer : {stats.payableCount}</Chip>
            <Chip>Payées : {stats.paidCount}</Chip>
            <Chip>Total restant : {formatMoney(stats.totalToPay, stats.cur)}</Chip>
            {stats.totalPaid > 0 ? <Chip>Total payé : {formatMoney(stats.totalPaid, stats.cur)}</Chip> : null}
          </div>

          {loading && <Alert tone="info">Chargement des factures…</Alert>}
          {err && (
            <Alert tone="error">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>{err}</span>
              </div>
            </Alert>
          )}

          {!loading && !err && (
            <div className="space-y-6">
              {/* À payer */}
              <section className="rounded-3xl border border-blue-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg md:text-xl font-extrabold text-gray-900">À payer</h2>
                      <Pill tone={payable.length ? "warn" : "ok"}>
                        {payable.length ? `${payable.length} en attente` : "Tout est réglé ✅"}
                      </Pill>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-600">
                      Factures en attente, en retard ou paiement partiel.
                    </p>
                  </div>
                </div>

                {payable.length === 0 ? (
                  <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 p-5">
                    <div className="text-lg font-extrabold text-gray-900">Aucune facture à payer</div>
                    <div className="mt-1 text-sm font-semibold text-gray-700">Tu es à jour ✅</div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {payable.map((inv: any) => {
                      const st = statusInfo(inv);
                      const currency = tenantPayments.pickCurrency(inv, "XOF");
                      const total = inv._total ?? inv.amount_total ?? inv.amount ?? 0;
                      const remaining = inv._remaining ?? total;

                      return (
                        <div key={inv.id} className="rounded-3xl border border-blue-200 bg-white p-5">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-lg font-extrabold text-gray-900 truncate">
                                  {inv.invoice_number ? `Facture ${inv.invoice_number}` : `Facture #${inv.id}`}
                                </div>
                                <Pill tone={st.tone}>{st.label}</Pill>
                              </div>

                              <div className="mt-2 text-sm font-semibold text-gray-700">
                                Échéance : <span className="font-extrabold text-gray-900">{inv.due_date || "—"}</span>
                                {inv.type ? (
                                  <>
                                    {" "}
                                    · Type : <span className="font-extrabold text-gray-900">{inv.type}</span>
                                  </>
                                ) : null}
                              </div>

                              {(inv.period_start || inv.period_end) && (
                                <div className="mt-1 text-xs font-bold text-gray-500">
                                  Période : {inv.period_start || "—"} → {inv.period_end || "—"}
                                </div>
                              )}

                              {isPartial(inv) && (
                                <div className="mt-2 text-xs font-bold text-gray-600">
                                  Restant à payer :{" "}
                                  <span className="font-extrabold text-gray-900">{formatMoney(remaining, currency)}</span>
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-xs font-bold text-gray-500">{isPartial(inv) ? "Reste à payer" : "Montant"}</div>
                              <div className="mt-1 text-2xl font-extrabold text-gray-900">
                                {formatMoney(isPartial(inv) ? remaining : total, currency)}
                              </div>

                              <div className="mt-3 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handlePay(inv.id)}
                                  disabled={payingId === inv.id}
                                  className="
                                    inline-flex items-center justify-center gap-2
                                    rounded-2xl bg-blue-600 px-4 py-3
                                    text-sm font-extrabold text-white
                                    hover:bg-blue-700
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    transition
                                  "
                                >
                                  {payingId === inv.id ? (
                                    <>
                                      <Loader2 size={16} className="animate-spin" /> Redirection…
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={16} /> Payer
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Payées */}
              <section className="rounded-3xl border border-blue-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Paiements effectués</h2>
                      <Pill tone="ok">{paid.length} payé(s)</Pill>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-600">Historique des factures déjà réglées.</p>
                  </div>
                </div>

                {!showPaid ? (
                  <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm font-semibold text-gray-700">
                    Liste masquée.
                  </div>
                ) : paid.length === 0 ? (
                  <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 p-5">
                    <div className="text-lg font-extrabold text-gray-900">Aucun paiement enregistré</div>
                    <div className="mt-1 text-sm font-semibold text-gray-700">
                      Quand tu paieras une facture, elle apparaîtra ici.
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {paid.map((inv: any) => {
                      const currency = tenantPayments.pickCurrency(inv, "XOF");
                      const total = inv._total ?? inv.amount_total ?? inv.amount ?? 0;
                      const paidAt = inv._paidAt ?? inv.paid_at ?? inv.updated_at ?? null;

                      return (
                        <div key={inv.id} className="rounded-3xl border border-blue-200 bg-white p-5">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-lg font-extrabold text-gray-900 truncate">
                                  {inv.invoice_number ? `Facture ${inv.invoice_number}` : `Facture #${inv.id}`}
                                </div>
                                <Pill tone="ok">Payée</Pill>
                              </div>

                              <div className="mt-2 text-sm font-semibold text-gray-700">
                                Échéance : <span className="font-extrabold text-gray-900">{inv.due_date || "—"}</span>
                                {inv.type ? (
                                  <>
                                    {" "}
                                    · Type : <span className="font-extrabold text-gray-900">{inv.type}</span>
                                  </>
                                ) : null}
                              </div>

                              <div className="mt-1 text-xs font-bold text-gray-500">
                                Payée le : <span className="font-extrabold text-gray-700">{paidAt ? String(paidAt) : "—"}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs font-bold text-gray-500">Montant</div>
                              <div className="mt-1 text-2xl font-extrabold text-gray-900">
                                {formatMoney(total, currency)}
                              </div>

                              <div className="mt-3 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleReceipt(inv.id)}
                                  className="
                                    inline-flex items-center justify-center gap-2
                                    rounded-2xl border border-blue-200 bg-white px-4 py-3
                                    text-sm font-extrabold text-gray-800
                                    hover:bg-blue-50 hover:text-blue-700
                                    transition
                                  "
                                >
                                  <FileText size={16} />
                                  Quittance
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
