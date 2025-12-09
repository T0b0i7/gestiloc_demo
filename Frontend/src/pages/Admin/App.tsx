import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { SupportTickets } from './components/SupportTickets';
import { SystemActivity } from './components/SystemActivity';
import { Settings } from './components/Settings';
import { ViewType, AppNotification } from './types';
import { Menu, Bell, Search, Moon, Sun, Languages, Check, Trash2, Info, AlertCircle } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme, language, setLanguage, t } = useAppContext();
  
  // Mock Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', title: 'New Ticket Created', message: 'Alice created a ticket regarding Heating.', time: '5 min ago', read: false, type: 'info' },
    { id: '2', title: 'Payment Failed', message: 'Tenant Marc Leroy payment was declined.', time: '1 hr ago', read: false, type: 'alert' },
    { id: '3', title: 'System Update', message: 'Maintenance scheduled for tonight.', time: '5 hrs ago', read: true, type: 'warning' },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);

  // Handle click outside notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  // Simulate initial loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <UserManagement />;
      case 'tickets': return <SupportTickets />;
      case 'activity': return <SystemActivity />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative mb-4">
             <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                title="Toggle menu"
                aria-label="Toggle navigation menu"
             >
                <Menu size={24} />
             </button>
             <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-900 transition-all">
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder={t('common.search')}
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
             </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Language Toggle */}
             <button
               onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sky-500 dark:text-sky-400 transition-colors flex items-center gap-1"
               title="Change Language"
             >
               <Languages size={20} />
               <span className="text-xs font-bold uppercase">{language}</span>
             </button>

             {/* Theme Toggle */}
             <button 
               onClick={toggleTheme}
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
               title="Toggle Theme"
             >
               {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>

            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce"></span>
                )}
              </button>

              {/* Dropdown Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-slide-in origin-top-right">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">{t('common.notifications')}</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t('common.markAllRead')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                        {t('common.noNotifications')}
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                          </div>
                          <button 
                            onClick={() => deleteNotif(notif.id)} 
                            className="text-slate-400 hover:text-red-500 transition-colors h-fit"
                            title="Delete notification"
                            aria-label="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <div className="flex flex-col items-end sm:block cursor-pointer" onClick={() => setCurrentView('settings')}>
               <span className="text-xs font-bold text-slate-700 dark:text-slate-200">GESTILOC Admin</span>
               <span className="text-[10px] text-emerald-500 font-medium flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                 {t('common.online')}
               </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950 relative">
           {/* Animated Content Wrapper */}
           <div key={currentView} className="animate-fade-in-up h-full">
             {renderView()}
           </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;