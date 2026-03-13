import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  Info,
  Download
} from 'lucide-react';
import { Tab, ToastMessage } from '../types';
import { Toast } from './ui/Toast';
import { AnimatedPage } from './AnimatedPage';
import { Landlord } from './Landlord';
import api from '@/services/api';
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

interface NotificationItem {
  id: string;
  type: 'critical' | 'important' | 'info';
  title: string;
  message: string;
  subtext?: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  icon?: string;
  pdf_url?: string;
  _uniqueKey?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  path?: string;
  isLogout?: boolean;
  children?: MenuItem[];
  categoryIcon?: string;
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
  user: UserData | null;
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
}

// ─── COMPOSANTS ET CONSTANTES DU DESIGN HARMONISÉ ───────────────────
const ic = (c: string) => ({ stroke: c, fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const Icons = {
  Dashboard: () => <img src="/Ressource_gestiloc/tb_locataire.png" alt="Tableau de bord" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  LocationImg: () => <img src="/Ressource_gestiloc/Ma_location.png" alt="Ma location" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  LocationCategoryImg: () => <img src="/Ressource_gestiloc/Ma_location.png" alt="Location" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  ProprioImg: () => <img src="/Ressource_gestiloc/Home.png" alt="Mon propriétaire" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  QuittancesImg: () => <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Mes quittances" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  DocumentsImg: () => <img src="/Ressource_gestiloc/document.png" alt="Documents" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  DocumentsCategoryImg: () => <img src="/Ressource_gestiloc/Document%20In%20Folder.png" alt="Documents" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  InterventionsImg: () => <img src="/Ressource_gestiloc/Tools.png" alt="Mes interventions" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  TasksImg: () => <img src="/Ressource_gestiloc/Nouvelles_taches.png" alt="Mes tâches" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  NotesImg: () => <img src="/Ressource_gestiloc/Edit%20Property.png" alt="Mes notes" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  PreavisImg: () => <img src="/Ressource_gestiloc/preavis.png" alt="Préavis" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  PaiementsImg: () => <img src="/Ressource_gestiloc/paiement.png" alt="Paiements" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  ParametresImg: () => <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  ConfigurationCategoryImg: () => <img src="/Ressource_gestiloc/Tools.png" alt="Configuration" className="w-[18px] h-[18px] object-contain transition-transform group-hover:scale-110" />,
  LogOut: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c || "#aaa")}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  // Category Icons (kept for Services)
  ToolsIcon: ({ c }: { c: string }) => (
    <svg viewBox="0 0 24 24" width={18} height={18} {...ic(c)}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
};

const iconColors: Record<string, string> = {
  Dashboard: "#e6a817",
  LogOut: "#aaa",
  LocationCategoryImg: "#529D21",
  DocumentsCategoryImg: "#529D21",
  ConfigurationCategoryImg: "#529D21",
  ToolsIcon: "#529D21",
};

const TEXT_GREEN = "#529D21";
const GRADIENT_GREEN = "linear-gradient(94.5deg, #8CCC63 5.47%, rgba(82, 157, 33, 0.87) 91.93%)";

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "",
    items: [
      { id: 'home', label: 'Tableau de bord', icon: "Dashboard" },
    ]
  },
  {
    title: "",
    items: [
      { 
        id: 'location-section', 
        label: 'Location', 
        icon: "LocationCategoryImg",
        categoryIcon: "LocationCategoryImg",
        children: [
          { id: 'location', label: 'Ma location', icon: "LocationImg" },
          { id: 'landlord', label: 'Mon propriétaire', icon: "ProprioImg" },
          { id: 'payments', label: 'Paiements', icon: "PaiementsImg" },
          { id: 'notice', label: 'Préavis', icon: "PreavisImg" },
        ]
      },
      { 
        id: 'documents-section', 
        label: 'Documents', 
        icon: "DocumentsCategoryImg",
        categoryIcon: "DocumentsCategoryImg",
        children: [
          { id: 'receipts', label: 'Mes quittances', icon: "QuittancesImg" },
          { id: 'documents', label: 'Documents', icon: "DocumentsImg" },
          { id: 'notes', label: 'Mes notes', icon: "NotesImg" },
        ]
      },
      { 
        id: 'services-section', 
        label: 'Services', 
        icon: "ToolsIcon",
        categoryIcon: "ToolsIcon",
        children: [
          { id: 'interventions', label: 'Mes interventions', icon: "InterventionsImg" },
          { id: 'tasks', label: 'Mes tâches', icon: "TasksImg" },
        ]
      },
      { 
        id: 'configuration-section', 
        label: 'Configuration', 
        icon: "ConfigurationCategoryImg",
        categoryIcon: "ConfigurationCategoryImg",
        children: [
          { id: 'settings', label: 'Paramètres', icon: "ParametresImg" },
          { id: 'logout', label: 'Déconnexion', icon: "LogOut", isLogout: true },
        ]
      },
    ]
  }
];

// ─── NAV ITEM COMPONENT ────────────
const NavItem: React.FC<{
  item: MenuItem,
  activeTab: Tab,
  onNavigate: (tab: Tab) => void,
  onLogout: () => void,
}> = ({ item, activeTab, onNavigate, onLogout }) => {
  const [hovered, setHovered] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children.some(child => child.id === activeTab);
  const [isExpanded, setIsExpanded] = useState(isChildActive);
  
  useEffect(() => {
    if (isChildActive) {
      setIsExpanded(true);
    }
  }, [isChildActive]);
  
  const isActive = activeTab === item.id;
  const Ico = Icons[item.icon as keyof typeof Icons];

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.isLogout) {
      onLogout();
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
          marginBottom: '2px'
        }}
      >
        {(isActive || isChildActive) && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[30px] bg-[#FFB300] rounded-r-full shadow-[0px_0px_10px_rgba(255,179,0,0.4)]" />
        )}

        <div className={`transition-all duration-300 ${(isActive || isChildActive || hovered) ? 'scale-110' : 'scale-100 opacity-60'}`}>
          {Ico ? <Ico c={item.isLogout ? (hovered ? "#e53935" : "#aaa") : (isActive || isChildActive) ? TEXT_GREEN : iconColors[item.icon] || "#888"} /> : null}
        </div>

        <span className="text-[0.9rem] font-bold whitespace-nowrap transition-colors duration-300 text-gray-500" style={{ color: ((isActive || isChildActive || hovered) && !item.isLogout) ? TEXT_GREEN : undefined }}>
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
            <ChevronRight size={14} className="text-[#529D21]" />
          </div>
        )}
      </button>

      {/* Dropdown Children */}
      {hasChildren && isExpanded && (
        <div className="pl-4 space-y-1 border-l-2 border-gray-200 ml-6 mt-1">
          {item.children.map((child) => (
            <NavItem key={child.id} item={child} activeTab={activeTab} onNavigate={onNavigate} onLogout={onLogout} />
          ))}
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
  user: UserData | null
}> = ({ activeTab, onNavigate, onLogout, user }) => {
  const userInitials = React.useMemo(() => {
    if (!user) return "L";
    const a = (user.first_name?.[0] || user.email?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    return `${a}${b}`.trim() || "L";
  }, [user]);

  const userName = React.useMemo(() => {
    if (!user) return "Locataire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "Locataire";
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
                fontSize: '0.55rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#BDBDBD',
                padding: '1.2rem 1.4rem 0.6rem',
                textAlign: 'left',
                fontFamily: "'Merriweather', serif",
                whiteSpace: 'nowrap',
                textTransform: 'uppercase'
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

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  toasts,
  removeToast,
  onLogout,
  user,
  notify,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await api.get('/tenant/notifications');
      const notificationsData = response.data.notifications || [];
      const notificationsWithUniqueKeys = notificationsData.map((notif: NotificationItem, index: number) => ({
        ...notif,
        _uniqueKey: `notif-${notif.id || 'unknown'}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      setNotifications(notificationsWithUniqueKeys);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(`/tenant/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      const newUnreadCount = notifications.filter(n => !n.is_read).length - 1;
      setUnreadCount(Math.max(0, newUnreadCount));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/tenant/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      notify('Toutes les notifications ont été marquées comme lues', 'success');
    } catch (error) {
      console.error('Erreur mark all as read:', error);
    }
  };

  const handleNavigate = (tab: Tab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  // Helpers notification
  const getNotificationIcon = (type: string, iconName?: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'critical': return <AlertTriangle className={`${iconClass} text-red-500`} />;
      case 'important': return <Clock className={`${iconClass} text-orange-500`} />;
      default: return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

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
            onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); }}
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
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); }}
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
            onClick={() => handleNavigate('profile' as Tab)}
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

        <div className="flex-1 lg:ml-[390px] bg-white">
          <div id="app-scroll-container" className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-white scroll-smooth scrollbar-hide">
            <div className="p-4 sm:p-12 max-w-7xl mx-auto">
              {activeTab === 'landlord' ? (
                <AnimatedPage animation="fadeInUp" delay={100}>
                  <Landlord notify={notify} />
                </AnimatedPage>
              ) : (
                <AnimatedPage animation="fadeInUp" delay={100}>
                  {children}
                </AnimatedPage>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOASTS */}
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
        <div className="fixed inset-0 sm:inset-auto sm:top-20 sm:right-6 sm:w-96 bg-white sm:rounded-xl shadow-2xl border-t sm:border border-gray-200 z-[110] flex flex-col h-full sm:h-auto max-h-[600px]">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Merriweather', serif" }}>
              Notifications
            </h3>
            <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[450px]">
            {loadingNotifications ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#529D21] mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 font-medium">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif: NotificationItem) => (
                <div key={notif._uniqueKey || notif.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 relative group"
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.link) {
                      const linkToTab: { [key: string]: Tab } = {
                        '/payments': 'payments', '/receipts': 'receipts', '/interventions': 'interventions', '/notice': 'notice', '/location': 'location',
                      };
                      if (linkToTab[notif.link]) handleNavigate(linkToTab[notif.link]);
                    }
                  }}>
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${notif.is_read ? 'bg-gray-300' : notif.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} />
                    <div className="flex-1">
                      <p className={`text-[0.9rem] leading-tight ${notif.is_read ? 'text-gray-500 font-medium' : 'text-gray-900 font-bold'}`}>{notif.title || notif.message}</p>
                      <p className="text-[0.85rem] text-gray-600 mt-1">{notif.message || notif.subtext}</p>
                      <p className="text-[0.75rem] text-gray-400 mt-2 font-medium uppercase tracking-wider flex items-center gap-1">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {notif.pdf_url && (
                        <a href={notif.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
                          <Download size={12} /> Télécharger document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
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
      {
        showHelp && (
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
                { title: 'Guide de démarrage locataire', desc: 'Apprenez les bases de GestiLoc', color: 'bg-green-500', route: 'help' },
                { title: 'Gérer ses incidents', desc: 'Déclarer ou suivre une intervention', color: 'bg-blue-500', route: 'interventions' },
                { title: 'Nous contacter', desc: 'Une question ?', color: 'bg-purple-500', route: 'help' },
              ].map((help, idx) => (
                <div key={idx} onClick={() => handleNavigate(help.route as Tab)} className="p-4 m-1 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100">
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
          </div>
        )
      }
    </div>
  );
};