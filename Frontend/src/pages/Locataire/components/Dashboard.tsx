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

interface Lease {
  id: number;
  uuid: string;
  lease_number: string;
  start_date: string;
  end_date: string | null;
  status: string;
  rent_amount: number;
  charges_amount: number;
  total_monthly?: number;
  type: string;
  property?: {
    id: number;
    name: string;
    address: string;
    city: string;
    postal_code?: string;
    country?: string;
  };
  landlord?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

interface Payment {
  id: number;
  amount: number;
  amount_net: number;
  fee_amount: number;
  status: string;
  payment_method: string;
  paid_at: string;
  created_at: string;
  property?: {
    id: number;
    name: string;
    address: string;
  };
  month?: string;
}

interface Receipt {
  id: number;
  receipt_number: string;
  amount: number;
  paid_month: string;
  issued_date: string;
  payment_date: string;
  status: string;
  property?: {
    id: number;
    name: string;
  };
  pdf_url?: string;
}

interface Incident {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    name: string;
  };
  photos?: string[];
}

interface Notice {
  id: number;
  notice_number: string;
  notice_date: string;
  effective_date: string;
  status: string;
  reason?: string;
  created_at: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: string;
  type: string;
  description?: string;
}

interface DashboardData {
  user: UserData;
  leases: Lease[];
  active_lease: Lease | null;
  payments: Payment[];
  receipts: Receipt[];
  incidents: Incident[];
  notices: Notice[];
  invoices: Invoice[];
  stats: {
    total_monthly: number;
    is_up_to_date: boolean;
    months_paid_count: number;
    open_incidents: number;
    in_progress_incidents: number;
    pending_notices: number;
    total_paid_ytd: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab = 'home', notify, onNavigate }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentYM = useMemo(() => monthKey(new Date()), []);

  useEffect(() => {
    // Récupérer les données utilisateur depuis localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Appel API réel au lieu des mocks
        const response = await api.get('/tenant/dashboard');
        
        if (!cancelled) {
          setDashboardData(response.data);
          
          // Mettre à jour l'utilisateur si nécessaire
          if (response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
      } catch (err: any) {
        console.error('[DASH] Error fetching dashboard data:', err);
        if (!cancelled) {
          setError(err.response?.data?.message || 'Erreur lors du chargement des données');
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
  const rentMonthly = useMemo(() => dashboardData?.active_lease?.rent_amount || 0, [dashboardData]);
  const chargesMonthly = useMemo(() => dashboardData?.active_lease?.charges_amount || 0, [dashboardData]);
  const totalMonthly = useMemo(() => rentMonthly + chargesMonthly, [rentMonthly, chargesMonthly]);

  const receiptsSorted = useMemo(() => {
    if (!dashboardData?.receipts) return [];
    const arr = [...dashboardData.receipts];
    arr.sort((a, b) => {
      const da = safeDate(a.issued_date || "")?.getTime() ?? 0;
      const db = safeDate(b.issued_date || "")?.getTime() ?? 0;
      if (db !== da) return db - da;
      return (b.paid_month || "").localeCompare(a.paid_month || "");
    });
    return arr;
  }, [dashboardData?.receipts]);

  const lastReceipt = useMemo(() => receiptsSorted[0] || null, [receiptsSorted]);

  const monthsPaidSet = useMemo(() => {
    const s = new Set<string>();
    dashboardData?.payments?.forEach((p) => {
      if (p.status === 'approved' && p.paid_at) {
        const month = new Date(p.paid_at).toISOString().slice(0, 7);
        s.add(month);
      }
    });
    return s;
  }, [dashboardData?.payments]);

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
    return (dashboardData?.receipts || []).filter((r) => (r.paid_month || "") >= ytdStart);
  }, [dashboardData?.receipts]);

  const totalPaidYTD = useMemo(() => {
    return receiptsYTD.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [receiptsYTD]);

  const avgPaid = useMemo(() => {
    if (!dashboardData?.receipts?.length) return 0;
    const sum = dashboardData.receipts.reduce((acc, r) => acc + (r.amount || 0), 0);
    return sum / dashboardData.receipts.length;
  }, [dashboardData?.receipts]);

  const openIncidents = useMemo(
    () => dashboardData?.incidents?.filter((i) => i.status === "open").length || 0,
    [dashboardData?.incidents]
  );
  
  const inProgressIncidents = useMemo(
    () => dashboardData?.incidents?.filter((i) => i.status === "in_progress").length || 0,
    [dashboardData?.incidents]
  );

  const pendingNotices = useMemo(
    () => dashboardData?.notices?.filter((n) => n.status === "pending").length || 0,
    [dashboardData?.notices]
  );

  const hasAnyError = error !== null;

  // Afficher le contenu selon l'onglet actif
  const renderContent = () => {
    const activeLease = dashboardData?.active_lease;
    
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-[#529D21] to-[#7CB342] rounded-xl shadow-lg p-6 mb-6 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <div className="z-10">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Bienvenue sur Gestiloc, {dashboardData?.user?.first_name || 'Locataire'} !
                  </h1>
                  <p className="text-white/90 text-sm max-w-md">
                    Retrouvez ici toutes les informations de location. Gérez vos quittances, contactez votre propriétaire et suivez l'état de votre logement en toute simplicité.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-white/80 text-sm">Loyer mensuel</p>
                    <p className="text-2xl font-bold text-white">{fmtMoney(totalMonthly)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <button onClick={() => onNavigate?.('receipts')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/quittances.png" alt="Mes quittances" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Mes quittances</span>
              </button>

              <button onClick={() => onNavigate?.('interventions')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Nouvelle intervention" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouvelle intervention</span>
              </button>

              <button onClick={() => onNavigate?.('tasks')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/rappels.png" alt="Nouvelle tâche" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouvelle tâche</span>
              </button>

              <button onClick={() => onNavigate?.('notes')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/Signing A Document.png" alt="Nouvelle note" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouvelle note</span>
              </button>

              <button onClick={() => onNavigate?.('documents')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/Document In Folder.png" alt="Nouveau document" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouveau document</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Locations */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/Ressource_gestiloc/Key Security.png" alt="Locations" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{dashboardData?.leases?.length || 0}</p>
                      <p className="text-sm text-gray-600">Location(s)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('location')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Loyers en retard */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Statut de paiement</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/Ressource_gestiloc/Dollar Bag.png" alt="Loyers" className="w-12 h-12 object-contain" />
                    <div>
                      <p className={`text-3xl font-bold ${isUpToDate ? 'text-green-600' : 'text-red-600'}`}>
                        {isUpToDate ? 'À jour' : 'En retard'}
                      </p>
                      <p className="text-sm text-gray-600">Ce mois-ci</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('payments')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                    Voir détails
                  </button>
                </div>
              </div>

              {/* Interventions */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Interventions</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center gap-4">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Interventions" className="w-12 h-12 object-contain" />
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{openIncidents}</p>
                      <p className="text-sm text-gray-600">Ouverte</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{inProgressIncidents}</p>
                      <p className="text-sm text-gray-600">En cours</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('interventions')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Quittances */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quittances</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center gap-4">
                  <img src="/Ressource_gestiloc/Inspection.png" alt="Quittances" className="w-12 h-12 object-contain" />
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{dashboardData?.receipts?.length || 0}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{paidStreak}</p>
                      <p className="text-sm text-gray-600">Mois consécutifs</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('receipts')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
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
            {dashboardData?.active_lease ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">{dashboardData.active_lease.property?.name || 'Détails du logement'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">
                      {dashboardData.active_lease.property?.address || 'Non spécifiée'}, 
                      {dashboardData.active_lease.property?.city || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loyer mensuel</p>
                    <p className="font-medium">{fmtMoney(dashboardData.active_lease.rent_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Charges</p>
                    <p className="font-medium">{fmtMoney(dashboardData.active_lease.charges_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total mensuel</p>
                    <p className="font-medium">{fmtMoney(totalMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">{new Date(dashboardData.active_lease.start_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">
                      {dashboardData.active_lease.end_date 
                        ? new Date(dashboardData.active_lease.end_date).toLocaleDateString('fr-FR')
                        : 'Non spécifiée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type de bail</p>
                    <p className="font-medium">
                      {dashboardData.active_lease.type === 'nu' ? 'Location nue' : 'Location meublée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro de bail</p>
                    <p className="font-medium">{dashboardData.active_lease.lease_number}</p>
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
                {dashboardData?.receipts && dashboardData.receipts.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.receipts.map((receipt) => (
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
                          <p className="font-semibold">{fmtMoney(receipt.amount)}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            receipt.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
              {dashboardData?.incidents && dashboardData.incidents.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.incidents.map((incident) => (
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
                        <span className={`text-xs px-2 py-1 rounded ${
                          incident.status === 'open' ? 'bg-red-100 text-red-800' : 
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
              {dashboardData?.payments && dashboardData.payments.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.payments.map((payment) => (
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
                        <span className={`text-xs px-2 py-1 rounded ${
                          payment.status === 'approved' ? 'bg-green-100 text-green-800' : 
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
              {dashboardData?.notices && dashboardData.notices.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.notices.map((notice) => (
                    <div key={notice.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Préavis de départ #{notice.notice_number}</p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(notice.notice_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Effectif le: {new Date(notice.effective_date).toLocaleDateString('fr-FR')}
                        </p>
                        {notice.reason && (
                          <p className="text-sm text-gray-500">Motif: {notice.reason}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        notice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
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
        return (
          <>
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-[#529D21] to-[#F5A623] rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Bienvenue, {dashboardData?.user?.first_name || user?.first_name || 'Locataire'} 👋
                  </h1>
                  <p className="text-white/90">
                    Gérez votre location en toute simplicité
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-white/80 text-sm">Loyer mensuel</p>
                    <p className="text-2xl font-bold text-white">{fmtMoney(totalMonthly)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <button onClick={() => onNavigate?.('receipts')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/quittances.png" alt="Mes quittances" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Mes quittances</span>
              </button>

              <button onClick={() => onNavigate?.('interventions')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Nouvelle intervention" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouvelle intervention</span>
              </button>

              <button onClick={() => onNavigate?.('tasks')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/rappels.png" alt="Nouvelle tâche" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouvelle tâche</span>
              </button>

              <button onClick={() => onNavigate?.('notes')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/Signing A Document.png" alt="Nouvelle note" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouvelle note</span>
              </button>

              <button onClick={() => onNavigate?.('documents')} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <img src="/Ressource_gestiloc/Document In Folder.png" alt="Nouveau document" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">Nouveau document</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Locations */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/Ressource_gestiloc/Key Security.png" alt="Locations" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{dashboardData?.leases?.length || 0}</p>
                      <p className="text-sm text-gray-600">Location(s)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('location')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Statut paiement */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Statut paiement</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/Ressource_gestiloc/Dollar Bag.png" alt="Paiement" className="w-12 h-12 object-contain" />
                    <div>
                      <p className={`text-3xl font-bold ${isUpToDate ? 'text-green-600' : 'text-red-600'}`}>
                        {isUpToDate ? 'À jour' : 'En retard'}
                      </p>
                      <p className="text-sm text-gray-600">Ce mois-ci</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('payments')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                    Voir détails
                  </button>
                </div>
              </div>

              {/* Interventions */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Interventions</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center gap-4">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Interventions" className="w-12 h-12 object-contain" />
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{openIncidents}</p>
                      <p className="text-sm text-gray-600">Ouverte</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{inProgressIncidents}</p>
                      <p className="text-sm text-gray-600">En cours</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('interventions')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Quittances */}
              <div className="bg-white rounded-lg shadow p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quittances</h3>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center gap-4">
                  <img src="/Ressource_gestiloc/Inspection.png" alt="Quittances" className="w-12 h-12 object-contain" />
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{dashboardData?.receipts?.length || 0}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-gray-900">{paidStreak}</p>
                      <p className="text-sm text-gray-600">Mois consécutifs</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => onNavigate?.('receipts')} className="text-xs text-orange-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

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