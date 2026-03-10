import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Bell,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { Tab, ToastMessage } from '../types';
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

const CONFIG = {
  LARAVEL_URL: 'http://localhost:8000',
  REACT_URL: 'http://localhost:8080',
  LOGIN_URL: '/login',
  LOGOUT_URL: '/logout',
};

// ─── ICÔNES SVG IDENTIQUES AU CO-PROPRIÉTAIRE ───────────────────────
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
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#8CCC63")}>
      <path d="M16 21v-2a4 4 0 00-3-3.87" /><path d="M8 21v-2a4 4 0 014-4h1" /><circle cx="12" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  House: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#FF9800")}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" />
    </svg>
  ),
  File: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#529D21")}>
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
  Settings: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#607d8b")}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  LogOut: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#aaa")}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Chevron: ({ open, c }: { open?: boolean; c?: string }) => (
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
  UserPlus: "#8CCC63",
  House: "#FF9800",
  File: "#529D21",
  Clipboard: "#7b1fa2",
  Wallet: "#ffa726",
  TrendingUp: "#4CAF50",
  Settings: "#607d8b",
  LogOut: "#aaa",
};

const TEXT_GREEN = "#529D21";
const GRADIENT_GREEN = "linear-gradient(94.5deg, #8CCC63 5.47%, rgba(82, 157, 33, 0.87) 91.93%)";

// ─── MENU SECTIONS — routes propriétaire + section gestionnaires ─────
const menuSections = [
  {
    title: "Menu principal",
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: "Dashboard" as keyof typeof Icons, path: "/proprietaire/dashboard", isReact: true },
    ]
  },
  {
    title: "GESTION DES BIENS",
    items: [
      { id: "ajouter-bien", label: "Ajouter un bien", icon: "UserPlus" as keyof typeof Icons, path: "/proprietaire/ajouter-bien", isReact: true },
      { id: "mes-biens", label: "Mes biens", icon: "House" as keyof typeof Icons, path: "/proprietaire/mes-biens", isReact: true },
    ]
  },
  {
    title: "GESTION LOCATIVE",
    items: [
      { id: "nouvelle-location", label: "Nouvelle location", icon: "Handshake" as keyof typeof Icons, path: "/proprietaire/nouvelle-location", isReact: true },
      { id: "ajouter-locataire", label: "Ajouter un locataire", icon: "UserPlus" as keyof typeof Icons, path: "/proprietaire/ajouter-locataire", isReact: true },
      { id: "locataires", label: "Liste des locataires", icon: "People" as keyof typeof Icons, path: "/proprietaire/locataires", isReact: true },
      { id: "paiements", label: "Gestion des paiements", icon: "Wallet" as keyof typeof Icons, path: "/proprietaire/paiements", isReact: true },
    ]
  },
  {
    title: "DOCUMENTS",
    items: [
      { id: "baux", label: "Contrats de bail", icon: "File" as keyof typeof Icons, path: "/proprietaire/baux", isReact: true },
      { id: "etats-lieux", label: "Etats de lieux", icon: "Clipboard" as keyof typeof Icons, path: "/proprietaire/etats-lieux", isReact: true },
      { id: "avis-echeance", label: "Avis d'échéance", icon: "File" as keyof typeof Icons, path: "/proprietaire/avis-echeance", isReact: true },
      { id: "quittances", label: "Quittances de loyers", icon: "Clipboard" as keyof typeof Icons, path: "/proprietaire/quittances", isReact: true },
      { id: "factures", label: "Factures et documents divers", icon: "File" as keyof typeof Icons, path: "/proprietaire/factures", isReact: true },
      { id: "archives", label: "Archivage de documents", icon: "File" as keyof typeof Icons, path: "/proprietaire/archives", isReact: true },
    ]
  },
  {
    title: "REPARATIONS ET TRAVAUX",
    items: [
      { id: "incidents", label: "Réparations et travaux", icon: "Handshake" as keyof typeof Icons, path: "/proprietaire/incidents", isReact: true },
    ]
  },
  {
    title: "COMPTABILITE ET STATISTIQUES",
    items: [
      { id: "comptabilite", label: "Comptabilité et statistiques", icon: "TrendingUp" as keyof typeof Icons, path: "/proprietaire/comptabilite", isReact: true },
    ]
  },
  {
    title: "GESTION DES GESTIONNAIRES",
    items: [
      { id: "coproprietaires", label: "Liste des gestionnaires", icon: "People" as keyof typeof Icons, path: "/proprietaire/coproprietaires", isReact: true },
      { id: "inviter-coproprietaire", label: "Inviter un gestionnaire", icon: "UserPlus" as keyof typeof Icons, path: "/proprietaire/inviter-coproprietaire", isReact: true },
    ]
  },
  {
    title: "CONFIGURATION",
    items: [
      { id: "parametres", label: "Paramètres", icon: "Settings" as keyof typeof Icons, path: "/proprietaire/parametres", isReact: true },
      { id: "logout", label: "Déconnexion", icon: "LogOut" as keyof typeof Icons, path: "", isLogout: true },
    ]
  }
];

// ─── NAVIGATION HELPERS ──────────────────────────────────────────────
const getToken = () => {
  let t = localStorage.getItem('token');
  if (t) return t;
  t = new URLSearchParams(window.location.search).get('api_token');
  if (t) { localStorage.setItem('token', t); return t; }
  return sessionStorage.getItem('token');
};

const goToReact = (path: string) => {
  const token = getToken();
  if (!token) { window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`; return; }
  const sep = path.includes('?') ? '&' : '?';
  window.location.href = `${CONFIG.REACT_URL}${path.startsWith('/') ? path : '/' + path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
};

const navigateTo = (path: string, onNavigate: (tab: Tab) => void) => {
  // Chemin absolu React interne → on utilise le router
  const stripped = path.replace('/proprietaire/', '');
  onNavigate(stripped as Tab);
};

// ─── NAV ITEM ────────────────────────────────────────────────────────
const NavItem: React.FC<{
  item: any;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  onLogout: () => void;
  isExpanded: boolean;
  toggleMenu: (id: string) => void;
}> = ({ item, activeTab, onNavigate, onLogout, isExpanded, toggleMenu }) => {
  const [hovered, setHovered] = useState(false);

  const hasSubmenu = false;
  const isActive = activeTab === item.id;
  const Ico = Icons[item.icon as keyof typeof Icons];

  const handleClick = () => {
    if (hasSubmenu) {
      toggleMenu(item.id);
    } else if (item.isLogout) {
      onLogout();
    } else if (item.isReact) {
      navigateTo(item.path, onNavigate);
    } else {
      onNavigate(item.id as Tab);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full relative flex items-center gap-3 px-6 py-3 transition-all duration-300"
        style={{
          background: isActive && !hasSubmenu
            ? 'linear-gradient(90deg, rgba(255, 213, 124, 0.87) 0%, #FFFFFF 100%)'
            : 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '12px',
          marginBottom: '2px',
        }}
      >
        {isActive && !hasSubmenu && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[30px] bg-[#FFB300] rounded-r-full shadow-[0px_0px_10px_rgba(255,179,0,0.4)]" />
        )}

        <div className={`transition-all duration-300 ${isActive || hovered ? 'scale-110' : 'scale-100 opacity-60'}`}>
          {Ico ? (
            <Ico
              c={
                item.isLogout
                  ? hovered ? "#e53935" : "#aaa"
                  : isActive
                    ? TEXT_GREEN
                    : iconColors[item.icon] || "#888"
              }
            />
          ) : null}
        </div>

        <span
          className="text-[0.9rem] font-bold whitespace-nowrap transition-colors duration-300"
          style={{ color: (isActive || hovered) && !item.isLogout ? TEXT_GREEN : '#6B7280' }}
        >
          {item.label}
        </span>

        {hasSubmenu ? (
          <div className="ml-auto">
            <Icons.Chevron open={isExpanded} c={isActive ? TEXT_GREEN : "#bbb"} />
          </div>
        ) : isActive ? (
          <div className="ml-auto">
            <ChevronRight size={14} color="#529D21" />
          </div>
        ) : null}
      </button>

      {hasSubmenu && isExpanded && (
        <div className="ml-10 pl-4 border-l-2 border-slate-100 mt-1 mb-2 space-y-1">
          {item.submenu.map((sub: any) => {
            const SubIco = Icons[sub.icon as keyof typeof Icons];
            const subActive = activeTab === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => navigateTo(sub.path, onNavigate)}
                className="w-full relative flex items-center gap-3 px-3 py-2 transition-all duration-300"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: subActive ? 700 : 500,
                  color: subActive ? TEXT_GREEN : "#666",
                  background: subActive ? 'linear-gradient(90deg, rgba(255,213,124,0.4) 0%, #FFFFFF 100%)' : 'transparent',
                  borderRadius: 10,
                  textAlign: "left",
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {subActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#FFB300] rounded-r-full" />
                )}
                <span className="scale-90 opacity-70">
                  {SubIco ? <SubIco c={subActive ? TEXT_GREEN : "#aaa"} /> : null}
                </span>
                <span className="truncate">{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── SIDEBAR CONTENT ─────────────────────────────────────────────────
const SidebarContent: React.FC<{
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  onLogout: () => void;
  expandedMenus: string[];
  toggleMenu: (id: string) => void;
  user: UserData | null;
}> = ({ activeTab, onNavigate, onLogout, expandedMenus, toggleMenu, user }) => {
  const ownerInitials = React.useMemo(() => {
    if (!user) return "P";
    const a = (user.first_name?.[0] || user.email?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    return `${a}${b}`.trim() || "P";
  }, [user]);

  const ownerName = React.useMemo(() => {
    if (!user) return "Propriétaire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "Propriétaire";
  }, [user]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div
        className="flex-1 overflow-y-auto py-6 px-3 sidebar-scroll scrollbar-hide"
      >
        <style>{`
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#BDBDBD',
              padding: '1.2rem 1.4rem 0.6rem',
              textAlign: 'left',
              fontFamily: "'Merriweather', serif",
              lineHeight: '100%',
              textTransform: 'uppercase',
            }}>
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  onNavigate={onNavigate}
                  onLogout={onLogout}
                  isExpanded={
                    expandedMenus.includes(item.id) ||
                    activeTab === item.id
                  }
                  toggleMenu={toggleMenu}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer profil */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(to right, #70AE48, #8BC34A)' }}
          >
            {ownerInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{ownerName}</div>
            <div className="text-xs text-gray-500">Propriétaire</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── LAYOUT PRINCIPAL ────────────────────────────────────────────────
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [notifs, setNotifs] = useState([
    { id: '1', type: 'critical', message: 'Loyer novembre en retard', subtext: 'Régularisez avant pénalités', isRead: false, time: '2 heures' },
    { id: '2', type: 'important', message: 'Intervention confirmée', subtext: '22/11 - 14h-16h', isRead: false, time: '1 jour' },
  ]);

  const notifCount = notifs.filter(n => !n.isRead).length;

  const markAllAsRead = () => setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));

  const removeNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const handlePageChange = (page: string) => {
    if (page.startsWith('/')) {
      window.location.href = page;
      return;
    }
    onNavigate(page as Tab);
    setShowNotifications(false);
    setShowHelp(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error('Impossible de lire user depuis localStorage', e);
    }
  }, []);

  const handleNavigate = (tab: Tab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowHelp(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = (id: string) =>
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
  }, [isMobileMenuOpen]);

  return (
    <div
      className="min-h-screen h-screen w-screen overflow-hidden flex flex-col"
      style={{ background: '#fff', fontFamily: "'Merriweather', serif" }}
    >
      {/* ── HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-between px-6 sm:px-12"
        style={{ background: GRADIENT_GREEN }}
      >
        {/* Logo + burger */}
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
            fontSize: '1.85rem',
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Gestiloc
          </span>
        </div>

        {/* Boutons header */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); }}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20 relative"
            style={{ background: 'rgba(255,255,255,0.4)', border: 'none', backdropFilter: 'blur(8px)' }}
          >
            <Bell size={18} fill="#FFC107" stroke="#FFC107" />
            <span className="hidden sm:inline">Notifications</span>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#8CCC63]">
                {notifCount}
              </span>
            )}
          </button>

          {/* Aide */}
          <button
            onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); }}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.4)', border: 'none', backdropFilter: 'blur(8px)' }}
          >
            <HelpCircle size={18} />
            <span className="hidden sm:inline">Aide</span>
          </button>

          {/* Mon compte */}
          <button
            onClick={() => handleNavigate('profil' as Tab)}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.4)', border: 'none', backdropFilter: 'blur(8px)' }}
          >
            <img
              src="/Ressource_gestiloc/customer.png"
              alt="Mon compte"
              className="w-6 h-6 rounded-full object-cover shadow-sm bg-white"
            />
            <span className="hidden sm:inline">Mon compte</span>
          </button>
        </div>
      </header>

      {/* ── ZONE PRINCIPALE ── */}
      <div className="flex flex-1 h-[calc(100vh-72px)] relative pt-[72px]">
        {/* Backdrop mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside
          className={`
            fixed h-auto z-[120] bg-white flex flex-col
            transition-all duration-300 ease-in-out
            ${isMobileMenuOpen
              ? 'translate-x-0 bottom-0 top-0 left-0 w-[280px]'
              : '-translate-x-full lg:translate-x-0 lg:left-[30px] lg:top-[100px] lg:w-[310px]'
            }
          `}
          style={
            !isMobileMenuOpen
              ? {
                borderRadius: '24px',
                boxShadow: '0px 0px 20px rgba(0,0,0,0.05), 0px 5px 25px rgba(112,174,72,0.15)',
                maxHeight: 'calc(100vh - 140px)',
                overflow: 'hidden',
              }
              : {
                boxShadow: '10px 0px 30px rgba(0,0,0,0.1)',
              }
          }
        >
          {/* Bouton fermeture mobile */}
          {isMobileMenuOpen && (
            <div
              className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden"
              style={{ background: GRADIENT_GREEN }}
            >
              <span style={{ fontFamily: "'Merriweather', serif", fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
          )}

          <SidebarContent
            activeTab={activeTab}
            onNavigate={handleNavigate}
            onLogout={onLogout}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
            user={user}
          />
        </aside>

        {/* ── CONTENU ── */}
        <div className="flex-1 lg:ml-[390px] bg-white">
          <div
            id="app-scroll-container"
            className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-white scroll-smooth"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
          >
            <div className="p-4 sm:p-12 max-w-7xl mx-auto">
              <AnimatedPage animation="fadeInUp" delay={100}>
                {children}
              </AnimatedPage>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOASTS ── */}
      <div className="fixed bottom-4 right-4 z-[300] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>

      {/* ── NOTIFICATIONS DROPDOWN ── */}
      {showNotifications && (
        <div className="fixed inset-0 sm:inset-auto sm:top-20 sm:right-6 sm:w-96 bg-white sm:rounded-xl shadow-2xl border-t sm:border border-gray-200 z-[110] flex flex-col h-full sm:h-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Merriweather', serif" }}>
              Notifications
            </h3>
            <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {notifs.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 relative group"
                onClick={() => setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}>
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-gray-300' : notif.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} />
                  <div className="flex-1">
                    <p className={`text-[0.9rem] leading-tight ${notif.isRead ? 'text-gray-500 font-medium' : 'text-gray-900 font-bold'}`}>{notif.message}</p>
                    <p className="text-[0.85rem] text-gray-600 mt-1">{notif.subtext}</p>
                    <p className="text-[0.75rem] text-gray-400 mt-2 font-medium uppercase tracking-wider">Il y a {notif.time}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => removeNotif(notif.id, e)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
            {notifs.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-400 font-medium">Aucune notification</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <button onClick={markAllAsRead} className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-800 font-bold shadow-sm transition-all">
              Tout marquer lu
            </button>
          </div>
        </div>
      )}

      {/* ── AIDE DROPDOWN ── */}
      {showHelp && (
        <div className="fixed inset-0 sm:inset-auto sm:top-20 sm:right-6 sm:w-96 bg-white sm:rounded-xl shadow-2xl border-t sm:border border-gray-200 z-[110] flex flex-col h-full sm:h-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Merriweather', serif" }}>
              Aide & Support
            </h3>
            <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {[
              { title: 'Guide de démarrage', desc: 'Apprenez les bases de GestiLoc', color: 'bg-green-500', route: '/help' },
              { title: "Centre d'aide complet", desc: 'Accédez à tous nos guides', color: 'bg-blue-500', route: '/help' },
              { title: 'Contactez le support', desc: 'Notre équipe est là pour vous aider', color: 'bg-purple-500', route: '/contact' },
            ].map((help, idx) => (
              <div key={idx} onClick={() => handlePageChange(help.route)} className="p-4 m-1 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100">
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
            <button onClick={() => handlePageChange('/help')} className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold transition-all"
              style={{ color: TEXT_GREEN }}>
              Consulter toute l'aide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;