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
  AlertTriangle,
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

// ─── COMPOSANTS DU NOUVEAU DESIGN HARMONISÉ ───────────────────
const ic = (c: string) => ({ stroke: c, fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const Icons = {
  Dashboard: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={c || "#e6a817"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="8" /><rect x="10" y="7" width="4" height="13" /><rect x="17" y="3" width="4" height="17" />
    </svg>
  ),
  People: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#FF7043")}>
      <circle cx="9" cy="7" r="3" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M16 3.13a4 4 0 010 7.75" /><path d="M21 21v-2a4 4 0 00-3-3.85" />
    </svg>
  ),
  PersonHouse: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#00897b")}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><circle cx="12" cy="13" r="2.5" />
    </svg>
  ),
  Handshake: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#4CAF50")}>
      <path d="M17 11h1a3 3 0 010 6h-1" /><path d="M9 12c.66 0 1.33.16 2 .5a5.1 5.1 0 012.5-1.5" /><path d="M6 11H5a3 3 0 000 6h1" /><path d="M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
    </svg>
  ),
  Eye: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#FF9800")}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  UserPlus: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#2196F3")}>
      <path d="M16 21v-2a4 4 0 00-3-3.87" /><path d="M8 21v-2a4 4 0 014-4h1" /><circle cx="12" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  House: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#FF9800")}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" />
    </svg>
  ),
  File: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#00acc1")}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  Clipboard: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#7b1fa2")}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  ),
  Wallet: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#ffa726")}>
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  TrendingUp: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#4CAF50")}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Calculator: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#546e7a")}>
      <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="14.01" /><line x1="12" y1="14" x2="12" y2="14.01" /><line x1="8" y1="14" x2="8" y2="14.01" /><line x1="16" y1="18" x2="16" y2="18.01" /><line x1="12" y1="18" x2="12" y2="18.01" /><line x1="8" y1="18" x2="8" y2="18.01" />
    </svg>
  ),
  Settings: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#607d8b")}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  LogOut: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#aaa")}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Chevron: ({ open, c }: { open?: boolean, c?: string }) => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={c || "#bbb"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginLeft: "auto", transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

const iconColors: Record<string, string> = {
  Dashboard: "#e6a817",
  People: "#FF7043",
  PersonHouse: "#00897b",
  Handshake: "#4CAF50",
  Eye: "#FF9800",
  UserPlus: "#2196F3",
  House: "#FF9800",
  File: "#00acc1",
  Clipboard: "#7b1fa2",
  Wallet: "#ffa726",
  TrendingUp: "#4CAF50",
  Calculator: "#546e7a",
  Settings: "#607d8b",
  LogOut: "#aaa",
};

const menuSections = [
  {
    label: "Menu Principal",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "Dashboard" as keyof typeof Icons, submenu: [] },
    ],
  },
  {
    label: "Délégations",
    items: [
      { id: "delegations", label: "Gestion des délégations", icon: "Handshake" as keyof typeof Icons, submenu: [] },
      { id: "audit", label: "Audit des délégations", icon: "Eye" as keyof typeof Icons, submenu: [] },
      { id: "inviter-proprietaire", label: "Inviter un propriétaire", icon: "UserPlus" as keyof typeof Icons, submenu: [] },
    ],
  },
  {
    label: "Biens délégués",
    items: [
      { id: "biens", label: "Mes biens délégués", icon: "House" as keyof typeof Icons, submenu: [] },
    ],
  },
  {
    label: "Gestion locative",
    items: [
      { id: "locataires", label: "Locataires", icon: "People" as keyof typeof Icons, submenu: [] },
      { id: "baux", label: "Contrats de bails", icon: "File" as keyof typeof Icons, submenu: [] },
      { id: "quittances", label: "Quittances", icon: "Clipboard" as keyof typeof Icons, submenu: [] },
    ],
  },
  {
    label: "Documents & Finance",
    items: [
      { id: "documents", label: "Tous les Documents", icon: "File" as keyof typeof Icons, submenu: [] },
      { id: "finances", label: "Gestion Finances", icon: "Wallet" as keyof typeof Icons, submenu: [] },
      { id: "emettre-paiement", label: "Émettre un paiement", icon: "TrendingUp" as keyof typeof Icons, submenu: [] },
      { id: "retrait-methode", label: "Méthodes de retrait", icon: "Calculator" as keyof typeof Icons, submenu: [] },
    ],
  },
  {
    label: "Configuration",
    items: [
      { id: "parametres", label: "Paramètres", icon: "Settings" as keyof typeof Icons, submenu: [] },
      { id: "logout", label: "Déconnexion", icon: "LogOut" as keyof typeof Icons, submenu: [], isLogout: true },
    ],
  },
];

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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

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

  const toggleMenu = (id: string) =>
    setExpandedMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const ACTIVE_BG = "linear-gradient(90deg, rgba(255, 213, 124, 0.45) 0%, rgba(255, 255, 255, 0) 100%)";
  const ACTIVE_BAR = "#FFB300";

  const NavItem = ({ item }: { item: any }) => {
    const [hovered, setHovered] = useState(false);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = activeTab === item.id || (item.submenu && item.submenu.some((s: any) => s.id === activeTab));
    const isExpanded = expandedMenus.includes(item.id) || isActive;
    const Ico = Icons[item.icon as keyof typeof Icons];

    const iconC = item.isLogout ? (hovered ? "#e53935" : "#aaa") : isActive ? "#4CAF50" : iconColors[item.icon as keyof typeof iconColors] || "#888";
    const textC = item.isLogout ? (hovered ? "#e53935" : "#666") : isActive ? "#4CAF50" : "#444";
    const bg = item.isLogout
      ? (hovered ? "#fff5f5" : "transparent")
      : isActive && !hasSubmenu ? ACTIVE_BG : hovered ? "#f6fdf6" : "transparent";

    return (
      <div className="w-full">
        <button
          onClick={() => {
            if (hasSubmenu) {
              toggleMenu(item.id);
            } else if (item.isLogout) {
              onLogout();
            } else {
              handleNavigate(item.id as Tab);
            }
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex items-center gap-3 px-6 py-3.5 w-full transition-all duration-200"
          style={{
            background: bg,
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "0.88rem",
            fontWeight: isActive ? 700 : 600,
            color: textC,
          }}
        >
          {isActive && !hasSubmenu && (
            <span style={{
              position: "absolute", left: 0, top: "20%", bottom: "20%",
              width: 4, borderRadius: "0 4px 4px 0", background: ACTIVE_BAR,
              boxShadow: "0 0 10px rgba(255, 179, 0, 0.5)"
            }} />
          )}
          <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {Ico ? <Ico c={iconC} /> : null}
          </span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
          {hasSubmenu && <Icons.Chevron open={isExpanded} />}
        </button>

        {hasSubmenu && isExpanded && (
          <div className="ml-8 pl-4 border-l-2 border-gray-100 mt-1 mb-2 space-y-1">
            {item.submenu.map((sub: any) => {
              const isSubActive = activeTab === sub.id;
              const SubIco = Icons[sub.icon as keyof typeof Icons];
              return (
                <button
                  key={sub.id}
                  onClick={() => handleNavigate(sub.id as Tab)}
                  className="relative flex items-center gap-3 px-3 py-2.5 w-full transition-all duration-150"
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: isSubActive ? 700 : 500,
                    color: isSubActive ? "#4CAF50" : "#555",
                    background: isSubActive ? ACTIVE_BG : "transparent",
                    borderRadius: 10,
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {isSubActive && (
                    <span style={{
                      position: "absolute", left: 0, top: "15%", bottom: "15%",
                      width: 2, borderRadius: 99, background: ACTIVE_BAR,
                    }} />
                  )}
                  <span style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {SubIco ? <SubIco c={isSubActive ? "#4CAF50" : iconColors[sub.icon as keyof typeof iconColors] || "#888"} /> : null}
                  </span>
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto py-6 px-3 sidebar-scroll scrollbar-hide">
        <style>{`
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        {menuSections.map((section) => (
          <div key={section.label} className="mb-4">
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#bbb',
              textTransform: 'uppercase',
              padding: '0 1.5rem 0.5rem',
              whiteSpace: 'nowrap'
            }}>
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-gray-100 p-4">
        <div
          onClick={() => handleNavigate('profile')}
          className="group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-green-50"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#388E3C] flex items-center justify-center text-white font-extrabold shadow-md group-hover:scale-105 transition-transform">
            {ownerInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate">{ownerName}</p>
            <p className="text-[0.65rem] text-[#4CAF50] font-bold uppercase tracking-wider">Co-propriétaire</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-between px-6 sm:px-12" style={{
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Merriweather', serif" }}>
            Gestiloc
          </h1>
        </div>

        {/* Right: action buttons with pill style */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} fill="#FFC107" stroke="#FFC107" />
            <span className="hidden sm:inline">Notifications</span>
          </button>

          {/* Aide */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Aide"
          >
            <HelpCircle size={18} />
            <span className="hidden sm:inline">Aide</span>
          </button>

          {/* Mon compte */}
          <button
            onClick={() => handleNavigate('profile')}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Mon compte"
          >
            <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold text-white">
              {ownerInitials}
            </div>
            <span className="hidden sm:inline">Mon compte</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 h-[calc(100vh-72px)] relative pt-[72px]">
        {/* MOBILE BACKDROP */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed h-auto z-[120]
            bg-white
            flex flex-col
            transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0 bottom-0 top-0 left-0 w-[280px]' : '-translate-x-full lg:translate-x-0 lg:left-[30px] lg:top-[100px] lg:w-[265px]'}
          `}
          style={
            !isMobileMenuOpen ? {
              borderRadius: '24px',
              boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05), 0px 5px 25px rgba(76, 175, 80, 0.15)',
              maxHeight: 'calc(100vh - 140px)',
            } : {
              boxShadow: '10px 0px 30px rgba(0,0,0,0.1)',
            }
          }
        >
          <SidebarContent />
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 lg:ml-[320px] bg-gray-50">
          <div id="app-scroll-container" className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-gray-50 scroll-smooth scrollbar-hide">
            <div className="p-4 sm:p-12 max-w-7xl mx-auto">
              <AnimatedPage animation="fadeInUp" delay={100}>
                {children}
              </AnimatedPage>
            </div>
          </div>
        </div>
      </div>

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

export default Layout;
