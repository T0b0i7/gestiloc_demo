import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LogOut,
  Bell,
  HelpCircle,
  UserPlus,
  Eye,
  Handshake,
  TrendingUp,
} from 'lucide-react';
import { Tab, ToastMessage } from '../types';
import { Toast } from './ui/Toast';
import { AnimatedPage } from './AnimatedPage';
import '../../Proprietaire/animations.css';

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

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  toasts,
  removeToast,
  onLogout,
  isDarkMode,
  toggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Impossible de lire user depuis localStorage", e);
    }
  }, []);

  const ownerName = user
    ? user.first_name || user.last_name
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user.email
    : 'Co-propriétaire';

  const ownerInitials = user
    ? (`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      'C')
    : 'C';

  const handleNavigate = (tab: Tab) => {
    onNavigate(tab);
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
  const SvgFileDoc = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#00acc1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
  const SvgClipboard = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#7b1fa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    </svg>
  );
  const SvgWallet = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#ffa726" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 010-4h14v4" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="16" x2="21" y2="16" /><line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
  const SvgCalculator = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#546e7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="16" y2="14" /><line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
  const SvgSettings = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#607d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24 4.24M7.78 7.78L3.54 3.54" />
    </svg>
  );
  const SvgLogout = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  // ── Composant icône personnalisée ──
  const SideIcon: React.FC<{ src: string; alt?: string }> = ({ src, alt = '' }) => (
    <img
      src={`/Ressource_gestiloc/${src}`}
      alt={alt}
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  );

  const menuSections = [
    {
      label: 'Tableau de bord',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <SideIcon src="tb_locataire.png" /> },
      ],
    },
    {
      label: 'Délégations',
      items: [
        { id: 'delegations', label: 'Gestion des délégations', icon: <Handshake size={18} color="#4CAF50" /> },
        { id: 'audit', label: 'Audit des délégations', icon: <Eye size={18} color="#FF9800" /> },
        { id: 'inviter-proprietaire', label: 'Inviter un propriétaire', icon: <UserPlus size={18} color="#2196F3" /> },
      ],
    },
    {
      label: 'Biens délégués',
      items: [
        { id: 'biens', label: 'Mes biens délégués', icon: <SideIcon src="Home.png" /> },
      ],
    },
    {
      label: 'Gestion locative',
      items: [
        { id: 'locataires', label: 'Locataires', icon: <SvgPeople /> },
        { id: 'baux', label: 'Contrats de bails', icon: <SvgFileDoc /> },
        { id: 'quittances', label: 'Quittances', icon: <SvgClipboard /> },
      ],
    },
    {
      label: 'Finances',
      items: [
        { id: 'finances', label: 'Finances', icon: <SvgWallet /> },
        { id: 'emettre-paiement', label: 'Émettre un paiement', icon: <TrendingUp size={18} color="#4CAF50" /> },
        { id: 'retrait-methode', label: 'Méthodes de retrait', icon: <SvgCalculator /> },
      ],
    },
    {
      label: 'Documents',
      items: [
        { id: 'documents', label: 'Documents', icon: <SvgFileDoc /> },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { id: 'profile', label: 'Mon profil', icon: <SvgPersonHouse /> },
        { id: 'parametres', label: 'Paramètres', icon: <SvgSettings /> },
        { id: 'logout', label: 'Déconnexion', icon: <SvgLogout /> },
      ],
    },
  ];

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
            onClick={() => handleNavigate('profile')}
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
            <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold text-white">
              {ownerInitials}
            </div>
            {ownerName}
          </button>
          {/* Mon compte mobile */}
          <button
            onClick={() => handleNavigate('profile')}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:bg-white/30 btn-hover"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.45)' }}
            aria-label="Mon compte"
          >
            <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold text-white">
              {ownerInitials}
            </div>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 h-[calc(100vh-58px)] relative pt-[58px]">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-gray-200 fixed left-0 top-[58px] bottom-0 overflow-hidden z-[50]">
          

          {/* Menu sections */}
          <nav className="flex-1 overflow-y-auto py-3">
            {menuSections.map((section, si) => (
              <div key={section.label} className={`menu-section-enter animate-delay-${si * 100}`}>
                {/* Section label */}
                <div className="px-5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 first:pt-2 first:pb-1 pt-4">
                  {section.label}
                </div>
                {/* Section items */}
                {section.items.map((item, ii) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.id === 'logout' ? onLogout() : handleNavigate(item.id as Tab)}
                      className={`
                        menu-item menu-item-enter animate-delay-${(si * 100) + (ii * 50)}
                        w-full flex items-center px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 group cursor-pointer
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#4CAF50] to-[#43a047] text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-[#4CAF50]/10 hover:text-[#4CAF50] hover:translate-x-1'
                        }
                        mb-1
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-left whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 lg:ml-[260px] bg-gray-50">
          <div id="app-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 scroll-smooth">
            <div className="p-4 sm:p-6 pt-6 sm:pt-8 max-w-7xl mx-auto">
              <AnimatedPage animation="fadeInUp" delay={100}>
                {children}
              </AnimatedPage>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="relative w-[280px] max-w-[85vw] bg-white shadow-xl">
            {/* Menu header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between" style={{
              background: 'linear-gradient(90deg, #4CAF50 0%, #43a047 60%, #388E3C 100%)',
            }}>
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
            <nav className="flex-1 overflow-y-auto py-3 max-h-[calc(100vh-120px)]">
              {menuSections.map((section, si) => (
                <div key={section.label} className={`menu-section-enter animate-delay-${si * 100}`}>
                  {/* Section label */}
                  <div className="px-5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 first:pt-2 first:pb-1 pt-4">
                    {section.label}
                  </div>
                  {/* Section items */}
                  {section.items.map((item, ii) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'logout') {
                            onLogout();
                          } else {
                            handleNavigate(item.id as Tab);
                          }
                        }}
                        className={`
                          menu-item menu-item-enter animate-delay-${(si * 100) + (ii * 50)}
                          w-full flex items-center px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 group cursor-pointer
                          ${isActive 
                            ? 'bg-gradient-to-r from-[#4CAF50] to-[#43a047] text-white shadow-lg' 
                            : 'text-gray-700 hover:bg-[#4CAF50]/10 hover:text-[#4CAF50] hover:translate-x-1'
                          }
                          mb-1
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="text-left whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="fixed bottom-4 right-4 z-[300] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};
