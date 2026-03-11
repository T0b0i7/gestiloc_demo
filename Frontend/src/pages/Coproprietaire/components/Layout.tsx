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
  ChevronRight,
  Building,
} from 'lucide-react';
import { Tab, ToastMessage } from '../types';
import { Toast } from './ui/Toast';
import { AnimatedPage } from './AnimatedPage';
import NotificationsModal from './NotificationsModal';
import api from '@/services/api';
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

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  path: string;
  isLaravel?: boolean;
  isReact?: boolean;
  isLogout?: boolean;
  submenu?: MenuItem[];
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

// ─── COMPOSANTS ET CONSTANTES DU DESIGN HARMONISÉ ───────────────────
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
  UserPlus: "#8CCC63",
  House: "#FF9800",
  File: "#529D21",
  Clipboard: "#7b1fa2",
  Wallet: "#ffa726",
  TrendingUp: "#4CAF50",
  Calculator: "#546e7a",
  Settings: "#607d8b",
  LogOut: "#aaa",
};

const ACTIVE_BG = 'linear-gradient(90deg, rgba(140, 204, 99, 0.1) 0%, rgba(255, 255, 255, 0) 100%)';
const TEXT_GREEN = "#529D21";
const GRADIENT_GREEN = "linear-gradient(94.5deg, #8CCC63 5.47%, rgba(82, 157, 33, 0.87) 91.93%)";

// Menu sections avec les icônes adaptées ET les propriétés de navigation conservées
const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "Menu principal",
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: "Dashboard" as keyof typeof Icons, path: "/coproprietaire/dashboard", isReact: true },
    ]
  },
  {
    title: "GESTIONS DES BIENS",
    items: [
      { id: "add-property", label: "Ajouter un bien", icon: "UserPlus" as keyof typeof Icons, path: "/coproprietaire/biens/create", isLaravel: true },
      { id: "my-properties", label: "Mes biens", icon: "House" as keyof typeof Icons, path: "/coproprietaire/biens", isReact: true },
    ]
  },
  {
    title: "GESTION LOCATIVE",
    items: [
      { id: "new-rental", label: "Nouvelle location", icon: "Handshake" as keyof typeof Icons, path: "/coproprietaire/assign-property/create", isLaravel: true },
      { id: "add-tenant", label: "Ajouter un locataire", icon: "UserPlus" as keyof typeof Icons, path: "/coproprietaire/tenants/create", isLaravel: true },
      { id: "tenant-list", label: "Liste des locataires", icon: "People" as keyof typeof Icons, path: "/coproprietaire/tenants", isLaravel: true },
      { id: "payment-management", label: "Gestion des paiements", icon: "Wallet" as keyof typeof Icons, path: "/coproprietaire/paiements", isLaravel: true },
    ]
  },
  {
    title: "DOCUMENTS",
    items: [
      { id: "lease-contracts", label: "Contrats de bail", icon: "File" as keyof typeof Icons, path: "/coproprietaire/leases", isLaravel: true },
      { id: "condition-reports", label: "Etats de lieux", icon: "Clipboard" as keyof typeof Icons, path: "/coproprietaire/etats-des-lieux", isLaravel: true },
      { id: "due-notices", label: "Avis d'échéance", icon: "File" as keyof typeof Icons, path: "/coproprietaire/notices", isLaravel: true },
      { id: "rent-receipts", label: "Quittances de loyers", icon: "Clipboard" as keyof typeof Icons, path: "/coproprietaire/quittances", isLaravel: true },
      { id: "invoices", label: "Factures et documents divers", icon: "File" as keyof typeof Icons, path: "/coproprietaire/factures", isLaravel: true },
      { id: "document-archiving", label: "Archivage de documents", icon: "File" as keyof typeof Icons, path: "/coproprietaire/documents", isReact: true },
    ]
  },
  {
    title: "REPARATIONS ET TRAVAUX",
    items: [
      { id: "repairs", label: "Réparations et travaux", icon: "Handshake" as keyof typeof Icons, path: "/coproprietaire/maintenance", isLaravel: true },
    ]
  },
  {
    title: "COMPTABILITE ET STATISTIQUES",
    items: [
      { id: "accounting", label: "Comptabilité et statistiques", icon: "TrendingUp" as keyof typeof Icons, path: "/coproprietaire/comptabilite", isLaravel: true },
    ]
  },
  {
    title: "GESTION DES COPROPRIÉTAIRES",
    items: [
      { id: "coowner-list", label: "Liste des gestionnaires", icon: "People" as keyof typeof Icons, path: "/coproprietaire/gestionnaires", isLaravel: true },
      { id: "invite-coowner", label: "Inviter un gestionnaire", icon: "UserPlus" as keyof typeof Icons, path: "/coproprietaire/gestionnaires/creer", isLaravel: true },
    ]
  },
  {
    title: "CONFIGURATION",
    items: [
      { id: "settings", label: "Paramètres", icon: "Settings" as keyof typeof Icons, path: "/coproprietaire/parametres", isReact: true },
      { id: "logout", label: "Déconnexion", icon: "LogOut" as keyof typeof Icons, path: "", isLogout: true },
    ]
  }
];

// Fonctions de navigation
const getToken = () => {
  let t = localStorage.getItem('token');
  if (t) return t;
  t = new URLSearchParams(window.location.search).get('api_token');
  if (t) { localStorage.setItem('token', t); return t; }
  return sessionStorage.getItem('token');
};

const goToLaravel = (path: string) => {
  const token = getToken();
  if (!token) { window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`; return; }
  const sep = path.includes('?') ? '&' : '?';
  window.location.href = `${CONFIG.LARAVEL_URL}${path.startsWith('/') ? path : '/' + path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
};

const goToReact = (path: string) => {
  const token = getToken();
  if (!token) {
    window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`;
    return;
  }
  const sep = path.includes('?') ? '&' : '?';
  window.location.href = `${CONFIG.REACT_URL}${path.startsWith('/') ? path : '/' + path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
};

// ─── NAV ITEM COMPONENT ────────────
const NavItem: React.FC<{
  item: MenuItem,
  activeTab: Tab,
  onNavigate: (tab: Tab) => void,
  onLogout: () => void,
  isExpanded: boolean,
  toggleMenu: (id: string) => void
}> = ({ item, activeTab, onNavigate, onLogout, isExpanded, toggleMenu }) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);

  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isSubActive = (subId: string) => activeTab === subId;
  const isActive = activeTab === item.id || (item.submenu?.some((s: any) => s.id === activeTab));
  const Ico = Icons[item.icon as keyof typeof Icons];

  const handleClick = () => {
    if (hasSubmenu) {
      toggleMenu(item.id);
    } else if (item.isLogout) {
      onLogout();
    } else if (item.isLaravel) {
      goToLaravel(item.path);
    } else if (item.isReact) {
      goToReact(item.path);
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
        className="w-full relative flex items-center gap-3 px-6 py-3 transition-all duration-300 group"
        style={{
          background: isActive && !hasSubmenu ? 'linear-gradient(90deg, rgba(255, 213, 124, 0.87) 0%, #FFFFFF 100%)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '12px',
          marginBottom: '2px'
        }}
      >
        {isActive && !hasSubmenu && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[30px] bg-[#FFB300] rounded-r-full shadow-[0px_0px_10px_rgba(255,179,0,0.4)]" />
        )}

        <div className={`transition-all duration-300 ${isActive || hovered ? 'scale-110' : 'scale-100 opacity-60'}`}>
          {Ico ? <Ico c={item.isLogout ? (hovered ? "#e53935" : "#aaa") : isActive ? TEXT_GREEN : iconColors[item.icon] || "#888"} /> : null}
        </div>

        <span className={`text-[0.9rem] font-bold whitespace-nowrap transition-colors duration-300 ${isActive || hovered ? `text-[${TEXT_GREEN}]` : 'text-gray-500'}`} style={{ color: (isActive || hovered) && !item.isLogout ? TEXT_GREEN : undefined }}>
          {item.label}
        </span>

        {hasSubmenu ? (
          <div className="ml-auto">
            <Icons.Chevron open={isExpanded} c={isActive ? TEXT_GREEN : "#bbb"} />
          </div>
        ) : isActive && (
          <div className="ml-auto">
            <ChevronRight size={14} className="text-[#529D21]" />
          </div>
        )}
      </button>

      {hasSubmenu && isExpanded && (
        <div className="ml-10 pl-4 border-l-2 border-slate-100 mt-1 mb-2 space-y-1">
          {item.submenu?.map((sub: any) => {
            const active = isSubActive(sub.id);
            const SubIco = Icons[sub.icon as keyof typeof Icons];
            const handleSubClick = () => {
              if (sub.isLaravel) {
                goToLaravel(sub.path);
              } else if (sub.isReact) {
                goToReact(sub.path);
              } else {
                onNavigate(sub.id as Tab);
              }
            };
            return (
              <button
                key={sub.id}
                onClick={handleSubClick}
                onMouseEnter={() => setHoveredSub(sub.id)}
                onMouseLeave={() => setHoveredSub(null)}
                className="w-full relative flex items-center gap-3 px-3 py-2 transition-all duration-300"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? TEXT_GREEN : hoveredSub === sub.id ? TEXT_GREEN : "#666",
                  background: active ? 'linear-gradient(90deg, rgba(255, 213, 124, 0.4) 0%, #FFFFFF 100%)' : 'transparent',
                  borderRadius: 10,
                  textAlign: "left"
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#FFB300] rounded-r-full" />
                )}
                <span className="scale-90 transition-opacity opacity-70 group-hover:opacity-100">
                  {SubIco ? <SubIco c={active ? TEXT_GREEN : (hoveredSub === sub.id ? TEXT_GREEN : "#aaa")} /> : null}
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

// ─── SIDEBAR COMPONENT ────────────
const SidebarContent: React.FC<{
  activeTab: Tab,
  onNavigate: (tab: Tab) => void,
  onLogout: () => void,
  expandedMenus: string[],
  toggleMenu: (id: string) => void,
  user: UserData | null
}> = ({ activeTab, onNavigate, onLogout, expandedMenus, toggleMenu, user }) => {
  const ownerInitials = React.useMemo(() => {
    if (!user) return "C";
    const a = (user.first_name?.[0] || user.email?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    return `${a}${b}`.trim() || "C";
  }, [user]);

  const ownerName = React.useMemo(() => {
    if (!user) return "Co-propriétaire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "Co-propriétaire";
  }, [user]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto py-6 px-3 sidebar-scroll scrollbar-hide">
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
              verticalAlign: 'middle',
              textTransform: 'uppercase'
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
                  isExpanded={!!(expandedMenus.includes(item.id) || activeTab === item.id || item.submenu?.some((s: any) => s.id === activeTab))}
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#70AE48] to-[#8BC34A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {ownerInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{ownerName}</div>
            <div className="text-xs text-gray-500">Co-propriétaire</div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/co-owners/me/notifications');
        setUnreadCount(response.data.unread_count || 0);
      } catch (error) {
        console.error('Erreur unread notifications:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Rafraîchir toutes les minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Impossible de lire user depuis localStorage", e);
    }
  }, []);

  const handleNavigate = (tab: Tab) => {
    const allItems = menuSections.flatMap(s => s.items) as MenuItem[];
    const menuItem = allItems.find(item => item.id === tab);

    if (menuItem?.isLaravel) {
      goToLaravel(menuItem.path);
    } else if (menuItem?.isReact) {
      goToReact(menuItem.path);
    } else {
      onNavigate(tab);
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMenu = (id: string) =>
    setExpandedMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white h-screen w-screen overflow-hidden flex flex-col transition-all duration-300" style={{ background: "#fff", fontFamily: "'Merriweather', serif" }}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-between px-6 sm:px-12" style={{
        background: GRADIENT_GREEN,
      }}>
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

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Bell size={18} fill="#FFC107" stroke="#FFC107" />
            <span className="hidden sm:inline">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#8CCC63]">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <HelpCircle size={18} />
            <span className="hidden sm:inline">Aide</span>
          </button>

          <button
            onClick={() => handleNavigate('settings' as Tab)}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <img src="/Ressource_gestiloc/customer.png" alt="Mon compte" className="w-6 h-6 rounded-full object-cover shadow-sm bg-white" />
            <span className="hidden sm:inline">Mon compte</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 h-[calc(100vh-72px)] relative pt-[72px]">
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`
            fixed h-auto z-[120]
            bg-white
            flex flex-col
            transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0 bottom-0 top-0 left-0 w-[280px]' : '-translate-x-full lg:translate-x-0 lg:left-[30px] lg:top-[100px] lg:w-[310px]'}
          `}
          style={
            !isMobileMenuOpen ? {
              borderRadius: '24px',
              boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05), 0px 5px 25px rgba(112, 174, 72, 0.15)',
              maxHeight: 'calc(100vh - 140px)',
              overflow: 'hidden'
            } : {
              boxShadow: '10px 0px 30px rgba(0,0,0,0.1)',
            }
          }
        >
          <SidebarContent
            activeTab={activeTab}
            onNavigate={handleNavigate}
            onLogout={onLogout}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
            user={user}
          />
        </aside>

        <div className="flex-1 lg:ml-[390px] bg-white">
          <div id="app-scroll-container" className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-white scroll-smooth scrollbar-hide">
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

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          api.get('/co-owners/me/notifications').then(res => setUnreadCount(res.data.unread_count || 0));
        }}
      />
    </div>
  );
};

export default Layout;