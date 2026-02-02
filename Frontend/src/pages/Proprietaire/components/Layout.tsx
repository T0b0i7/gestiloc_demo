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
  CreditCard, // ✅ NEW
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Owner (from localStorage)
  const [user, setUser] = useState<UserData | null>(null);

  // ✅ Un seul menu accordéon ouvert à la fois
  const [expandedMenu, setExpandedMenu] = useState<string | null>("biens");

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

  // ===================== MENUS =====================
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      path: "/proprietaire/dashboard",
    },

    {
      id: "biens",
      label: "Gestion des Biens",
      icon: Building,
      path: "/proprietaire/biens",
      submenu: [
        { id: "ajouter-bien", label: "Ajouter un bien", icon: Home, path: "/proprietaire/ajouter-bien" },
        { id: "mes-biens", label: "Mes biens", icon: Building, path: "/proprietaire/mes-biens" },
        {
          id: "incidents",
          label: "Réparations",
          icon: FileCheck,
          path: "/proprietaire/incidents",
        },
        // { id: "coproprietaires", label: "Copropriétaires", icon: Users, path: "/proprietaire/coproprietaires" },
      ],
    },

    {
      id: "gestion-locative",
      label: "Gestion Locative",
      icon: FileSignature,
      path: "/proprietaire/gestion-locative",
      submenu: [
        { id: "nouvelle-location", label: "Nouvelle location", icon: FilePlus, path: "/proprietaire/nouvelle-location" },
        { id: "liste-locations", label: "Locations en cours", icon: FileText, path: "/proprietaire/liste-locations" },
        { id: "ajouter-locataire", label: "Ajouter un locataire", icon: UserPlus, path: "/proprietaire/ajouter-locataire" },
        { id: "locataires", label: "Liste des locataires", icon: Users, path: "/proprietaire/locataires" },
        { id: "preavis", label: "Gestion des préavis", icon: FileText, path: "/proprietaire/preavis" },
        { id: "etat-des-lieux", label: "États des lieux", icon: FileCheck, path: "/proprietaire/etats-des-lieux" },
      ],
    },

    

    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      path: "/proprietaire/documents",
      submenu: [
        { id: "baux", label: "Contrats de bail", icon: FileSignature, path: "/proprietaire/documents/baux" },
        { id: "quittances", label: "Quittances", icon: FileText, path: "/proprietaire/quittances" },
        { id: "factures", label: "Factures", icon: FileText, path: "/proprietaire/factures" },
      ],
    },

    {
      id: "coproprietaires",
      label: "Co-propriétaires",
      icon: Users,
      submenu: [
        { id: "coproprietaires", label: "Liste des co-propriétaires", icon: Users },
        { id: "inviter-coproprietaire", label: "Inviter un co-propriétaire", icon: UserPlus },
      ],
    },

    {
      id: "finances",
      label: "Finances",
      icon: CreditCard,
      path: "/proprietaire/finances",
      submenu: [
        {
          id: "emettre-paiement",
          label: "Émettre un paiement",
          icon: CreditCard,
          path: "/proprietaire/emettre-paiement",
        },
        {
          id: "retrait-methode",
          label: "Méthode de retrait",
          icon: CreditCard,
          path: "/proprietaire/retrait-methode",
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

  const handleNavigate = (tab: Tab | string) => {
    const menuItem = flatMenu.find((i) => i.id === tab || i.path === tab);
    if (menuItem?.path) onNavigate(menuItem.path as Tab);
    else onNavigate(tab as Tab);

    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Un seul ouvert : toggle = ouvrir OU fermer, mais jamais plusieurs
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
    const activeBtn = "bg-blue-600 text-white shadow-lg shadow-blue-600/30";
    const idleBtn = "text-gray-600 hover:bg-blue-50 hover:text-blue-600";

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
                className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"}`}
              />
              {item.label}
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""} ${
                isActive ? "text-white/90" : "text-gray-400 group-hover:text-blue-600"
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
                    onClick={() => handleNavigate(sub.path ?? sub.id)}
                    className={`${baseBtn} ${
                      subActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : idleBtn
                    } py-3`}
                    type="button"
                  >
                    <div className="flex items-center gap-3.5">
                      <SubIcon
                        size={18}
                        className={`${subActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"}`}
                      />
                      {sub.label}
                    </div>

                    {typeof sub.badge === "number" && sub.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          subActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {sub.badge}
                      </span>
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
        onClick={() => handleNavigate(item.path ?? item.id)}
        className={`${baseBtn} ${isActive ? activeBtn : idleBtn}`}
        type="button"
      >
        <div className="flex items-center gap-3.5">
          <Icon size={20} className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"}`} />
          {item.label}
        </div>

        {typeof item.badge === "number" && item.badge > 0 && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
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

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-2 sidebar-scroll">
          {menuItems.map((item) => renderMenuItem(item))}

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
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 md:px-8 pb-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
};
