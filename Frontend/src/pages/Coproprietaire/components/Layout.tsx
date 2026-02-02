import React, { useEffect, useMemo, useState } from "react";
import {
  Building,
  LayoutDashboard,
  Home,
  Users,
  FileSignature,
  Bell,
  FileText,
  FileCheck,
  Wrench,
  UserPlus,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  CreditCard,
  DollarSign,
  User,
  Wallet,
  ExternalLink,
} from "lucide-react";

import { Tab, ToastMessage } from '../types';
import { Toast } from './ui/Toast';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface MenuItem {
  id: Tab | string;
  label: string;
  icon: React.ElementType;
  path?: string;
  submenu?: MenuItem[];
  badge?: number;
  isLaravel?: boolean;
}

type UserData = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar?: string | null;
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  toasts,
  removeToast,
  onLogout,
  isDarkMode,
  toggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>("biens");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Impossible de lire user depuis localStorage", e);
    }
  }, []);

  const ownerName = useMemo(() => {
    if (!user) return "Co-propriétaire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "Co-propriétaire";
  }, [user]);

  const ownerInitials = useMemo(() => {
    if (!user) return "C";
    const a = (user.first_name?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    const initials = `${a}${b}`.trim();
    return initials || (user.email?.[0] || "C").toUpperCase();
  }, [user]);

  // ✅ FONCTION : Navigation vers Laravel avec token
  const goToLaravelPage = (path: string) => {
    const token = localStorage.getItem("token");
    console.log("Token disponible pour Laravel:", token ? "OUI" : "NON");
    
    if (!token) {
      console.error("Aucun token trouvé pour l'authentification Laravel");
      alert("Session expirée, veuillez vous reconnecter");
      onNavigate('/login' as Tab);
      return;
    }

    const laravelBaseUrl = 'http://localhost:8000';
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

  // ✅ FONCTION : Navigation unifiée
  const handleNavigation = (path: string, isLaravel = false) => {
    console.log('Navigation vers:', path, 'Laravel:', isLaravel);
    
    if (isLaravel || path.startsWith('/test-laravel')) {
      goToLaravelPage(path);
    } else {
      onNavigate(path as Tab);
    }
    
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Menu mixte : Routes React ET Laravel
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      path: "/coproprietaire/dashboard",
    },
    {
      id: "biens",
      label: "Gestion des Biens",
      icon: Building,
      submenu: [
        { 
          id: "biens", 
          label: "Mes biens délégués", 
          icon: Home, 
          path: "/coproprietaire/biens" 
        },
        { 
          id: "delegations", 
          label: "Délégations reçues", 
          icon: Building, 
          path: "/coproprietaire/delegations" 
        },


        
      ],
    },
    {
      id: "gestion-locative",
      label: "Gestion Locative",
      icon: FileSignature,
      submenu: [
        { 
          id: "locataires", 
          label: "Liste des locataires", 
          icon: Users, 
          path: "/coproprietaire/tenants",
          isLaravel: true
        },
        { 
          id: "create-tenant", 
          label: "Créer un locataire", 
          icon: UserPlus, 
          path: "/coproprietaire/tenants/create",
          isLaravel: true
        },
        { 
          id: "assign-property", 
          label: "Assigner un bien", 
          icon: Home, 
          path: "/coproprietaire/assign-property/create",
          isLaravel: true
        },

{
  id: "leases-index",
  label: "Contrats de bail",
  icon: FileSignature,   
  path: "/coproprietaire/leases",
  isLaravel: true
},

     {
  id: "co-owner-quittances-index",
  label: "Quittances de loyer",
  icon: Bell,
  path: "/coproprietaire/quittances",
  isLaravel: true
},

{
  id: "co-owner-notices-index",
  label: "Préavis",
  icon: Bell,          
  path: "/coproprietaire/notices",
  isLaravel: true
},

{
  id: "co-owner-maintenance-index",
  label: "Demandes de maintenance",
  icon: Wrench, 
  path: "/coproprietaire/maintenance",
  isLaravel: true
},
  
        { 
          id: "baux", 
          label: "Baux en cours", 
          icon: FileText, 
          path: "/coproprietaire/baux" 
        },

      ],
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      submenu: [
        { 
          id: "documents", 
          label: "Mes documents", 
          icon: FileText, 
          path: "/coproprietaire/documents" 
        },
        { 
          id: "finances", 
          label: "Finances", 
          icon: DollarSign, 
          path: "/coproprietaire/finances" 
        },
      ],
    },
    {
      id: "profile",
      label: "Profil",
      icon: User,
      path: "/coproprietaire/profile",
    },
    
    {
      id: "finances",
      label: "Finances",
      icon: CreditCard,
      submenu: [
        {
          id: "emettre-paiement",
          label: "Émettre un paiement",
          icon: CreditCard,
          path: "/coproprietaire/emettre-paiement",
        },
        {
          id: "retrait-methode",
          label: "Méthode de retrait",
          icon: Wallet,
          path: "/coproprietaire/retrait-methode",
        },
      ],
    },
  ];

  const flatMenu = useMemo(() => {
    const items: MenuItem[] = [];
    const walk = (arr: MenuItem[]) => {
      arr.forEach((i) => {
        items.push(i);
        if (i.submenu?.length) walk(i.submenu);
      });
    };
    walk(menuItems);
    return items;
  }, []);

  const activeTitle = useMemo(() => {
    const found = flatMenu.find((i) => i.path === activeTab || i.id === activeTab);
    return found?.label ?? "Tableau de bord";
  }, [activeTab, flatMenu]);

  // ✅ Auto-open du menu parent du sous-menu actif
  useEffect(() => {
    const parent = menuItems.find((m) => m.submenu?.some((s) => s.path === activeTab || s.id === activeTab));
    if (parent?.id) setExpandedMenu(String(parent.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleMenuItemClick = (item: MenuItem) => {
    console.log('Click menu:', item.label, 'path:', item.path, 'Laravel?', item.isLaravel);
    
    if (item.path) {
      handleNavigation(item.path, item.isLaravel);
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenu((prev) => (prev === menuId ? null : menuId));
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;

    const isActive =
      (item.path && item.path === activeTab) ||
      item.id === activeTab ||
      (item.submenu?.some((s) => s.path === activeTab || s.id === activeTab) ?? false);

    const hasSub = !!item.submenu?.length;
    const isExpanded = expandedMenu === String(item.id);

    const baseBtn =
      "w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 group relative";
    const activeBtn = "bg-blue-600 text-white";
    const idleBtn = "text-gray-700 hover:bg-blue-50 hover:text-blue-600";

    if (hasSub) {
      return (
        <div key={String(item.id)} className="space-y-1">
          <button
            onClick={() => toggleMenu(String(item.id))}
            className={`${baseBtn} ${isActive ? activeBtn : idleBtn}`}
            type="button"
          >
            <div className="flex items-center gap-3.5">
              <Icon
                size={20}
                className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"}`}
              />
              {item.label}
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""} ${
                isActive ? "text-white/90" : "text-gray-500 group-hover:text-blue-600"
              }`}
            />
          </button>

          {isExpanded && (
            <div className="pl-2 space-y-1">
              {item.submenu!.map((sub) => {
                const SubIcon = sub.icon;
                const subActive = sub.path === activeTab || sub.id === activeTab;
                
                return (
                  <button
                    key={String(sub.id)}
                    onClick={() => handleMenuItemClick(sub)}
                    className={`${baseBtn} ${
                      subActive ? "bg-blue-600 text-white" : idleBtn
                    } py-3`}
                    type="button"
                  >
                    <div className="flex items-center gap-3.5">
                      <SubIcon
                        size={18}
                        className={`${
                          subActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                        }`}
                      />
                      {sub.label}
                      {/* SUPPRIMÉ : Le badge "Laravel" a été enlevé ici */}
                    </div>
                    {subActive && (
                      <ChevronRight
                        size={16}
                        className="text-white/90 ml-auto"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={String(item.id)}
        onClick={() => handleMenuItemClick(item)}
        className={`${baseBtn} ${isActive ? activeBtn : idleBtn}`}
        type="button"
      >
        <div className="flex items-center gap-3.5">
          <Icon
            size={20}
            className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"}`}
          />
          {item.label}
          {/* SUPPRIMÉ : Le badge "Laravel" a été enlevé ici aussi */}
        </div>
        {isActive && (
          <ChevronRight
            size={16}
            className="text-white/90 ml-auto"
          />
        )}
      </button>
    );
  };

  return (
    <>
      <style>{`
        body, #root {
          background-color: white !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-white">
        <div className="flex h-screen bg-white">
          {/* Sidebar */}
          <aside className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64">
              <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4 h-16 border-b border-gray-200">
                  <h1 className="text-xl font-bold text-gray-900">GestiLoc</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {menuItems.map(renderMenuItem)}
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {ownerInitials}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{ownerName}</div>
                      <div className="text-xs text-gray-600">Co-propriétaire</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile sidebar */}
          <div className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}>
            <div className={`fixed inset-0 bg-gray-600 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
            <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-gray-900">GestiLoc</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {menuItems.map(renderMenuItem)}
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {ownerInitials}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{ownerName}</div>
                      <div className="text-xs text-gray-600">Co-propriétaire</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col w-0 flex-1 overflow-hidden bg-white">
            {/* Top bar */}
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
              <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-1 px-4 flex justify-between items-center sm:px-6 lg:px-8">
                <div className="flex-1">
                  <div className="max-w-lg">
                    <h1 className="text-2xl font-bold text-gray-900">{activeTitle}</h1>
                  </div>
                </div>
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Page content */}
            <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Toast container */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};