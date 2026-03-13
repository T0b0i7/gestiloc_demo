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
import api from "@/services/api";

// Types pour les données de l'API
interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

interface Landlord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Lease {
  id: number;
  uuid: string;
  lease_number: string;
  start_date: string;
  end_date: string;
  status: string;
  rent_amount: number;
  charges_amount: number;
  guarantee_amount: number;
  type: string;
  property: Property | null;
  landlord: Landlord | null;
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
  property: {
    id: number;
    name: string;
    address: string;
  } | null;
  month: string | null;
}

interface Receipt {
  id: number;
  reference: string;
  amount: number;
  paid_month: string;
  month: number;
  year: number;
  issued_date: string;
  paid_at: string;
  status: string;
  type: string;
  property: {
    id: number;
    name: string;
  } | null;
  pdf_url: string | null;
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
  property: {
    id: number;
    name: string;
  } | null;
  photos: string[];
}

interface Notice {
  id: number;
  notice_number: string;
  notice_date: string;
  effective_date: string;
  status: string;
  reason: string;
  created_at: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: string;
  type: string;
  description: string;
}

interface ApiResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    roles: string[];
  };
  leases: Lease[];
  active_lease: Lease | null;
  payments: Payment[];
  receipts: Receipt[];
  incidents: Incident[];
  notices: Notice[];
  invoices: Invoice[];
  notifications: any[];
  notifications_unread_count: number;
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

// Données fictives pour les utilisateurs non connectés
const mockDashboardData: ApiResponse = {
  user: {
    id: 0,
    email: "invite@example.com",
    first_name: "Invité",
    last_name: "",
    phone: "",
    roles: ["guest"]
  },
  leases: [
    {
      id: 1,
      uuid: "mock-lease-1",
      lease_number: "BAIL-2025-001",
      start_date: "2025-01-01",
      end_date: "2026-01-01",
      status: "active",
      rent_amount: 150000,
      charges_amount: 25000,
      guarantee_amount: 150000,
      type: "nu",
      property: {
        id: 1,
        name: "Appartement Moderne",
        address: "123 Rue de la Paix",
        city: "Dakar",
        postal_code: "12500",
        country: "Sénégal"
      },
      landlord: {
        id: 1,
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@example.com",
        phone: "+221 77 123 45 67"
      }
    }
  ],
  active_lease: {
    id: 1,
    uuid: "mock-lease-1",
    lease_number: "BAIL-2025-001",
    start_date: "2025-01-01",
    end_date: "2026-01-01",
    status: "active",
    rent_amount: 150000,
    charges_amount: 25000,
    guarantee_amount: 150000,
    type: "nu",
    property: {
      id: 1,
      name: "Appartement Moderne",
      address: "123 Rue de la Paix",
      city: "Dakar",
      postal_code: "12500",
      country: "Sénégal"
    },
    landlord: {
      id: 1,
      first_name: "Jean",
      last_name: "Dupont",
      email: "jean.dupont@example.com",
      phone: "+221 77 123 45 67"
    }
  },
  payments: [
    {
      id: 1,
      amount: 175000,
      amount_net: 175000,
      fee_amount: 0,
      status: "approved",
      payment_method: "Carte bancaire",
      paid_at: "2025-03-15T10:30:00Z",
      created_at: "2025-03-15T10:30:00Z",
      property: {
        id: 1,
        name: "Appartement Moderne",
        address: "123 Rue de la Paix"
      },
      month: "2025-03"
    },
    {
      id: 2,
      amount: 175000,
      amount_net: 175000,
      fee_amount: 0,
      status: "approved",
      payment_method: "Mobile Money",
      paid_at: "2025-02-14T09:15:00Z",
      created_at: "2025-02-14T09:15:00Z",
      property: {
        id: 1,
        name: "Appartement Moderne",
        address: "123 Rue de la Paix"
      },
      month: "2025-02"
    }
  ],
  receipts: [
    {
      id: 1,
      reference: "QUIT-2025-03-001",
      amount: 175000,
      paid_month: "2025-03",
      month: 3,
      year: 2025,
      issued_date: "2025-03-16",
      paid_at: "2025-03-15",
      status: "paid",
      type: "rent",
      property: {
        id: 1,
        name: "Appartement Moderne"
      },
      pdf_url: "/mock/receipt-1.pdf"
    },
    {
      id: 2,
      reference: "QUIT-2025-02-001",
      amount: 175000,
      paid_month: "2025-02",
      month: 2,
      year: 2025,
      issued_date: "2025-02-15",
      paid_at: "2025-02-14",
      status: "paid",
      type: "rent",
      property: {
        id: 1,
        name: "Appartement Moderne"
      },
      pdf_url: "/mock/receipt-2.pdf"
    }
  ],
  incidents: [
    {
      id: 1,
      title: "Fuite d'eau dans la cuisine",
      description: "Fuite sous l'évier qui nécessite une intervention rapide",
      category: "plomberie",
      priority: "high",
      status: "in_progress",
      created_at: "2025-03-10T08:00:00Z",
      updated_at: "2025-03-11T14:30:00Z",
      property: {
        id: 1,
        name: "Appartement Moderne"
      },
      photos: []
    }
  ],
  notices: [],
  invoices: [],
  notifications: [],
  notifications_unread_count: 0,
  stats: {
    total_monthly: 175000,
    is_up_to_date: true,
    months_paid_count: 2,
    open_incidents: 0,
    in_progress_incidents: 1,
    pending_notices: 0,
    total_paid_ytd: 350000
  }
};

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

export const Dashboard: React.FC<DashboardProps> = ({
  activeTab = 'home',
  notify,
  onNavigate
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Data states
  const [dashboardData, setDashboardData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Derived date keys
  const currentYM = useMemo(() => monthKey(new Date()), []);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Si non authentifié, utiliser les données fictives
      setDashboardData(mockDashboardData);
      setLoading(false);
    }
  }, []);

  // Charger les données depuis l'API Laravel (seulement si authentifié)
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Appel à l'API Laravel - endpoint dashboard
        const response = await api.get('/tenant/dashboard');

        if (cancelled) return;

        console.log('Données reçues:', response.data);
        setDashboardData(response.data);

      } catch (err: any) {
        console.error('[DASH] Erreur chargement données:', err);
        if (!cancelled) {
          // En cas d'erreur d'authentification, utiliser les données fictives
          if (err.response?.status === 401) {
            setIsAuthenticated(false);
            setDashboardData(mockDashboardData);
          } else {
            setError(err.response?.data?.message || 'Erreur lors du chargement des données');
          }
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
  }, [isAuthenticated]);

  // ---------- derived stats ----------
  const activeLease = dashboardData?.active_lease;

  const rentMonthly = useMemo(() => activeLease?.rent_amount || 0, [activeLease]);
  const chargesMonthly = useMemo(() => activeLease?.charges_amount || 0, [activeLease]);
  const totalMonthly = useMemo(() => rentMonthly + chargesMonthly, [rentMonthly, chargesMonthly]);

  const receipts = useMemo(() => dashboardData?.receipts || [], [dashboardData]);
  const incidents = useMemo(() => dashboardData?.incidents || [], [dashboardData]);
  const notices = useMemo(() => dashboardData?.notices || [], [dashboardData]);
  const payments = useMemo(() => dashboardData?.payments || [], [dashboardData]);
  const leases = useMemo(() => dashboardData?.leases || [], [dashboardData]);

  const receiptsSorted = useMemo(() => {
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

  // Statistiques depuis l'API ou calculées
  const locationCount = useMemo(() => leases.length || 0, [leases]);

  const openIncidents = useMemo(
    () => incidents?.filter((i: Incident) => i.status === "open").length || 0,
    [incidents]
  );

  const inProgressIncidents = useMemo(
    () => incidents?.filter((i: Incident) => i.status === "in_progress").length || 0,
    [incidents]
  );

  const pendingNotices = useMemo(
    () => notices.filter((n: Notice) => String(n.status) === "pending").length,
    [notices]
  );

  const latePayments = useMemo(() => {
    // Calculer les paiements en retard
    return payments.filter((p: Payment) =>
      p.status === 'pending' || p.status === 'initiated'
    ).length;
  }, [payments]);

  // Afficher le contenu selon l'onglet actif
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="secondary">
            Réessayer
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Styles injectés pour l'harmonisation */}
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
              .font-merriweather { font-family: 'Merriweather', serif; }
              .font-manrope { font-family: 'Manrope', sans-serif; }
              @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
              .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>

            {/* Bannière mode démo si non authentifié */}
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-4 mb-6 text-white shadow-lg animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <p className="font-medium font-manrope">Mode Démonstration</p>
                      <p className="text-sm text-white/90 font-manrope">Les données affichées sont fictives. Connectez-vous pour voir vos véritables informations.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium font-manrope"
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            )}

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:min-h-[200px] mb-8 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10"
              style={{ background: 'linear-gradient(135deg, #8CCC63 0%, #529D21 100%)' }}>
              <div className="z-10 text-center md:text-left max-w-xl">
                <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black mb-4 font-merriweather leading-tight">
                  {!isAuthenticated
                    ? 'Bienvenue sur Gestiloc !'
                    : dashboardData?.user?.first_name
                      ? `Bonjour, ${dashboardData.user.first_name} !`
                      : 'Bienvenue sur Gestiloc !'}
                </h1>
                <p className="text-white/95 text-sm sm:text-base leading-relaxed font-manrope font-medium">
                  {!isAuthenticated
                    ? 'Découvrez la gestion locative simplifiée. Testez toutes les fonctionnalités en mode démo.'
                    : 'Retrouvez ici toutes les informations de votre location. Gérez vos quittances, contactez votre propriétaire et suivez l\'état de votre logement en toute simplicité.'}
                </p>
              </div>
              <img
                src="/Ressource_gestiloc/hand.png"
                alt="Welcome"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain z-10 filter drop-shadow-2xl animate-float"
              />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-3xl opacity-30" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 mb-12">
              {[
                { id: 'receipts', label: 'Mes quittances', icon: '/Ressource_gestiloc/Mes_quittances.png' },
                { id: 'interventions', label: 'Nouvelle intervention', icon: '/Ressource_gestiloc/Tools.png' },
                { id: 'tasks', label: 'Nouvelle tâche', icon: '/Ressource_gestiloc/Nouvelles_taches.png' },
                { id: 'notes', label: 'Nouvelle note', icon: '/Ressource_gestiloc/Edit Property.png' },
                { id: 'documents', label: 'Nouveau document', icon: '/Ressource_gestiloc/Document In Folder.png' },
              ].map(action => (
                <button
                  key={action.id}
                  onClick={() => onNavigate?.(action.id as Tab)}
                  className="flex flex-col items-center justify-center gap-4 group cursor-pointer bg-white p-6 transition-all hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2 active:scale-[0.98] w-full aspect-square md:aspect-auto md:h-[180px]"
                  style={{ borderRadius: '2.5rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] bg-gray-50 flex items-center justify-center p-4 group-hover:bg-green-50 transition-colors shadow-inner">
                    <img src={action.icon} alt={action.label} className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className="text-sm font-extrabold text-gray-900 text-center font-manrope group-hover:text-green-600 transition-colors leading-tight px-2">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 sm:gap-8 mb-12">
              {/* Locations Card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col h-[300px] relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 font-merriweather">Locations</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Settings" className="w-6 h-6 opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center -mt-2">
                  <div className="flex items-center gap-8">
                    <img src="/Ressource_gestiloc/Key Security.png" alt="Key" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
                    <div className="text-center">
                      <p className="text-6xl sm:text-7xl font-black text-green-600 font-merriweather leading-none drop-shadow-sm">{locationCount}</p>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 flex font-manrope justify-center">
                        {locationCount > 1 ? 'Locations' : 'Location'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate?.('location')}
                  className="absolute bottom-6 right-8 text-sm font-bold text-green-600 hover:text-green-700 font-manrope flex items-center gap-1 group"
                >
                  Tout afficher <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Loyers en retard Card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col h-[300px] relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 font-merriweather">Loyers en retard</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Settings" className="w-6 h-6 opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center -mt-2">
                  <div className="flex items-center gap-8">
                    <img src="/Ressource_gestiloc/Dollar Bag.png" alt="Money" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
                    <div className="text-center">
                      <p className="text-6xl sm:text-7xl font-black text-orange-500 font-merriweather leading-none drop-shadow-sm">{latePayments}</p>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 flex font-manrope justify-center">
                        {latePayments > 1 ? 'Retards' : 'Retard'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate?.('payments')}
                  className="absolute bottom-6 right-8 text-sm font-bold text-green-600 hover:text-green-700 font-manrope flex items-center gap-1 group"
                >
                  Tout afficher <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Interventions Card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col h-[300px] relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 font-merriweather">Interventions</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Settings" className="w-6 h-6 opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center -mt-2">
                  <div className="flex items-center gap-6 w-full">
                    <img src="/Ressource_gestiloc/Tools.png" alt="Tools" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                    <div className="flex flex-1 justify-around">
                      <div className="text-center">
                        <p className="text-4xl sm:text-5xl font-black text-gray-900 font-merriweather leading-none">{openIncidents}</p>
                        <p className="text-[0.65rem] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 font-manrope">Ouvertes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl sm:text-5xl font-black text-orange-500 font-merriweather leading-none">0</p>
                        <p className="text-[0.65rem] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 font-manrope">En retard</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl sm:text-5xl font-black text-green-500 font-merriweather leading-none">{inProgressIncidents}</p>
                        <p className="text-[0.65rem] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 font-manrope">En cours</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate?.('interventions')}
                  className="absolute bottom-6 right-8 text-sm font-bold text-green-600 hover:text-green-700 font-manrope flex items-center gap-1 group"
                >
                  Tout afficher <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Tâches Card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col h-[300px] relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 font-merriweather">Tâches</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Settings" className="w-6 h-6 opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center -mt-2">
                  <div className="flex items-center gap-8 w-full">
                    <img src="/Ressource_gestiloc/Inspection.png" alt="Tasks" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                    <div className="flex flex-1 justify-around gap-4">
                      <div className="text-center">
                        <p className="text-4xl sm:text-5xl font-black text-gray-900 font-merriweather leading-none">0</p>
                        <p className="text-[0.65rem] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 font-manrope">Ouvertes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl sm:text-5xl font-black text-orange-500 font-merriweather leading-none">0</p>
                        <p className="text-[0.65rem] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 font-manrope">En retard</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate?.('tasks')}
                  className="absolute bottom-6 right-8 text-sm font-bold text-green-600 hover:text-green-700 font-manrope flex items-center gap-1 group"
                >
                  Tout afficher <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ma Location</h2>
            {activeLease ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">{activeLease.property?.name || 'Détails du logement'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">
                      {activeLease.property?.address || 'Non spécifiée'}
                      {activeLease.property?.city ? `, ${activeLease.property.city}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loyer mensuel</p>
                    <p className="font-medium">{fmtMoney(activeLease.rent_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Charges</p>
                    <p className="font-medium">{fmtMoney(activeLease.charges_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total mensuel</p>
                    <p className="font-medium">{fmtMoney(totalMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">{new Date(activeLease.start_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">
                      {activeLease.end_date
                        ? new Date(activeLease.end_date).toLocaleDateString('fr-FR')
                        : 'Non spécifiée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type de bail</p>
                    <p className="font-medium">
                      {activeLease.type === 'nu' ? 'Location nue' : 'Location meublée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro de bail</p>
                    <p className="font-medium">{activeLease.lease_number}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <img src="/Ressource_gestiloc/Key Security.png" alt="No lease" className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 mb-4">Aucune location active</p>
                <p className="text-sm text-gray-400">Vous n'avez pas encore de bail actif.</p>
              </div>
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
                    {receipts.map((receipt: Receipt) => (
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
                          <p className="font-semibold">{fmtMoney(receipt.amount || 0)}</p>
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
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Aucune quittance disponible</p>
                  </div>
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
                  {incidents.map((incident: Incident) => (
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
                <div className="text-center py-8">
                  <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Aucune intervention en cours</p>
                </div>
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
                  {payments.map((payment: Payment) => (
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
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Aucun paiement enregistré</p>
                </div>
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
                  {notices.map((notice: Notice) => (
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
                <div className="text-center py-8">
                  <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Aucun préavis en cours</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Onglet non trouvé</p>
          </div>
        );
    }
  };

  return (
    <>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalMonthly || 0}
        notify={notify}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>
    </>
  );
};