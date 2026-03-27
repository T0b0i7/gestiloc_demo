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
  children?: MenuItem[];
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

// ─── ICÔNES SVG ───────────────────────────────────────────────────────
const ic = (c: string) => ({ stroke: c, fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const Icons = {
  Dashboard:    () => <img src="/Ressource_gestiloc/tb_locataire.png" alt="Tableau de bord" className="w-[18px] h-[18px] object-contain" />,
  People:       ({ c }: { c: string }) => <img src="/Ressource_gestiloc/customer.png" alt="Locataires" className="w-[18px] h-[18px] object-contain" />,
  Handshake:    ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Ma_location.png" alt="Location" className="w-[18px] h-[18px] object-contain" />,
  HandshakeCat: ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Ma_location.png" alt="Gestion locative" className="w-[18px] h-[18px] object-contain" />,
  Tools:        ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Tools.png" alt="Outils" className="w-[18px] h-[18px] object-contain" />,
  House:        ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Home.png" alt="Biens" className="w-[18px] h-[18px] object-contain" />,
  HouseCat:     ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Home.png" alt="Gestion des biens" className="w-[18px] h-[18px] object-contain" />,
  UserPlus:     ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#8CCC63")}>
      <path d="M16 21v-2a4 4 0 00-3-3.87" /><path d="M8 21v-2a4 4 0 014-4h1" /><circle cx="12" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  File:         ({ c }: { c: string }) => <img src="/Ressource_gestiloc/document.png" alt="Documents" className="w-[18px] h-[18px] object-contain" />,
  FileCat:      ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Document%20In%20Folder.png" alt="Documents" className="w-[18px] h-[18px] object-contain" />,
  Clipboard:    ({ c }: { c: string }) => <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Quittances" className="w-[18px] h-[18px] object-contain" />,
  Wallet:       ({ c }: { c: string }) => <img src="/Ressource_gestiloc/paiement.png" alt="Paiements" className="w-[18px] h-[18px] object-contain" />,
  TrendingUp:   ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#4CAF50")}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Settings:     ({ c }: { c: string }) => <img src="/Ressource_gestiloc/parametres.png" alt="Paramètres" className="w-[18px] h-[18px] object-contain" onError={(e) => (e.currentTarget.src="/Ressource_gestiloc/customer.png")} />,
  ConfigCat:    ({ c }: { c: string }) => <img src="/Ressource_gestiloc/parametres.png" alt="Configuration" className="w-[18px] h-[18px] object-contain" onError={(e) => (e.currentTarget.src="/Ressource_gestiloc/customer.png")} />,
  GestCat:      ({ c }: { c: string }) => <img src="/Ressource_gestiloc/customer.png" alt="Gestionnaires" className="w-[18px] h-[18px] object-contain" />,
  LogOut:       ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#aaa")}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const TEXT_GREEN = "#529D21";
const GRADIENT_GREEN = "linear-gradient(94.5deg, #8CCC63 5.47%, rgba(82, 157, 33, 0.87) 91.93%)";

// ─── MENU — Catégories collapsibles (même structure que Propriétaire) ─
const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "",
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: "Dashboard", path: "/coproprietaire/dashboard", isReact: true },
    ]
  },
  {
    title: "",
    items: [
      {
        id: 'biens-section',
        label: 'Gestion des biens',
        icon: "HouseCat",
        children: [
          { id: "add-property",  label: "Ajouter un bien", icon: "UserPlus", path: "/coproprietaire/biens/create",  isLaravel: true },
          { id: "my-properties", label: "Mes biens",       icon: "House",    path: "/coproprietaire/biens",         isReact: true  },
        ]
      },
      {
        id: 'locative-section',
        label: 'Gestion locative',
        icon: "HandshakeCat",
        children: [
          { id: "new-rental",         label: "Nouvelle location",      icon: "Handshake", path: "/coproprietaire/assign-property/create", isLaravel: true },
          { id: "add-tenant",         label: "Ajouter un locataire",   icon: "UserPlus",  path: "/coproprietaire/tenants/create",          isLaravel: true },
          { id: "tenant-list",        label: "Liste des locataires",   icon: "People",    path: "/coproprietaire/tenants",                 isLaravel: true },
          { id: "payment-management", label: "Gestion des paiements",  icon: "Wallet",    path: "/coproprietaire/paiements",               isLaravel: true },
        ]
      },
      {
        id: 'documents-section',
        label: 'Documents',
        icon: "FileCat",
        children: [
          { id: "lease-contracts",    label: "Contrats de bail",             icon: "File",      path: "/coproprietaire/leases",          isLaravel: true },
          { id: "condition-reports",  label: "Etats de lieux",               icon: "Clipboard", path: "/coproprietaire/etats-des-lieux", isLaravel: true },
          { id: "due-notices",        label: "Préavis",              icon: "File",      path: "/coproprietaire/notices",         isLaravel: true },
             { id: "due-notices",        label: "Avis d'échéance",              icon: "File",      path: "/coproprietaire/avis-echeance",         isLaravel: true },
          { id: "rent-receipts",      label: "Quittances de loyers",         icon: "Clipboard", path: "/coproprietaire/quittances",      isLaravel: true },
          { id: "invoices",           label: "Factures et documents divers", icon: "File",      path: "/coproprietaire/factures",        isLaravel: true },
          { id: "document-archiving", label: "Archivage de documents",       icon: "File",      path: "/coproprietaire/documents",       isReact: true  },
        ]
      },
      {
        id: 'services-section',
        label: 'Services',
        icon: "Tools",
        children: [
          { id: "repairs",     label: "Réparations et travaux",        icon: "Tools",      path: "/coproprietaire/maintenance", isLaravel: true },
          { id: "accounting",  label: "Comptabilité et statistiques",  icon: "TrendingUp", path: "/coproprietaire/comptabilite", isLaravel: true },
        ]
      },
      {
        id: 'delegation-section',
        label: 'Délégation',
        icon: "GestCat",
        children: [
          { id: "coowner-list",   label: "Liste des gestionnaires",  icon: "People",   path: "/coproprietaire/gestionnaires",       isLaravel: true },
          { id: "invite-coowner", label: "Inviter un gestionnaire",  icon: "UserPlus", path: "/coproprietaire/gestionnaires/creer", isLaravel: true },
        ]
      },
      {
        id: 'configuration-section',
        label: 'Configuration',
        icon: "ConfigCat",
        children: [
          { id: "settings", label: "Paramètres",  icon: "Settings", path: "/coproprietaire/settings", isLaravel: true },
          { id: "logout",   label: "Déconnexion", icon: "LogOut",   isLogout: true },
        ]
      },
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

const goToLaravel = (path: string) => {
  const token = getToken();
  if (!token) { window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`; return; }
  const sep = path.includes('?') ? '&' : '?';
  window.location.href = `${CONFIG.LARAVEL_URL}${path.startsWith('/') ? path : '/'+path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
};

const goToReact = (path: string) => {
  const token = getToken();
  if (!token) { window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`; return; }
  const sep = path.includes('?') ? '&' : '?';
  window.location.href = `${CONFIG.REACT_URL}${path.startsWith('/') ? path : '/'+path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
};

const navigateTo = (path: string, onNavigate: (tab: Tab) => void) => {
  const stripped = path.replace('/coproprietaire/', '');
  onNavigate(stripped as Tab);
};

// ─── NAV ITEM (récursif, identique au Propriétaire) ──────────────────
const NavItem: React.FC<{
  item: MenuItem;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  onLogout: () => void;
}> = ({ item, activeTab, onNavigate, onLogout }) => {
  const [hovered, setHovered] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Détecte si un enfant est actif — via activeTab (React) OU via l'URL courante (Laravel)
  const currentPath = window.location.pathname;
  const isChildActive = hasChildren && item.children!.some(child =>
    child.id === activeTab ||
    (child.path && (currentPath === child.path || currentPath.startsWith(child.path + '/'))) ||
    child.children?.some(c =>
      c.id === activeTab ||
      (c.path && (currentPath === c.path || currentPath.startsWith(c.path + '/')))
    )
  );

  const [isExpanded, setIsExpanded] = useState(isExpanded => isExpanded || isChildActive);

  useEffect(() => {
    if (isChildActive) setIsExpanded(true);
  }, [isChildActive]);

  // Détecte si CE lien est actif — via activeTab ou via l'URL courante
  const isActive = activeTab === item.id ||
    (item.path != null && (currentPath === item.path || currentPath.startsWith(item.path + '/')));
  const Ico = Icons[item.icon as keyof typeof Icons];

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.isLogout) {
      onLogout();
    } else if (item.isLaravel && item.path) {
      goToLaravel(item.path);
    } else if (item.isReact && item.path) {
      goToReact(item.path);
    } else if (item.path) {
      navigateTo(item.path, onNavigate);
    } else {
      onNavigate(item.id as Tab);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full relative flex items-center gap-3 px-6 py-3 transition-all duration-300 group"
        style={{
          background: (isActive || isChildActive) ? 'linear-gradient(90deg, rgba(255, 213, 124, 0.87) 0%, #FFFFFF 100%)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '12px',
          marginBottom: '2px',
        }}
      >
        {(isActive || isChildActive) && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[30px] bg-[#FFB300] rounded-r-full shadow-[0px_0px_10px_rgba(255,179,0,0.4)]" />
        )}

        <div className={`transition-all duration-300 ${(isActive || isChildActive || hovered) ? 'scale-110' : 'scale-100 opacity-60'}`}>
          {Ico ? <Ico c={item.isLogout ? (hovered ? "#e53935" : "#aaa") : (isActive || isChildActive) ? TEXT_GREEN : "#888"} /> : null}
        </div>

        <span
          className="text-[0.9rem] font-bold whitespace-nowrap transition-colors duration-300 text-gray-500"
          style={{ color: ((isActive || isChildActive || hovered) && !item.isLogout) ? TEXT_GREEN : undefined, fontFamily: "'Manrope', sans-serif" }}
        >
          {item.label}
        </span>

        {hasChildren && (
          <div className="ml-auto">
            <svg viewBox="0 0 24 24" width={16} height={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} style={{ stroke: TEXT_GREEN, strokeWidth: 2, fill: 'none' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}

        {(!hasChildren && isActive) && (
          <div className="ml-auto">
            <ChevronRight size={14} color={TEXT_GREEN} />
          </div>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="pl-4 space-y-1 border-l-2 border-gray-200 ml-6 mt-1">
          {item.children!.map((child) => (
            <NavItem key={child.id} item={child} activeTab={activeTab} onNavigate={onNavigate} onLogout={onLogout} />
          ))}
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
  user: UserData | null;
}> = ({ activeTab, onNavigate, onLogout, user }) => {
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
                />
              ))}
            </div>
          </div>
        ))}
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
  isDarkMode,
  toggleTheme,
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
    onNavigate(tab);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowHelp(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
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
          <img src="/Ressource_gestiloc/IMONA_SBLack.png" alt="IMONA" className="h-[75px] w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] filter brightness-0 invert" />
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
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#8CCC63]">
              2
            </span>
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
  onClick={() => {
    // Rediriger vers la page des paramètres (Mon compte)
    const token = getToken();
    if (!token) {
      window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`;
      return;
    }
    const sep = '/coproprietaire/parametres'.includes('?') ? '&' : '?';
    window.location.href = `${CONFIG.REACT_URL}/coproprietaire/parametres${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
  }}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
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
            user={user}
          />
        </aside>

        {/* ── CONTENU ── */}
        <div className="flex-1 lg:ml-[460px] bg-white">
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
            <div className="p-12 text-center">
              <p className="text-gray-400 font-medium">Aucune notification</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-800 font-bold shadow-sm transition-all">
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
              { title: 'Guide de démarrage',    desc: 'Apprenez les bases de Imona',      color: 'bg-green-500',  route: '/help' },
              { title: "Centre d'aide complet", desc: 'Accédez à tous nos guides',            color: 'bg-blue-500',   route: '/help' },
              { title: 'Contactez le support',  desc: 'Notre équipe est là pour vous aider', color: 'bg-purple-500', route: '/contact' },
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