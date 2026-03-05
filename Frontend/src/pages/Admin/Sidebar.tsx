import React from 'react';
import { LayoutDashboard, Users, MessageSquare, Activity, Settings as SettingsIcon, X } from 'lucide-react';
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
  
  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { id: 'users', label: t('sidebar.users'), icon: Users },
    { id: 'tickets', label: t('sidebar.tickets'), icon: MessageSquare },
    { id: 'activity', label: t('sidebar.activity'), icon: Activity },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

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
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewType);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl animate-fadeIn" />
                )}
                <item.icon 
                  size={20} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                />
                <span>{item.label}</span>
                {item.id === 'tickets' && (
                  <span className="ml-auto bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 py-0.5 px-2 rounded-full text-[10px] font-bold">3</span>
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
        </nav>

        {/* User Profile Snippet at Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onChangeView('settings')}>
            <img 
              src="https://picsum.photos/100/100?random=99" 
              alt="Admin" 
              className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">Sophie Martin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};