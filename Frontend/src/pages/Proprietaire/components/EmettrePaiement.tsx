// src/pages/Proprietaire/components/EmettrePaiement.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Plus,
  Copy,
  ExternalLink,
  AlertTriangle,
  Home,
  User,
  CalendarDays,
  CreditCard,
  FileText,
} from "lucide-react";

import { landlordPayments, type Invoice, type InvoiceType } from "@/services/landlordPayments";
import { leaseService, type Lease } from "@/services/api";

type Props = {
  onCreated?: (invoice: Invoice) => void;
  notify?: (msg: string, type: "success" | "info" | "error") => void;
};

type LeaseLite = Lease & {
  rent_amount?: number;
  property_id?: number;
  property?: { id?: number; address?: string; city?: string } | null;
  tenant?: {
    first_name?: string;
    last_name?: string;
    user?: { email?: string; phone?: string } | null;
  } | null;
};

const isoToday = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const money = (v: any) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("fr-FR").format(n);
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

function normalizeApiError(err: ApiErr, fallback: string) {
  if (err?.request && !err?.response) return "Le serveur ne répond pas. Vérifie ta connexion puis réessaie.";
  const status = err?.response?.status;

  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 413) return "Fichiers trop volumineux.";
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";

  const backendMsg =
    String(err?.response?.data?.message ?? "").trim() ||
    String(err?.response?.data?.error ?? "").trim() ||
    String(err?.message ?? "").trim();

  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;

  return fallback;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">{children}</div>;
}

function Select({
  value,
  onChange,
  disabled,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full appearance-none rounded-2xl
          bg-white text-gray-900
          border border-blue-200
          px-4 py-3 pr-10
          text-sm font-semibold
          outline-none
          focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
          disabled:opacity-60 disabled:cursor-not-allowed
          transition
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">▾</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  min,
  step,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  min?: number | string;
  step?: number | string;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      min={min as any}
      step={step as any}
      className="
        w-full rounded-2xl bg-white text-gray-900
        border border-blue-200
        px-4 py-3
        text-sm font-semibold
        placeholder:text-gray-400
        outline-none
        focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
        disabled:opacity-60 disabled:cursor-not-allowed
        transition
      "
    />
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
      {children}
    </span>
  );
}

export default function EmettrePaiement({ onCreated, notify }: Props) {
  const pushNotify = (msg: string, type: "success" | "info" | "error") => {
    if (notify) notify(msg, type);
    else alert(msg);
  };

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyPaylink, setBusyPaylink] = useState(false);

  const [leases, setLeases] = useState<LeaseLite[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const [leaseId, setLeaseId] = useState<number | "">("");
  const [type, setType] = useState<InvoiceType>("rent");

  const [periodStart, setPeriodStart] = useState<string>(isoToday());
  const [periodEnd, setPeriodEnd] = useState<string>(isoToday());
  const [dueDate, setDueDate] = useState<string>(addDays(3));

  const [amountTotal, setAmountTotal] = useState<number>(0);

  // ✅ préchargé depuis la dernière facture si possible
  const [paymentMethod, setPaymentMethod] = useState<string>("fedapay");

  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [payLinkUrl, setPayLinkUrl] = useState<string | null>(null);
  const [payLinkExpiresAt, setPayLinkExpiresAt] = useState<string | null>(null);

  const selectedLease = useMemo<LeaseLite | null>(() => {
    if (!leaseId) return null;
    return leases.find((l) => Number(l.id) === Number(leaseId)) ?? null;
  }, [leaseId, leases]);

  const leaseLabel = useMemo(() => {
    if (!selectedLease) return "—";
    const addr = selectedLease.property?.address || `Bien #${selectedLease.property_id ?? "—"}`;
    const city = selectedLease.property?.city ? `, ${selectedLease.property.city}` : "";
    const t = selectedLease.tenant
      ? `${selectedLease.tenant.first_name || ""} ${selectedLease.tenant.last_name || ""}`.trim()
      : "";
    return `${addr}${city}${t ? ` — ${t}` : ""}`;
  }, [selectedLease]);

  const tenantName = useMemo(() => {
    if (!selectedLease?.tenant) return "—";
    const name = `${selectedLease.tenant.first_name || ""} ${selectedLease.tenant.last_name || ""}`.trim();
    return name || selectedLease.tenant.user?.email || "Locataire";
  }, [selectedLease]);

  const tenantEmail = selectedLease?.tenant?.user?.email || "";
  const tenantPhone = selectedLease?.tenant?.user?.phone || "";

  const fetchAll = async () => {
    setLoading(true);
    setPageError(null);

    try {
      const [list, invoices] = await Promise.allSettled([leaseService.listLeases(), landlordPayments.listInvoices()]);

      if (list.status === "fulfilled") {
        const arr = Array.isArray(list.value) ? (list.value as LeaseLite[]) : [];
        setLeases(arr);
      } else {
        console.warn("[EmettrePaiement] listLeases failed", list.reason);
      }

      if (invoices.status === "fulfilled") {
        const inv = Array.isArray(invoices.value) ? invoices.value : [];
        const last = [...inv].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))[0];
        if (last?.payment_method) setPaymentMethod(String(last.payment_method));
      } else {
        console.warn("[EmettrePaiement] listInvoices failed", invoices.reason);
      }
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors du chargement.");
      setPageError(msg);
      pushNotify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedLease) return;
    const rent = Number(selectedLease.rent_amount ?? 0);

    if (type === "rent") setAmountTotal(Number.isFinite(rent) ? rent : 0);
    if (type !== "rent" && !amountTotal) setAmountTotal(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLease, type]);

  const resetAfterCreate = () => {
    setPayLinkUrl(null);
    setPayLinkExpiresAt(null);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);

    if (!leaseId) return pushNotify("Choisis un bail.", "error");
    if (!dueDate) return pushNotify("Choisis une date d’échéance.", "error");
    if (Number(amountTotal) <= 0) return pushNotify("Le montant doit être > 0.", "error");
    if (!paymentMethod) return pushNotify("Choisis un moyen de paiement.", "error");

    setBusy(true);
    resetAfterCreate();

    try {
      const invoice = await landlordPayments.createInvoice({
        lease_id: Number(leaseId),
        type,
        due_date: dueDate,
        period_start: periodStart || undefined,
        period_end: periodEnd || undefined,
        amount_total: Number(amountTotal),
        payment_method: paymentMethod,
      });

      setCreatedInvoice(invoice);
      onCreated?.(invoice);
      pushNotify("Facture créée ✅", "success");
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors de la création de la facture.");
      setPageError(msg);
      pushNotify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePayLink = async () => {
    if (!createdInvoice?.id) return;
    setBusyPaylink(true);

    try {
      const res = await landlordPayments.createPayLink(createdInvoice.id, { hours: 24, send_email: true });
      setPayLinkUrl(res.url);
      setPayLinkExpiresAt(res.expires_at);
      pushNotify("Lien de paiement généré ✅", "success");
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors de la création du lien de paiement.");
      pushNotify(msg, "error");
    } finally {
      setBusyPaylink(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushNotify("Lien copié ✅", "success");
    } catch {
      pushNotify("Impossible de copier automatiquement. Copie manuellement le lien.", "info");
    }
  };

  const resetAll = () => {
    setCreatedInvoice(null);
    setPayLinkUrl(null);
    setPayLinkExpiresAt(null);
    setLeaseId("");
    setType("rent");
    setAmountTotal(0);
    setPeriodStart(isoToday());
    setPeriodEnd(isoToday());
    setDueDate(addDays(3));
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
            <CreditCard size={14} />
            Paiements
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Demande de paiement</h1>

          <p className="mt-1 text-sm font-semibold text-gray-600">
            Crée une facture, puis génère un lien FedaPay à envoyer au locataire.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={fetchAll}
            disabled={busy || busyPaylink}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-blue-200 bg-white px-4 py-3
              text-sm font-extrabold text-gray-800
              hover:bg-blue-50 hover:text-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
            type="button"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Actualiser
          </button>

          <button
            onClick={resetAll}
            disabled={busy || busyPaylink}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-blue-200 bg-white px-4 py-3
              text-sm font-extrabold text-gray-800
              hover:bg-blue-50 hover:text-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
            type="button"
          >
            <Plus size={18} />
            Nouveau
          </button>

          {createdInvoice?.id ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
              <CheckCircle2 size={14} /> Facture créée
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-3xl">
          {pageError && (
            <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700 font-bold">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>{pageError}</span>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-blue-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Créer une facture</h2>
                  <Chip>Propriétaire</Chip>
                  <Chip>Moyen actuel : {paymentMethod}</Chip>
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  Étape 1 : facture · Étape 2 : lien de paiement (FedaPay).
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-5 space-y-5">
              <div>
                <FieldLabel>Bail (location)</FieldLabel>
                <div className="mt-2">
                  <Select
                    value={String(leaseId || "")}
                    onChange={(v) => setLeaseId(v ? Number(v) : "")}
                    disabled={loading}
                    options={[
                      { value: "", label: loading ? "Chargement des baux..." : "— Sélectionner un bail —" },
                      ...leases.map((l) => {
                        const addr = l.property?.address || `Bien #${l.property_id ?? "—"}`;
                        const city = l.property?.city ? `, ${l.property.city}` : "";
                        const t = l.tenant ? `${l.tenant.first_name || ""} ${l.tenant.last_name || ""}`.trim() : "";
                        const label = `${addr}${city}${t ? ` — ${t}` : ""} · Loyer: ${money(l.rent_amount)} XOF`;
                        return { value: String(l.id), label };
                      }),
                    ]}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                      <Home size={14} /> Bien
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-gray-900">{leaseId ? leaseLabel : "—"}</div>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                      <User size={14} /> Locataire
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-gray-900">{tenantName}</div>
                    <div className="mt-1 text-xs font-bold text-gray-600">
                      {tenantEmail ? <span>{tenantEmail}</span> : <span className="text-gray-500">Email —</span>}
                      {tenantPhone ? <span> • {tenantPhone}</span> : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Type + Montant */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Type de facture</FieldLabel>
                  <div className="mt-2">
                    <Select
                      value={type}
                      onChange={(v) => setType(v as InvoiceType)}
                      options={[
                        { value: "rent", label: "Loyer" },
                        { value: "deposit", label: "Caution" },
                        { value: "charge", label: "Charges" },
                        { value: "repair", label: "Réparation" },
                      ]}
                    />
                  </div>
                  <div className="mt-2 text-xs font-bold text-gray-500">
                    Astuce : <span className="text-gray-700">“Loyer”</span> reprend automatiquement le montant du bail.
                  </div>
                </div>

                <div>
                  <FieldLabel>Montant (XOF)</FieldLabel>
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={amountTotal}
                      onChange={(v) => setAmountTotal(Number(v))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <FieldLabel>Moyen de paiement</FieldLabel>
                <div className="mt-2">
                  <Select
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    options={[
                      { value: "fedapay", label: "FedaPay (le locataire choisit carte / mobile money / etc.)" },
                      { value: "mobile_money", label: "Mobile Money" },
                      { value: "card", label: "Carte bancaire" },
                      { value: "bank_transfer", label: "Virement bancaire" },
                      { value: "cash", label: "Espèces" },
                    ]}
                  />
                </div>
                <div className="mt-2 text-xs font-bold text-gray-500">
                  Recommandé : <span className="text-gray-700">FedaPay</span> (le locataire choisit le canal au moment de payer).
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <FieldLabel>Début période</FieldLabel>
                  <div className="mt-2">
                    <Input type="date" value={periodStart} onChange={setPeriodStart} />
                  </div>
                  <div className="mt-2 text-xs font-bold text-gray-500 flex items-center gap-2">
                    <CalendarDays size={14} className="text-blue-700" />
                    Période
                  </div>
                </div>

                <div>
                  <FieldLabel>Fin période</FieldLabel>
                  <div className="mt-2">
                    <Input type="date" value={periodEnd} onChange={setPeriodEnd} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Échéance</FieldLabel>
                  <div className="mt-2">
                    <Input type="date" value={dueDate} onChange={setDueDate} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
                <button
                  type="submit"
                  disabled={busy || busyPaylink || !leaseId}
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-2xl bg-blue-600 px-4 py-3
                    text-sm font-extrabold text-white
                    hover:bg-blue-700
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition
                  "
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Créer la facture
                </button>
              </div>
            </form>

            {/* Résultat */}
            {createdInvoice?.id && (
              <div className="mt-6 rounded-3xl border border-blue-200 bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-gray-900">
                        Facture #{createdInvoice.id}
                        {createdInvoice.invoice_number ? ` — ${createdInvoice.invoice_number}` : ""}
                      </h3>
                      <Chip>{createdInvoice.type}</Chip>
                      <Chip>{String(createdInvoice.status ?? "pending")}</Chip>
                    </div>

                    <div className="mt-2 text-sm font-semibold text-gray-700">
                      Montant:{" "}
                      <span className="font-extrabold text-gray-900">{money(createdInvoice.amount_total)} XOF</span>{" "}
                      · Échéance: <span className="font-extrabold text-gray-900">{createdInvoice.due_date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreatePayLink}
                    disabled={busyPaylink}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl bg-emerald-600 px-4 py-3
                      text-sm font-extrabold text-white
                      hover:bg-emerald-700
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition
                    "
                  >
                    {busyPaylink ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Générer le lien de paiement
                  </button>
                </div>

                {payLinkUrl ? (
                  <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-sm font-extrabold text-emerald-800">Lien de paiement (à envoyer au locataire)</div>

                    <div className="mt-2 break-all rounded-2xl border border-emerald-200 bg-white p-3 text-sm font-semibold text-gray-800">
                      {payLinkUrl}
                    </div>

                    <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="text-xs font-bold text-emerald-800">
                        Expire le : <span className="font-extrabold">{payLinkExpiresAt ?? "—"}</span>{" "}
                        <span className="ml-2 font-bold text-emerald-700/80">(email locataire envoyé si disponible)</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => copy(payLinkUrl)}
                          className="
                            inline-flex items-center justify-center gap-2
                            rounded-2xl border border-emerald-200 bg-white px-4 py-3
                            text-xs font-extrabold text-emerald-800
                            hover:bg-emerald-100
                            transition
                          "
                        >
                          <Copy size={14} />
                          Copier
                        </button>

                        <a
                          href={payLinkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            inline-flex items-center justify-center gap-2
                            rounded-2xl bg-emerald-600 px-4 py-3
                            text-xs font-extrabold text-white
                            hover:bg-emerald-700
                            transition
                          "
                        >
                          <ExternalLink size={14} />
                          Ouvrir
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs font-bold text-gray-500">
                    Étape suivante : clique sur <span className="text-gray-700">“Générer le lien de paiement”</span> pour produire
                    une URL FedaPay.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
