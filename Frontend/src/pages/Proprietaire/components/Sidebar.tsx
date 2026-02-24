import React from 'react';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  FileText, 
  CreditCard, 
  ChevronDown,
  X, 
  Package, 
  FileCheck, 
  DollarSign, 
  PenTool, 
  Zap, 
  Plus, 
  UserPlus, 
  FilePlus, 
  Settings as SettingsIcon, 
  LogOut 
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

  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: t('sidebar.dashboard', 'Tableau de Bord'), 
      icon: LayoutDashboard,
      submenu: []
    },
    { 
      id: 'biens', 
      label: t('sidebar.properties', 'Biens'), 
      icon: Building,
      submenu: [
        { 
          id: 'ajouter-bien', 
          label: t('sidebar.addProperty', 'Ajouter un bien'), 
          icon: Plus 
        },
        { 
          id: 'mes-biens', 
          label: t('sidebar.myProperties', 'Mes biens'), 
          icon: Building 
        },
        { 
          id: 'lots', 
          label: t('sidebar.lots', 'Lots'), 
          icon: Building 
        },
        { 
          id: 'immeubles', 
          label: t('sidebar.buildings', 'Immeubles'), 
          icon: Building 
        }
      ]
    },
    { 
      id: 'locataires', 
      label: t('sidebar.tenants', 'Locataires'), 
      icon: Users,
      submenu: [
        { 
          id: 'ajouter-locataire', 
          label: t('sidebar.addTenant', 'Ajouter un locataire'), 
          icon: UserPlus 
        },
        { 
          id: 'list-tenants', 
          label: t('sidebar.tenantsList', 'Liste des locataires'), 
          icon: Users 
        }
      ]
    },
    { 
      id: 'coproprietaires', 
      label: t('sidebar.coOwners', 'Co-propriétaires'), 
      icon: Users,
      submenu: [
        { 
          id: 'list-coowners', 
          label: t('sidebar.coOwnersList', 'Liste des co-propriétaires'), 
          icon: Users 
        },
        { 
          id: 'inviter-coproprietaire', 
          label: t('sidebar.inviteCoOwner', 'Inviter un co-propriétaire'), 
          icon: UserPlus 
        }
      ]
    },
    { 
      id: 'locations', 
      label: t('sidebar.rentals', 'Locations'), 
      icon: FileText,
      submenu: [
        { 
          id: 'nouvelle-location', 
          label: t('sidebar.newRental', 'Nouvelle location'), 
          icon: FilePlus 
        },
        { 
          id: 'liste-locations', 
          label: t('sidebar.rentalsList', 'Liste des locations'), 
          icon: FileText 
        }
      ]
    },
    { 
      id: 'inventory', 
      label: t('sidebar.inventory', 'Inventaires'), 
      icon: Package,
      submenu: []
    },
    { 
      id: 'etats-lieux', 
      label: t('sidebar.inspection', 'État des lieux'), 
      icon: FileCheck,
      submenu: []
    },
    { 
      id: 'finances', 
      label: t('sidebar.finances', 'Finances'), 
      icon: DollarSign,
      submenu: [
        { 
          id: 'finances-overview', 
          label: t('sidebar.financesOverview', 'Aperçu'), 
          icon: DollarSign 
        },
        { 
          id: 'finances-loans', 
          label: t('sidebar.loans', 'Prêts'), 
          icon: CreditCard 
        },
        { 
          id: 'finances-summary', 
          label: t('sidebar.summary', 'Bilan'), 
          icon: FileText 
        },
        { 
          id: 'finances-tax', 
          label: t('sidebar.taxDeclarations', 'Déclarations fiscales'), 
          icon: FileText 
        }
      ]
    },
    { 
      id: 'documents', 
      label: t('sidebar.documents', 'Documents'), 
      icon: FileText,
      submenu: [
        { 
          id: 'my-documents', 
          label: t('sidebar.myDocuments', 'Mes documents'), 
          icon: FileText 
        },
        { 
          id: 'e-signature', 
          label: t('sidebar.eSignature', 'Signature électronique'), 
          icon: PenTool 
        },
        { 
          id: 'letter-templates', 
          label: t('sidebar.letterTemplates', 'Modèles de lettres'), 
          icon: FileText 
        },
        { 
          id: 'onboarding', 
          label: t('sidebar.gettingStarted', 'Démarrer l\'utilisation'), 
          icon: Zap 
        }
      ]
    },
  ];

  // Vérifie si un élément du sous-menu est actif
  const isSubmenuItemActive = (submenu: { id: string }[]) => {
    return submenu.some(item => item.id === activeTab);
  };

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
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">
            {t('sidebar.mainMenu', 'Menu Principal')}
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
                        ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-expanded={hasSubmenu ? isExpanded : undefined}
                  aria-controls={hasSubmenu ? `submenu-${item.id}` : undefined}
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
                                ? 'bg-blue-50/80 text-blue-600 dark:bg-slate-800/80 dark:text-blue-400 font-medium'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                          <SubIcon 
                            size={16} 
                            className={`${
                              isSubActive 
                                ? 'text-blue-600 dark:text-blue-400' 
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {t('user.initials', 'PM')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {t('user.name', 'Propriétaire')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t('user.role', 'Propriétaire')}
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
