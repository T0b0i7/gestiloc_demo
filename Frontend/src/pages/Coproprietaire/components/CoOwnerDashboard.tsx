import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Home,
  ChevronRight,
  FileText,
  Users,
  Plus,
  Calendar,
  CreditCard,
  Building,
  Zap,
} from "lucide-react";
import { Card } from "../../Proprietaire/components/ui/Card";
import { Button } from "../../Proprietaire/components/ui/Button";
import { Skeleton } from "../../Proprietaire/components/ui/Skeleton";
import { Tab } from "../types";
import { PropertyModal } from "./PropertyModal";

import {
  coOwnerApi,
  type CoOwner,
  type CoOwnerProperty,
} from "@/services/coOwnerApi";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend);

interface CoOwnerDashboardProps {
  onNavigate: (tab: Tab) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

const fcfa = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(isFinite(n) ? n : 0) + " FCFA";

export const CoOwnerDashboard: React.FC<CoOwnerDashboardProps> = ({ onNavigate, notify }) => {
  // 1. All Hooks at the top
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoOwner | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<CoOwnerProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const barChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<ChartJS | null>(null);
  const donutChartInstance = useRef<ChartJS | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileData = await coOwnerApi.getProfile();
      setProfile(profileData);
    } catch (e: any) {
      console.warn("Dashboard Fetch Error (using fallback):", e);
      setProfile({
        id: 0,
        email: 'demo@gestiloc.com',
        first_name: 'Utilisateur',
        last_name: 'Démo',
        dashboard_data: null
      } as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const dashboardData = useMemo(() => {
    if (!profile || !profile.dashboard_data) {
      return {
        subscription: { plan: "Premium GestiLoc", renewal_date: "15 Juin 2026" },
        rent_data: [
          { month: 'Jan', received: 420000, expected: 500000 },
          { month: 'Fév', received: 380000, expected: 500000 },
          { month: 'Mar', received: 450000, expected: 500000 },
          { month: 'Avr', received: 410000, expected: 500000 },
          { month: 'Mai', received: 480000, expected: 500000 },
          { month: 'Juin', received: 460000, expected: 500000 },
        ],
        graph_max: 500000,
        occupancy_data: { occupied: 12, vacant: 3, total: 15, occupancy_rate: 80 },
        recent_documents: [],
        quick_actions: [],
      };
    }
    return profile.dashboard_data;
  }, [profile]);

  useEffect(() => {
    if (!barChartRef.current || loading || !profile) return;
    if (barChartInstance.current) barChartInstance.current.destroy();

    const { rent_data, graph_max } = dashboardData;
    barChartInstance.current = new ChartJS(barChartRef.current, {
      type: 'bar',
      data: {
        labels: rent_data.map((item: any) => item.month),
        datasets: [
          {
            label: 'Loyers reçus',
            data: rent_data.map((item: any) => item.received),
            backgroundColor: '#8CCC63',
            borderRadius: 6,
            barPercentage: 0.5,
          },
          {
            label: 'Loyers attendus',
            data: rent_data.map((item: any) => item.expected),
            backgroundColor: '#FF9800',
            borderRadius: 6,
            barPercentage: 0.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${fcfa(ctx.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Manrope', size: 11 }, color: '#999' } },
          y: { beginAtZero: true, max: (graph_max || 500000) * 1.2, border: { display: false }, grid: { color: '#f0f0f0' }, ticks: { font: { family: 'Manrope', size: 10 }, color: '#bbb' } },
        },
      },
    });
    return () => barChartInstance.current?.destroy();
  }, [dashboardData, loading, profile]);

  useEffect(() => {
    if (!donutChartRef.current || loading || !profile) return;
    if (donutChartInstance.current) donutChartInstance.current.destroy();

    const { occupancy_data } = dashboardData;
    donutChartInstance.current = new ChartJS(donutChartRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [occupancy_data.occupied, occupancy_data.vacant],
          backgroundColor: ['#8CCC63', '#FF9800'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: { legend: { display: false } },
      },
    });
    return () => donutChartInstance.current?.destroy();
  }, [dashboardData, loading, profile]);

  const { subscription, occupancy_data, recent_documents } = dashboardData;

  const demoDocs = [
    { name: 'Contrat de bail-Dupont', date: '28 Janvier 2026', type: 'contract' },
    { name: 'Avis d\'échéance – Février', date: '24 janvier 2026', type: 'invoice' },
    { name: 'Quittance – Martin', date: '25 janvier 2026', type: 'receipt' },
  ];

  return (
    <div className="space-y-8 py-4 px-0 sm:px-4" style={{ fontFamily: "'Merriweather', serif" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-merriweather tracking-tight">
        Tableau de bord
      </h1>

      {/* Premium Welcome Banner - Styled like Propriétaire */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 md:min-h-[240px] shadow-2xl shadow-green-900/10 transition-all duration-500 hover:shadow-green-500/20"
        style={{ background: 'linear-gradient(135deg, #8CCC63 0%, #529D21 100%)' }}>

        <div className="z-10 text-center md:text-left max-w-2xl">
          <h2 className="text-white text-2xl sm:text-3xl md:text-5xl font-black mb-4 font-merriweather leading-tight">
            Bonjour, {profile?.first_name || 'Utilisateur'}
          </h2>
          <p className="text-white/95 text-base sm:text-lg leading-relaxed font-manrope font-medium max-w-xl">
            Votre patrimoine immobilier est sous contrôle. Gérez vos délégations et revenus en toute simplicité.
          </p>
        </div>

        <div className="relative z-10 hidden md:block">
          <img
            src="/Ressource_gestiloc/hand.png"
            alt="Welcome"
            className="w-32 h-32 md:w-48 md:h-48 object-contain filter drop-shadow-2xl animate-float"
          />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-3xl opacity-30" />
      </div>

      {/* Subscription & Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <Card className="md:col-span-8 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 border border-orange-100/30 shadow-xl shadow-orange-900/5 transition-all hover:shadow-2xl relative overflow-hidden group"
          style={{ background: 'linear-gradient(90.54deg, #FFE9D9 0.09%, #FFE2CF 46.16%, #F2C6AB 99.91%)' }}>
          <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
            <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm">
              <img src="/Ressource_gestiloc/crown.png" alt="" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-800/50 uppercase tracking-[0.2em] font-manrope">Abonnement actuel</p>
              <h3 className="text-3xl font-black text-[#e65100] font-merriweather leading-tight mt-1">{subscription.plan}</h3>
            </div>
          </div>
          <div className="text-right sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-orange-200/40">
            <p className="text-[10px] font-black text-orange-800/50 uppercase tracking-[0.2em] font-manrope">Prochain renouvellement</p>
            <p className="text-xl font-black text-gray-900 font-manrope mt-1">{subscription.renewal_date}</p>
          </div>
          {/* Subtle glow */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
        </Card>

        <Card className="md:col-span-4 p-8 rounded-[2.5rem] bg-gray-900 border-none shadow-2xl shadow-green-900/10 flex flex-col justify-center text-white relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest font-manrope mb-4">Actions rapides</p>
          <button onClick={() => onNavigate('emettre-paiement')} className="flex items-center justify-between w-full group/btn">
            <span className="text-xl font-black font-merriweather">Émettre paiement</span>
            <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-green-500 transition-all shadow-lg shadow-green-900/50">
              <Plus className="text-white w-6 h-6" />
            </div>
          </button>
        </Card>
      </div>

      {/* Getting Started Section - Harmonisé avec Propriétaire */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 shadow-xl shadow-gray-900/5 overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 font-merriweather tracking-tight">
          Pour démarrer la gestion des délégations…
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { id: 1, title: 'Accepter Délégation', desc: 'Rejoignez la gestion d\'un bien avec un lien d\'invitation', icon: <Handshake /> },
            { id: 2, title: 'Vérifier vos contrats', desc: 'Consultez les baux délégués pour vérifier les montants', icon: <FileText /> },
            { id: 3, title: 'Émettre Paiements', desc: 'Suivez et collectez les revenus générés par les biens', icon: <CreditCard /> }
          ].map((step) => (
            <div
              key={step.id}
              className="group cursor-pointer rounded-3xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4 transition-all hover:bg-white hover:border-green-200 hover:shadow-2xl hover:shadow-green-900/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center text-white shadow-xl shadow-green-600/30 group-hover:scale-110 transition-transform">
                <span className="text-xl font-black font-merriweather">{step.id}</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 font-manrope uppercase tracking-tight group-hover:text-green-600 transition-colors">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Chart Card */}
        <Card className="xl:col-span-2 p-10 rounded-[4rem] bg-white border-none shadow-2xl shadow-green-900/5 relative">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-2xl">
                <TrendingUp className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 font-merriweather">Revenus locatifs</h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reçus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendus</span>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <canvas ref={barChartRef} />
          </div>
        </Card>

        {/* Occupancy Card */}
        <Card className="p-10 rounded-[4rem] bg-white border-none shadow-2xl shadow-green-900/5 flex flex-col items-center">
          <h3 className="text-xl font-black text-gray-900 font-merriweather mb-10">Taux d'occupation</h3>
          <div className="relative w-64 h-64 mb-10">
            <canvas ref={donutChartRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-black text-green-600 font-merriweather">{occupancy_data.occupancy_rate}%</p>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Global</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 w-full border-t border-gray-50 pt-8 mt-auto">
            <div className="text-center">
              <p className="text-3xl font-black text-green-600 font-merriweather">{occupancy_data.occupied}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Occupés</p>
            </div>
            <div className="text-center border-l border-gray-50">
              <p className="text-3xl font-black text-amber-600 font-merriweather">{occupancy_data.vacant}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Vacants</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recents Documents & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-gray-900 font-merriweather tracking-tight">Activité récente</h3>
            <button onClick={() => onNavigate('documents')} className="text-xs font-black text-green-600 uppercase tracking-widest hover:text-green-700 transition-colors">Voir tout</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(recent_documents.length > 0 ? recent_documents.slice(0, 4) : demoDocs).map((doc: any, i: number) => (
              <Card key={i} className="p-6 rounded-[2.5rem] bg-white border-none shadow-xl shadow-green-900/5 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group flex items-center gap-5">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-green-50 transition-colors">
                  <FileText className="text-gray-400 group-hover:text-green-600 w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 font-manrope truncate uppercase">{doc.name || doc.title}</p>
                  <p className="text-[10px] font-bold text-gray-400 font-manrope mt-1 uppercase tracking-widest">{doc.date}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 group-hover:bg-green-100 group-hover:text-green-600 transition-all">
                  <ChevronRight size={18} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="lg:col-span-4 p-10 rounded-[4rem] bg-gradient-to-br from-gray-50 to-white border-none shadow-2xl shadow-green-900/5 flex flex-col gap-6">
          <h3 className="text-xl font-black text-gray-900 font-merriweather mb-2">Pas de temps ?</h3>
          <div className="space-y-4">
            <button onClick={() => onNavigate('dashboard')} className="w-full p-6 rounded-[2rem] bg-white shadow-lg shadow-gray-200/50 flex items-center gap-4 hover:-translate-y-1 transition-all border border-gray-100">
              <div className="p-3 bg-green-50 rounded-xl text-green-600"><Home size={20} /></div>
              <span className="text-sm font-black text-gray-700 font-manrope uppercase tracking-tight">Gérer mes biens</span>
            </button>
            <button onClick={() => onNavigate('finances')} className="w-full p-6 rounded-[2rem] bg-white shadow-lg shadow-gray-200/50 flex items-center gap-4 hover:-translate-y-1 transition-all border border-gray-100">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><CreditCard size={20} /></div>
              <span className="text-sm font-black text-gray-700 font-manrope uppercase tracking-tight">Suivre finances</span>
            </button>
          </div>
          <div className="mt-auto p-8 rounded-[2.5rem] bg-green-600 text-white shadow-xl shadow-green-600/30 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-lg font-black leading-tight">Besoin d'aide ?</p>
              <p className="text-[10px] font-bold opacity-80 mt-1 mb-4 uppercase tracking-widest">Support prioritaire</p>
              <button className="w-full bg-white text-green-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-colors">Contacter</button>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          </div>
        </Card>
      </div>

      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProperty(null); }}
        notify={notify}
        onUpdate={fetchProfile}
        isAgency={profile?.is_professional || false}
      />
    </div>
  );
};
