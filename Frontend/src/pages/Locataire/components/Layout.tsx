import React, { useState, useEffect } from 'react';
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  Bell,
  User,
  LogOut,
  Building,
  ChevronRight,
  Menu,
  X,
  FileSignature,
} from 'lucide-react';
import { Tab, Notification, ToastMessage } from '../types';
import { Toast } from './ui/Toast';

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
  user: UserData | null;

  // ✅ AJOUTE ÇA
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
  user,
  isDarkMode,
  toggleTheme,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('app-scroll-container');
    if (!el) return;

    const handleScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (tab: Tab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'property', label: 'Mon bail', icon: Building },
    { id: 'receipts', label: 'Quittances', icon: FileText },
    { id: 'interventions', label: 'Incidents', icon: Wrench },
    { id: 'notice', label: 'Préavis', icon: FileSignature },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'factures', label: 'Paiements', icon: CreditCard },
  ];

  const userInitials =
    user
      ? (`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
          user.email?.[0]?.toUpperCase() ||
          'U')
      : 'U';

  const userLabel =
    user
      ? user.first_name || user.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user.email
      : 'Utilisateur';

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR FIXE */}
      <aside
        className={`
          fixed top-4 bottom-4 left-4 z-50 w-72
          bg-white border border-blue-200 rounded-3xl shadow-xl
          flex flex-col
          transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Building size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Espace</h1>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">
                Locataire
              </span>
            </div>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="px-4 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="mt-auto p-4 border-t border-blue-100 space-y-3">
          <div
            onClick={() => handleNavigate('profile')}
            className="bg-blue-50 p-3 rounded-2xl flex items-center gap-3 border border-blue-200 cursor-pointer hover:bg-blue-100"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{userLabel}</p>
              <p className="text-[10px] uppercase font-bold text-gray-500">Locataire</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 lg:ml-[20rem] flex flex-col h-screen">
        {/* Header */}
        <header
          className={`sticky top-0 z-30 px-4 lg:px-8 py-4 border-b ${
            scrolled ? 'bg-white shadow-sm' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
              <h2 className="font-bold text-lg">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h2>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h2>
            </div>

            <button
              className="relative p-2 bg-blue-50 rounded-full border border-blue-200"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Scroll UNIQUE */}
        <div id="app-scroll-container" className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-8 pb-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
