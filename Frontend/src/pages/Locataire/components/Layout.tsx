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

// Icônes SVG colorées style illustration — comme dans la photo
const NavIcons: Record<string, React.FC<{ active?: boolean }>> = {
  home: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="13" width="22" height="13" rx="2" fill="#a8d5a2" />
      <polygon points="14,3 2,14 26,14" fill="#529D21" />
      <rect x="11" y="18" width="6" height="8" rx="1" fill="#fff" />
    </svg>
  ),
  location: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="14" cy="26" rx="6" ry="1.5" fill="#e0e0e0" />
      <path d="M14 3C9.58 3 6 6.58 6 11c0 6.63 8 14 8 14s8-7.37 8-14c0-4.42-3.58-8-8-8z" fill="#F5A623" />
      <circle cx="14" cy="11" r="3" fill="#fff" />
    </svg>
  ),
  landlord: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="8" width="20" height="17" rx="2" fill="#fbd38d" />
      <rect x="2" y="11" width="24" height="3" rx="1" fill="#F5A623" />
      <rect x="8" y="14" width="5" height="5" rx="1" fill="#fff" />
      <rect x="15" y="14" width="5" height="5" rx="1" fill="#fff" />
      <polygon points="14,2 3,11 25,11" fill="#e8c97e" />
    </svg>
  ),
  receipts: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="5" y="3" width="18" height="22" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
      <rect x="8" y="8" width="12" height="1.5" rx="0.75" fill="#64748b" />
      <rect x="8" y="12" width="9" height="1.5" rx="0.75" fill="#64748b" />
      <rect x="8" y="16" width="6" height="1.5" rx="0.75" fill="#64748b" />
      <rect x="5" y="21" width="18" height="4" rx="0 0 2 2" fill="#529D21" opacity="0.3" />
    </svg>
  ),
  documents: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="6" width="16" height="20" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
      <rect x="7" y="6" width="18" height="20" rx="2" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
      <rect x="10" y="11" width="10" height="1.5" rx="0.75" fill="#92400e" />
      <rect x="10" y="15" width="7" height="1.5" rx="0.75" fill="#92400e" />
    </svg>
  ),
  interventions: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="12" y="3" width="4" height="16" rx="2" fill="#94a3b8" transform="rotate(45 14 14)" />
      <rect x="12" y="9" width="4" height="16" rx="2" fill="#64748b" transform="rotate(-45 14 14)" />
      <circle cx="20" cy="8" r="4" fill="#f87171" />
      <line x1="18" y1="8" x2="22" y2="8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="6" x2="20" y2="10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  tasks: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="5" y="4" width="18" height="20" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="9" y="2" width="10" height="4" rx="2" fill="#94a3b8" />
      <path d="M9 13 l3 3 l7-7" stroke="#529D21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  notes: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="4" width="20" height="20" rx="2" fill="#fef9c3" stroke="#fde68a" strokeWidth="1" />
      <rect x="8" y="9" width="12" height="1.5" rx="0.75" fill="#78716c" />
      <rect x="8" y="13" width="9" height="1.5" rx="0.75" fill="#78716c" />
      <rect x="8" y="17" width="5" height="1.5" rx="0.75" fill="#78716c" />
      <path d="M20 20 l4-4 v4 z" fill="#fde68a" />
    </svg>
  ),
  notice: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="6" width="20" height="18" rx="2" fill="#ede9fe" stroke="#a78bfa" strokeWidth="1" />
      <path d="M9 6 V4 Q14 2 19 4 V6" fill="#c4b5fd" />
      <rect x="8" y="11" width="12" height="1.5" rx="0.75" fill="#7c3aed" />
      <rect x="8" y="15" width="8" height="1.5" rx="0.75" fill="#7c3aed" />
      <path d="M17 19 l3-2 v4 z" fill="#a78bfa" />
    </svg>
  ),
  payments: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="8" width="24" height="14" rx="3" fill="#529D21" />
      <rect x="2" y="12" width="24" height="4" fill="#3d7a18" />
      <rect x="5" y="17" width="5" height="2" rx="1" fill="#a8d5a2" />
      <rect x="12" y="17" width="3" height="2" rx="1" fill="#a8d5a2" />
      <circle cx="22" cy="9" r="5" fill="#F5A623" />
      <text x="22" y="13" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">$</text>
    </svg>
  ),
  settings: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="4" fill="#64748b" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <rect
          key={i}
          x="13" y="3"
          width="2" height="4"
          rx="1"
          fill="#94a3b8"
          transform={`rotate(${deg} 14 14)`}
        />
      ))}
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
    { id: 'home', label: 'Tableau de bord', image: '/Ressource_gestiloc/tb_locataire.png' },
    { id: 'location', label: 'Ma location', image: '/Ressource_gestiloc/Ma_location.png' },
    { id: 'landlord', label: 'Mon propriétaire', image: '/Ressource_gestiloc/mon_proprio.png' },
    { id: 'receipts', label: 'Mes quittances', image: '/Ressource_gestiloc/Mes_quittances.png' },
    { id: 'documents', label: 'Documents', image: '/Ressource_gestiloc/Document In Folder.png' },
    { id: 'interventions', label: 'Mes interventions', image: '/Ressource_gestiloc/Tools.png' },
    { id: 'tasks', label: 'Mes tâches', image: '/Ressource_gestiloc/Nouvelles_taches.png' },
    { id: 'notes', label: 'Mes notes', image: '/Ressource_gestiloc/Edit Property.png' },
    { id: 'notice', label: 'Préavis', image: '/Ressource_gestiloc/preavis.png' },
    { id: 'payments', label: 'Paiements', image: '/Ressource_gestiloc/paiement.png' },
    { id: 'settings', label: 'Paramètres', image: '/Ressource_gestiloc/parametre_loc.png' },
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
    const IconComponent = NavIcons[item.id as keyof typeof NavIcons];

    return (
      <button
        onClick={() => onNavigate(item.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full relative flex items-center gap-3 px-6 py-4 transition-all duration-300 group"
        style={{
          background: isActive ? 'linear-gradient(90deg, rgba(255, 235, 180, 0.4) 0%, rgba(255, 255, 255, 0) 100%)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '12px',
          marginBottom: '4px'
        }}
      >
        {/* Yellow indicator for active tab precisely as requested */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[30px] bg-[#FFB300] rounded-r-full shadow-[0px_0px_10px_#FFB300]" />
        )}

        <div className={`transition-all duration-300 ${isActive || hovered ? 'scale-110' : 'scale-100 opacity-70'}`}>
          {isLogout ? (
            <LogOut size={20} color={hovered ? "#e53935" : "#666"} />
          ) : (
            IconComponent ? <IconComponent active={isActive} /> : <div className="w-5 h-5 bg-gray-200 rounded-full" />
          )}
        </div>

        <span className={`text-sm font-bold whitespace-nowrap transition-colors duration-300 ${isActive || hovered ? 'text-[#529D21]' : 'text-gray-500'}`}>
          {item.label}
        </span>

        {isActive && (
          <div className="ml-auto">
            <ChevronRight size={16} className="text-[#529D21]" />
          </div>
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-[24px]">
      <div className="flex-1 overflow-y-auto py-6 px-4 sidebar-scroll scrollbar-hide">
        <style>{`
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onNavigate={handleNavigate}
          />
        ))}

        <div className="border-t border-gray-100 my-4 mx-2" />

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
              <div className="animate-fadeIn">
                <Landlord notify={notify} />
              </div>
            ) : (
              <div className="max-w-[1400px] mx-auto animate-fadeIn">
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