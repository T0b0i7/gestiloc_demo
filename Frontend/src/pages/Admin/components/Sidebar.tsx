import React from 'react';
import { LayoutDashboard, Users, MessageSquare, FileText, Activity, Settings as SettingsIcon, X, BarChart3, LogOut, AlertCircle } from 'lucide-react';
import { ViewType } from '../types';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
  const { t } = useAppContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  
  // ✅ FONCTION : Navigation vers Laravel
  const goToLaravelPage = (path: string) => {
    const token = localStorage.getItem('token');
    console.log("Token disponible pour Laravel:", token ? "OUI" : "NON");
    
    if (!token) {
      console.error("Aucun token trouvé pour l'authentification Laravel");
      alert("Session expirée, veuillez vous reconnecter");
      window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
      return;
    }

    const laravelBaseUrl = 'https://wheat-skunk-120710.hostingersite.com';
    let fullPath = path;
    
    if (fullPath.startsWith('/')) {
      fullPath = `${laravelBaseUrl}${fullPath}`;
    }
    
    const separator = fullPath.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    const fullUrl = `${fullPath}${separator}api_token=${encodeURIComponent(token)}&_t=${timestamp}`;
    
    console.log("Redirection vers Laravel:", fullUrl);
    window.location.href = fullUrl;
  };

  // ✅ FONCTION CORRIGÉE : Déconnexion qui redirige vers la route Laravel /logout
  const handleLogout = () => {
    // Rediriger vers la route de déconnexion Laravel
    // Laravel s'occupera de nettoyer la session et rediriger vers React
    window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
  };

  // ✅ Fonction pour gérer la navigation mixte (React ou Laravel)
  const handleNavigation = (viewId: string, isLaravelRoute = false) => {
    console.log('Navigation vers:', viewId, 'Laravel:', isLaravelRoute);
    
    if (isLaravelRoute) {
      goToLaravelPage(viewId);
    } else {
      onChangeView(viewId as ViewType);
    }
    
    if (window.innerWidth < 768) onClose();
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: t('sidebar.dashboard'), 
      icon: LayoutDashboard 
    },
    { 
      id: 'users', 
      label: t('sidebar.users'), 
      icon: Users 
    },
    { 
      id: 'tickets', 
      label: t('sidebar.tickets'), 
      icon: MessageSquare 
    },
    { 
      id: 'activity', 
      label: t('sidebar.activity'), 
      icon: Activity 
    },
    // ✅ NOUVEAU : Statistiques Globales 
    { 
      id: '/admin/statistiques', 
      label: 'Statistiques Globales', 
      icon: BarChart3,
      isLaravel: true
    },
    {
      id: '/admin/logs',
      label: 'Journaux Système',
      icon: FileText, 
      isLaravel: true
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Confirmation de déconnexion */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirmer la déconnexion
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Vous serez redirigé vers la page de connexion
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  // Appeler la déconnexion après un court délai
                  setTimeout(() => {
                    handleLogout();
                  }, 300);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-200 dark:shadow-red-900/30"
              >
                Oui, me déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col shadow-xl md:shadow-none transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg mr-3 shadow-lg shadow-blue-200 dark:shadow-none animate-pulse-glow flex items-center justify-center">
             <span className="text-white font-bold text-lg">G</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">GESTILOC</h1>
          <button onClick={onClose} className="ml-auto md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">{t('sidebar.mainMenu')}</div>
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            const isLaravelRoute = item.isLaravel || false;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLaravelRoute) {
                    goToLaravelPage(item.id);
                  } else {
                    onChangeView(item.id as ViewType);
                  }
                  
                  if (window.innerWidth < 768) onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive && !isLaravelRoute
                    ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}
                  ${isLaravelRoute ? 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400' : ''}
                `}
              >
                {isActive && !isLaravelRoute && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl animate-fadeIn" />
                )}
                
                {isLaravelRoute && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-l-xl animate-fadeIn" />
                )}
                
                <item.icon 
                  size={20} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isLaravelRoute ? 'text-green-600 dark:text-green-400' : ''}`} 
                />
                
                <span className="flex items-center gap-2">
                  {item.label}
                  {isLaravelRoute && (
                    <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 py-0.5 px-2 rounded-full">
                 
                    </span>
                  )}
                </span>
                
                {item.id === 'tickets' && (
                  <span className="ml-auto bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 py-0.5 px-2 rounded-full text-[10px] font-bold">3</span>
                )}
                
                {item.id === '/admin/statistiques' && (
                  <span className="ml-auto bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    <BarChart3 size={12} />
                  </span>
                )}
              </button>
            );
          })}
          
          <div className="my-4 border-t border-slate-100 dark:border-slate-800 mx-4" />
          
          <button
             onClick={() => {
               onChangeView('settings');
               if (window.innerWidth < 768) onClose();
             }}
             className={`
               w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
               ${currentView === 'settings' 
                 ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold' 
                 : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}
             `}
          >
             <SettingsIcon size={20} />
             <span>{t('sidebar.settings')}</span>
          </button>
          
          {/* ✅ SECTION ADMIN - Liens Laravel */}
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4 mt-8">Liens rapides</div>
          
          <div className="grid grid-cols-2 gap-2 mt-4 px-4">
            <button
              onClick={() => goToLaravelPage('/admin/statistiques/export/users')}
              className="text-xs px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
            >
              Export Users
            </button>
            <button
              onClick={() => goToLaravelPage('/admin/statistiques')}
              className="text-xs px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </nav>

        {/* User Profile Snippet at Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onChangeView('settings')}>
            <img 
              src="https://picsum.photos/100/100?random=99" 
              alt="Admin" 
              className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-800 dark:text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@gestiloc.com</p>
            </div>
            <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 py-1 px-2 rounded-full">
              Admin
            </span>
          </div>
          
          {/* ✅ BOUTON DE DÉCONNEXION - MAINTENANT FONCTIONNEL */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          >
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogOut size={18} />
            </div>
            <span className="font-medium">Se déconnecter</span>
         
          </button>
        </div>
      </div>
    </>
  );
};