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
  path?: string;
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
  REACT_URL:   'http://localhost:8080',
  LOGIN_URL:   '/login',
  LOGOUT_URL:  '/logout',
};

// ─── COMPOSANTS ET CONSTANTES DU DESIGN HARMONISÉ ───────────────────
const ic = (c: string) => ({ stroke: c, fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const Icons = {
  Dashboard: () => <img src="/Ressource_gestiloc/tb_locataire.png" alt="Tableau de bord" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  People: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/customer.png" alt="Locataires" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  Handshake: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Ma_location.png" alt="Location" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  Tools: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Tools.png" alt="Outils" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  House: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Home.png" alt="Biens" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  UserPlus: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#8CCC63")}>
      <path d="M16 21v-2a4 4 0 00-3-3.87" /><path d="M8 21v-2a4 4 0 014-4h1" /><circle cx="12" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  File: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/document.png" alt="Documents" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  Clipboard: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Quittances" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  Wallet: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/paiement.png" alt="Paiements" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  TrendingUp: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#4CAF50")}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Settings: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/parametres.png" alt="Paramètres" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
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
    title: "",
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: "Dashboard" as keyof typeof Icons, path: "/coproprietaire/dashboard", isReact: true },
    ]
  },
  {
    title: "GESTIONS DES BIENS",
    items: [
      {
        id: "biens-parent",
        label: "Gestion des biens",
        icon: "House" as keyof typeof Icons,
        submenu: [
          { id: "add-property",  label: "Ajouter un bien",  icon: "UserPlus" as keyof typeof Icons, path: "/coproprietaire/biens/create", isLaravel: true },
          { id: "my-properties", label: "Mes biens",        icon: "House" as keyof typeof Icons, path: "/coproprietaire/biens",        isReact: true  },
        ]
      }
    ]
  },
  {
    title: "GESTION LOCATIVE",
    items: [
      {
        id: "locative-parent",
        label: "Gestion locative",
        icon: "Handshake" as keyof typeof Icons,
        submenu: [
          { id: "new-rental",        label: "Nouvelle location",      icon: "Handshake" as keyof typeof Icons, path: "/coproprietaire/assign-property/create", isLaravel: true },
          { id: "add-tenant",        label: "Ajouter un locataire",   icon: "UserPlus" as keyof typeof Icons, path: "/coproprietaire/tenants/create",          isLaravel: true },
          { id: "tenant-list",       label: "Liste des locataires",   icon: "People" as keyof typeof Icons, path: "/coproprietaire/tenants",                 isLaravel: true },
          { id: "payment-management",label: "Gestion des paiements",  icon: "Wallet" as keyof typeof Icons, path: "/coproprietaire/paiements",               isLaravel: true },
        ]
      }
    ]
  },
  {
    title: "DOCUMENTS",
    items: [
      {
        id: "documents-parent",
        label: "Documents",
        icon: "File" as keyof typeof Icons,
        submenu: [
          { id: "lease-contracts",    label: "Contrats de bail",              icon: "File" as keyof typeof Icons, path: "/coproprietaire/leases",           isLaravel: true },
          { id: "condition-reports",  label: "Etats de lieux",                icon: "Clipboard" as keyof typeof Icons, path: "/coproprietaire/etats-des-lieux",  isLaravel: true },
          { id: "due-notices",        label: "Avis d'échéance",               icon: "File" as keyof typeof Icons, path: "/coproprietaire/notices",          isLaravel: true },
          { id: "rent-receipts",      label: "Quittances de loyers",          icon: "Clipboard" as keyof typeof Icons, path: "/coproprietaire/quittances",       isLaravel: true },
          { id: "invoices",           label: "Factures et documents divers",  icon: "File" as keyof typeof Icons, path: "/coproprietaire/factures",         isLaravel: true },
          { id: "document-archiving", label: "Archivage de documents",        icon: "File" as keyof typeof Icons, path: "/coproprietaire/documents",        isReact: true   },
        ]
      }
    ]
  },
  {
    title: "REPARATIONS ET TRAVAUX",
    items: [
      { id: "repairs", label: "Réparations et travaux", icon: "Tools" as keyof typeof Icons, path: "/coproprietaire/maintenance", isLaravel: true },
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
      {
        id: "coowners-parent",
        label: "Gestionnaires",
        icon: "People" as keyof typeof Icons,
        submenu: [
          { id: "coowner-list",  label: "Liste des gestionnaires",  icon: "People" as keyof typeof Icons, path: "/coproprietaire/gestionnaires",       isLaravel: true },
          { id: "invite-coowner",label: "Inviter un gestionnaire",  icon: "UserPlus" as keyof typeof Icons, path: "/coproprietaire/gestionnaires/creer", isLaravel: true },
        ]
      }
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
  window.location.href = `${CONFIG.LARAVEL_URL}${path.startsWith('/') ? path : '/'+path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
};

const goToReact = (path: string) => {
  const token = getToken();
  if (!token) { 
    window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`; 
    return; 
  }
  const sep = path.includes('?') ? '&' : '?';
  window.location.href = `${CONFIG.REACT_URL}${path.startsWith('/') ? path : '/'+path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
};

// ─── NAV ITEM COMPONENT ────────────
const NavItem: React.FC<{
  item: any,
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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[24px] bg-[#FFB300] rounded-r-full shadow-[0px_0px_8px_rgba(255,179,0,0.3)]" />
        )}

        <div className={`transition-all duration-300 ${isActive || hovered ? 'scale-110' : 'scale-100 opacity-60'} flex items-center justify-center w-[32px] h-[32px]`}>
          {Ico ? <Ico c={item.isLogout ? (hovered ? "#e53935" : "#aaa") : isActive ? TEXT_GREEN : "#9CA3AF"} /> : null}
        </div>

        <span className="text-left font-medium whitespace-nowrap transition-colors duration-300" style={{ fontSize: '12.5px', color: (isActive || hovered) && !item.isLogout ? TEXT_GREEN : '#4B5563', fontFamily: "'Manrope', sans-serif" }}>
          {item.label}
        </span>

        {hasSubmenu ? (
          <div className="ml-auto">
            <Icons.Chevron open={isExpanded} c={isActive ? TEXT_GREEN : "#bbb"} />
          </div>
        ) : isActive ? (
          <div className="ml-auto">
            <ChevronRight size={14} className="text-[#529D21]" />
          </div>
        ) : null}
      </button>

      {hasSubmenu && isExpanded && (
        <div className="ml-10 pl-4 border-l-2 border-slate-100 mt-1 mb-2 space-y-1">
          {item.submenu.map((sub: MenuItem) => {
            const active = isSubActive(sub.id);
            const SubIco = Icons[sub.icon as keyof typeof Icons];
            const handleSubClick = () => {
              if (sub.isLaravel && sub.path) {
                goToLaravel(sub.path);
              } else if (sub.isReact && sub.path) {
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
                  fontSize: "12px",
                  fontWeight: active ? 600 : 500,
                  color: active ? TEXT_GREEN : hoveredSub === sub.id ? TEXT_GREEN : "#666",
                  background: active ? 'linear-gradient(90deg, rgba(255, 213, 124, 0.87) 0%, #FFFFFF 100%)' : 'transparent',
                  borderRadius: 10,
                  textAlign: "left",
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#FFB300] rounded-r-full" />
                )}
                <span className="scale-90 opacity-70 w-[24px] flex items-center justify-center">
                  {SubIco ? <SubIco c={active ? TEXT_GREEN : (hoveredSub === sub.id ? TEXT_GREEN : "#aaa")} /> : null}
                </span>
                <span className="truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>{sub.label}</span>
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
          <div key={section.title || "main-menu-top"} className={section.title ? "mb-4" : "mb-2"}>
            {section.title && (
              <div style={{
                fontSize: '9.5px',
                fontWeight: 600,
                color: '#9CA3AF',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '1.2rem 1.4rem 0.6rem',
                textAlign: 'left',
                fontFamily: "'Manrope', sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  onNavigate={onNavigate}
                  onLogout={onLogout}
                  isExpanded={
                    !!(expandedMenus.includes(item.id) ||
                    activeTab === item.id ||
                    (item.submenu?.some((s: any) => s.id === activeTab) || false))
                  }
                  toggleMenu={toggleMenu}
                />
              ))}
            </div>
          </div>
        ))}
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Impossible de lire user depuis localStorage", e);
    }
  }, []);

  const handleNavigate = (tab: Tab) => {
    // Vérifier si c'est une route React qui nécessite une redirection externe
    const allItems = menuSections.flatMap(s => s.items);
    const menuItem = allItems.find(item => item.id === tab);
    
    if (menuItem) {
      if (menuItem.isLaravel && menuItem.path) {
        goToLaravel(menuItem.path);
      } else if (menuItem.isReact && menuItem.path) {
        goToReact(menuItem.path);
      } else {
        onNavigate(tab);
      }
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
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#8CCC63]">
              2
            </span>
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
            fixed h-auto z-[120] bg-white flex flex-col
            transition-all duration-300 ease-in-out
            ${isMobileMenuOpen
              ? 'translate-x-0 bottom-0 top-0 left-0 w-[320px]'
              : '-translate-x-full lg:translate-x-0 lg:left-[30px] lg:top-[100px] lg:w-[400px]'
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
          <SidebarContent
            activeTab={activeTab}
            onNavigate={handleNavigate}
            onLogout={onLogout}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
            user={user}
          />
        </aside>

        <div className="flex-1 lg:ml-[460px] bg-white">
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
    </div>
  );
};

export default Layout;