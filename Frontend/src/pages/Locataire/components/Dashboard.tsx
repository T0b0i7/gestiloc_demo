import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Wrench,
  ClipboardList,
  File,
  Key,
  DollarSign,
  Settings,
  Bell,
  HelpCircle,
  User,
  Home,
  ChevronRight,
  Eye,
  X,
  MessageCircle,
  Building,
} from "lucide-react";

import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { Tab } from "../types";
import { PaymentModal } from "./PaymentModal";
import api from "@/services/api"; // Service API réel

// Import missing types and mock services
import { TenantLease, TenantIncident, mockTenantApi } from "@/services/mockTenantApi";
import { RentReceipt, mockRentReceiptService } from "@/services/mockRentReceiptService";
import { TenantInvoice, mockInvoiceService } from "@/services/mockInvoiceService";
import { Notice, mockNoticeService } from "@/services/mockNoticeService";

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

const money = (v: unknown): number => {
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
  activeTab?: string;
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate?: (tab: Tab) => void;
}

interface UserData {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  roles: string[];
  default_role: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab = 'home', notify, onNavigate }) => {
  // User state
  const [user, setUser] = useState<UserData | null>(null);

  // Data states
  const [lease, setLease] = useState<TenantLease | null>(null);
  const [receipts, setReceipts] = useState<RentReceipt[]>([]);
  const [invoices, setInvoices] = useState<TenantInvoice[]>([]);
  const [incidents, setIncidents] = useState<TenantIncident[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Derived date keys
  const currentYM = useMemo(() => monthKey(new Date()), []);
  const ytdStartYM = useMemo(() => `${new Date().getFullYear()}-01`, []);

  useEffect(() => {
    // Récupérer les données utilisateur depuis localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Erreur lors de la lecture des données utilisateur:', err);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Lancer toutes les requêtes en parallèle
        const [leasesRes, receiptsRes, invoicesRes, incidentsRes, noticesRes] = await Promise.allSettled([
          mockTenantApi.getLeases(),
          mockRentReceiptService.list({ type: "independent" }),
          mockInvoiceService.list(),
          mockTenantApi.getIncidents(),
          mockNoticeService.list(),
        ]);

        if (cancelled) return;

        // Traiter les résultats
        if (leasesRes.status === "fulfilled") {
          const ls = leasesRes.value || [];
          const activeLease = ls.find((l: TenantLease) => String(l.status).toLowerCase() === "active") || ls[0] || null;
          setLease(activeLease);
        } else {
          console.error("[DASH] leases error", leasesRes.reason);
        }

        if (receiptsRes.status === "fulfilled") {
          setReceipts(receiptsRes.value || []);
        } else {
          console.error("[DASH] receipts error", receiptsRes.reason);
        }

        if (invoicesRes.status === "fulfilled") {
          setInvoices(invoicesRes.value || []);
        } else {
          console.error("[DASH] invoices error", invoicesRes.reason);
        }

        if (incidentsRes.status === "fulfilled") {
          setIncidents(incidentsRes.value || []);
        } else {
          console.error("[DASH] incidents error", incidentsRes.reason);
        }

        if (noticesRes.status === "fulfilled") {
          setNotices(noticesRes.value || []);
        } else {
          console.error("[DASH] notices error", noticesRes.reason);
        }

      } catch (err: any) {
        console.error('[DASH] Error fetching dashboard data:', err);
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement des données');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- derived stats ----------
  const rentMonthly = useMemo(() => lease?.rent_amount || 0, [lease]);
  const chargesMonthly = useMemo(() => lease?.charges_amount || 0, [lease]);
  const totalMonthly = useMemo(() => rentMonthly + chargesMonthly, [rentMonthly, chargesMonthly]);

  const receiptsSorted = useMemo(() => {
    if (!receipts) return [];
    const arr = [...receipts];
    arr.sort((a, b) => {
      const da = safeDate(a.issued_date || "")?.getTime() ?? 0;
      const db = safeDate(b.issued_date || "")?.getTime() ?? 0;
      if (db !== da) return db - da;
      return (b.paid_month || "").localeCompare(a.paid_month || "");
    });
    return arr;
  }, [receipts]);

  const lastReceipt = useMemo(() => receiptsSorted[0] || null, [receiptsSorted]);

  const monthsPaidSet = useMemo(() => {
    const s = new Set<string>();
    payments?.forEach((p) => {
      if (p.status === 'approved' && p.paid_at) {
        const month = new Date(p.paid_at).toISOString().slice(0, 7);
        s.add(month);
      }
    });
    return s;
  }, [payments]);

  const isUpToDate = useMemo(() => monthsPaidSet.has(currentYM), [monthsPaidSet, currentYM]);

  const paidStreak = useMemo(() => {
    if (monthsPaidSet.size === 0) return 0;

    let start = currentYM;
    if (!monthsPaidSet.has(start)) {
      const all = Array.from(monthsPaidSet).sort();
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
    const ytdStart = `${new Date().getFullYear()}-01`;
    return (receipts || []).filter((r) => (r.paid_month || "") >= ytdStart);
  }, [receipts]);

  const totalPaidYTD = useMemo(() => {
    return receiptsYTD.reduce((sum, r) => sum + ((r as any).amount || r.amount_paid || 0), 0);
  }, [receiptsYTD]);

  const avgPaid = useMemo(() => {
    if (!receipts?.length) return 0;
    const sum = receipts.reduce((acc, r) => acc + ((r as any).amount || r.amount_paid || 0), 0);
    return sum / receipts.length;
  }, [receipts]);

  const openIncidents = useMemo(
    () => incidents?.filter((i) => i.status === "open").length || 0,
    [incidents]
  );

  const inProgressIncidents = useMemo(
    () => incidents?.filter((i) => i.status === "in_progress").length || 0,
    [incidents]
  );

  const pendingNotices = useMemo(
    () => notices.filter((n: Notice) => String(n.status) === "pending").length,
    [notices]
  );

  const hasAnyError = error !== null;

  // Afficher le contenu selon l'onglet actif
  const renderContent = () => {
    const activeLease = lease;

    switch (activeTab) {
      case 'home':
        // Contenu du tableau de bord principal - Refait selon le design Figma
        return (
          <>
            {/* Welcome Card - Exact comme la maquette Figma */}
            <div className="bg-gradient-to-r from-[#529D21] to-[#7CB342] rounded-2xl shadow-lg p-6 mb-6 relative overflow-hidden">
              <div className="flex justify-between items-start md:items-center gap-6">
                <div className="z-10 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Bienvenue sur Gestiloc !
                  </h1>
                  <p className="text-white/90 text-sm md:text-base max-w-md leading-relaxed">
                    Retrouvez ici toutes les informations de location. Gérez vos quittances, contactez votre propriétaire et suivez l'état de votre logement en toute simplicité.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src="/Ressource_gestiloc/hand.png"
                    alt="Welcome"
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions - Cards Layout */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              <button onClick={() => onNavigate?.('receipts')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Mes quittances" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Mes quittances</span>
              </button>

              <button onClick={() => onNavigate?.('interventions')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Tools.png" alt="Nouvelle intervention" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle intervention</span>
              </button>

              <button onClick={() => onNavigate?.('tasks')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Nouvelles_taches.png" alt="Nouvelle tâche" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle tâche</span>
              </button>

              <button onClick={() => onNavigate?.('notes')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Edit Property.png" alt="Nouvelle note" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle note</span>
              </button>

              <button onClick={() => onNavigate?.('documents')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Document In Folder.png" alt="Nouveau document" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouveau document</span>
              </button>
            </div>

            {/* Stats Grid - 2x2 layout comme Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Locations Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Locations</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Key Security.png" alt="Locations" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600 mt-1">Location</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('location')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Loyers en retard Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Loyers en retard</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Dollar Bag.png" alt="Loyers" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600 mt-1">Loyers en retard</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('payments')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Interventions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Interventions</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Interventions" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">{openIncidents}</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En cours</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('interventions')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Tâches Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Tâches</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Inspection.png" alt="Tâches" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('tasks')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ma Location</h2>
            {lease ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">{lease.property?.name || 'Détails du logement'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">
                      {lease.property?.address || 'Non spécifiée'},
                      {lease.property?.city || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loyer mensuel</p>
                    <p className="font-medium">{fmtMoney(lease.rent_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Charges</p>
                    <p className="font-medium">{fmtMoney(lease.charges_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total mensuel</p>
                    <p className="font-medium">{fmtMoney(totalMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">{new Date(lease.start_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">
                      {lease.end_date
                        ? new Date(lease.end_date).toLocaleDateString('fr-FR')
                        : 'Non spécifiée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type de bail</p>
                    <p className="font-medium">
                      {lease.type === 'nu' ? 'Location nue' : 'Location meublée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro de bail</p>
                    <p className="font-medium">{lease.lease_number}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Aucune location active</p>
            )}
          </div>
        );

      case 'receipts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Quittances</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Historique des quittances</h3>
                {receipts && receipts.length > 0 ? (
                  <div className="space-y-3">
                    {receipts.map((receipt) => (
                      <div key={receipt.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                        <div>
                          <p className="font-medium">Mois: {receipt.paid_month}</p>
                          <p className="text-sm text-gray-500">
                            Émis le: {new Date(receipt.issued_date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {receipt.property?.name && `Bien: ${receipt.property.name}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{fmtMoney((receipt as any).amount || receipt.amount_paid || 0)}</p>
                          <span className={`text-xs px-2 py-1 rounded ${receipt.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {receipt.status === 'paid' ? 'Payé' : 'En attente'}
                          </span>
                          {receipt.pdf_url && (
                            <a
                              href={receipt.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-xs text-blue-600 hover:underline"
                            >
                              Télécharger
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune quittance disponible</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'interventions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Interventions</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Historique des interventions</h3>
              {incidents && incidents.length > 0 ? (
                <div className="space-y-3">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-sm text-gray-500">{incident.description.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-400">
                          {new Date(incident.created_at).toLocaleDateString('fr-FR')}
                          {incident.property?.name && ` • ${incident.property.name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${incident.status === 'open' ? 'bg-red-100 text-red-800' :
                          incident.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {incident.status === 'open' ? 'Ouvert' :
                            incident.status === 'in_progress' ? 'En cours' :
                              'Résolu'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune intervention en cours</p>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paiements</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Historique des paiements</h3>
              {payments && payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                      <div>
                        <p className="font-medium">
                          {payment.payment_method === 'card' ? 'Paiement par carte' :
                            payment.payment_method === 'mobile_money' ? 'Mobile Money' :
                              payment.payment_method === 'virement' ? 'Virement' :
                                payment.payment_method === 'especes' ? 'Espèces' :
                                  payment.payment_method === 'cheque' ? 'Chèque' : 'Paiement'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                        {payment.property?.name && (
                          <p className="text-sm text-gray-500">Bien: {payment.property.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{fmtMoney(payment.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {payment.status === 'approved' ? 'Approuvé' :
                            payment.status === 'pending' ? 'En attente' :
                              payment.status === 'initiated' ? 'Initiatié' :
                                payment.status === 'cancelled' ? 'Annulé' :
                                  payment.status === 'failed' ? 'Échoué' : payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun paiement enregistré</p>
              )}
            </div>
          </div>
        );

      case 'notice':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Préavis</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gestion du préavis</h3>
              {notices && notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div key={notice.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Préavis de départ #{notice.notice_number}</p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(notice.notice_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Effectif le: {notice.effective_date ? new Date(notice.effective_date).toLocaleDateString('fr-FR') : 'Non défini'}
                        </p>
                        {notice.reason && (
                          <p className="text-sm text-gray-500">Motif: {notice.reason}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${notice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {notice.status === 'pending' ? 'En attente' : 'Confirmé'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun préavis en cours</p>
              )}
            </div>
          </div>
        );

      default:
        // Par défaut, afficher le tableau de bord - Même contenu que le cas 'home'
        return (
          <>
            {/* Welcome Card - Exact comme la maquette Figma */}
            <div className="bg-gradient-to-r from-[#529D21] to-[#7CB342] rounded-2xl shadow-lg p-6 mb-6 relative overflow-hidden">
              <div className="flex justify-between items-start md:items-center gap-6">
                <div className="z-10 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Bienvenue sur Gestiloc !
                  </h1>
                  <p className="text-white/90 text-sm md:text-base max-w-md leading-relaxed">
                    Retrouvez ici toutes les informations de location. Gérez vos quittances, contactez votre propriétaire et suivez l'état de votre logement en toute simplicité.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src="/Ressource_gestiloc/hand.png"
                    alt="Welcome"
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions - Reviewed per Figma Spec */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <button onClick={() => onNavigate?.('receipts')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{
                    width: '74px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'rgba(255, 251, 244, 1)',
                    border: '3px solid rgba(255, 177, 51, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Mes quittances" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Mes quittances</span>
              </button>

              <button onClick={() => onNavigate?.('interventions')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{
                    width: '74px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'rgba(255, 251, 244, 1)',
                    border: '3px solid rgba(255, 177, 51, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Tools.png" alt="Nouvelle intervention" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle intervention</span>
              </button>

              <button onClick={() => onNavigate?.('tasks')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{
                    width: '74px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'rgba(255, 251, 244, 1)',
                    border: '3px solid rgba(255, 177, 51, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Nouvelles_taches.png" alt="Nouvelle tâche" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle tâche</span>
              </button>

              <button onClick={() => onNavigate?.('property')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{
                    width: '74px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'rgba(255, 251, 244, 1)',
                    border: '3px solid rgba(255, 177, 51, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Edit Property.png" alt="Nouvelle note" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle note</span>
              </button>

              <button onClick={() => onNavigate?.('documents')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{
                    width: '74px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'rgba(255, 251, 244, 1)',
                    border: '3px solid rgba(255, 177, 51, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Document In Folder.png" alt="Nouveau document" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouveau document</span>
              </button>
            </div>

            {/* Stats Grid - 2x2 layout comme Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Locations Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Locations</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Key Security.png" alt="Locations" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600 mt-1">Location</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('location')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Loyers en retard Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Loyers en retard</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Dollar Bag.png" alt="Loyers" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600 mt-1">Loyers en retard</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('payments')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Interventions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Interventions</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Interventions" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">{openIncidents}</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En cours</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('interventions')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Tâches Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Tâches</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Inspection.png" alt="Tâches" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('tasks')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  // Forcer le rechargement quand l'onglet change
  React.useEffect(() => {
    if (activeTab === 'home') {
      // Forcer le rafraîchissement des données quand on revient au tableau de bord
      const timer = setTimeout(() => {
        // Le contenu sera re-rendu automatiquement
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // ---------- UI ----------
  if (loading && activeTab !== 'home') {
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
        <div className="mt-20 mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-800 font-bold relative z-0">
          Certaines données n'ont pas pu être chargées (le dashboard reste utilisable).
          <div className="mt-2 text-sm font-semibold">
            <div>• Erreur: {error}</div>
          </div>
        </div>
      ) : null}

      {renderContent()}
    </>
  );
};