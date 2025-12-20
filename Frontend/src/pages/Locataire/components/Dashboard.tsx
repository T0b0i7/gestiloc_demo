import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  ArrowUpRight,
  CheckCircle,
  Calendar,
  Wrench,
  Clock,
  Activity,
  Loader2,
  AlertTriangle,
  Home,
  TrendingUp,
} from "lucide-react";

import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { Tab } from "../types";
import { PaymentModal } from "./PaymentModal";

import tenantApi, { TenantLease, TenantIncident } from "../services/tenantApi";
import { tenantRentReceiptService, RentReceipt } from "../services/tenantRentReceiptService";
import { noticeService } from "@/services/noticeService";

// ---------- helpers ----------
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const prevMonthKey = (ym: string) => {
  const [yS, mS] = ym.split("-");
  const y = Number(yS);
  const m = Number(mS);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() - 1);
  return monthKey(d);
};

const money = (v: any) => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0;
  return Number.isFinite(n) ? n : 0;
};

const fmtMoney = (n: number, currency = "FCFA") =>
  `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;

const safeDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, notify }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [lease, setLease] = useState<TenantLease | null>(null);
  const [receipts, setReceipts] = useState<RentReceipt[]>([]);
  const [incidents, setIncidents] = useState<TenantIncident[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  const [errLeases, setErrLeases] = useState<string | null>(null);
  const [errReceipts, setErrReceipts] = useState<string | null>(null);
  const [errIncidents, setErrIncidents] = useState<string | null>(null);
  const [errNotices, setErrNotices] = useState<string | null>(null);

  const currentYM = useMemo(() => monthKey(new Date()), []);
  const ytdStartYM = useMemo(() => `${new Date().getFullYear()}-01`, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setErrLeases(null);
      setErrReceipts(null);
      setErrIncidents(null);
      setErrNotices(null);

      // 1) Leases
      try {
        const ls = await tenantApi.getLeases();
        if (cancelled) return;

        const activeLease =
          ls.find((l) => String(l.status).toLowerCase() === "active") || ls[0] || null;

        setLease(activeLease);
      } catch (e: any) {
        console.error("[DASH] getLeases", e?.response?.data || e);
        setErrLeases(e?.response?.data?.message || "Erreur lors du chargement du bail.");
        setLease(null);
      }

      // 2) Receipts
      try {
        const rr = await tenantRentReceiptService.list({ type: "independent" });
        if (cancelled) return;
        setReceipts(Array.isArray(rr) ? rr : []);
      } catch (e: any) {
        console.error("[DASH] receipts", e?.response?.data || e);
        setErrReceipts(e?.response?.data?.message || "Erreur lors du chargement des quittances.");
        setReceipts([]);
      }

      // 3) Incidents
      try {
        const list = await tenantApi.getIncidents();
        if (cancelled) return;
        setIncidents(Array.isArray(list) ? list : []);
      } catch (e: any) {
        console.error("[DASH] incidents", e?.response?.data || e);
        setErrIncidents(e?.response?.data?.message || "Erreur lors du chargement des incidents.");
        setIncidents([]);
      }

      // 4) Notices (préavis) — optionnel
      try {
        const n = await noticeService.list();
        if (cancelled) return;
        setNotices(Array.isArray(n) ? n : []);
      } catch (e: any) {
        console.error("[DASH] notices", e?.response?.data || e);
        setErrNotices(e?.response?.data?.message || "Erreur lors du chargement des préavis.");
        setNotices([]);
      }

      if (!cancelled) setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- derived stats ----------
  const rentMonthly = useMemo(() => (lease ? money(lease.rent_amount) : 0), [lease]);
  const chargesMonthly = useMemo(() => (lease ? money(lease.charges_amount) : 0), [lease]);
  const totalMonthly = useMemo(() => rentMonthly + chargesMonthly, [rentMonthly, chargesMonthly]);

  const receiptsSorted = useMemo(() => {
    const arr = [...receipts];
    arr.sort((a, b) => {
      const da = safeDate(a.issued_date || "")?.getTime() ?? 0;
      const db = safeDate(b.issued_date || "")?.getTime() ?? 0;
      if (db !== da) return db - da;
      const ma = (a.paid_month || "").localeCompare(a.paid_month || "");
      const mb = (b.paid_month || "").localeCompare(b.paid_month || "");
      return mb - ma;
    });
    return arr;
  }, [receipts]);

  const lastReceipt = useMemo(() => receiptsSorted[0] || null, [receiptsSorted]);

  const monthsPaidSet = useMemo(() => {
    const s = new Set<string>();
    receipts.forEach((r) => {
      if (r.paid_month) s.add(r.paid_month);
    });
    return s;
  }, [receipts]);

  // À jour si quittance existe pour le mois courant
  const isUpToDate = useMemo(() => monthsPaidSet.has(currentYM), [monthsPaidSet, currentYM]);

  // Streak : mois consécutifs en partant du dernier mois dispo
  const paidStreak = useMemo(() => {
    if (monthsPaidSet.size === 0) return 0;

    // start = mois courant si présent sinon dernier mois du set
    let start = currentYM;
    if (!monthsPaidSet.has(start)) {
      const all = Array.from(monthsPaidSet).sort(); // asc
      start = all[all.length - 1];
    }

    let streak = 0;
    let cur = start;
    while (monthsPaidSet.has(cur)) {
      streak++;
      cur = prevMonthKey(cur);
      if (streak > 120) break;
    }
    return streak;
  }, [monthsPaidSet, currentYM]);

  const receiptsYTD = useMemo(() => {
    return receipts.filter((r) => (r.paid_month || "") >= ytdStartYM);
  }, [receipts, ytdStartYM]);

  const totalPaidYTD = useMemo(() => {
    return receiptsYTD.reduce((sum, r) => {
      const a = r.amount_paid != null ? money(r.amount_paid) : totalMonthly;
      return sum + a;
    }, 0);
  }, [receiptsYTD, totalMonthly]);

  const avgPaid = useMemo(() => {
    if (!receipts.length) return 0;
    const sum = receipts.reduce(
      (acc, r) => acc + (r.amount_paid != null ? money(r.amount_paid) : totalMonthly),
      0
    );
    return sum / receipts.length;
  }, [receipts, totalMonthly]);

  const openIncidents = useMemo(
    () => incidents.filter((i) => i.status === "open").length,
    [incidents]
  );
  const inProgressIncidents = useMemo(
    () => incidents.filter((i) => i.status === "in_progress").length,
    [incidents]
  );

  const pendingNotices = useMemo(
    () => notices.filter((n: any) => String(n.status) === "pending").length,
    [notices]
  );

  const hasAnyError = errLeases || errReceipts || errIncidents || errNotices;

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-3xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-56 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalMonthly || 0}
        notify={notify}
      />

      {hasAnyError ? (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-800 font-bold">
          Certaines données n’ont pas pu être chargées (le dashboard reste utilisable).
          <div className="mt-2 text-sm font-semibold">
            {errLeases ? <div>• Bail: {errLeases}</div> : null}
            {errReceipts ? <div>• Quittances: {errReceipts}</div> : null}
            {errIncidents ? <div>• Incidents: {errIncidents}</div> : null}
            {errNotices ? <div>• Préavis: {errNotices}</div> : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-black">Bonjour 👋</h1>
            <p className="text-gray-700 mt-2 font-medium">
              {lease?.property?.address ? (
                <>
                  Logement :{" "}
                  <span className="text-blue-600 font-bold">{lease.property.address}</span>
                  {lease.property.city ? ` • ${lease.property.city}` : ""}
                </>
              ) : (
                "Bienvenue dans votre espace locataire."
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<FileText size={18} />}
              onClick={() => onNavigate("documents")}
            >
              Quittances ({receipts.length})
            </Button>
            <Button
              variant="primary"
              icon={<ArrowUpRight size={18} />}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Payer maintenant
            </Button>
          </div>
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-200 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div
                className={`p-3 rounded-2xl ${
                  isUpToDate ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                }`}
              >
                {isUpToDate ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
              </div>
              <span
                className={`${
                  isUpToDate ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                } text-xs font-bold px-3 py-1.5 rounded-full`}
              >
                {isUpToDate ? "À jour" : "En attente"}
              </span>
            </div>

            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Statut quittance (mois courant)
            </h3>

            <div className="mt-2 text-2xl font-bold text-black">
              {isUpToDate ? `Quittance dispo (${currentYM})` : `Pas encore (${currentYM})`}
            </div>

            <p className="text-xs font-medium text-gray-600 mt-4 flex items-center gap-1">
              <Activity size={12} /> Série : {paidStreak} mois consécutif(s)
            </p>
          </div>

          {/* Amounts */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-200 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                <TrendingUp size={28} />
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                Bail
              </span>
            </div>

            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Montant mensuel
            </h3>

            <div className="mt-2 text-4xl font-bold text-black tracking-tight">
              {fmtMoney(totalMonthly)}
            </div>

            <p className="text-xs font-medium text-gray-600 mt-4">
              Loyer: {fmtMoney(rentMonthly)} • Charges: {fmtMoney(chargesMonthly)}
            </p>
          </div>

          {/* Maintenance */}
          <div
            className="bg-blue-700 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform border border-blue-600"
            onClick={() => onNavigate("interventions")}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <Wrench size={28} className="text-orange-400" />
              </div>
              <span className="bg-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-400/30">
                {openIncidents + inProgressIncidents} actif(s)
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                Incidents
              </h3>
              <p className="text-xl font-bold leading-tight">
                Ouverts: {openIncidents} • En cours: {inProgressIncidents}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs font-medium text-white/60 bg-black/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Clock size={12} />
                <span>Accéder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: receipts analytics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-blue-200 shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-black">Statistiques quittances</h3>
                    <p className="text-sm font-semibold text-gray-600">
                      Basé sur les quittances réellement disponibles.
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={() => onNavigate("documents")}>
                  Voir tout
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-extrabold text-gray-600 uppercase">Total quittances</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">{receipts.length}</div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-extrabold text-gray-600 uppercase">Payé (YTD)</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">{fmtMoney(totalPaidYTD)}</div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-extrabold text-gray-600 uppercase">Moyenne quittance</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">{fmtMoney(avgPaid)}</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-blue-700">
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-gray-900">Dernière quittance</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {lastReceipt
                        ? `${lastReceipt.reference || `#${lastReceipt.id}`} • Mois: ${
                            lastReceipt.paid_month || "—"
                          } • Émise: ${
                            lastReceipt.issued_date
                              ? String(lastReceipt.issued_date).slice(0, 10)
                              : "—"
                          }`
                        : "Aucune quittance disponible pour le moment."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-3xl p-6 border border-blue-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl border border-blue-200 flex items-center justify-center text-blue-700">
                  <Home size={22} />
                </div>
                <div>
                  <div className="font-bold text-lg text-black">Mon logement</div>
                  <div className="text-sm font-semibold text-gray-700">
                    Voir les infos, photos, contact propriétaire, bail.
                  </div>
                </div>
              </div>
              <Button variant="primary" onClick={() => onNavigate("property")}>
                Accéder
              </Button>
            </div>
          </div>

          {/* Right: notices + incidents recap */}
          <div className="bg-white rounded-3xl border border-blue-200 shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-black">Suivi</h3>
                <p className="text-sm font-semibold text-gray-600">Préavis & incidents</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-gray-600 uppercase">Préavis en attente</div>
                  <div className="mt-1 text-2xl font-black text-gray-900">{pendingNotices}</div>
                </div>
                <Button variant="secondary" onClick={() => onNavigate("preavis" as any)}>
                  Voir
                </Button>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-gray-600 uppercase">Incidents actifs</div>
                  <div className="mt-1 text-2xl font-black text-gray-900">
                    {openIncidents + inProgressIncidents}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => onNavigate("interventions")}>
                  Suivre
                </Button>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="text-xs font-extrabold text-blue-700 uppercase">Astuce</div>
                <div className="mt-1 text-sm font-semibold text-gray-800">
                  Si une quittance manque, elle apparaît dès que le propriétaire la génère.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
