import React, { useState, useEffect } from 'react';
import {
  Home,
  Key,
  FileText,
  Folder,
  Wrench,
  CheckSquare,
  StickyNote,
  FileSignature,
  CreditCard,
  Settings,
  Menu,
  X,
  Bell,
  ArrowLeft,
  LogOut,
  Building,
  HelpCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  Info,
  FileText as FileIcon,
  CreditCard as CreditCardIcon,
  Home as HomeIcon,
  Wrench as WrenchIcon,
  Bell as BellIcon,
  ChevronRight,
  User as UserIcon,
  Download,
} from 'lucide-react';
import { Tab, Notification, ToastMessage } from '../types';
import { Toast } from './ui/Toast';
import { Landlord } from './Landlord';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

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
  subtext: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  icon?: string;
  pdf_url?: string;
  _uniqueKey?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
  onLogout: () => void;
  user: UserData | null;
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ic = (c: string) => ({
  stroke: c,
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
});

const Icons: Record<string, React.FC<{ c: string }>> = {
  LayoutDashboard: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Home: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  Building: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  ),
  Receipt: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M4 2v20l3-2 2 2 3-2 3 2 2-2 3 2V2l-3 2-2-2-3 2-3-2-2 2-3-2z" />
      <line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="14" y2="14" />
    </svg>
  ),
  FileText: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  Wrench: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  CheckSquare: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  StickyNote: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h8l6-6V4a2 2 0 00-2-2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Calendar: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  CreditCard: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Settings: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 01-2.83 0l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  LogOut: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
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
  isDarkMode,
  toggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // Nouvel état pour la confirmation
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementById('app-scroll-container');
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowLogoutConfirm(false); // Fermer la modale
    try {
      await api.post('/logout');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      navigate('/login');
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      navigate('/login');
      notify('Erreur lors de la déconnexion', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await api.get('/tenant/notifications');
      const notificationsData = response.data.notifications || [];
      // Always generate unique keys to prevent duplicate key warnings
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
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) markAsRead(notification.id);
    if (notification.link) {
      const linkToTab: { [key: string]: Tab } = {
        '/payments': 'payments',
        '/receipts': 'receipts',
        '/interventions': 'interventions',
        '/notice': 'notice',
        '/location': 'location',
      };
      const targetTab = linkToTab[notification.link];
      if (targetTab) onNavigate(targetTab);
    }
    setShowNotifications(false);
  };

  const handleNavigate = (tab: Tab) => {
    if (activeTab !== tab) onNavigate(tab);
    setIsMobileMenuOpen(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: string) => {
    const validTabIds = ['home', 'location', 'landlord', 'receipts', 'documents', 'interventions', 'tasks', 'notes', 'notice', 'payments', 'settings', 'profile'];
    if (validTabIds.includes(page)) onNavigate(page as Tab);
    setIsMobileMenuOpen(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNotificationIcon = (type: string, iconName?: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'critical': return <AlertTriangle className={`${iconClass} text-red-500`} />;
      case 'important': return <Clock className={`${iconClass} text-orange-500`} />;
      default:
        if (iconName === 'file-text') return <FileIcon className={`${iconClass} text-blue-500`} />;
        if (iconName === 'credit-card') return <CreditCardIcon className={`${iconClass} text-green-500`} />;
        if (iconName === 'home') return <HomeIcon className={`${iconClass} text-purple-500`} />;
        if (iconName === 'wrench') return <WrenchIcon className={`${iconClass} text-orange-500`} />;
        if (iconName === 'file-signature') return <FileSignature className={`${iconClass} text-yellow-500`} />;
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'hover:bg-gray-50';
    switch (type) {
      case 'critical': return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
      case 'important': return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500';
      default: return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500';
    }
  };

  const menuItems = [
    { id: 'home', label: 'Tableau de bord', icon: 'LayoutDashboard' },
    { id: 'location', label: 'Ma location', icon: 'Home' },
    { id: 'landlord', label: 'Mon propriétaire', icon: 'Building' },
    { id: 'receipts', label: 'Mes quittances', icon: 'Receipt' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'interventions', label: 'Mes interventions', icon: 'Wrench' },
    { id: 'tasks', label: 'Mes tâches', icon: 'CheckSquare' },
    { id: 'notes', label: 'Mes notes', icon: 'StickyNote' },
    { id: 'notice', label: 'Préavis', icon: 'Calendar' },
    { id: 'payments', label: 'Paiements', icon: 'CreditCard' },
    { id: 'settings', label: 'Paramètres', icon: 'Settings' },
  ];

  const userInitials = user
    ? (`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U')
    : 'U';

  const userLabel = user
    ? user.first_name || user.last_name
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user.email
    : 'Utilisateur';

  // ─── COMPOSANTS DU NOUVEAU DESIGN ───────────────────────────
  const ic = (c: string) => ({ stroke: c, fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

  const NavItem = ({ item, isActive, onNavigate, isLogout }: any) => {
    const [hovered, setHovered] = useState(false);
    const IconComponent = Icons[item.icon as keyof typeof Icons];

    const iconColor = isLogout
      ? (hovered ? "#e53935" : "#aaa")
      : isActive ? "#4CAF50" : hovered ? "#4CAF50" : "#888";

    const textColor = isLogout
      ? (hovered ? "#e53935" : "#888")
      : isActive ? "#4CAF50" : hovered ? "#4CAF50" : "#444";

    return (
      <button
        onClick={() => onNavigate(item.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full relative flex items-center gap-3 px-6 py-3.5 transition-all duration-300 group"
        style={{
          background: isActive ? 'linear-gradient(90deg, rgba(255, 213, 124, 0.4) 0%, rgba(255, 255, 255, 0) 100%)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '10px',
          marginBottom: '2px'
        }}
      >
        {/* Yellow indicator for active tab precisely as requested */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#FFB300] rounded-r-full" />
        )}

        <div className={`transition-all duration-300 ${isActive || hovered ? 'scale-110' : 'scale-100'}`}>
          {isLogout ? (
            <Icons.LogOut c={iconColor} />
          ) : (
            IconComponent ? <IconComponent c={iconColor} /> : <div className="w-5 h-5 bg-gray-200 rounded-full" />
          )}
        </div>

        <span className={`text-sm whitespace-nowrap transition-colors duration-300 ${isActive ? 'font-bold' : 'font-medium'} ${isActive || hovered ? 'text-[#4CAF50]' : 'text-[#444]'}`}>
          {item.label}
        </span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-[24px]">
      <div className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll scrollbar-hide">
        <style>{`
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div style={{
          fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.10em",
          color: "#bbb", textTransform: "uppercase",
          padding: "0.4rem 1.2rem 0.8rem", whiteSpace: "nowrap",
          fontFamily: "'Manrope', sans-serif"
        }}>
          Menu Locataire
        </div>

        {menuItems.map((item) => (
          <div key={item.id}>
            {item.id === "settings" && (
              <div className="border-t border-gray-100 my-2 mx-2" />
            )}
            <NavItem
              item={item}
              isActive={activeTab === item.id}
              onNavigate={handleNavigate}
            />
          </div>
        ))}

        <NavItem
          item={{ id: 'logout', label: 'Déconnexion' }}
          isActive={false}
          onNavigate={() => setShowLogoutConfirm(true)}
          isLogout
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[rgba(254,255,253,1)] flex flex-col transition-all duration-300" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-between px-6 sm:px-12" style={{
        background: '#70AE48',
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} className="text-white" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Gestiloc</h1>
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#70AE48]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
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
            onClick={() => handlePageChange('profile')}
            className="flex items-center gap-2 py-2 px-6 rounded-full text-white text-xs sm:text-sm font-semibold transition-all hover:bg-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Mon compte"
          >
            <UserIcon size={18} className="text-gray-900" />
            <span className="hidden sm:inline">Mon compte</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE BACKDROP ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
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
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05), 0px 5px 25px rgba(112, 174, 72, 0.15)',
            maxHeight: 'calc(100vh - 140px)',
          } : {
            boxShadow: '10px 0px 30px rgba(0,0,0,0.1)',
          }
        }
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 relative pt-[72px] overflow-hidden">
        {/* Toasts */}
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="h-full ml-0 lg:ml-[320px] transition-all duration-300">
          <div id="app-scroll-container" className="h-full overflow-y-auto px-4 sm:px-12 py-8 scroll-smooth scrollbar-hide">
            {activeTab === 'landlord' ? (
              <div>
                <Landlord notify={notify} />
              </div>
            ) : (
              <div className="max-w-[1400px] mx-auto">
                {children}
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ── MODALE DE CONFIRMATION DE DÉCONNEXION ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut size={28} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Déconnexion</h3>
                  <p className="text-sm text-gray-500">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800 flex items-start gap-3">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <span>Vous devrez vous reconnecter pour accéder à votre espace locataire. Toutes les modifications non enregistrées seront perdues.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Déconnexion...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={18} />
                      <span>Se déconnecter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS DROPDOWN ── */}
      {showNotifications && (
        <div className="fixed inset-0 sm:inset-auto sm:top-20 sm:right-6 sm:w-96 bg-white sm:rounded-xl shadow-2xl border-t sm:border border-gray-200 z-[110] flex flex-col h-full sm:h-auto max-h-[600px]">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 font-merriweather">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-600 flex items-center gap-1"
                title="Tout marquer comme lu"
              >
                <CheckCircle size={16} />
                <span className="hidden sm:inline">Tout marquer</span>
              </button>
              <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors btn-hover">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[450px]">
            {loadingNotifications ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#529D21] mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune notification</p>
                <p className="text-xs text-gray-400 mt-1">Vous serez notifié en cas de nouvelle activité</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._uniqueKey || `notif-${notification.id}-${Math.random()}`}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 ${getNotificationBgColor(notification.type, notification.is_read)} cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 relative group`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type, notification.icon)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {notification.pdf_url && (
                        <a
                          href={notification.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={12} />
                          Télécharger le document
                        </a>
                      )}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Marquer comme lu"
                    >
                      <CheckCircle size={14} className="text-green-600" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => { setShowNotifications(false); handlePageChange('notifications'); }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}

      {/* ── HELP DROPDOWN ── */}
      {showHelp && (
        <div className="fixed inset-0 sm:inset-auto sm:top-20 sm:right-6 sm:w-96 bg-white sm:rounded-xl shadow-2xl border-t sm:border border-gray-200 z-[110] flex flex-col h-full sm:h-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900 font-merriweather">Aide & Support</h3>
            <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors btn-hover">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-96">
            {[
              { color: 'bg-green-500', title: 'Guide de démarrage', sub: 'Apprenez les bases de GestiLoc' },
              { color: 'bg-blue-500', title: "Centre d'aide complet", sub: 'Accédez à tous nos guides' },
              { color: 'bg-purple-500', title: 'Contactez le support', sub: 'Notre équipe est là pour vous aider' },
            ].map((item, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 ${item.color} rounded-full mt-2 flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <button
              onClick={() => { setShowHelp(false); window.location.href = '/help'; }}
              className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm text-blue-600 hover:text-blue-700 font-bold shadow-sm transition-all active:scale-[0.98] btn-hover"
            >
              Voir toute l'aide
            </button>
          </div>
        </div>
      )}

      {/* Styles pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layout;