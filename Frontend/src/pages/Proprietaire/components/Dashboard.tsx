import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { landlordService } from '@/services/api';
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


interface DashboardProps {
  onNavigate?: (tab: string) => void;
  notify?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const DashboardComponent: React.FC<DashboardProps> = ({ onNavigate, notify }) => {

  const barChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<ChartJS | null>(null);
  const donutChartInstance = useRef<ChartJS | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données du dashboard
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await landlordService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Erreur dashboard stats:', err);
        notify?.('Erreur lors du chargement des statistiques', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [notify]);

  // Chart.js - Bar Chart (Loyers)
  useEffect(() => {
    if (!barChartRef.current || !stats) return;

    // Destroy previous instance
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    // Préparation des données du graphique
    const trend = stats.charts?.revenue_trend || [];
    const labels = trend.map((t: any) => t.month);
    const dataPaid = trend.map((t: any) => t.total_paid || 0);
    const dataExpected = trend.map((t: any) => t.total_expected || 0);

    barChartInstance.current = new ChartJS(barChartRef.current, {
      type: 'bar',
      data: {
        labels: labels.length > 0 ? labels : ['Aucune donnée'],
        datasets: [
          {
            label: 'Loyers reçus',
            data: dataPaid.length > 0 ? dataPaid : [0],
            backgroundColor: '#4CAF50',
            borderRadius: 3,
            borderSkipped: false,
            barPercentage: 0.40,
            categoryPercentage: 0.80,
          },
          {
            label: 'Loyers attendus',
            data: dataExpected.length > 0 ? dataExpected : [0],
            backgroundColor: '#FF9800',
            borderRadius: 3,
            borderSkipped: false,
            barPercentage: 0.40,
            categoryPercentage: 0.80,
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
              label: (ctx) => ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')} FCFA`,
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
            border: { display: false },
            grid: { color: '#efefef', lineWidth: 1 },
            ticks: {
              font: { family: 'Manrope', size: 10 },
              color: '#777',
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
  }, [stats]);

  // Chart.js - Donut Chart (Taux d'occupation)
  useEffect(() => {
    if (!donutChartRef.current || !stats) return;

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    const occupied = stats.kpi?.active_tenants || 0;
    const total = stats.kpi?.total_properties || 0;
    const vacant = Math.max(0, total - occupied);

    donutChartInstance.current = new ChartJS(donutChartRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: total > 0 ? [occupied, vacant] : [0, 1],
          backgroundColor: ['rgba(129, 194, 88, 1)', 'rgba(238, 238, 238, 1)'],
          borderWidth: 5,
          borderColor: '#ffffff',
          hoverOffset: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        rotation: -100,
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
  }, [stats]);

  // Transformation des baux récents en "documents" pour l'instant
  const lastActivity = stats?.recent_leases?.map((l: any) => ({
    icon: '/Ressource_gestiloc/Profile.png',
    name: `Bail ${l.tenant} - ${l.property}`,
    date: l.date
  })) || [];

  const documents = lastActivity.length > 0 ? lastActivity : [
    { icon: '/Ressource_gestiloc/Profile.png', name: 'Aucune activité récente', date: '---' },
  ];

  function handleStepClick(id: number): void {
    if (onNavigate) {
      if (id === 1) onNavigate('ajouter-bien');
      if (id === 2) onNavigate('ajouter-locataire');
      if (id === 3) onNavigate('nouvelle-location');
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-500 font-manrope">Chargement de votre tableau de bord...</p>
      </div>
    );
  }


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

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:min-h-[200px] transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10"
        style={{ background: 'linear-gradient(135deg, #8CCC63 0%, #529D21 100%)' }}>
        <div className="z-10 text-center md:text-left max-w-xl">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black mb-4 font-merriweather leading-tight">
            Bienvenue {JSON.parse(localStorage.getItem('user') || '{}').first_name || ''} !
          </h1>
          <p className="text-white/95 text-sm sm:text-base leading-relaxed font-manrope font-medium">
            Merci de vous être inscrit sur Gestiloc ! Nous sommes heureux de vous avoir à bord !
            Gérez vos biens et vos locataires en toute simplicité depuis votre nouveau tableau de bord.
          </p>
        </div>
        <img
          src="/Ressource_gestiloc/hand.png"
          alt="Welcome"
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain z-10 filter drop-shadow-2xl animate-float"
        />
        {/* Subtle decorative elements */}
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
            <div className="text-lg font-black text-[#e65100] font-merriweather leading-none mt-1">Premium</div>
          </div>
        </div>
        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-orange-200/40">
          <div className="text-[0.65rem] font-bold text-orange-800/50 uppercase tracking-[0.1em] font-manrope">Renouvellement</div>
          <div className="text-base font-bold text-gray-900 font-manrope sm:mt-1">15 Mars 2026</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 shadow-sm overflow-hidden">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-8 font-merriweather">
          Pour démarrer, c'est simple…
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Steps Column */}
          <div className="lg:col-span-3 space-y-4">
            {[
              { id: 1, title: 'Créer un bien', desc: 'Créez la fiche de votre premier bien immobilier' },
              { id: 2, title: 'Créer un locataire', desc: 'Ajoutez les informations de vos locataires' },
              { id: 3, title: 'Créer une Location', desc: 'Liez votre bien à un locataire en quelques clics' }
            ].map((step) => (
              <div
                key={step.id}
                onClick={() => handleStepClick(step.id)}
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

          {/* Illustration Column */}
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
        {/* Bar Chart - Loyers */}
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

          <div className="relative h-[280px] sm:h-[320px] w-full px-2">
            <canvas ref={barChartRef}></canvas>
          </div>

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

        {/* Donut Chart - Taux d'occupation */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col items-center justify-between">
          <h3 className="font-merriweather text-lg font-black text-gray-900 mb-8">Taux d'occupation</h3>

          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-8 group transition-transform hover:scale-105 duration-500">
            <canvas ref={donutChartRef}></canvas>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl sm:text-4xl font-black text-green-600 font-merriweather drop-shadow-sm">
                {stats?.kpi?.occupancy_rate ?? 0}%
              </span>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Global</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full border-t border-gray-50 pt-8">
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl font-black text-green-500 font-merriweather">
                {stats?.kpi?.active_tenants ?? 0}
              </div>
              <div className="text-[0.7rem] font-bold text-green-700/40 uppercase tracking-widest mt-2 font-manrope">Occupés</div>
            </div>
            <div className="text-center border-l border-gray-100 px-2">
              <div className="text-2xl sm:text-3xl font-black text-yellow-500 font-merriweather">
                {Math.max(0, (stats?.kpi?.total_properties ?? 0) - (stats?.kpi?.active_tenants ?? 0))}
              </div>
              <div className="text-[0.7rem] font-bold text-yellow-700/40 uppercase tracking-widest mt-2 font-manrope">Vacants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
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
            onClick={() => onNavigate && onNavigate('factures')}
            className="group flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-sm font-bold text-green-600 shadow-sm border border-green-50 hover:bg-green-50 transition-all font-manrope"
          >
            Tout voir
            <ChevronRight className="transition-transform group-hover:translate-x-1" size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="group cursor-pointer rounded-2xl bg-white p-4 flex items-center gap-4 transition-all hover:shadow-2xl hover:shadow-green-900/5 hover:-translate-y-1.5 active:scale-[0.98] border border-gray-100/50 hover:border-green-200/50"
            >
              <div className="w-12 h-12 rounded-[1.2rem] bg-gray-50 flex items-center justify-center p-2.5 group-hover:bg-green-50 transition-colors shadow-inner">
                <img src={doc.icon} alt={doc.name} className="w-full h-full object-contain filter group-hover:brightness-110" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.95rem] font-extrabold text-gray-900 font-manrope truncate group-hover:text-green-600 transition-colors">
                  {doc.name}
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
      </div>
    </div>
  );
};

export default DashboardComponent;
