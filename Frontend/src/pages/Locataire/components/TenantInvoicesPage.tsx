import React, { useEffect, useMemo, useState } from "react";
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

const Pill = ({ tone, children }: { tone: "ok" | "warn" | "idle"; children: React.ReactNode }) => {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={cx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", cls)}>
      {children}
    </span>
  );
};

const Alert = ({ tone, children }: { tone: "info" | "ok" | "error"; children: React.ReactNode }) => {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-slate-200 bg-slate-50 text-slate-700";
  return <div className={cx("rounded-xl border p-3 text-sm", cls)}>{children}</div>;
};

const isPaid = (inv: Invoice) => {
  const s = String(inv.status || "").toLowerCase();
  return s === "paid" || s === "paye" || s === "payé";
};

const statusLabel = (inv: Invoice) => {
  if (isPaid(inv)) return { label: "Payé", tone: "ok" as const };
  const s = String(inv.status || "").toLowerCase();
  if (s.includes("late") || s.includes("retard")) return { label: "En retard", tone: "warn" as const };
  return { label: "À payer", tone: "idle" as const };
};

export default function TenantInvoicesPage({
  notify,
}: {
  notify?: (message: string, type?: "success" | "error" | "info") => void;
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<Invoice[]>([]);
  const [payingId, setPayingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const list = await tenantPayments.listInvoices();
      setItems(list);
    } catch (e: any) {
      setErr(e?.message || "Impossible de charger les factures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(b.due_date || "").localeCompare(String(a.due_date || "")));
  }, [items]);

  const handlePay = async (invoiceId: number) => {
    setPayingId(invoiceId);
    setErr(null);

    try {
      notify?.("Redirection vers le paiement…", "info");
      const { checkout_url } = await tenantPayments.initInvoicePayment(invoiceId);
      window.location.href = checkout_url;
    } catch (e: any) {
      notify?.(e?.message || "Erreur lors de l'initialisation du paiement.", "error");
      setErr(e?.message || "Erreur lors de l'initialisation du paiement.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-extrabold tracking-tight">Mes factures</div>
            <div className="mt-1 text-sm text-white/80">Consulte tes loyers/charges et paie en 1 clic via FedaPay.</div>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      {loading && <Alert tone="info">Chargement des factures…</Alert>}
      {err && <Alert tone="error">{err}</Alert>}

      {!loading && !err && (
        <div className="space-y-3">
          {sorted.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-bold text-slate-900">Aucune facture</div>
              <div className="mt-1 text-sm text-slate-600">Tu n’as pas encore de facture émise.</div>
            </div>
          )}

          {sorted.map((inv) => {
            const st = statusLabel(inv);
            const currency = inv.currency || inv?.meta?.currency || "XOF";
            const amount = inv.amount_total ?? inv.amount ?? 0;

            return (
              <div key={inv.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-slate-900">
                        {inv.invoice_number ? `Facture ${inv.invoice_number}` : `Facture #${inv.id}`}
                      </div>
                      <Pill tone={st.tone}>{st.label}</Pill>
                    </div>

                    <div className="mt-1 text-sm text-slate-600">
                      Échéance : <span className="font-semibold">{inv.due_date || "—"}</span>
                      {inv.type ? (
                        <>
                          {" "}
                          · Type : <span className="font-semibold">{inv.type}</span>
                        </>
                      ) : null}
                    </div>

                    {(inv.period_start || inv.period_end) && (
                      <div className="mt-1 text-xs text-slate-500">
                        Période : {inv.period_start || "—"} → {inv.period_end || "—"}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">Montant</div>
                    <div className="text-2xl font-extrabold text-slate-900">{formatMoney(amount, currency)}</div>

                    <div className="mt-3 flex gap-2 justify-end">
                      {!isPaid(inv) && (
                        <button
                          type="button"
                          onClick={() => handlePay(inv.id)}
                          disabled={payingId === inv.id}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {payingId === inv.id ? "Redirection…" : "Payer"}
                        </button>
                      )}

                      {isPaid(inv) && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const blob = await tenantPayments.downloadReceipt(inv.id);
                              const url = URL.createObjectURL(blob);
                              window.open(url, "_blank");
                            } catch (e: any) {
                              notify?.(e?.message || "Impossible de télécharger la quittance.", "error");
                            }
                          }}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Quittance
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
