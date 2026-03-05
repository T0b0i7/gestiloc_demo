import React, { useMemo, useState } from "react";
import { Download, AlertCircle, CheckCircle, Clock, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TenantInvoice } from "@/services/api";

interface TenantInvoicesCardProps {
  invoices: TenantInvoice[];
  isLoading: boolean;
  error?: string | null;
  onDownload?: (id: number) => void;
}

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

const safeNumber = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const formatMonth = (date: string): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const formatDateTime = (date?: string | null): string => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
};

const formatAmount = (amount: number, currency = "XOF"): string => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: (currency || "XOF").toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${(currency || "XOF").toUpperCase()}`;
  }
};

const isPaid = (status?: string) => String(status || "").toLowerCase() === "paid";
const isPartial = (status?: string) => String(status || "").toLowerCase() === "partially_paid";
const isPayable = (status?: string) => {
  const s = String(status || "").toLowerCase();
  return s === "pending" || s === "overdue" || s === "partially_paid";
};

export const TenantInvoicesCard: React.FC<TenantInvoicesCardProps> = ({ invoices, isLoading, error, onDownload }) => {
  const navigate = useNavigate();

  const [showPaid, setShowPaid] = useState(true);

  const getStatusBadge = (status: TenantInvoice["status"]) => {
    switch (status) {
      case "paid":
        return { bg: "bg-emerald-50", text: "text-emerald-700", ring: "border-emerald-200", label: "Payée", icon: CheckCircle };
      case "partially_paid":
        return { bg: "bg-blue-50", text: "text-blue-700", ring: "border-blue-200", label: "En cours", icon: Clock };
      case "pending":
        return { bg: "bg-amber-50", text: "text-amber-700", ring: "border-amber-200", label: "En attente", icon: AlertCircle };
      case "overdue":
        return { bg: "bg-orange-50", text: "text-orange-700", ring: "border-orange-200", label: "En retard", icon: AlertCircle };
      case "failed":
        return { bg: "bg-red-50", text: "text-red-700", ring: "border-red-200", label: "Échouée", icon: AlertCircle };
      default:
        return { bg: "bg-slate-50", text: "text-slate-700", ring: "border-slate-200", label: String(status || "—"), icon: AlertCircle };
    }
  };

  const normalized = useMemo(() => {
    return (invoices || []).map((inv) => {
      const total = safeNumber((inv as any).amount_total ?? (inv as any).amount ?? 0);
      const paid = safeNumber((inv as any).paid_amount ?? (inv as any).amount_paid ?? 0);
      const remaining = Math.max(0, total - paid);

      const currency = String((inv as any).currency ?? (inv as any).meta?.currency ?? "XOF");
      const paidAt = (inv as any).paid_at ?? (inv as any).paidAt ?? (inv as any).updated_at ?? null;

      return { ...inv, _total: total, _paid: paid, _remaining: remaining, _currency: currency, _paidAt: paidAt };
    });
  }, [invoices]);

  const { payable, paid } = useMemo(() => {
    const p1: typeof normalized = [];
    const p2: typeof normalized = [];

    for (const inv of normalized) {
      if (isPaid((inv as any).status)) p2.push(inv);
      else p1.push(inv);
    }

    // tri : à payer par échéance desc, payées par date paiement desc
    p1.sort((a: any, b: any) => String(b.due_date || "").localeCompare(String(a.due_date || "")));
    p2.sort((a: any, b: any) => String(b._paidAt || "").localeCompare(String(a._paidAt || "")));

    return { payable: p1, paid: p2 };
  }, [normalized]);

  const stats = useMemo(() => {
    const cur = normalized[0]?._currency || "XOF";
    const totalToPay = payable.reduce((s: number, i: any) => s + (i._remaining ?? i._total ?? 0), 0);
    const totalPaid = paid.reduce((s: number, i: any) => s + (i._total ?? 0), 0);
    return { cur, totalToPay, totalPaid, payableCount: payable.length, paidCount: paid.length };
  }, [normalized, payable, paid]);

  // ----- states -----
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-extrabold text-slate-900 mb-4">Factures</h3>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-extrabold text-slate-900 mb-4">Factures</h3>
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (!invoices?.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-extrabold text-slate-900 mb-4">Factures</h3>
        <div className="text-center py-10">
          <p className="text-slate-500 font-semibold">Aucune facture pour le moment</p>
        </div>
      </div>
    );
  }

  // ----- UI -----
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Factures</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Suis tes factures et règle en 1 clic lorsque nécessaire.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
              À payer : {stats.payableCount}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
              Payées : {stats.paidCount}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
              Total restant : {formatAmount(stats.totalToPay, stats.cur)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPaid((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
        >
          {showPaid ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showPaid ? "Masquer payées" : "Afficher payées"}
        </button>
      </div>

      {/* À payer */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-extrabold text-slate-900">À payer</div>
          <span className={cx("text-xs font-extrabold", payable.length ? "text-amber-700" : "text-emerald-700")}>
            {payable.length ? `${payable.length} en attente` : "Tout est payé ✅"}
          </span>
        </div>

        <div className="space-y-3">
          {payable.map((invoice: any) => {
            const badge = getStatusBadge(invoice.status);
            const StatusIcon = badge.icon;

            const month = invoice?.due_date ? formatMonth(invoice.due_date) : "—";
            const total = invoice._total ?? 0;
            const paidAmt = invoice._paid ?? 0;
            const remaining = invoice._remaining ?? total;
            const currency = invoice._currency ?? "XOF";

            return (
              <div
                key={invoice.id}
                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
              >
                {/* Left */}
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 capitalize">{month}</p>
                  <p className="text-xs text-slate-500 font-semibold">
                    {invoice.invoice_number ? `Facture ${invoice.invoice_number}` : `Facture #${invoice.id}`}
                    {invoice?.due_date ? ` · Échéance ${invoice.due_date}` : ""}
                  </p>

                  {isPartial(invoice.status) && paidAmt > 0 && (
                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      Déjà payé : <span className="font-extrabold text-emerald-700">{formatAmount(paidAmt, currency)}</span>{" "}
                      · Restant : <span className="font-extrabold text-slate-900">{formatAmount(remaining, currency)}</span>
                    </p>
                  )}
                </div>

                {/* Middle amount */}
                <div className="md:text-center">
                  <p className="text-xs text-slate-500 font-semibold">Montant</p>
                  <p className="text-lg md:text-xl font-extrabold text-slate-900">
                    {formatAmount(isPartial(invoice.status) ? remaining : total, currency)}
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 justify-end">
                  <div className={cx("flex items-center gap-2 px-3 py-1 rounded-full border", badge.bg, badge.ring)}>
                    <StatusIcon size={14} className={badge.text} />
                    <span className={cx("text-xs font-extrabold", badge.text)}>{badge.label}</span>
                  </div>

                  {isPayable(invoice.status) && (
                    <button
                      onClick={() => navigate(`/locataire/payer/${invoice.id}`)}
                      className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 text-sm font-extrabold"
                      title="Payer cette facture"
                    >
                      <CreditCard size={16} />
                      <span className="hidden sm:inline">Payer</span>
                    </button>
                  )}

                  {/* Download: optional; usually for paid only but keep if you want */}
                  {onDownload && (
                    <button
                      onClick={() => onDownload(invoice.id)}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                      title="Télécharger le PDF"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payées */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-extrabold text-slate-900">Paiements effectués</div>
          <span className="text-xs font-extrabold text-slate-600">{paid.length} payé(s)</span>
        </div>

        {!showPaid ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Liste masquée.
          </div>
        ) : (
          <div className="space-y-3">
            {paid.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-600">Aucun paiement enregistré.</p>
              </div>
            ) : (
              paid.map((invoice: any) => {
                const badge = getStatusBadge("paid");
                const StatusIcon = badge.icon;

                const month = invoice?.due_date ? formatMonth(invoice.due_date) : "—";
                const total = invoice._total ?? 0;
                const currency = invoice._currency ?? "XOF";
                const paidAt = invoice._paidAt;

                return (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 capitalize">{month}</p>
                      <p className="text-xs text-slate-500 font-semibold">
                        {invoice.invoice_number ? `Facture ${invoice.invoice_number}` : `Facture #${invoice.id}`}
                        {invoice?.due_date ? ` · Échéance ${invoice.due_date}` : ""}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-600">
                        Payé le : <span className="font-extrabold text-slate-900">{formatDateTime(paidAt)}</span>
                      </p>
                    </div>

                    <div className="md:text-center">
                      <p className="text-xs text-slate-500 font-semibold">Montant</p>
                      <p className="text-lg md:text-xl font-extrabold text-slate-900">{formatAmount(total, currency)}</p>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      <div className={cx("flex items-center gap-2 px-3 py-1 rounded-full border", badge.bg, badge.ring)}>
                        <StatusIcon size={14} className={badge.text} />
                        <span className={cx("text-xs font-extrabold", badge.text)}>Payée</span>
                      </div>

                      {onDownload && (
                        <button
                          onClick={() => onDownload(invoice.id)}
                          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                          title="Télécharger la quittance"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
