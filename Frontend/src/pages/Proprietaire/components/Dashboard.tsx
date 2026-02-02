import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Home,
  AlertCircle,
  DollarSign,
  Building,
  Zap,
  ChevronRight,
  MapPin,
  FileSignature,
  UserPlus,
  FileText,
  ClipboardList,
} from "lucide-react";
import EtatsLieux from "@/pages/Proprietaire/components/EtatsLieux";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { Tab } from "../types";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  propertyService,
  tenantService,
  leaseService,
  noticeService,
  rentReceiptService,
  type Property,
  type Lease,
  type Notice,
  type RentReceipt,
  type TenantApi,
} from "@/services/api"; // adapte le chemin si besoin

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

/** Helpers */
const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    isFinite(n) ? n : 0
  );

const toNumber = (v: any) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/\s/g, "").replace(",", ".");
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
};

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabelFR = (yyyyMm: string) => {
  const [y, m] = yyyyMm.split("-").map((x) => Number(x));
  const date = new Date(y, (m || 1) - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
};

const safeImg = (p: Property) => {
  const photos = p.photos || [];
  // si backend renvoie déjà des URLs complètes
  if (photos.length && /^https?:\/\//i.test(photos[0])) return photos[0];
  // sinon, fallback joli (tu peux remplacer par ton endpoint storage si tu en as un)
  return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400";
};

type ActivityItem =
  | { kind: "receipt"; date: string; title: string; subtitle: string; amount: number }
  | { kind: "notice"; date: string; title: string; subtitle: string; severity: "high" | "medium" | "low" };

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, notify }) => {
  const [loading, setLoading] = useState(true);

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<TenantApi[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [receipts, setReceipts] = useState<RentReceipt[]>([]);

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const promises = {
        props: propertyService.listProperties(),
        tenants: tenantService.listTenants(),
        leases: leaseService.listLeases(),
        notices: noticeService.list(),
        receipts: rentReceiptService.listIndependent(),
      } as const;

      const entries = Object.entries(promises) as [keyof typeof promises, Promise<any>][];
      const results = await Promise.allSettled(entries.map(([, p]) => p));

      for (let i = 0; i < entries.length; i++) {
        const key = entries[i][0];
        const res = results[i];
        if (res.status === "fulfilled") {
          const value = res.value;
          switch (key) {
            case "props": {
              const props = value?.data ?? [];
              setProperties(props);
              setSelectedPropertyId((prev) => prev ?? (props[0]?.id ?? null));
              break;
            }
            case "tenants":
              setTenants(value?.tenants ?? []);
              break;
            case "leases":
              setLeases(Array.isArray(value) ? value : []);
              break;
            case "notices":
              setNotices(Array.isArray(value) ? value : []);
              break;
            case "receipts":
              setReceipts(Array.isArray(value) ? value : []);
              break;
            default:
              break;
          }
        } else {
          const e = res.reason;
          console.error(`[PROPRIETAIRE DASH] ${String(key)} error`, e?.response?.data || e);
          notify(e?.message || `Erreur lors du chargement de ${String(key)}`, "error");
          switch (key) {
            case "props":
              setProperties([]);
              setSelectedPropertyId((prev) => prev ?? null);
              break;
            case "tenants":
              setTenants([]);
              break;
            case "leases":
              setLeases([]);
              break;
            case "notices":
              setNotices([]);
              break;
            case "receipts":
              setReceipts([]);
              break;
            default:
              break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      notify(e?.message || "Impossible de charger le tableau de bord", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Derived stats */
  const activeLeases = useMemo(
    () => leases.filter((l) => (l.status || "").toLowerCase() === "active"),
    [leases]
  );

  const rentedPropertyIds = useMemo(() => {
    const s = new Set<number>();
    activeLeases.forEach((l) => s.add(Number(l.property_id)));
    return s;
  }, [activeLeases]);

  const occupancy = useMemo(() => {
    const total = properties.length || 0;
    const rented = rentedPropertyIds.size;
    return { total, rented, vacant: Math.max(0, total - rented) };
  }, [properties.length, rentedPropertyIds]);

  const monthlyExpectedRent = useMemo(() => {
    // somme des loyers attendus (baux actifs)
    return activeLeases.reduce((acc, l) => acc + toNumber(l.rent_amount), 0);
  }, [activeLeases]);

  const activeAlerts = useMemo(() => {
    // alertes = notices pending + (option) quittances draft/impayés si tu ajoutes plus tard
    const pendingNotices = notices.filter((n) => (n.status || "").toLowerCase() === "pending");
    return pendingNotices.length;
  }, [notices]);

  const last6Months = useMemo(() => {
    const arr: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push(ym(d));
    }
    return arr;
  }, []);

  const financialData = useMemo(() => {
    // Graph: Loyers attendus vs quittances émises (réel)
    // receipts: amount_paid + paid_month (YYYY-MM)
    const issuedByMonth = new Map<string, number>();
    receipts.forEach((r) => {
      const key = r.paid_month; // YYYY-MM
      issuedByMonth.set(key, (issuedByMonth.get(key) || 0) + (r.amount_paid || 0));
    });

    return last6Months.map((key) => ({
      month: monthLabelFR(key),
      loyers_attendus: monthlyExpectedRent, // théorique (constant) — si tu veux mieux: calculer par bail + période
      quittances_emises: issuedByMonth.get(key) || 0,
    }));
  }, [receipts, last6Months, monthlyExpectedRent]);

  const occupationData = useMemo(
    () => [
      { name: "Loués", value: occupancy.rented, fill: "#10b981" },
      { name: "Vacants", value: occupancy.vacant, fill: "#f59e0b" },
    ],
    [occupancy]
  );

  const kpis = useMemo(() => {
    const totalProps = properties.length;
    const occPct = totalProps ? (occupancy.rented / totalProps) * 100 : 0;

    // tendance simple: compare quittances ce mois vs mois-1
    const now = new Date();
    const thisMonth = ym(new Date(now.getFullYear(), now.getMonth(), 1));
    const prevMonth = ym(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const sumMonth = (m: string) =>
      receipts
        .filter((r) => r.paid_month === m)
        .reduce((acc, r) => acc + (r.amount_paid || 0), 0);

    const a = sumMonth(thisMonth);
    const b = sumMonth(prevMonth);
    const trendPct = b > 0 ? ((a - b) / b) * 100 : a > 0 ? 100 : 0;

    return [
      {
        label: "Loyers attendus (mensuel)",
        value: eur(monthlyExpectedRent),
        trend: `${trendPct >= 0 ? "+" : ""}${trendPct.toFixed(1)}%`,
        isPositive: trendPct >= 0,
        icon: <DollarSign className="w-6 h-6" />,
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Taux d’occupation",
        value: `${occPct.toFixed(1)}%`,
        trend: `${occupancy.rented}/${properties.length || 0}`,
        isPositive: occPct >= 80,
        icon: <Home className="w-6 h-6" />,
        color: "bg-blue-100 text-blue-700",
      },
      {
        label: "Nombre de biens",
        value: String(properties.length),
        trend: `${activeLeases.length} baux actifs`,
        isPositive: true,
        icon: <Building className="w-6 h-6" />,
        color: "bg-purple-100 text-purple-700",
      },
      {
        label: "Alertes actives",
        value: String(activeAlerts),
        trend: activeAlerts > 0 ? "À traiter" : "OK",
        isPositive: activeAlerts === 0,
        icon: <AlertCircle className="w-6 h-6" />,
        color: "bg-orange-100 text-orange-700",
      },
    ];
  }, [properties.length, occupancy, monthlyExpectedRent, receipts, activeLeases.length, activeAlerts]);

  const recentProperties = useMemo(() => {
    const statusLabel = (p: Property) => {
      const s = (p.status || "").toLowerCase();
      if (rentedPropertyIds.has(p.id)) return "Loué";
      if (s.includes("work") || s.includes("trav")) return "Travaux";
      if (s.includes("inactive") || s.includes("draft")) return "Inactif";
      return "Vacant";
    };

    return properties
      .slice()
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        name: p.name || p.description || p.type || `Bien #${p.id}`,
        address: `${p.city || ""}${p.district ? ` · ${p.district}` : ""}`.trim() || p.address,
        status: statusLabel(p),
        rent: p.rent_amount ? `${eur(toNumber(p.rent_amount))}/mois` : "—",
        image: safeImg(p),
      }));
  }, [properties, rentedPropertyIds]);

  const alerts = useMemo(() => {
    const pending = notices
      .filter((n) => (n.status || "").toLowerCase() === "pending")
      .slice()
      .sort((a, b) => (b.notice_date || "").localeCompare(a.notice_date || ""))
      .slice(0, 4)
      .map((n) => ({
        message: `${n.reason} • Fin: ${n.end_date}`,
        severity: "medium" as const,
        icon: "📌",
      }));

    // Exemple: si tu veux créer une “alerte” sur invitations locataires en attente
    // (tenantsRes.invitations existe, mais pas stocké ici — ajoute-le si tu veux)
    return pending.length ? pending : [{ message: "Aucune alerte pour le moment", severity: "low" as const, icon: "✅" }];
  }, [notices]);

  const activity = useMemo<ActivityItem[]>(() => {
    const lastReceipts = receipts
      .slice()
      .sort((a, b) => (b.issued_date || "").localeCompare(a.issued_date || ""))
      .slice(0, 4)
      .map<ActivityItem>((r) => ({
        kind: "receipt",
        date: r.issued_date,
        title: `Quittance émise (${r.paid_month})`,
        subtitle: r.property?.address ? `${r.property.address}${r.property.city ? `, ${r.property.city}` : ""}` : "—",
        amount: r.amount_paid || 0,
      }));

    const lastNotices = notices
      .slice()
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 2)
      .map<ActivityItem>((n) => ({
        kind: "notice",
        date: n.notice_date,
        title: `Préavis (${n.type === "tenant" ? "locataire" : "bailleur"})`,
        subtitle: n.property?.address ? n.property.address : n.reason,
        severity: (n.status || "").toLowerCase() === "pending" ? "high" : "medium",
      }));

    return [...lastReceipts, ...lastNotices].slice(0, 6);
  }, [receipts, notices]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <br />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Tableau de Bord Propriétaire</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Synthèse en temps réel (biens, baux, quittances, alertes)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => onNavigate("documents")}>
            Mes Documents
          </Button>
          <Button variant="primary" onClick={() => onNavigate("properties")}>
            Ajouter un Bien
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-8 border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-600" />
            Actions rapides
          </h2>
          <Button variant="ghost" size="sm" onClick={fetchAll}>
            Rafraîchir
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/proprietaire/ajouter-bien"
            className="group relative block rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all bg-gradient-to-b from-white to-slate-50"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <Building className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">+ Ajouter un bien</h3>
                <p className="text-sm text-slate-500 mt-1">Enregistrez un nouveau bien immobilier</p>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Créer
              </span>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </div>
          </Link>

          <Link
            to="/proprietaire/ajouter-locataire"
            className="group relative block rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all bg-gradient-to-b from-white to-slate-50"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <UserPlus className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">+ Ajouter un locataire</h3>
                <p className="text-sm text-slate-500 mt-1">Invitez / enregistrez un locataire</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Créer
              </span>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-emerald-600" />
            </div>
          </Link>

          <Link
            to="/proprietaire/nouvelle-location"
            className="group relative block rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-purple-300 transition-all bg-gradient-to-b from-white to-slate-50"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <FileSignature className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">+ Nouvelle location</h3>
                <p className="text-sm text-slate-500 mt-1">Créez un bail et démarrez une location</p>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                Créer
              </span>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </div>
          </Link>
        </div>
      </div>

      {/* Etats des lieux (choix sans input gris) */}
      <div className="mt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            États des lieux
          </h2>

          <div className="flex flex-wrap gap-2">
            {properties.slice(0, 6).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPropertyId(p.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  selectedPropertyId === p.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                {p.name || `Bien #${p.id}`}
              </button>
            ))}
            <Link
              to="/proprietaire/documents/etats-des-lieux"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center ml-2"
            >
              Voir tout <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <Card className="p-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {selectedPropertyId ? (
              <EtatsLieux propertyId={String(selectedPropertyId)} />
            ) : (
              <div className="p-6 text-sm text-slate-500">
                Ajoutez un bien pour afficher ses états des lieux.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${kpi.color} flex items-center justify-center mb-4`}>
              {kpi.icon}
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              {kpi.label}
            </p>
            <div className="flex items-end justify-between gap-3">
              <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
              <div
                className={[
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
                  kpi.isPositive ? "text-emerald-700 bg-emerald-50" : "text-orange-700 bg-orange-50",
                ].join(" ")}
              >
                {kpi.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Finances</h2>
                <p className="text-sm text-slate-500 mt-1">Loyers attendus vs quittances émises (6 derniers mois)</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("finances")}>
                Voir détails →
              </Button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value: any) => eur(Number(value))}
                />
                <Legend wrapperStyle={{ paddingTop: 16 }} />
                <Bar dataKey="loyers_attendus" fill="#1d4ed8" radius={[10, 10, 0, 0]} />
                <Bar dataKey="quittances_emises" fill="#10b981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Mes biens</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("properties")}>
                Voir tous →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProperties.map((property) => (
                <div
                  key={property.id}
                  className="rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => onNavigate("properties")}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className={[
                        "absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold",
                        property.status === "Loué"
                          ? "bg-emerald-100 text-emerald-800"
                          : property.status === "Vacant"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800",
                      ].join(" ")}
                    >
                      {property.status}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{property.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin size={12} />
                      {property.address}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500">Loyer</p>
                      <p className="font-bold text-slate-900">{property.rent}</p>
                    </div>
                  </div>
                </div>
              ))}

              {!recentProperties.length && (
                <div className="text-sm text-slate-500 col-span-full">
                  Aucun bien pour le moment — ajoutez votre premier bien.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Occupation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Occupation</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={occupationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {occupationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Loués</span>
                <span className="font-bold text-emerald-700">
                  {occupancy.rented}/{occupancy.total}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Vacants</span>
                <span className="font-bold text-amber-700">
                  {occupancy.vacant}/{occupancy.total}
                </span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Activité récente</h2>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                {activity.length}
              </span>
            </div>

            <div className="space-y-3">
              {activity.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={[
                        "w-9 h-9 rounded-full flex items-center justify-center text-white",
                        item.kind === "receipt" ? "bg-emerald-600" : item.severity === "high" ? "bg-red-600" : "bg-amber-600",
                      ].join(" ")}
                    >
                      {item.kind === "receipt" ? <FileText size={16} /> : <AlertCircle size={16} />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right pl-3">
                    <p className="text-xs text-slate-500">
                      {item.date ? new Date(item.date).toLocaleDateString("fr-FR") : "—"}
                    </p>
                    {item.kind === "receipt" ? (
                      <p className="text-sm font-bold text-emerald-700">+ {eur(item.amount)}</p>
                    ) : (
                      <p className="text-sm font-bold text-slate-700">—</p>
                    )}
                  </div>
                </div>
              ))}

              {!activity.length && (
                <div className="text-sm text-slate-500">Aucune activité récente.</div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Alertes
              </h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                {alerts[0]?.icon === "✅" ? 0 : alerts.length}
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((a, idx) => (
                <div
                  key={idx}
                  className={[
                    "p-3 rounded-xl border-l-4",
                    a.severity === "high"
                      ? "bg-red-50 border-red-500"
                      : a.severity === "medium"
                      ? "bg-amber-50 border-amber-500"
                      : "bg-emerald-50 border-emerald-500",
                  ].join(" ")}
                >
                  <div className="flex gap-2">
                    <span className="text-lg">{a.icon}</span>
                    <p
                      className={[
                        "text-xs font-semibold",
                        a.severity === "high"
                          ? "text-red-900"
                          : a.severity === "medium"
                          ? "text-amber-900"
                          : "text-emerald-900",
                      ].join(" ")}
                    >
                      {a.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IA Assistant CTA */}
          <div className="rounded-2xl p-6 text-white shadow-lg border border-blue-600/20 bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold text-lg">GestiBot Assistant</h3>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Analysez vos biens, vos baux et vos documents pour optimiser la rentabilité.
            </p>
            <Button
              variant="primary"
              className="w-full bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => onNavigate("ai-assistant")}
            >
              Lancer l’assistant →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
