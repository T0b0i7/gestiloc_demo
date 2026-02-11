import React, { useEffect, useMemo, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  User,
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
  icon?: React.ElementType;
  path?: string;
  emoji?: string;
  isLaravel?: boolean;
  isReact?: boolean;
}

type UserData = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar?: string | null;
  name?: string | null;
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
    return full || user.name || user.email || "Co-propriétaire";
  }, [user]);

  const ownerInitials = useMemo(() => {
    if (!user) return "C";
    const a = (user.first_name?.[0] || user.name?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    const initials = `${a}${b}`.trim();
    return initials || (user.email?.[0] || "C").toUpperCase();
  }, [user]);

  // ✅ FONCTION AMÉLIORÉE : Navigation vers Laravel avec token
  const goToLaravelPage = (path: string) => {
    console.log('🚀 Navigation React -> Laravel:', path);
    
    // Récupérer le token de toutes les sources
    const token = getTokenFromAllSources();
    
    if (!token) {
      console.error('❌ Aucun token trouvé pour Laravel');
      alert('Session expirée, redirection vers la connexion...');
      setTimeout(() => {
        window.location.href = 'http://localhost:8000/login';
      }, 500);
      return;
    }

    const laravelBaseUrl = 'http://localhost:8000';
    let fullPath = path;
    
    // Assurer le format correct
    if (!fullPath.startsWith('/')) {
      fullPath = '/' + fullPath;
    }
    
    // Construire l'URL complète
    let fullUrl = `${laravelBaseUrl}${fullPath}`;
    const separator = fullUrl.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    
    fullUrl += `${separator}api_token=${encodeURIComponent(token)}&_t=${timestamp}`;
    
    console.log('✅ URL Laravel générée:', fullUrl);
    
    // Redirection
    setTimeout(() => {
      window.location.href = fullUrl;
    }, 100);
  };

  // ✅ FONCTION AMÉLIORÉE : Récupération du token
  const getTokenFromAllSources = () => {
    console.log('🔍 Recherche du token...');
    
    // 1. LocalStorage
    let token = localStorage.getItem('token');
    if (token) {
      console.log('✅ Token trouvé dans localStorage');
      return token;
    }
    
    // 2. URL
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('api_token');
    if (token) {
      console.log('✅ Token trouvé dans URL');
      localStorage.setItem('token', token);
      return token;
    }
    
    // 3. SessionStorage
    token = sessionStorage.getItem('token');
    if (token) {
      console.log('✅ Token trouvé dans sessionStorage');
      return token;
    }
    
    console.log('❌ Aucun token trouvé');
    return null;
  };

  // ✅ FONCTION : Navigation unifiée
  const handleNavigation = (item: MenuItem) => {
    console.log('📱 Navigation:', item.label, 'path:', item.path);
    
    if (!item.path) return;
    
    if (item.isLaravel) {
      goToLaravelPage(item.path);
    } else if (item.isReact) {
      // Navigation interne React
      onNavigate(item.path as Tab);
      setIsMobileMenuOpen(false);
    } else {
      // Navigation interne standard
      onNavigate(item.path as Tab);
      setIsMobileMenuOpen(false);
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Menu synchronisé avec Blade
  const menuSections = [
    {
      title: "Menu principal",
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          emoji: '📊',
          path: "/coproprietaire/dashboard",
          isReact: true
        },
      ]
    },
    {
      title: "GESTIONS DES BIENS",
      items: [
        { 
          id: "add-property", 
          label: "Ajouter un bien", 
          emoji: '+',
          path: "/coproprietaire/biens/create",
          isLaravel: true
        },
        { 
          id: "my-properties", 
          label: "Mes biens", 
          emoji: '🏠',
          path: "/coproprietaire/biens",
          isReact: true
        },
      ]
    },
    {
      title: "GESTION LOCATIVE",
      items: [
        { 
          id: "new-rental", 
          label: "Nouvelle location", 
          emoji: '🔑',
          path: "/coproprietaire/assign-property/create",
          isLaravel: true
        },
        { 
          id: "add-tenant", 
          label: "Ajouter un locataire", 
          emoji: '📍',
          path: "/coproprietaire/tenants/create",
          isLaravel: true
        },
        { 
          id: "tenant-list", 
          label: "Liste des locataires", 
          emoji: '📄',
          path: "/coproprietaire/tenants",
          isLaravel: true
        },
        { 
          id: "payment-management", 
          label: "Gestion des paiements", 
          emoji: '📅',
          path: "/coproprietaire/paiements",
          isLaravel: true
        },
      ]
    },
    {
      title: "DOCUMENTS",
      items: [
        { 
          id: "lease-contracts", 
          label: "Contrats de bail", 
          emoji: '📄',
          path: "/coproprietaire/leases",
          isLaravel: true
        },
        { 
          id: "condition-reports", 
          label: "Etats de lieux", 
          emoji: '📄',
          path: "/coproprietaire/etats-des-lieux",
          isLaravel: true
        },
        { 
          id: "due-notices", 
          label: "Avis d'échéance", 
          emoji: '📄',
          path: "/coproprietaire/notices",
          isLaravel: true
        },
        { 
          id: "rent-receipts", 
          label: "Quittances de loyers", 
          emoji: '📄',
          path: "/coproprietaire/quittances",
          isLaravel: true
        },
        { 
          id: "invoices", 
          label: "Factures et documents divers", 
          emoji: '📄',
          path: "/coproprietaire/factures",
          isLaravel: true
        },
        { 
          id: "document-archiving", 
          label: "Archivage de documents", 
          emoji: '📄',
          path: "/coproprietaire/documents",
          isReact: true
        },
      ]
    },
    {
      title: "REPARATIONS ET TRAVAUX",
      items: [
        { 
          id: "repairs", 
          label: "Réparations et travaux", 
          emoji: '✂️',
          path: "/coproprietaire/maintenance",
          isLaravel: true
        },
      ]
    },
    {
      title: "COMPTABILITE ET STATISTIQUES",
      items: [
        { 
          id: "accounting", 
          label: "Comptabilité et statistiques", 
          emoji: '💼',
          path: "/coproprietaire/comptabilite",
          isLaravel: true
        },
      ]
    },
    {
      title: "CONFIGURATION",
      items: [
        { 
          id: "settings", 
          label: "Paramètres", 
          emoji: '📜',
          path: "/coproprietaire/parametres",
          isReact: true
        },
        { 
          id: "profile", 
          label: "Mon compte", 
          emoji: '📜',
          path: "/coproprietaire/parametres",
          isReact: true
        },
      ]
    }
  ];

  const flatMenu = useMemo(() => {
    const items: MenuItem[] = [];
    menuSections.forEach(section => {
      section.items.forEach(item => {
        items.push(item);
      });
    });
    return items;
  }, []);

  const activeTitle = useMemo(() => {
    const found = flatMenu.find((i) => 
      i.path === activeTab || 
      i.id === activeTab
    );
    return found?.label ?? "Tableau de bord";
  }, [activeTab, flatMenu]);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.path === activeTab || item.id === activeTab;

    const baseBtn = "w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 group cursor-pointer";
    const activeBtn = "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg";
    const idleBtn = "text-gray-700 hover:bg-blue-50 hover:text-blue-600";

    return (
      <button
        key={String(item.id)}
        onClick={() => handleNavigation(item)}
        className={`${baseBtn} ${isActive ? activeBtn : idleBtn} mb-1`}
        type="button"
        title={item.label}
      >
        <div className="flex items-center gap-3.5">
          {item.emoji ? (
            <span className="text-lg" role="img" aria-label={item.label}>
              {item.emoji}
            </span>
          ) : null}
          <span className="text-left whitespace-nowrap overflow-hidden text-ellipsis">
            {item.label}
          </span>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="flex h-screen bg-white">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-[300px] bg-white border-r border-gray-200">
              {/* Header avec fond bleu #377DF4 */}
              <div className="flex items-center flex-shrink-0 px-6 h-16 border-b border-gray-200" style={{ backgroundColor: '#377DF4' }}>
                <h1 className="text-xl font-bold text-white">
                  GestiLoc
                </h1>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                {menuSections.map((section) => (
                  <div key={section.title} className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pl-4">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map(renderMenuItem)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {ownerInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{ownerName}</div>
                    <div className="text-xs text-gray-600">Co-propriétaire</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-col flex-1 overflow-hidden bg-white">
            {/* Top bar avec fond bleu #377DF4 */}
            <div className="relative z-10 flex-shrink-0 flex h-16 border-b border-gray-200 lg:border-none" style={{ backgroundColor: '#377DF4' }}>
              <button
                type="button"
                className="px-4 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden hover:bg-white/10 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-1 px-6 flex justify-between items-center">
                <div className="flex-1">
                  <div className="max-w-lg">
                    <h1 className="text-2xl font-bold text-white">{activeTitle}</h1>
                  </div>
                </div>
                <div className="ml-4 flex items-center md:ml-6 space-x-2">
                  {/* Bouton Notifications */}
                  <button
                    onClick={() => onNavigate('/coproprietaire/notifications' as Tab)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="hidden md:inline">Notifications</span>
                  </button>

                  {/* Bouton Aide */}
                  <button
                    onClick={() => onNavigate('/coproprietaire/aide' as Tab)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                    title="Aide"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden md:inline">Aide</span>
                  </button>

                  {/* Bouton Mon compte */}
                  <button
                    onClick={() => onNavigate('/coproprietaire/parametres' as Tab)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                    title="Mon compte"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">Mon compte</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-white hover:bg-white/20 lg:hidden transition-all duration-200"
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
                <div className="max-w-7xl mx-auto px-6">
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