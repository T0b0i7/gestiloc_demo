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
      <triangle points="14,2 3,11 25,11" fill="#c8a96e" />
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
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
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
      const notificationsWithUniqueKeys = notificationsData.map((notif: NotificationItem, index: number) => ({
        ...notif,
        _uniqueKey: `notif-${notif.id}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
    switch(type) {
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
    switch(type) {
      case 'critical': return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
      case 'important': return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500';
      default: return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500';
    }
  };

  const menuItems = [
    { id: 'home',          label: 'Tableau de bord',   iconKey: 'home' },
    { id: 'landlord',      label: 'Mon propriétaire',  iconKey: 'landlord' },
    { id: 'location',      label: 'Ma location',       iconKey: 'location' },
    { id: 'receipts',      label: 'Mes quittances',    iconKey: 'receipts' },
    { id: 'documents',     label: 'Documents',         iconKey: 'documents' },
    { id: 'interventions', label: 'Mes interventions', iconKey: 'interventions' },
    { id: 'tasks',         label: 'Mes tâches',        iconKey: 'tasks' },
    { id: 'notes',         label: 'Mes notes',         iconKey: 'notes' },
    { id: 'notice',        label: 'Préavis',           iconKey: 'notice' },
    { id: 'payments',      label: 'Paiements',         iconKey: 'payments' },
    { id: 'settings',      label: 'Paramètres',        iconKey: 'settings' },
  ];

  const userInitials = user
    ? (`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U')
    : 'U';

  const userLabel = user
    ? user.first_name || user.last_name
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user.email
    : 'Utilisateur';

  // ─── SIDEBAR CONTENT (partagé mobile + desktop) ───────────────────────────
  const SidebarContent = () => (
    <>
      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = NavIcons[item.iconKey];
            const isFirst = item.id === 'home';

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as Tab)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'text-[#529D21]'
                    : isFirst
                      ? 'text-[#529D21] hover:bg-gray-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                style={isActive ? {
                  background: 'linear-gradient(to right, rgba(253,230,138,0.6), rgba(253,230,138,0.05))',
                } : {}}
              >
                {/* Icône SVG illustration */}
                <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                  {IconComponent ? <IconComponent active={isActive} /> : null}
                </span>
                <span className={`${isActive || isFirst ? 'font-semibold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile + Déconnexion — toujours en bas */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <div
          onClick={() => handleNavigate('profile' as Tab)}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-1"
        >
          <div className="w-9 h-9 rounded-full bg-[#529D21] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userLabel}</p>
            <p className="text-xs text-gray-400">Locataire</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Déconnexion en cours...</span>
            </>
          ) : (
            <>
              <LogOut size={16} className="shrink-0" />
              <span>Déconnexion</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">

      {/* ── HEADER ── */}
      <header
        className="px-4 sm:px-6 py-3 fixed top-0 left-0 right-0 z-[100] h-[60px]"
        style={{ background: 'rgba(82, 157, 33, 0.82)' }}
      >
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-3">
            {activeTab !== 'home' && (
              <button
                onClick={() => handleNavigate('home')}
                className="p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Menu"
            >
              <Menu size={24} className="text-white" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Gestiloc</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="relative flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="hidden sm:inline text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              onClick={() => setShowHelp(!showHelp)}
              aria-label="Aide"
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline text-sm">Aide</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              onClick={() => handlePageChange('profile')}
              aria-label="Mon compte"
            >
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-xs font-bold">{userInitials}</span>
              </div>
              <span className="hidden sm:inline text-sm">Mon compte</span>
            </button>
          </div>
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
          fixed top-0 left-0 h-full w-[280px] z-[100]
          bg-white flex flex-col
          transition-transform duration-300 ease-out
          lg:border-r lg:border-gray-200 lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:w-64 lg:top-[60px] lg:h-[calc(100vh-60px)] lg:z-40'}
        `}
      >
        {/* Mobile Header */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: 'rgba(82, 157, 33, 0.82)' }}
        >
          <h2 className="text-base font-bold text-white">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X size={22} className="text-white" />
          </button>
        </div>

        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 h-[calc(100vh-60px)] relative pt-[60px]">
        {/* Toasts */}
        <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>

        <main className="flex-1 flex flex-col ml-0 lg:ml-64 h-full overflow-hidden z-0 relative">
          <div id="app-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 scroll-smooth">
            {activeTab === 'landlord' ? (
              <Landlord notify={notify} />
            ) : (
              <div className="p-4 sm:p-6 pt-6 sm:pt-8 max-w-7xl mx-auto">
                {children}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── NOTIFICATIONS DROPDOWN ── */}
      {showNotifications && (
        <div className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
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
              <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
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
        <div className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Aide</h3>
            <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
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
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => { setShowHelp(false); window.location.href = '/help'; }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Voir toute l'aide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;