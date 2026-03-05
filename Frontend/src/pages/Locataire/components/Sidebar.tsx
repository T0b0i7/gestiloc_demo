import React from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Building, 
  FileText, 
  Wrench, 
  CheckSquare, 
  StickyNote, 
  Calendar, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut,
  Receipt,
  X,
  ChevronDown
} from 'lucide-react';
import { Tab } from '../types';

// Import des polices
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
`;

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
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  // Fonction de traduction simplifiée
  const t = (key: string, fallback: string) => fallback;

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Vérifie si un élément du sous-menu est actif
  const isSubmenuItemActive = (submenu: { id: string }[]) => {
    return submenu.some(item => item.id === activeTab);
  };

  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
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
      <style>{fontStyles}</style>
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
        style={{
          boxShadow: '0px 5px 8.6px 0px rgba(131, 199, 87, 0.3)',
          borderRadius: '0 14px 14px 0',
        }}
      >
        {/* Zone du logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800" style={{
          background: 'linear-gradient(90deg, #4CAF50 0%, #43a047 60%, #388E3C 100%)',
        }}>
          <div className="w-8 h-8 bg-white/20 rounded-lg mr-3 shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{
            fontFamily: "'Merriweather', serif",
          }}>
            GESTILOC
          </h1>
          <button 
            onClick={onClose} 
            className="ml-auto md:hidden text-white/70 hover:text-white"
            aria-label="Fermer le menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">
            {t('sidebar.mainMenu', 'Menu Locataire')}
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.submenu.length > 0 && isSubmenuItemActive(item.submenu));
            const hasSubmenu = item.submenu.length > 0;
            const isExpanded = expandedMenus.includes(item.id) || isActive;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      toggleMenu(item.id);
                    } else {
                      onNavigate(item.id as Tab);
                      onClose();
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all 
                    duration-200 group relative overflow-hidden
                    ${
                      isActive
                        ? 'bg-green-50 text-green-700 font-semibold shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-green-50 hover:text-green-700'
                    }`}
                  aria-expanded={hasSubmenu ? isExpanded : undefined}
                  aria-controls={hasSubmenu ? `submenu-${item.id}` : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-l-xl animate-fadeIn" />
                  )}
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} 
                  />
                  <span className="text-left">{item.label}</span>
                  {hasSubmenu && (
                    <ChevronDown 
                      size={18} 
                      className={`ml-auto transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      } text-slate-400`}
                    />
                  )}
                </button>

                {/* Sous-menu */}
                {hasSubmenu && isExpanded && (
                  <div 
                    id={`submenu-${item.id}`}
                    className="mt-1 ml-6 space-y-1 border-l-2 border-slate-100 dark:border-slate-700 pl-4 py-1"
                  >
                    {item.submenu.map((subitem) => {
                      const SubIcon = subitem.icon;
                      const isSubActive = activeTab === subitem.id;
                      
                      return (
                        <button
                          key={subitem.id}
                          onClick={() => {
                            onNavigate(subitem.id as Tab);
                            onClose();
                          }}
                          className={`
                            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm 
                            transition-all duration-200
                            ${
                              isSubActive
                                ? 'bg-green-50/80 text-green-600 font-medium'
                                : 'text-slate-500 hover:bg-green-50 hover:text-green-600'
                            }`}
                        >
                          <SubIcon 
                            size={16} 
                            className={`${
                              isSubActive 
                                ? 'text-green-600' 
                                : 'text-slate-400'
                            }`} 
                          />
                          <span>{subitem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
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
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-green-50 hover:text-green-700'
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
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
