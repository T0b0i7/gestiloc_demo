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

  // ── Icons (SVG harmonisés) ────────────────────────────────
  const ic = (c: string) => ({ stroke: c, fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

  const Icons = {
    Dashboard: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={c || "#e6a817"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="8" /><rect x="10" y="7" width="4" height="13" /><rect x="17" y="3" width="4" height="17" />
      </svg>
    ),
    Plus: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={16} height={16} {...ic(c || "#4CAF50")}>
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    House: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#FF9800")}>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" />
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
    List: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#757575")}>
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    Lock: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#3949ab")}>
        <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
      </svg>
    ),
    File: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#00acc1")}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
    Clipboard: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#757575")}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" />
      </svg>
    ),
    Warning: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={c || "#e53935"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    Bell: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#FFC107")}>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    Receipt: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#1976D2")}>
        <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    Folder: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#795548")}>
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
    Wrench: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#9e6b2e")}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    Grid: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#4CAF50")}>
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    Settings: ({ c }: { c: string }) => (
      <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#757575")}>
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
    Chevron: ({ open, c }: { open?: boolean, c?: string }) => (
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={c || "#bbb"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, marginLeft: "auto", transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
  };

  const iconColors: Record<string, string> = {
    Dashboard: "#e6a817",
    Plus: "#4CAF50",
    House: "#FF9800",
    People: "#FF7043",
    PersonHouse: "#00897b",
    List: "#757575",
    Lock: "#3949ab",
    File: "#00acc1",
    Clipboard: "#757575",
    Warning: "#e53935",
    Bell: "#FFC107",
    Receipt: "#1976D2",
    Folder: "#795548",
    Wrench: "#9e6b2e",
    Grid: "#4CAF50",
    Settings: "#757575",
    LogOut: "#aaa",
  };

  const ACTIVE_BG = 'linear-gradient(90deg, rgba(255, 213, 124, 0.87) 0%, #FFFFFF 100%)';
  const ACTIVE_BAR = "#FFB300";
  const PRIMARY_GREEN = "#70AE48";
  const TEXT_GREEN = "#529D21";

  // ── Menu structure — Avec Sous-menus ──
  const menuSections = [
    {
      label: "Menu Principal",
      items: [
        { id: "dashboard", label: "Bureau", icon: "Dashboard" as keyof typeof Icons, submenu: [] },
      ],
    },
    {
      label: "Gestion des biens",
      items: [
        {
          id: "biens", label: "Mes biens", icon: "House" as keyof typeof Icons,
          submenu: [
            { id: "ajouter-bien", label: "Ajouter un bien", icon: "Plus" as keyof typeof Icons },
            { id: "mes-biens", label: "Mes biens", icon: "House" as keyof typeof Icons },
          ],
        },
      ],
    },
    {
      label: "Gestion Locative",
      items: [
        { id: "nouvelle-location", label: "Nouvelle location", icon: "People" as keyof typeof Icons, submenu: [] },
        { id: "ajouter-locataire", label: "Ajouter un locataire", icon: "PersonHouse" as keyof typeof Icons, submenu: [] },
        { id: "locataires", label: "Liste des locataires", icon: "List" as keyof typeof Icons, submenu: [] },
        { id: "paiements", label: "Gestion des paiements", icon: "Lock" as keyof typeof Icons, submenu: [] },
      ],
    },
    {
      label: "Documents",
      items: [
        {
          id: "documents", label: "Documents", icon: "File" as keyof typeof Icons,
          submenu: [
            { id: "baux", label: "Contrats de bails", icon: "File" as keyof typeof Icons },
            { id: "etats-lieux", label: "Etats de lieux", icon: "Clipboard" as keyof typeof Icons },
            { id: "avis-echeance", label: "Avis d'échéance", icon: "Warning" as keyof typeof Icons },
            { id: "quittances", label: "Quittances de loyers", icon: "Bell" as keyof typeof Icons },
            { id: "factures", label: "Factures et documents divers", icon: "Receipt" as keyof typeof Icons },
            { id: "archives", label: "Archivage de documents", icon: "Folder" as keyof typeof Icons },
          ],
        },
      ],
    },
    {
      label: "Réparations et Travaux",
      items: [
        { id: "incidents", label: "Répartitions et travaux", icon: "Wrench" as keyof typeof Icons, submenu: [] },
      ],
    },
    {
      label: "Comptabilité et Statistiques",
      items: [
        { id: "comptabilite", label: "Comptabilité et travaux", icon: "Grid" as keyof typeof Icons, submenu: [] },
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const toggleMenu = (id: string) =>
    setExpandedMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const NavItem = ({ item }: { item: any }) => {
    const [hovered, setHovered] = useState(false);
    const [hoveredSub, setHoveredSub] = useState<string | null>(null);

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubActive = (subId: string) => activeTab === subId;
    const isActive = activeTab === item.id || (item.submenu?.some((s: any) => s.id === activeTab));
    const isExpanded = expandedMenus.includes(item.id) || isActive;
    const Ico = Icons[item.icon as keyof typeof Icons];

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
          className="w-full relative flex items-center gap-3 px-6 py-3.5 transition-all duration-300 group"
          style={{
            background: isActive && !hasSubmenu ? ACTIVE_BG : 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '12px',
            marginBottom: '2px'
          }}
        >
          {/* Yellow indicator for active tab precisely as requested */}
          {isActive && !hasSubmenu && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[30px] bg-[#FFB300] rounded-r-full shadow-[0px_0px_10px_#FFB300]" />
          )}

          <div className={`transition-all duration-300 ${isActive || hovered ? 'scale-110' : 'scale-100 opacity-70'}`}>
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
              <ChevronRight size={16} style={{ color: TEXT_GREEN }} />
            </div>
          )}
        </button>

        {/* Sous-menu interactif */}
        {hasSubmenu && isExpanded && (
          <div className="ml-10 pl-4 border-l-2 border-slate-100 mt-1 mb-2 space-y-1">
            {item.submenu.map((sub: any) => {
              const active = isSubActive(sub.id);
              const SubIco = Icons[sub.icon as keyof typeof Icons];
              return (
                <button
                  key={sub.id}
                  onClick={() => handleNavigate(sub.id as Tab)}
                  onMouseEnter={() => setHoveredSub(sub.id)}
                  onMouseLeave={() => setHoveredSub(null)}
                  className="w-full relative flex items-center gap-3 px-3 py-2.5 transition-all duration-300"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? TEXT_GREEN : hoveredSub === sub.id ? TEXT_GREEN : "#666",
                    background: active ? ACTIVE_BG : 'transparent',
                    borderRadius: 10,
                    textAlign: "left"
                  }}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#FFB300] rounded-r-full" />
                  )}
                  <span className="scale-90 transition-opacity opacity-80 group-hover:opacity-100">
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
    <div className="h-screen w-screen overflow-hidden flex flex-col transition-all duration-300" style={{ background: "rgba(254,255,253,1)", fontFamily: "'Merriweather', serif" }}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-between px-6 sm:px-12" style={{
        background: PRIMARY_GREEN,
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
            fontSize: '1.85rem',
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Gestiloc
          </span>
        </div>

        {/* Right: action buttons with pill style as shown in the image */}
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
            <HelpCircle size={18} className="text-red-400" />
            <span className="hidden sm:inline">Aide</span>
          </button>

          {/* Mon compte */}
          <button
            onClick={() => handlePageChange('profil')}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Mon compte"
          >
            <img src="/Ressource_gestiloc/customer.png" alt="Mon compte" className="w-6 h-6 rounded-full object-cover" />
            <span className="hidden sm:inline">Mon compte</span>
          </button>
        </div>
      </header>

      {/* Mobile Backdrop - HORS du conteneur relative */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed z-[120]
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
        {/* Mobile Header with Close */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200" style={{ background: PRIMARY_GREEN }}>
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
        <nav className="flex-1 overflow-y-auto py-6 px-4 sidebar-scroll scrollbar-hide">
          <style>{`
            .sidebar-scroll::-webkit-scrollbar { width: 4px; }
            .sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          {menuSections.map((section, si) => (
            <div key={section.label} className={`menu-section-enter animate-delay-${si * 100}`}>
              {/* Section label */}
              <div style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#bbb',
                textTransform: 'uppercase',
                padding: '1.2rem 1.4rem 0.6rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {section.label}
              </div>
              {/* Section items using NavItem component */}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profil Section supprimée comme demandé */}
      </aside>

      {/* CONTENU PRINCIPAL - IDENTIQUE au locataire */}
      <div className="flex flex-1 h-[calc(100vh-72px)] relative pt-[72px]">
        {/* Toasts */}
        <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col ml-0 lg:ml-[360px] h-full overflow-hidden z-0 relative">
          {/* Content */}
          <div id="app-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide" style={{ background: "rgba(254,255,253,1)" }}>
            <div className="p-4 sm:p-6 pt-6 sm:pt-10 max-w-7xl mx-auto animation-fadeIn">
              <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animation-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
              `}</style>
              <AnimatedPage animation="fadeInUp" delay={100}>
                {children}
              </AnimatedPage>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications Dropdown - Adaptive position and size */}
      {
        showNotifications && (
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
        )
      }

      {/* Help Dropdown - Adaptive position and size */}
      {
        showHelp && (
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
        )
      }
    </div>
  );
};