// src/pages/Proprietaire/Finance/CreatePaymentRequest.tsx
import React, { useEffect, useMemo, useState } from "react";
import { landlordPayments, type Invoice, type InvoiceType } from "@/services/landlordPayments";
import { leaseService, type Lease } from "@/services/api"; // ✅ si leaseService est exporté

type Props = {
  onCreated?: (invoice: Invoice) => void;
};

const money = (v: any) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("fr-FR").format(n);
};

const todayYMD = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function CreatePaymentRequest({ onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingPaylink, setLoadingPaylink] = useState(false);

  const [leases, setLeases] = useState<Lease[]>([]);
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [leasesError, setLeasesError] = useState<string | null>(null);

  const [leaseId, setLeaseId] = useState<number | "">("");
  const [type, setType] = useState<InvoiceType>("rent");

  const [periodStart, setPeriodStart] = useState<string>(todayYMD());
  const [periodEnd, setPeriodEnd] = useState<string>(todayYMD());
  const [dueDate, setDueDate] = useState<string>(addDays(3));

  const [amountTotal, setAmountTotal] = useState<number>(0);

  // ✅ Fix 422: payment_method requis côté backend (mets "fedapay" par défaut)
  // Si tu veux offrir un choix plus tard (card/mobile_money/bank_transfer), adapte la liste.
  const [paymentMethod, setPaymentMethod] = useState<string>("fedapay");

  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [payLinkUrl, setPayLinkUrl] = useState<string | null>(null);
  const [payLinkExpiresAt, setPayLinkExpiresAt] = useState<string | null>(null);

  const selectedLease = useMemo(() => {
    if (!leaseId) return null;
    return leases.find((l) => Number(l.id) === Number(leaseId)) ?? null;
  }, [leaseId, leases]);

  // 🔹 Charge les baux
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLeasesLoading(true);
        setLeasesError(null);

        // ✅ certains services renvoient {data:[]}, d’autres renvoient []
        const list = await leaseService.listLeases();
        if (!mounted) return;

        setLeases(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!mounted) return;
        setLeasesError(e?.message || "Impossible de charger les baux.");
      } finally {
        if (!mounted) return;
        setLeasesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔹 Auto-remplissage montant selon type + bail
  useEffect(() => {
    if (!selectedLease) return;

    const rent = Number((selectedLease as any).rent_amount ?? 0);

    if (type === "rent") setAmountTotal(Number.isFinite(rent) ? rent : 0);

    // si autre type, ne pas écraser un montant déjà saisi
    if (type !== "rent" && !amountTotal) setAmountTotal(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLease, type]);

  const resetAfterCreate = () => {
    setPayLinkUrl(null);
    setPayLinkExpiresAt(null);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaseId) return alert("Choisis un bail.");
    if (!dueDate) return alert("Choisis une date d’échéance.");
    if (amountTotal <= 0) return alert("Le montant doit être > 0.");
    if (!paymentMethod) return alert("Choisis un moyen de paiement.");

    setLoading(true);
    resetAfterCreate();

    try {
      const invoice = await landlordPayments.createInvoice({
        lease_id: Number(leaseId),
        type,
        due_date: dueDate,
        period_start: periodStart || undefined,
        period_end: periodEnd || undefined,
        amount_total: Number(amountTotal),
        payment_method: paymentMethod, // ✅ FIX 422
      });

      setCreatedInvoice(invoice);
      onCreated?.(invoice);
    } catch (err: any) {
      // axios error -> message parfois vide, donc fallback
      alert(err?.response?.data?.message || err?.message || "Erreur lors de la création de la facture.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayLink = async () => {
    if (!createdInvoice?.id) return;

    setLoadingPaylink(true);
    try {
      const res = await landlordPayments.createPayLink(createdInvoice.id, {
        hours: 24,
        send_email: true,
      });

      setPayLinkUrl(res.url);
      setPayLinkExpiresAt(res.expires_at);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Erreur lors de la création du lien de paiement.");
    } finally {
      setLoadingPaylink(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Lien copié ✅");
    } catch {
      alert("Impossible de copier automatiquement. Copie manuellement le lien.");
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Demande de paiement</h2>
            <p className="text-sm text-slate-600">
              Le propriétaire émet une facture, puis génère un lien de paiement (FedaPay) à envoyer au locataire.
            </p>
          </div>

          {createdInvoice?.id ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Facture créée
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Nouveau
            </span>
          )}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          {leasesError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {leasesError}
            </div>
          )}

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            {/* Bail */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Bail (location)</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={leaseId}
                onChange={(e) => setLeaseId(e.target.value ? Number(e.target.value) : "")}
                disabled={leasesLoading}
              >
                <option value="">
                  {leasesLoading ? "Chargement des baux..." : "Sélectionner un bail"}
                </option>

                {leases.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} — {l.uuid} — {l.status} — Loyer: {money((l as any).rent_amount)} XOF
                  </option>
                ))}
              </select>

              {selectedLease && (
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Bail sélectionné :</span>{" "}
                  id={selectedLease.id} · uuid={selectedLease.uuid} · statut={selectedLease.status}
                </div>
              )}
            </div>

            {/* Type + Montant */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Type de facture</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={type}
                  onChange={(e) => setType(e.target.value as InvoiceType)}
                >
                  <option value="rent">Loyer</option>
                  <option value="deposit">Caution</option>
                  <option value="charge">Charges</option>
                  <option value="repair">Réparation</option>
                </select>
                <div className="mt-1 text-xs text-slate-500">Astuce : “Loyer” reprend automatiquement le montant du bail.</div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Montant (XOF)</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={amountTotal}
                  onChange={(e) => setAmountTotal(Number(e.target.value))}
                />
              </div>
            </div>

            {/* ✅ Payment method (requis backend) */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Moyen de paiement</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {/* Le locataire choisit ensuite dans le checkout FedaPay */}
                <option value="fedapay">FedaPay (le locataire choisit carte / mobile money / etc.)</option>

                {/* Si ton backend accepte ces valeurs, tu peux les garder */}
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Carte bancaire</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="cash">Espèces</option>
              </select>
              <div className="mt-1 text-xs text-slate-500">
                Recommandé : <span className="font-semibold">FedaPay</span> (le locataire choisit le canal au moment de payer).
              </div>
            </div>

            {/* Période + échéance */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Début période</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Fin période</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Échéance</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
              <button
                type="submit"
                disabled={loading || !leaseId}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Création..." : "Créer la facture"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedInvoice(null);
                  setPayLinkUrl(null);
                  setPayLinkExpiresAt(null);
                }}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Réinitialiser
              </button>
            </div>
          </form>

          {/* Résultat facture */}
          {createdInvoice?.id && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Facture #{createdInvoice.id}{" "}
                    {createdInvoice.invoice_number ? `— ${createdInvoice.invoice_number}` : ""}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    Montant: <span className="font-semibold">{money(createdInvoice.amount_total)} XOF</span> · Échéance:{" "}
                    <span className="font-semibold">{createdInvoice.due_date}</span> · Statut:{" "}
                    <span className="font-semibold">{String(createdInvoice.status ?? "pending")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreatePayLink}
                  disabled={loadingPaylink}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPaylink ? "Génération..." : "Générer le lien de paiement"}
                </button>
              </div>

              {/* Paylink */}
              {payLinkUrl && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3">
                  <div className="text-sm font-semibold text-slate-900">Lien de paiement (à envoyer au locataire)</div>

                  <div className="mt-2 break-all rounded-lg bg-slate-50 p-2 text-sm text-slate-800">{payLinkUrl}</div>

                  <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-slate-600">
                      Expire le: <span className="font-semibold">{payLinkExpiresAt ?? "—"}</span>
                      <span className="ml-2 text-slate-400">(email locataire envoyé si disponible)</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copy(payLinkUrl)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Copier
                      </button>
                      <a
                        href={payLinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Ouvrir
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {!payLinkUrl && (
                <div className="mt-3 text-xs text-slate-600">
                  Étape suivante : clique sur <span className="font-semibold">“Générer le lien de paiement”</span> pour produire
                  une URL FedaPay.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
