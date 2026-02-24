import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
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

  // Chart.js - Bar Chart (Loyers)
  useEffect(() => {
    if (!barChartRef.current) return;

    // Destroy previous instance
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    barChartInstance.current = new ChartJS(barChartRef.current, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
          {
            label: 'Loyers reçus',
            data: [4200, 3800, 4500, 4100, 4800, 4600],
            backgroundColor: '#4CAF50',
            borderRadius: 3,
            borderSkipped: false,
            barPercentage: 0.40,
            categoryPercentage: 0.80,
          },
          {
            label: 'Loyers attendus',
            data: [5000, 5000, 5000, 5000, 5000, 5000],
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
            max: 6000,
            border: { display: false },
            grid: { color: '#efefef', lineWidth: 1 },
            ticks: {
              stepSize: 1000,
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
  }, []);

  // Chart.js - Donut Chart (Taux d'occupation)
  useEffect(() => {
    if (!donutChartRef.current) return;

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    donutChartInstance.current = new ChartJS(donutChartRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [12, 3],
          backgroundColor: ['rgba(129, 194, 88, 1)', 'rgba(253, 234, 91, 1)'],
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
  }, []);

  const loyersData = [
    { month: 'Jan', reçu: 4200, attendu: 5000 },
    { month: 'Fév', reçu: 3800, attendu: 5000 },
    { month: 'Mar', reçu: 4500, attendu: 5000 },
    { month: 'Avr', reçu: 4100, attendu: 5000 },
    { month: 'Mai', reçu: 4800, attendu: 5000 },
    { month: 'Juin', reçu: 4600, attendu: 5000 },
  ];

  const documents = [
    { icon: '/Ressource_gestiloc/Profile.png', name: 'Contrat de bail-Dupont', date: '28 Janvier · 2026' },
    { icon: '/Ressource_gestiloc/Error.png', name: 'Avis d\'échéance – Février', date: '24 janvier 2026' },
    { icon: '/Ressource_gestiloc/US Capitol.png', name: 'État des lieux – Apt 12', date: '27 janvier 2026' },
    { icon: '/Ressource_gestiloc/facture_travaux.png', name: 'Facture travaux – Villa 5', date: '23 janvier 2026' },
    { icon: '/Ressource_gestiloc/Bell.png', name: 'Quittance – Martin', date: '25 janvier 2026' },
  ];

  function handleStepClick(arg0: number): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="w-full" style={{ padding: '1.5rem 1rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp-1 { animation: fadeUp 0.5s ease both; }
        .animate-fadeUp-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .animate-fadeUp-3 { animation: fadeUp 0.5s 0.2s ease both; }
        .animate-fadeUp-4 { animation: fadeUp 0.5s 0.3s ease both; }
        .animate-fadeUp-5 { animation: fadeUp 0.5s 0.4s ease both; }
      `}</style>

      {/* Welcome Banner */}
      <div className="animate-fadeUp-1 relative overflow-hidden rounded-3xl p-10 mb-6 flex items-center justify-between"
        style={{ minHeight: '180px', background: 'linear-gradient(94.5deg, #8CCC63 5.47%, rgba(82, 157, 33, 0.87) 91.93%)' }}>
        <div style={{ zIndex: 1, maxWidth: '500px' }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, marginBottom: '0.8rem', fontFamily: 'Merriweather, serif' }}>
            Bienvenue sur Gestiloc !
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', lineHeight: '1.6' }}>
            Merci de vous être inscrit ! Nous sommes heureux de vous avoir à bord !
            Dites-nous un peu plus sur vous afin de compléter votre profil et de profiter pleinement de toutes nos fonctionnalités.
          </p>
        </div>
        <img
          src="/Ressource_gestiloc/hand.png"
          alt="Welcome"
          style={{
            fontSize: '5rem',
            zIndex: 1,
            flexShrink: 0,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.15))',
            width: '120px',
            height: '120px',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Subscription Card */}
      <div className="animate-fadeUp-2 mb-8 rounded-2xl p-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(90.54deg, #FFE9D9 0.09%, #FFE2CF 46.16%, #F2C6AB 99.91%)' }}>
        <div className="flex items-center gap-3">
          <img src="/Ressource_gestiloc/crown.png" alt="crown" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Abonnement actuel
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e65100', marginTop: '2px' }}>Premium</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Renouvellement
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', marginTop: '2px' }}>15 Mars 2026</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="animate-fadeUp-3 mb-8 bg-white rounded-3xl border border-[#e5e7eb] p-6">
        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.5rem' }}>
          Pour démarrer, c'est simple comme 1, 2, 3…
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Steps Column */}
          <div className="space-y-3">
            <div
              onClick={() => handleStepClick(1)}
              className="cursor-pointer rounded-2xl border border-[#e5e7eb] bg-gradient-to-r from-white to-[#f9fafb] p-4 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1"
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#4CAF50',
                color: '#fff',
                fontFamily: 'Merriweather, serif',
                fontWeight: 900,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>
                  Créer un bien
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>
                  Créer la fiche de votre bien
                </div>
              </div>
            </div>

            <div
              onClick={() => handleStepClick(2)}
              className="cursor-pointer rounded-2xl border border-[#e5e7eb] bg-gradient-to-r from-white to-[#f9fafb] p-4 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1"
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#4CAF50',
                color: '#fff',
                fontFamily: 'Merriweather, serif',
                fontWeight: 900,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>
                  Créer un locataire
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>
                  Créer la fiche de votre locataire
                </div>
              </div>
            </div>

            <div
              onClick={() => handleStepClick(3)}
              className="cursor-pointer rounded-2xl border border-[#e5e7eb] bg-gradient-to-r from-white to-[#f9fafb] p-4 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1"
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#4CAF50',
                color: '#fff',
                fontFamily: 'Merriweather, serif',
                fontWeight: 900,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>
                  Créer une Location
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>
                  Lier le bien et le locataire
                </div>
              </div>
            </div>
          </div>

          {/* Illustration Column */}
          <div className="flex items-center justify-center">
            <img
              src="/Ressource_gestiloc/svg_propiro1.png"
              alt="Steps illustration"
              style={{
                width: '100%',
                maxWidth: '280px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="animate-fadeUp-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart - Loyers */}
        <div className="lg:col-span-2" style={{
          background: '#fff',
          border: '1.5px solid #e2e8e2',
          borderRadius: 14,
          padding: '1.3rem 1.5rem 1.1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{
                width: 38, height: 38,
                background: '#fff',
                border: '1.5px solid #dde5dd',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
              }}>📋</div>
              <span style={{
                fontFamily: "'Merriweather', serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1a1a1a',
              }}>Loyers</span>
            </div>
            <button style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 600,
              border: '1.5px solid #ccc',
              borderRadius: 8,
              padding: '0.38rem 1rem',
              background: '#fff',
              cursor: 'pointer',
              color: '#222',
              letterSpacing: '0.01em',
            }}>Cette année &nbsp;∨</button>
          </div>

          <div style={{ position: 'relative', height: 230 }}>
            <canvas ref={barChartRef}></canvas>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '1.8rem', marginTop: '0.85rem', paddingTop: '0.6rem',
            borderTop: '1px solid #f0f0f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#444', fontWeight: 500 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#4CAF50' }}></div>
              Loyers reçus
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#444', fontWeight: 500 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF9800' }}></div>
              Loyers attendus
            </div>
          </div>
        </div>

        {/* Donut Chart - Taux d'occupation */}
        <div style={{
          background: '#fff',
          border: '1.5px solid #e2e8e2',
          borderRadius: 14,
          padding: '1.3rem 1.2rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            fontFamily: "'Merriweather', serif",
            fontSize: '0.98rem',
            fontWeight: 700,
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '1.1rem',
          }}>Taux d'occupation</div>

          <div style={{ position: 'relative', width: 150, height: 150, marginBottom: '1.4rem' }}>
            <canvas ref={donutChartRef}></canvas>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Merriweather', serif",
                fontSize: '2rem',
                fontWeight: 900,
                lineHeight: 1,
                color: 'rgba(129, 194, 88, 1)',
              }}>12</div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                marginTop: 4,
                color: 'rgba(129, 194, 88, 1)',
              }}>Occupés</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Merriweather', serif",
                fontSize: '2rem',
                fontWeight: 900,
                lineHeight: 1,
                color: 'rgba(253, 234, 91, 1)',
              }}>3</div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                marginTop: 4,
                color: 'rgba(253, 234, 91, 1)',
              }}>Vacants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="animate-fadeUp-5" style={{ background: 'rgba(235, 235, 235, 1)', borderRadius: 20, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/Ressource_gestiloc/document.png" alt="docs" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            Nouveaux documents
          </h2>
          <button
            onClick={() => onNavigate && onNavigate('my-documents')}
            className="text-[0.82rem] font-semibold text-[#4CAF50] hover:underline cursor-pointer bg-none border-none p-0"
          >
            Voir plus
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="cursor-pointer rounded-2xl bg-white p-3 flex items-center gap-3 transition-shadow hover:shadow-lg"
              style={{ border: 'none' }}
            >
              <img src={doc.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a' }}>{doc.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: 600, marginTop: '2px' }}>{doc.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
