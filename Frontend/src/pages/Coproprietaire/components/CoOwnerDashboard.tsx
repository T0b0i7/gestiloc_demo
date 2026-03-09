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
  Handshake as HandshakeIcon,
  AlertCircle,
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

// Données fictives pour le mode démo SEULEMENT
const mockDashboardData = {
  subscription: { plan: "Premium GestiLoc (Démo)", renewal_date: "15 Juin 2026" },
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
  recent_documents: [
    { name: 'Contrat de bail - Dupont', date: '28 Janvier 2026', type: 'contract' },
    { name: 'Avis d\'échéance – Février', date: '24 janvier 2026', type: 'invoice' },
    { name: 'État des lieux – Apt 12', date: '27 janvier 2026', type: 'inventory' },
    { name: 'Quittance – Martin', date: '25 janvier 2026', type: 'receipt' },
  ],
  quick_actions: [
    { id: 1, title: 'Créer un bien', description: 'Créez la fiche de votre bien', icon: 'home' },
    { id: 2, title: 'Créer un locataire', description: 'Ajoutez vos locataires', icon: 'users' },
    { id: 3, title: 'Créer une Location', description: 'Liez le bien et le locataire', icon: 'handshake' },
  ],
  kpis: {
    expected_rent: 500000,
    received_rent: 460000,
    occupancy_rate: 80,
    occupied_properties: 12,
    total_properties: 15,
    active_delegations: 5,
    active_alerts: 2,
  }
};

export const CoOwnerDashboard: React.FC<CoOwnerDashboardProps> = ({ onNavigate, notify }) => {
  // 1. All Hooks at the top
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoOwner | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<CoOwnerProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const barChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<ChartJS | null>(null);
  const donutChartInstance = useRef<ChartJS | null>(null);

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    setIsAuthenticated(!!(token && userStr));
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const profileData = await coOwnerApi.getProfile();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } catch (e: any) {
      console.warn("Dashboard Fetch Error:", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated]);

  // Utiliser les données du profil si disponibles, sinon les données fictives
  const dashboardData = useMemo(() => {
    if (isAuthenticated && profile?.dashboard_data) {
      return profile.dashboard_data;
    }
    return mockDashboardData;
  }, [profile, isAuthenticated]);

  // Extraire les données
  const { 
    subscription, 
    occupancy_data, 
    recent_documents,
    rent_data,
    graph_max,
  } = dashboardData;

  // Chart.js - Bar Chart (Loyers)
  useEffect(() => {
    if (!barChartRef.current || loading) return;
    
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

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
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { family: 'Manrope', size: 11 },
              color: '#666',
            },
          },
          y: {
            beginAtZero: true,
            max: (graph_max || 500000) * 1.2,
            border: { display: false },
            grid: { color: '#efefef', lineWidth: 1 },
            ticks: {
              stepSize: graph_max ? Math.ceil(graph_max / 5) : 100000,
              font: { family: 'Manrope', size: 10 },
              color: '#777',
              callback: (value) => fcfa(value as number).replace(' FCFA', 'k'),
            },
          },
        },
      },
    });

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, [rent_data, graph_max, loading]);

  // Chart.js - Donut Chart (Taux d'occupation)
  useEffect(() => {
    if (!donutChartRef.current || loading) return;

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    donutChartInstance.current = new ChartJS(donutChartRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [occupancy_data.occupied, occupancy_data.vacant],
          backgroundColor: ['#8CCC63', '#FF9800'],
          borderWidth: 5,
          borderColor: '#ffffff',
          hoverOffset: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const labels = ['Occupés', 'Vacants'];
                return ` ${labels[ctx.dataIndex]}: ${ctx.parsed}`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
    };
  }, [occupancy_data, loading]);

  // ✅ CORRECTION : Filtrer pour n'afficher que les documents qui existent réellement
  const displayedDocs = useMemo(() => {
    if (!isAuthenticated) {
      // Mode démo : afficher les documents fictifs
      return mockDashboardData.recent_documents;
    }
    
    // Mode connecté : afficher uniquement les documents de l'API
    // Si recent_documents est vide, on n'affiche rien
    return recent_documents && recent_documents.length > 0 ? recent_documents : [];
  }, [isAuthenticated, recent_documents]);

  // Obtenir l'icône en fonction du type de document
  const getDocumentIcon = (type: string) => {
    switch(type) {
      case 'contrat':
      case 'contract':
      case 'lease':
        return '/Ressource_gestiloc/Profile.png';
      case 'avis':
      case 'invoice':
        return '/Ressource_gestiloc/Error.png';
      case 'etat':
      case 'inventory':
        return '/Ressource_gestiloc/US Capitol.png';
      case 'facture':
      case 'maintenance':
        return '/Ressource_gestiloc/facture_travaux.png';
      case 'quittance':
      case 'receipt':
        return '/Ressource_gestiloc/Bell.png';
      default:
        return '/Ressource_gestiloc/document.png';
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-700">
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
                <AlertCircle size={20} />
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
      <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:min-h-[200px] transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10"
        style={{ background: 'linear-gradient(135deg, #8CCC63 0%, #529D21 100%)' }}>
        <div className="z-10 text-center md:text-left max-w-xl">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black mb-4 font-merriweather leading-tight">
            {isAuthenticated 
              ? `Bonjour, ${profile?.first_name || 'Copropriétaire'} !`
              : 'Bienvenue sur Gestiloc !'}
          </h1>
          <p className="text-white/95 text-sm sm:text-base leading-relaxed font-manrope font-medium">
            {isAuthenticated
              ? 'Votre patrimoine immobilier est sous contrôle. Gérez vos délégations et revenus en toute simplicité.'
              : 'Découvrez la gestion locative simplifiée pour copropriétaires. Testez toutes les fonctionnalités en mode démo.'}
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

      {/* Subscription Card */}
      <div className="rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-orange-100/30 shadow-sm transition-all hover:shadow-md"
        style={{ background: 'linear-gradient(90.54deg, #FFE9D9 0.09%, #FFE2CF 46.16%, #F2C6AB 99.91%)' }}>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
          <div className="bg-white/40 p-2.5 rounded-xl backdrop-blur-sm shadow-sm">
            <img src="/Ressource_gestiloc/crown.png" alt="crown" className="w-8 h-8 object-contain" />
          </div>
          <div className="text-left">
            <div className="text-[0.65rem] font-bold text-orange-800/50 uppercase tracking-[0.1em] font-manrope">Abonnement actuel</div>
            <div className="text-lg font-black text-[#e65100] font-merriweather leading-none mt-1">{subscription.plan}</div>
          </div>
        </div>
        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-orange-200/40">
          <div className="text-[0.65rem] font-bold text-orange-800/50 uppercase tracking-[0.1em] font-manrope">Renouvellement</div>
          <div className="text-base font-bold text-gray-900 font-manrope sm:mt-1">{subscription.renewal_date}</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 shadow-sm overflow-hidden">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-8 font-merriweather">
          {isAuthenticated ? 'Pour démarrer la gestion des délégations…' : 'Pour démarrer, c’est simple…'}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-3 space-y-4">
            {[
              { id: 1, title: 'Accepter une délégation', desc: 'Rejoignez la gestion d\'un bien avec un lien d\'invitation' },
              { id: 2, title: 'Vérifier vos contrats', desc: 'Consultez les baux délégués pour vérifier les montants' },
              { id: 3, title: 'Suivre les revenus', desc: 'Suivez et collectez les revenus générés par les biens' }
            ].map((step) => (
              <div
                key={step.id}
                className="group cursor-pointer rounded-2xl border border-gray-50 bg-gray-50/30 p-4 sm:p-5 flex items-center gap-4 sm:gap-6 transition-all hover:bg-white hover:border-green-100 hover:shadow-xl hover:shadow-green-500/5 active:scale-[0.98]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-black text-lg sm:text-xl font-merriweather shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                  {step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base sm:text-lg font-bold text-gray-900 font-manrope group-hover:text-green-600 transition-colors truncate">
                    {step.title}
                  </div>
                  <div className="text-[0.8rem] sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1 truncate">
                    {step.desc}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-white shadow-sm ring-1 ring-gray-100 group-hover:ring-green-100 transition-all">
                  <ChevronRight className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" size={20} />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 hidden sm:flex items-center justify-center p-4">
            <img
              src="/Ressource_gestiloc/svg_propiro1.png"
              alt="Steps"
              className="w-full max-w-[260px] h-auto object-contain transition-transform hover:scale-105 duration-700"
            />
          </div>
        </div>
      </div>

      {/* Charts Box */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-green-100">
                <img src="/Ressource_gestiloc/Accounting.png" className="w-7 h-7 object-contain" alt="" />
              </div>
              <h3 className="font-merriweather text-lg sm:text-xl font-black text-gray-900">Suivi des Loyers</h3>
            </div>
            <div className="relative w-full sm:w-auto">
              <select className="appearance-none w-full sm:w-auto bg-transparent border border-gray-100 rounded-xl px-5 py-2.5 pr-10 text-xs font-bold font-manrope text-gray-600 hover:border-gray-200 focus:outline-none transition-all cursor-pointer shadow-sm">
                <option>Cette année</option>
                <option>Année précédente</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <div className="relative h-[280px] sm:h-[320px] w-full px-2">
              <canvas ref={barChartRef}></canvas>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-8 pt-6 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-lg shadow-green-500/20" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-manrope">Reçus</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/20" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-manrope">Attendus</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col items-center justify-between">
          <h3 className="font-merriweather text-lg font-black text-gray-900 mb-8">Taux d'occupation</h3>

          {loading ? (
            <Skeleton className="w-48 h-48 rounded-full" />
          ) : (
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-8 group transition-transform hover:scale-105 duration-500">
              <canvas ref={donutChartRef}></canvas>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-black text-green-600 font-merriweather drop-shadow-sm">{occupancy_data.occupancy_rate}%</span>
                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Global</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 w-full border-t border-gray-50 pt-8">
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl font-black text-green-500 font-merriweather">{occupancy_data.occupied}</div>
              <div className="text-[0.7rem] font-bold text-green-700/40 uppercase tracking-widest mt-2 font-manrope">Occupés</div>
            </div>
            <div className="text-center border-l border-gray-100 px-2">
              <div className="text-2xl sm:text-3xl font-black text-yellow-500 font-merriweather">{occupancy_data.vacant}</div>
              <div className="text-[0.7rem] font-bold text-yellow-700/40 uppercase tracking-widest mt-2 font-manrope">Vacants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section - CORRIGÉE */}
      <div className="bg-gray-100/40 rounded-[2.5rem] p-6 sm:p-10 transition-all border border-gray-100/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-md ring-1 ring-black/5">
              <img src="/Ressource_gestiloc/document.png" alt="docs" className="w-6 h-6 object-contain" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-merriweather tracking-tight">
              Nouveaux documents
            </h2>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('documents' as Tab)}
            className="group flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-sm font-bold text-green-600 shadow-sm border border-green-50 hover:bg-green-50 transition-all font-manrope"
          >
            Tout voir
            <ChevronRight className="transition-transform group-hover:translate-x-1" size={16} strokeWidth={3} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : (
          <>
            {displayedDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedDocs.map((doc: any, idx: number) => (
                  <div
                    key={idx}
                    className="group cursor-pointer rounded-2xl bg-white p-4 flex items-center gap-4 transition-all hover:shadow-2xl hover:shadow-green-900/5 hover:-translate-y-1.5 active:scale-[0.98] border border-gray-100/50 hover:border-green-200/50"
                  >
                    <div className="w-12 h-12 rounded-[1.2rem] bg-gray-50 flex items-center justify-center p-2.5 group-hover:bg-green-50 transition-colors shadow-inner">
                      <img src={getDocumentIcon(doc.type || doc.document_type)} alt={doc.name || doc.title} className="w-full h-full object-contain filter group-hover:brightness-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.95rem] font-extrabold text-gray-900 font-manrope truncate group-hover:text-green-600 transition-colors">
                        {doc.name || doc.title}
                      </div>
                      <div className="text-[0.7rem] font-bold text-green-600 mt-1 flex items-center gap-1.5 opacity-70">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {doc.date}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-green-50 text-green-500">
                      <ChevronRight size={18} strokeWidth={3} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Message quand aucun document n'est disponible
              <div className="text-center py-12 bg-white/50 rounded-2xl">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium font-manrope">Aucun document récent</p>
                <p className="text-sm text-gray-400 font-manrope mt-1">Les documents apparaîtront ici quand ils seront créés.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions Card */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-green-900/10 flex flex-col text-white relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/5 rounded-full blur-2xl -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest font-manrope mb-6">Actions rapides</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => onNavigate('delegations' as Tab)} 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group/btn"
            >
              <span className="text-base font-black font-merriweather">Délégations</span>
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-green-500 transition-all shadow-lg shadow-green-900/50">
                <HandshakeIcon className="text-white w-5 h-5" />
              </div>
            </button>
            <button 
              onClick={() => onNavigate('biens' as Tab)} 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group/btn"
            >
              <span className="text-base font-black font-merriweather">Mes biens</span>
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-green-500 transition-all shadow-lg shadow-green-900/50">
                <Home className="text-white w-5 h-5" />
              </div>
            </button>
            <button 
              onClick={() => onNavigate('finances' as Tab)} 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group/btn"
            >
              <span className="text-base font-black font-merriweather">Finances</span>
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-green-500 transition-all shadow-lg shadow-green-900/50">
                <CreditCard className="text-white w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
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