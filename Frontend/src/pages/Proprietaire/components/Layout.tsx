import React, { useEffect, useMemo, useState } from "react";
import {
  Building,
  LayoutDashboard,
  Home,
  Users,
  FileSignature,
  FilePlus,
  FileText,
  FileCheck,
  UserPlus,
  Bell,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  CreditCard,
  Plus,
  BarChart3,
  List,
  Wallet,
  ClipboardList,
  AlertTriangle,
  FolderOpen,
  Archive,
  Wrench,
  Calculator,
  Settings,
  HelpCircle,
  Building2, // Pour les agences
  UserCog,   // Pour la gestion des utilisateurs
} from "lucide-react";

import { Tab, Notification, ToastMessage } from "../types";
import { Toast } from "./ui/Toast";

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
}

type UserData = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  roles?: string[];
  default_role?: string | null;
};

const notifications: Notification[] = [
  {
    id: "1",
    type: "critical",
    message: "Loyer novembre en retard",
    subtext: "Régularisez avant pénalités",
    isRead: false,
  },
  {
    id: "2",
    type: "important",
    message: "Intervention confirmée",
    subtext: "22/11 - 14h-16h",
    isRead: false,
  },
];

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Owner (from localStorage)
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Impossible de lire user depuis localStorage", e);
    }
  }, []);

  const ownerName = useMemo(() => {
    if (!user) return "Propriétaire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "Propriétaire";
  }, [user]);

  const ownerInitials = useMemo(() => {
    if (!user) return "P";
    const a = (user.first_name?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    const initials = `${a}${b}`.trim();
    return initials || (user.email?.[0] || "P").toUpperCase();
  }, [user]);

  // ===================== MENUS ORGANISÉS PAR CATÉGORIES =====================
  const menuSections = [
    {
      title: "MENU PRINCIPAL",
      items: [
        { id: "dashboard", label: "Tableau de bord", icon: BarChart3, path: "/proprietaire/dashboard" },
      ],
    },
    {
      title: "GESTIONS DES BIENS",
      items: [
        { id: "ajouter-bien", label: "Ajouter un bien", icon: Plus, path: "/proprietaire/ajouter-bien" },
        { id: "mes-biens", label: "Mes biens", icon: Home, path: "/proprietaire/mes-biens" },
      ],
    },
    {
      title: "GESTION LOCATIVE",
      items: [
        { id: "nouvelle-location", label: "Nouvelle location", icon: FileSignature, path: "/proprietaire/nouvelle-location" },
        { id: "ajouter-locataire", label: "Ajouter un locataire", icon: UserPlus, path: "/proprietaire/ajouter-locataire" },
        { id: "locataires", label: "Liste des locataires", icon: List, path: "/proprietaire/locataires" },
        { id: "paiements", label: "Gestion des paiements", icon: Wallet, path: "/proprietaire/paiements" },
      ],
    },
    {
      title: "DOCUMENTS",
      items: [
        { id: "baux", label: "Contrats de bails", icon: FileText, path: "/proprietaire/documents/baux" },
        { id: "etats-lieux", label: "États de lieux", icon: ClipboardList, path: "/proprietaire/etats-lieux" },
        { id: "avis-echeance", label: "Avis d'échéance", icon: AlertTriangle, path: "/proprietaire/avis-echeance" },
        { id: "quittances", label: "Quittances de loyers", icon: Bell, path: "/proprietaire/quittances" },
        { id: "factures", label: "Factures et documents divers", icon: FolderOpen, path: "/proprietaire/factures" },
        { id: "archives", label: "Archivage de documents", icon: Archive, path: "/proprietaire/archives" },
      ],
    },
    {
      title: "RÉPARATIONS ET TRAVAUX",
      items: [
        { id: "reparations", label: "Répartitions et travaux", icon: Wrench, path: "/proprietaire/reparations" },
      ],
    },
    {
      title: "COMPTABILITÉ ET STATISTIQUES",
      items: [
        { id: "comptabilite", label: "Comptabilité et statistiques", icon: Calculator, path: "/proprietaire/comptabilite" },
      ],
    },
    {
      title: "GESTION DES COPROPRIÉTAIRES",
      items: [
        { 
          id: "coproprietaires", 
          label: "Liste des co-propriétaires", 
          icon: Users, 
          path: "/proprietaire/coproprietaires" 
        },
        { 
          id: "inviter-coproprietaire", 
          label: "Inviter un co-propriétaire", 
          icon: UserPlus, 
          path: "/proprietaire/inviter-coproprietaire" 
        },
      ],
    },

 
    {
      title: "CONFIGURATION",
      items: [
        { id: "parametres", label: "Paramètres", icon: Settings, path: "/proprietaire/parametres" },
      ],
    },
  ];

  // ✅ Créer un flat menu à partir de menuSections pour la navigation
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
    const found = flatMenu.find((i) => i.path === activeTab || i.id === activeTab);
    return found?.label ?? "Tableau de bord";
  }, [activeTab, flatMenu]);

  const handleNavigate = (tab: Tab | string) => {
    const menuItem = flatMenu.find((i) => i.id === tab || i.path === tab);
    if (menuItem?.path) onNavigate(menuItem.path as Tab);
    else onNavigate(tab as Tab);

    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowHelp(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-black transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-0" />

      {/* ✅ Scrollbar custom (fond blanc, thumb gris) */}
      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(107,114,128,.7) transparent; /* thumb / track */
        }
        .sidebar-scroll::-webkit-scrollbar { width: 10px; }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: #ffffff;
          border-radius: 999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(107,114,128,.55);
          border-radius: 999px;
          border: 3px solid #ffffff; /* track blanc autour */
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(107,114,128,.8);
        }
      `}</style>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar FIXED desktop */}
      <aside
        className={`
          fixed top-4 bottom-4 left-4 z-50 w-72
          bg-white border border-blue-200
          shadow-xl rounded-3xl
          transform transition-all duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="p-8 flex items-center justify-between lg:justify-start gap-3 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Building size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-black tracking-tight leading-none">GestiLoc</h1>
              <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase">
                Espace Propriétaire
              </span>
            </div>
          </div>

          <button
            className="lg:hidden text-gray-400"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fermer le menu"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav avec catégories */}
        <nav className="flex-1 px-4 overflow-y-auto py-2 sidebar-scroll">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              {/* Section Title */}
              <h3 className="px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || activeTab === item.path;
                  return (
                    <button
                      key={String(item.id)}
                      onClick={() => handleNavigate(item.path ?? item.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#529D21] to-[#7CB342] text-white shadow-lg shadow-green-500/30"
                          : "text-gray-600 hover:bg-green-50 hover:text-[#529D21]"
                      }`}
                      type="button"
                    >
                      <Icon
                        size={18}
                        className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="my-4 mx-4 border-t border-blue-100" />

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-medium rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
            type="button"
          >
            <LogOut size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
            Déconnexion
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 mt-auto border-t border-blue-100">
          {/* Theme Toggle */}
          <div className="bg-blue-50 p-1 rounded-xl flex mb-4 border border-blue-200">
            <button
              onClick={toggleTheme}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold ${
                !isDarkMode ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
              type="button"
            >
              <Sun size={14} className="mr-2" /> Light
            </button>
            <button
              onClick={toggleTheme}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold ${
                isDarkMode ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
              type="button"
            >
              <Moon size={14} className="mr-2" /> Dark
            </button>
          </div>

          {/* User Card */}
          <div
            className="bg-blue-50 p-3 rounded-2xl flex items-center gap-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => handleNavigate("/proprietaire/profile")}
            role="button"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white">
                {ownerInitials}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-black truncate">{ownerName}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 truncate">Propriétaire</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main offset */}
      <main className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 relative z-10 bg-white lg:ml-80">
        {/* Header */}
        <header
          className={`sticky top-0 z-30 transition-all duration-200 ${
            scrolled ? "bg-white shadow-sm border-b border-blue-100" : "border-b border-blue-100"
          }`}
        >
          <div className="px-4 lg:px-8 py-4 lg:py-6 flex justify-between items-center">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-600 hover:bg-blue-50 rounded-xl transition-colors"
                aria-label="Ouvrir le menu"
                type="button"
              >
                <Menu size={24} />
              </button>
              <h2 className="font-bold text-lg text-black">{activeTitle}</h2>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold text-black tracking-tight">{activeTitle}</h2>
            </div>

            <div className="flex items-center gap-4 relative">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-700">Bail actif</span>
              </div>

              <button
                className="relative p-2.5 bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-all shadow-sm hover:shadow-md focus:outline-none border border-blue-200"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Afficher les notifications"
                type="button"
              >
                <Bell size={20} />
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              <button
                className="relative p-2.5 bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-all shadow-sm hover:shadow-md focus:outline-none border border-blue-200"
                onClick={() => setShowHelp(!showHelp)}
                aria-label="Afficher l'aide"
                type="button"
              >
                <HelpCircle size={20} />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-16 w-80 bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden animate-zoom-in ring-1 ring-black/5">
                  <div className="p-4 border-b border-blue-100 bg-blue-50 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-black">Notifications</h3>
                    <button className="text-xs text-blue-600 font-medium hover:underline" type="button">
                      Tout marquer lu
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto sidebar-scroll">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border-b border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer relative group"
                      >
                        <div className="flex gap-3">
                          <div
                            className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                              notif.type === "critical"
                                ? "bg-red-500 shadow-lg shadow-red-500/40"
                                : "bg-blue-600 shadow-lg shadow-blue-600/40"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-black group-hover:text-blue-600 transition-colors">
                              {notif.message}
                            </p>
                            {notif.subtext && (
                              <p className="text-xs text-gray-600 mt-0.5">{notif.subtext}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800" type="button">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}

              {showHelp && (
                <div className="absolute right-0 top-16 w-80 bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden animate-zoom-in ring-1 ring-black/5">
                  <div className="p-4 border-b border-blue-100 bg-blue-50 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-black">Aide</h3>
                    <button 
                      onClick={() => setShowHelp(false)}
                      className="text-xs text-blue-600 font-medium hover:underline" 
                      type="button"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto sidebar-scroll">
                    <div className="p-4 border-b border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full shrink-0 bg-green-500 shadow-lg shadow-green-500/40" />
                        <div>
                          <p className="text-sm font-medium text-black hover:text-blue-600 transition-colors">
                            Guide de démarrage
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">Apprenez les bases de GestiLoc</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-b border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full shrink-0 bg-blue-600 shadow-lg shadow-blue-600/40" />
                        <div>
                          <p className="text-sm font-medium text-black hover:text-blue-600 transition-colors">
                            Centre d'aide complet
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">Accédez à tous nos guides</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-b border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full shrink-0 bg-purple-600 shadow-lg shadow-purple-600/40" />
                        <div>
                          <p className="text-sm font-medium text-black hover:text-blue-600 transition-colors">
                            Contactez le support
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">Notre équipe est là pour vous aider</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setShowHelp(false);
                        handleNavigate("/help");
                      }}
                      className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800" 
                      type="button"
                    >
                      Voir toute l'aide
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 md:px-8 pb-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
};