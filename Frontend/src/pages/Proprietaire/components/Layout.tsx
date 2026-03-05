import React, { useState, useEffect } from 'react';
import {
  Building,
  Home,
  Plus,
  FileSignature,
  UserPlus,
  List,
  Wallet,
  FileText,
  ClipboardList,
  AlertTriangle,
  Bell,
  FolderOpen,
  Archive,
  Wrench,
  Calculator,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ArrowLeft,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { Tab, Notification, ToastMessage } from '../types';
import { Toast } from './ui/Toast';
import { AnimatedPage } from './AnimatedPage';
import '../animations.css';

interface UserData {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  roles: string[];
  default_role: string | null;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const notifications: Notification[] = [
  { id: '1', type: 'critical', message: 'Loyer novembre en retard', subtext: 'Régularisez avant pénalités', isRead: false },
  { id: '2', type: 'important', message: 'Intervention confirmée', subtext: '22/11 - 14h-16h', isRead: false },
];

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  toasts,
  removeToast,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error('Impossible de lire user depuis localStorage', e);
    }
  }, []);

  const handleNavigate = (tab: Tab) => {
    if (activeTab !== tab) {
      onNavigate(tab);
    }
    setIsMobileMenuOpen(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: string) => {
    // Synchroniser avec activeTab si c'est un onglet valide
    const validTabIds = [
      'dashboard', 'ajouter-bien', 'mes-biens', 'nouvelle-location',
      'ajouter-locataire', 'locataires', 'paiements', 'baux',
      'etats-lieux', 'avis-echeance', 'quittances', 'factures',
      'comptabilite', 'parametres', 'profil'
    ];
    if (validTabIds.includes(page)) {
      onNavigate(page as Tab);
    }
    setIsMobileMenuOpen(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── SVG Icons pour le menu ──
  const SvgDashboard = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#e6a817" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="8" /><rect x="10" y="7" width="4" height="13" /><rect x="17" y="3" width="4" height="17" />
    </svg>
  );
  const SvgPlus = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
  const SvgHouse = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" />
    </svg>
  );
  const SvgPeople = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#FF7043" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M16 3.13a4 4 0 010 7.75" /><path d="M21 21v-2a4 4 0 00-3-3.85" />
    </svg>
  );
  const SvgPersonHouse = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#00897b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><circle cx="12" cy="13" r="2.5" />
    </svg>
  );
  const SvgList = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
  const SvgLock = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#3949ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
  const SvgFileDoc = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#00acc1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
  const SvgClipboard = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  );
  const SvgWarning = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#e53935" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
  const SvgBellMenu = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
  const SvgReceipt = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#1976D2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
  const SvgFolder = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#795548" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
  const SvgWrench = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#9e6b2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
  const SvgGrid = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
  const SvgGear = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );

  // ── Helper for sidebar PNG icons ──
  const SideIcon = ({ src }: { src: string }) => (
    <img src={`/Ressource_gestiloc/${src}`} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
  );

  // ── Menu sections ──
  const menuSections = [
    {
      label: 'Menu Principal',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: <SideIcon src="tb_locataire.png" /> },
      ],
    },
    {
      label: 'Gestion des biens',
      items: [
        { id: 'ajouter-bien', label: 'Ajouter un bien', icon: <SideIcon src="Plus Math.png" /> },
        { id: 'mes-biens', label: 'Mes biens', icon: <SideIcon src="Home.png" /> },
      ],
    },
    {
      label: 'Gestion Locative',
      items: [
        { id: 'nouvelle-location', label: 'Nouvelle location', icon: <SideIcon src="Neighborhood.png" /> },
        { id: 'ajouter-locataire', label: 'Ajouter un locataire', icon: <SideIcon src="Person at Home.png" /> },
        { id: 'locataires', label: 'Liste des locataires', icon: <SideIcon src="Edit Property.png" /> },
        { id: 'paiements', label: 'Gestion des paiements', icon: <SideIcon src="Dollar Bag.png" /> },
      ],
    },
    {
      label: 'Documents',
      items: [
        { id: 'baux', label: 'Contrats de bails', icon: <SideIcon src="Profile.png" /> },
        { id: 'etats-lieux', label: 'Etats de lieux', icon: <SideIcon src="US Capitol.png" /> },
        { id: 'avis-echeance', label: "Avis d'échéance", icon: <SideIcon src="Error.png" /> },
        { id: 'quittances', label: 'Quittances de loyers', icon: <SideIcon src="Bell.png" /> },
        { id: 'factures', label: 'Factures et documents divers', icon: <SideIcon src="Signing A Document.png" /> },
        { id: 'archives', label: 'Archivage de documents', icon: <SideIcon src="document.png" /> },
      ],
    },
    {
      label: 'Réparations et Travaux',
      items: [
        { id: 'incidents', label: 'Répartitions et travaux', icon: <SideIcon src="Tools.png" /> },
      ],
    },
    {
      label: 'Comptabilité et Statistiques',
      items: [
        { id: 'comptabilite', label: 'Comptabilité et travaux', icon: <SideIcon src="Accounting.png" /> },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { id: 'parametres', label: 'Paramètres', icon: <SideIcon src="parametre_loc.png" /> },
        { id: 'logout', label: 'Déconnexion', icon: <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> },
      ],
    },
  ];

  const userInitials = user
    ? (`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      'P')
    : 'P';

  const userLabel = user
    ? user.first_name || user.last_name
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user.email
    : 'Propriétaire';

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-[58px] flex items-center justify-between px-4 sm:px-8" style={{
        background: 'linear-gradient(90deg, #4CAF50 0%, #43a047 60%, #388E3C 100%)',
      }}>
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} className="text-white" />
          </button>
          <span style={{
            fontFamily: "'Merriweather', serif",
            fontWeight: 900,
            fontSize: '1.35rem',
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Gestiloc
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="hidden sm:flex items-center gap-2 py-2 px-4 rounded-full text-white text-sm font-semibold transition-all hover:bg-white/30 btn-hover"
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.45)',
              backdropFilter: 'blur(4px)',
              fontFamily: "'Manrope', sans-serif",
              letterSpacing: '0.01em',
            }}
            aria-label="Notifications"
          >
            <img src="/Ressource_gestiloc/Bell.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            Notifications
          </button>
          {/* Notifications mobile */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:bg-white/30 btn-hover"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.45)' }}
            aria-label="Notifications"
          >
            <img src="/Ressource_gestiloc/Bell.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
          </button>

          {/* Aide */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="hidden sm:flex items-center gap-2 py-2 px-4 rounded-full text-white text-sm font-semibold transition-all hover:bg-white/30 btn-hover"
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.45)',
              backdropFilter: 'blur(4px)',
              fontFamily: "'Manrope', sans-serif",
              letterSpacing: '0.01em',
            }}
            aria-label="Aide"
          >
            <img src="/Ressource_gestiloc/question_mark.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            Aide
          </button>
          {/* Aide mobile */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:bg-white/30 btn-hover"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.45)' }}
            aria-label="Aide"
          >
            <img src="/Ressource_gestiloc/question_mark.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
          </button>

          {/* Mon compte */}
          <button
            onClick={() => handlePageChange('profil')}
            className="hidden sm:flex items-center gap-2 py-2 px-4 rounded-full text-white text-sm font-semibold transition-all hover:bg-white/30 btn-hover"
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.45)',
              backdropFilter: 'blur(4px)',
              fontFamily: "'Manrope', sans-serif",
              letterSpacing: '0.01em',
            }}
            aria-label="Mon compte"
          >
            <img src="/Ressource_gestiloc/customer.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            Mon compte
          </button>
          {/* Mon compte mobile */}
          <button
            onClick={() => handlePageChange('profil')}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:bg-white/30 btn-hover"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.45)' }}
            aria-label="Mon compte"
          >
            <img src="/Ressource_gestiloc/customer.png" alt="" style={{ width: 17, height: 17, objectFit: 'contain' }} />
          </button>
        </div>
      </header>

      {/* Mobile Backdrop - HORS du conteneur relative */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[270px] z-[100]
          flex flex-col
          transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[260px] lg:top-[58px] lg:h-[calc(100vh-58px)] lg:z-40'}
        `}
        style={{
          background: '#fff',
          boxShadow: '0px 5px 8.6px 0px rgba(131, 199, 87, 1)',
          borderRadius: isMobileMenuOpen ? '0' : '0 14px 14px 0',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        {/* Mobile Header with Close */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200" style={{ background: 'linear-gradient(90deg, #4CAF50 0%, #43a047 60%, #388E3C 100%)' }}>
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Menu sections */}
        <nav className="flex-1 overflow-y-auto py-3">
          {menuSections.map((section, si) => (
            <div key={section.label} className={`menu-section-enter animate-delay-${si * 100}`}>
              {/* Section label */}
              <div style={{
                fontSize: '0.67rem',
                fontWeight: 700,
                letterSpacing: '0.10em',
                color: '#999',
                textTransform: 'uppercase',
                padding: si === 0 ? '0.2rem 1.3rem 0.35rem' : '0.9rem 1.3rem 0.35rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {section.label}
              </div>
              {/* Section items */}
              {section.items.map((item, ii) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.id === 'logout' ? onLogout() : handleNavigate(item.id as Tab)}
                    className={`menu-item menu-item-enter animate-delay-${(si * 100) + (ii * 50)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      padding: '0.55rem 1.3rem',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#4CAF50' : '#2d2d2d',
                      cursor: 'pointer',
                      background: isActive ? '#f5f0e8' : 'transparent',
                      borderRadius: isActive ? '8px' : '0',
                      margin: isActive ? '0 0.6rem' : '0',
                      border: 'none',
                      width: isActive ? 'calc(100% - 1.2rem)' : '100%',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                      fontFamily: "'Manrope', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#f4faf4';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>


      </aside>

      {/* CONTENU PRINCIPAL - IDENTIQUE au locataire */}
      <div className="flex flex-1 h-[calc(100vh-58px)] relative pt-[58px]">
        {/* Toasts */}
        <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col ml-0 lg:ml-[260px] h-full overflow-hidden z-0 relative">
          {/* Content */}
          <div id="app-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 scroll-smooth">
            <div className="p-4 sm:p-6 pt-6 sm:pt-8 max-w-7xl mx-auto">
              <AnimatedPage animation="fadeInUp" delay={100}>
                {children}
              </AnimatedPage>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications Dropdown - Adaptive position and size */}
      {showNotifications && (
        <div className="fixed inset-0 sm:inset-auto sm:top-20 sm:right-6 sm:w-96 bg-white sm:rounded-xl shadow-2xl border-t sm:border border-gray-200 z-[110] flex flex-col h-full sm:h-auto dropdown-enter">
          <div className="p-4 border-b border-gray-200 flex flex-shrink-0 items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 font-merriweather">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors btn-hover"
              aria-label="Fermer"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {notifications.map((notif, idx) => (
              <div key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 active:bg-gray-100 menu-item-enter animate-delay-${idx * 100}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} />
                  <div className="flex-1">
                    <p className="text-[0.9rem] font-bold text-gray-900 leading-tight">{notif.message}</p>
                    {notif.subtext && <p className="text-[0.85rem] text-gray-600 mt-1 leading-relaxed">{notif.subtext}</p>}
                    <p className="text-[0.75rem] text-gray-400 mt-2 font-medium uppercase tracking-wider">Il y a {notif.type === 'critical' ? '2 heures' : '1 jour'}</p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-400 font-medium">Aucune notification</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm text-green-600 hover:text-green-700 font-bold shadow-sm transition-all active:scale-[0.98] btn-hover">
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}

      {/* Help Dropdown - Adaptive position and size */}
      {showHelp && (
        <div className="fixed inset-0 sm:inset-auto sm:top-20 sm:right-6 sm:w-96 bg-white sm:rounded-xl shadow-2xl border-t sm:border border-gray-200 z-[110] flex flex-col h-full sm:h-auto dropdown-enter">
          <div className="p-4 border-b border-gray-200 flex flex-shrink-0 items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 font-merriweather">Aide & Support</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors btn-hover"
              aria-label="Fermer"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {[
              { title: 'Guide de démarrage', desc: 'Apprenez les bases de GestiLoc', color: 'bg-green-500' },
              { title: "Centre d'aide complet", desc: 'Accédez à tous nos guides', color: 'bg-blue-500' },
              { title: 'Contactez le support', desc: 'Notre équipe est là pour vous aider', color: 'bg-purple-500' },
            ].map((help, idx) => (
              <div key={idx} className={`p-4 m-1 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100 active:bg-gray-100 menu-item-enter animate-delay-${idx * 100}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 ${help.color} rounded-full mt-2 flex-shrink-0 shadow-lg`} />
                  <div className="flex-1">
                    <p className="text-[0.95rem] font-bold text-gray-900">{help.title}</p>
                    <p className="text-[0.85rem] text-gray-600 mt-1">{help.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 mt-1" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm text-green-600 hover:text-green-700 font-bold shadow-sm transition-all active:scale-[0.98] btn-hover"
            >
              Consulter toute l'aide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};