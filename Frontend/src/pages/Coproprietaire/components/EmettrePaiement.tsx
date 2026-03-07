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
  Zap,
  ArrowRight,
} from "lucide-react";

import { coOwnerApi } from "@/services/coOwnerApi";
import { landlordPayments, type Invoice, type InvoiceType } from "@/services/landlordPayments";
import { leaseService, type Lease } from "@/services/api";
import { Card } from "../../Proprietaire/components/ui/Card";
import { Button } from "../../Proprietaire/components/ui/Button";

type Props = {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
  onCreated?: (invoice: Invoice) => void;
};

type LeaseLite = Lease & {
  rent_amount?: number;
  property_id?: number;
  property?: { id?: number; address?: string; city?: string; name?: string } | null;
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

const formatCurrency = (v: any) => {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
};

type ApiErr = {
  response?: { status?: number; data?: any };
  request?: unknown;
  message?: string;
};

function normalizeApiError(err: ApiErr, fallback: string) {
  if (err?.request && !err?.response) return "Le serveur ne répond pas. Vérifie ta connexion puis réessaie.";
  const status = err?.response?.status;
  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  const backendMsg = String(err?.response?.data?.message || err?.response?.data?.error || err?.message || "").trim();
  return backendMsg || fallback;
}

export const EmettrePaiement: React.FC<Props> = ({ onNavigate, notify, onCreated }) => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyPaylink, setBusyPaylink] = useState(false);
  const [leases, setLeases] = useState<LeaseLite[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const [leaseId, setLeaseId] = useState<number | "">("");
  const [type, setType] = useState<"rent" | "deposit" | "charge" | "repair">("rent");
  const [periodStart, setPeriodStart] = useState<string>(isoToday());
  const [periodEnd, setPeriodEnd] = useState<string>(isoToday());
  const [dueDate, setDueDate] = useState<string>(addDays(3));
  const [amountTotal, setAmountTotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("fedapay");

  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
  const [payLinkUrl, setPayLinkUrl] = useState<string | null>(null);
  const [payLinkExpiresAt, setPayLinkExpiresAt] = useState<string | null>(null);

  const selectedLease = useMemo<LeaseLite | null>(() => {
    if (!leaseId) return null;
    return leases.find((l) => Number(l.id) === Number(leaseId)) ?? null;
  }, [leaseId, leases]);

  const leaseLabel = useMemo(() => {
    if (!selectedLease) return "—";
    const name = selectedLease.property?.name || `Bien #${selectedLease.property_id ?? "—"}`;
    const city = selectedLease.property?.city ? `, ${selectedLease.property.city}` : "";
    return `${name}${city}`;
  }, [selectedLease]);

  const tenantName = useMemo(() => {
    if (!selectedLease?.tenant) return "Non assigné";
    const name = `${selectedLease.tenant.first_name || ""} ${selectedLease.tenant.last_name || ""}`.trim();
    return name || selectedLease.tenant.user?.email || "Locataire";
  }, [selectedLease]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const list = await coOwnerApi.getDelegatedLeases();
      setLeases(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setPageError(normalizeApiError(e, "Erreur de chargement."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!selectedLease) return;
    if (type === "rent") setAmountTotal(Number(selectedLease.rent_amount ?? 0));
  }, [selectedLease, type]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaseId) return notify("Veuillez sélectionner un bail.", "error");
    setBusy(true);
    try {
      const invoice = await landlordPayments.createInvoice({
        lease_id: Number(leaseId),
        type,
        due_date: dueDate,
        period_start: periodStart,
        period_end: periodEnd,
        amount_total: Number(amountTotal),
        payment_method: paymentMethod,
      });
      setCreatedInvoice(invoice);
      notify("Demande de paiement générée avec succès.", "success");
      if (onCreated) onCreated(invoice);
    } catch (e: any) {
      notify(normalizeApiError(e, "Impossible de créer la facture."), "error");
    } finally { setBusy(false); }
  };

  const handleCreatePayLink = async () => {
    if (!createdInvoice?.id) return;
    setBusyPaylink(true);
    try {
      const res = await landlordPayments.createPayLink(createdInvoice.id, { hours: 24, send_email: true });
      setPayLinkUrl(res.url);
      setPayLinkExpiresAt(res.expires_at);
      notify("Lien de paiement FedaPay généré.", "success");
    } catch (e: any) {
      notify(normalizeApiError(e, "Erreur lien de paiement."), "error");
    } finally { setBusyPaylink(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify("Lien copié dans le presse-papier.", "success");
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6" style={{ fontFamily: "'Merriweather', serif" }}>
        <div className="h-12 w-1/3 bg-gray-100 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-32 bg-gray-50 animate-pulse rounded-[2.5rem]" />
          <div className="h-32 bg-gray-50 animate-pulse rounded-[2.5rem]" />
        </div>
        <div className="h-[400px] bg-gray-50 animate-pulse rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Recouvrement</h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">
            Émettez des demandes de paiement sécurisées FedaPay pour vos locataires en quelques secondes.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => { setCreatedInvoice(null); setPayLinkUrl(null); }}
            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 rounded-[2rem] px-8 py-7 shadow-xl shadow-gray-200/50 transition-all font-manrope font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-5 h-5 mr-3 text-green-600" />
            Nouveau
          </Button>
          <Button
            onClick={fetchAll}
            className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-8 py-7 shadow-[0_20px_50px_rgba(22,163,74,0.25)] transition-all font-manrope font-black text-xs uppercase tracking-widest border-none"
          >
            <RefreshCw className={`w-5 h-5 mr-3 ${busy ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Formulaire Principal */}
        <div className="lg:col-span-12 xl:col-span-8">
          <Card className="p-10 md:p-14 rounded-[4rem] border-none shadow-2xl shadow-green-900/5 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

            <form onSubmit={handleCreateInvoice} className="relative z-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Sélection du Bien */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-manrope ml-2">Propriété & Bail</label>
                  <div className="relative group">
                    <Home className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
                    <select
                      value={String(leaseId)}
                      onChange={(e) => setLeaseId(Number(e.target.value))}
                      className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner un bien actif</option>
                      {leases.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.property?.name || 'Sans nom'} - {l.tenant?.last_name} ({formatCurrency(l.rent_amount)})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-green-600">
                      <ArrowRight className="w-5 h-5 opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Nature du Paiement */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-manrope ml-2">Type de frais</label>
                  <div className="relative group">
                    <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope appearance-none cursor-pointer"
                    >
                      <option value="rent">Loyer du mois</option>
                      <option value="deposit">Dépôt de garantie</option>
                      <option value="charge">Provision sur charges</option>
                      <option value="repair">Travaux & Dégradations</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Montant & Méthode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-manrope ml-2">Montant à collecter</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
                    <input
                      type="number"
                      value={amountTotal}
                      onChange={(e) => setAmountTotal(Number(e.target.value))}
                      className="w-full pl-16 pr-24 py-6 bg-gray-50 border-none rounded-[2rem] text-xl font-black text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope"
                      placeholder="0"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xs">FCFA</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-manrope ml-2">Mode de recouvrement</label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-8 py-6 bg-green-50/50 border-2 border-green-100/50 rounded-[2rem] text-sm font-black text-green-700 outline-none focus:border-green-400 transition-all font-manrope appearance-none cursor-pointer text-center"
                    >
                      <option value="fedapay">FedaPay (Carte & Mobile Money)</option>
                      <option value="mobile_money">Mobile Money Direct</option>
                      <option value="bank_transfer">Virement Bancaire</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-gray-50/50 rounded-[3rem] border border-gray-100">
                <div className="space-y-3 text-center md:text-left">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-manrope">Période du</label>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-bold text-gray-700 outline-none shadow-sm" />
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-manrope">Période au</label>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-bold text-gray-700 outline-none shadow-sm" />
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-manrope">Échéance limite</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-green-600 border-none rounded-xl py-3 px-4 text-sm font-bold text-white outline-none shadow-lg shadow-green-600/20" />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={busy || !leaseId}
                  className="w-full bg-gray-900 hover:bg-black text-white rounded-[2.5rem] py-10 shadow-2xl shadow-gray-900/20 transition-all active:scale-[0.98] font-manrope font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 border-none"
                >
                  {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      <span>Initialiser la facturation</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Résumé & Actions Latérales */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
          {/* Carte Résumé Dynamique */}
          <Card className="p-10 rounded-[3.5rem] bg-gradient-to-br from-green-600 to-green-700 text-white border-none shadow-2xl shadow-green-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold uppercase tracking-widest">Résumé</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Locataire cible</p>
                  <p className="text-2xl font-black leading-tight">{tenantName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Bien concerné</p>
                  <p className="text-lg font-bold leading-tight line-clamp-2">{leaseLabel}</p>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Montant à payer</p>
                  <p className="text-4xl font-black tracking-tighter">{formatCurrency(amountTotal)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions après création */}
          {createdInvoice && (
            <Card className="p-10 rounded-[3.5rem] bg-white border border-green-100 shadow-2xl shadow-green-900/5 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900">Facture Prête</h4>
                </div>

                {!payLinkUrl ? (
                  <Button
                    onClick={handleCreatePayLink}
                    disabled={busyPaylink}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-[1.5rem] py-6 shadow-xl shadow-green-600/20 transition-all font-manrope font-black text-xs uppercase tracking-widest border-none"
                  >
                    {busyPaylink ? <Loader2 className="animate-spin" /> : 'Générer lien FedaPay'}
                  </Button>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 break-all text-[11px] font-bold text-gray-500 font-manrope text-center">
                      {payLinkUrl}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => copyToClipboard(payLinkUrl)}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl py-5 font-manrope font-black text-[10px] uppercase tracking-widest border-none"
                      >
                        <Copy className="w-4 h-4 mr-2" /> Copier
                      </Button>
                      <a
                        href={payLinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-2xl py-5 font-manrope font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" /> Aperçu
                      </a>
                    </div>
                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Expire le : {payLinkExpiresAt ? new Date(payLinkExpiresAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
