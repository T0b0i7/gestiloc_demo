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
  FileText,
  Handshake,
} from "lucide-react";
import { Card } from "../../Proprietaire/components/ui/Card";
import { Button } from "../../Proprietaire/components/ui/Button";
import { Skeleton } from "../../Proprietaire/components/ui/Skeleton";
import { Tab } from "../types";
import { PropertyModal } from './PropertyModal';

import {
  coOwnerApi,
  type CoOwnerProperty,
  type CoOwnerLease,
  type CoOwnerRentReceipt,
  type CoOwnerNotice,
  type PropertyDelegation,
} from "@/services/coOwnerApi";

interface CoOwnerDashboardProps {
  onNavigate: (tab: Tab) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

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

const getPropertyImage = (property: CoOwnerProperty) => {
  // Vérifier si la propriété a des photos
  if (property.photos && property.photos.length > 0) {
    const firstPhoto = property.photos[0];
    // Si c'est déjà une URL complète, l'utiliser directement
    if (typeof firstPhoto === 'string' && firstPhoto.startsWith('http')) {
      return firstPhoto;
    }
    // Si c'est un chemin relatif, le préfixer avec l'URL de base
    if (typeof firstPhoto === 'string') {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${firstPhoto}`;
    }
  }
  // Image par défaut si aucune photo
  return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400";
};

type ActivityItem =
  | { kind: "receipt"; date: string; title: string; subtitle: string; amount: number }
  | { kind: "delegation"; date: string; title: string; subtitle: string; action: string };

export const CoOwnerDashboard: React.FC<CoOwnerDashboardProps> = ({ onNavigate, notify }) => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<CoOwnerProperty[]>([]);
  const [leases, setLeases] = useState<CoOwnerLease[]>([]);
  const [receipts, setReceipts] = useState<CoOwnerRentReceipt[]>([]);
  const [delegations, setDelegations] = useState<PropertyDelegation[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<CoOwnerProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const promises = {
        props: coOwnerApi.getDelegatedProperties(),
        leases: coOwnerApi.getLeases(),
        receipts: coOwnerApi.getRentReceipts(),
        delegations: coOwnerApi.getDelegations(),
      } as const;

      const entries = Object.entries(promises) as [keyof typeof promises, Promise<any>][];
      const results = await Promise.allSettled(entries.map(([, p]) => p));

      for (let i = 0; i < entries.length; i++) {
        const key = entries[i][0];
        const res = results[i];
        if (res.status === "fulfilled") {
          const value = res.value;
          switch (key) {
            case "props":
              setProperties(value || []);
              break;
            case "leases":
              setLeases(value || []);
              break;
            case "receipts":
              setReceipts(value || []);
              break;
            case "delegations":
              setDelegations(value || []);
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
  }, []);

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
    return activeLeases.reduce((acc, l) => acc + toNumber(l.rent_amount), 0);
  }, [activeLeases]);

  const activeAlerts = useMemo(() => {
    const pendingDelegations = delegations.filter((d: PropertyDelegation) => d.status === 'pending');
    return pendingDelegations.length;
  }, [delegations]);

  const kpis = useMemo(() => {
    const totalProps = properties.length;
    const occPct = totalProps ? (occupancy.rented / totalProps) * 100 : 0;

    return [
      {
        label: "Loyers attendus",
        value: eur(monthlyExpectedRent),
        trend: `${delegations.length} délégations`,
        isPositive: true,
        icon: <DollarSign className="w-6 h-6" />,
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Taux d'occupation",
        value: `${occPct.toFixed(1)}%`,
        trend: `${occupancy.rented}/${properties.length || 0}`,
        isPositive: occPct >= 80,
        icon: <Home className="w-6 h-6" />,
        color: "bg-blue-100 text-blue-700",
      },
      {
        label: "Biens délégués",
        value: String(delegations.length),
        trend: `${delegations.filter((d: PropertyDelegation) => d.status === 'active').length} actifs`,
        isPositive: true,
        icon: <Handshake className="w-6 h-6" />,
        color: "bg-purple-100 text-purple-700",
      },
      {
        label: "Alertes",
        value: String(activeAlerts),
        trend: activeAlerts > 0 ? "À traiter" : "OK",
        isPositive: activeAlerts === 0,
        icon: <AlertCircle className="w-6 h-6" />,
        color: "bg-orange-100 text-orange-700",
      },
    ];
  }, [properties.length, occupancy, monthlyExpectedRent, activeAlerts, delegations]);

  const recentProperties = useMemo(() => {
    return properties
      .slice()
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 3);
  }, [properties]);

  const activity = useMemo<ActivityItem[]>(() => {
    const lastReceipts = receipts
      .slice()
      .sort((a, b) => (b.issued_date || "").localeCompare(a.issued_date || ""))
      .slice(0, 3)
      .map<ActivityItem>((r) => ({
        kind: "receipt",
        date: r.issued_date,
        title: `Quittance (${r.paid_month})`,
        subtitle: r.property?.address || "—",
        amount: typeof r.amount_paid === 'number' ? r.amount_paid : toNumber(r.amount_paid),
      }));

    const lastDelegations = delegations
      .slice()
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 3)
      .map<ActivityItem>((d: PropertyDelegation) => ({
        kind: "delegation",
        date: d.created_at,
        title: `Délégation ${d.status}`,
        subtitle: d.property?.name || 'Propriété',
        action: d.status,
      }));

    return [...lastReceipts, ...lastDelegations].slice(0, 6);
  }, [receipts, delegations]);

  const handleViewProperty = (property: CoOwnerProperty) => {
    // Trouver la propriété complète dans la liste des propriétés
    const fullProperty = properties.find(p => p.id === property.id);
    if (fullProperty) {
      setSelectedProperty(fullProperty);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handlePropertyUpdated = () => {
    fetchAll(); // Rafraîchir toutes les données
  };

  // Helper pour obtenir une propriété affichable
  const getDisplayProperty = (property: CoOwnerProperty) => {
    const isRented = rentedPropertyIds.has(property.id);
    return {
      ...property,
      status: isRented ? "rented" : "available",
      displayStatus: isRented ? "Loué" : "Disponible",
      displayRent: property.rent_amount ? `${eur(toNumber(property.rent_amount))}/mois` : "—",
      displayImage: getPropertyImage(property),
      displayName: property.name || `Bien #${property.id}`,
      displayAddress: `${property.city || ""}${property.address ? ` · ${property.address}` : ""}`.trim() || "—",
    };
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Tableau de Bord Co-propriétaire</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Synthèse en temps réel (biens, délégations, alertes)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => onNavigate("documents")}>
            Mes Documents
          </Button>
          <Button variant="default" onClick={() => onNavigate("delegations")}>
            Gérer les délégations
          </Button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Biens délégués</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("biens")}>
                Voir tous →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProperties.map((property) => {
                const isRented = rentedPropertyIds.has(property.id);
                return (
                  <div
                    key={property.id}
                    className="rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => handleViewProperty(property)}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={getPropertyImage(property)}
                        alt={property.name || `Bien #${property.id}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Si l'image ne charge pas, utiliser l'image par défaut
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400";
                        }}
                      />
                      <div
                        className={[
                          "absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold",
                          isRented
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800",
                        ].join(" ")}
                      >
                        {isRented ? "Loué" : "Disponible"}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {property.name || `Bien #${property.id}`}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin size={12} />
                        <span className="line-clamp-1">
                          {property.city || property.address || "—"}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500">Loyer</p>
                        <p className="font-bold text-slate-900">
                          {property.rent_amount ? `${eur(toNumber(property.rent_amount))}/mois` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!recentProperties.length && (
                <div className="text-sm text-slate-500 col-span-full">
                  Aucun bien délégué pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Activité récente</h2>

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
                        item.kind === "receipt" ? "bg-emerald-600" : "bg-purple-600",
                      ].join(" ")}
                    >
                      {item.kind === "receipt" ? <FileText size={16} /> : <Handshake size={16} />}
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
        </div>
      </div>

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notify={notify}
        onUpdate={handlePropertyUpdated}
      />
    </div>
  );
};
