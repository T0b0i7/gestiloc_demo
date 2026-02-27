import React from 'react';
import { 
  LayoutDashboard, 
  Home, 
  User, 
  FileText, 
  Wrench, 
  CheckSquare, 
  StickyNote, 
  Calendar, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut,
  Receipt,
  Building
} from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  submenu: {
    id: string;
    label: string;
    icon: React.ElementType;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onNavigate, 
  isOpen, 
  onClose, 
  onLogout 
}) => {
  // Fonction de traduction simplifiée
  const t = (key: string, fallback: string) => fallback;

  const menuItems: MenuItem[] = [
    { 
      id: 'home', 
      label: t('sidebar.dashboard', 'Tableau de bord'), 
      icon: LayoutDashboard,
      submenu: []
    },
    { 
      id: 'location', 
      label: t('sidebar.myLease', 'Ma location'), 
      icon: Home,
      submenu: []
    },
    { 
      id: 'landlord', 
      label: t('sidebar.myLandlord', 'Mon propriétaire'), 
      icon: Building,
      submenu: []
    },
    { 
      id: 'receipts', 
      label: t('sidebar.receipts', 'Mes quittances'), 
      icon: Receipt,
      submenu: []
    },
    { 
      id: 'documents', 
      label: t('sidebar.documents', 'Documents'), 
      icon: FileText,
      submenu: []
    },
    { 
      id: 'interventions', 
      label: t('sidebar.interventions', 'Mes interventions'), 
      icon: Wrench,
      submenu: []
    },
    { 
      id: 'tasks', 
      label: t('sidebar.tasks', 'Mes tâches'), 
      icon: CheckSquare,
      submenu: []
    },
    { 
      id: 'notes', 
      label: t('sidebar.notes', 'Mes notes'), 
      icon: StickyNote,
      submenu: []
    },
    { 
      id: 'notice', 
      label: t('sidebar.notice', 'Préavis'), 
      icon: Calendar,
      submenu: []
    },
    { 
      id: 'payments', 
      label: t('sidebar.payments', 'Paiements'), 
      icon: CreditCard,
      submenu: []
    },
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Conteneur de la barre latérale */}
      <div 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 
          border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl 
          md:shadow-none transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Zone du logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg mr-3 shadow-lg shadow-blue-200 dark:shadow-none animate-pulse-glow flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            GESTILOC
          </h1>
          <button 
            onClick={onClose} 
            className="ml-auto md:hidden text-slate-400 hover:text-slate-600"
            aria-label="Fermer le menu"
          >
            <LogOut size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">
            {t('sidebar.mainMenu', 'Menu Locataire')}
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    onNavigate(item.id as Tab);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all 
                    duration-200 group relative overflow-hidden
                    ${
                      isActive
                        ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl animate-fadeIn" />
                  )}
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} 
                  />
                  <span className="text-left">{item.label}</span>
                </button>
              </div>
            );
          })}
          
          <div className="my-4 border-t border-slate-100 dark:border-slate-800 mx-4" />
          
          <button
            onClick={() => {
              onNavigate('settings' as Tab);
              onClose();
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all 
              duration-200 group
              ${
                activeTab === 'settings'
                  ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <SettingsIcon size={20} />
            <span>{t('sidebar.settings', 'Paramètres')}</span>
          </button>
        </nav>

        {/* Profil utilisateur en bas */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={() => {
              onNavigate('profile' as Tab);
              onClose();
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {t('user.initials', 'LT')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {t('user.name', 'Locataire')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t('user.role', 'Locataire')}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title={t('auth.logout', 'Déconnexion')}
              aria-label={t('auth.logout', 'Déconnexion')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
