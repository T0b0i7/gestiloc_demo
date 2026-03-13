import React, { useState } from "react";

const ic = (c: string) => ({
  stroke: c,
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
});

interface IconProps {
  c: string;
}

const Icons: Record<string, React.FC<IconProps>> = {
  LayoutDashboard: ({ c }) => (
    <img src="/Ressource_gestiloc/tb_locataire.png" alt="Tableau de bord" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  Home: ({ c }) => (
    <img src="/Ressource_gestiloc/Ma_location.png" alt="Ma location" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  Building: ({ c }) => (
    <img src="/Ressource_gestiloc/Home.png" alt="Mon propriétaire" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  Receipt: ({ c }) => (
    <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Mes quittances" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  FileText: ({ c }) => (
    <img src="/Ressource_gestiloc/document.png" alt="Documents" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  Wrench: ({ c }) => (
    <img src="/Ressource_gestiloc/Tools.png" alt="Mes interventions" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  CheckSquare: ({ c }) => (
    <img src="/Ressource_gestiloc/Nouvelles_taches.png" alt="Mes tâches" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  StickyNote: ({ c }) => (
    <img src="/Ressource_gestiloc/Edit Property.png" alt="Mes notes" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  Calendar: ({ c }) => (
    <img src="/Ressource_gestiloc/preavis.png" alt="Préavis" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  CreditCard: ({ c }) => (
    <img src="/Ressource_gestiloc/paiement.png" alt="Paiements" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  Settings: ({ c }) => (
    <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" width={19} height={19} style={{ filter: c === "#FFD700" ? "brightness(0) invert(1)" : "none" }} />
  ),
  LogOut: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  isLogout?: boolean;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: "LayoutDashboard" },
  { id: "location", label: "Ma location", icon: "Home" },
  { id: "landlord", label: "Mon propriétaire", icon: "Building" },
  { id: "receipts", label: "Mes quittances", icon: "Receipt" },
  { id: "documents", label: "Documents", icon: "FileText" },
  { id: "interventions", label: "Mes interventions", icon: "Wrench" },
  { id: "tasks", label: "Mes tâches", icon: "CheckSquare" },
  { id: "notes", label: "Mes notes", icon: "StickyNote" },
  { id: "notice", label: "Préavis", icon: "Calendar" },
  { id: "payments", label: "Paiements", icon: "CreditCard" },
  { id: "settings", label: "Paramètres", icon: "Settings" },
  { id: "logout", label: "Déconnexion", icon: "LogOut", isLogout: true },
];

interface NavItemProps {
  item: MenuItem;
  activeTab: string;
  onNavigate: (id: string) => void;
}

function NavItem({ item, activeTab, onNavigate }: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = activeTab === item.id && !item.isLogout;
  const Ico = Icons[item.icon];

  const iconColor = item.isLogout
    ? (hovered ? "#e53935" : "#aaa")
    : isActive ? "#4CAF50" : hovered ? "#4CAF50" : "#888";

  const textColor = item.isLogout
    ? (hovered ? "#e53935" : "#888")
    : isActive ? "#4CAF50" : hovered ? "#4CAF50" : "#444";

  const bg = item.isLogout
    ? (hovered ? "#fff5f5" : "transparent")
    : isActive
      ? "linear-gradient(90deg, rgba(255, 213, 124, 0.87) 0%, #FFFFFF 100%)"
      : hovered ? "#f6fdf6" : "transparent";

  return (
    <button
      onClick={() => !item.isLogout && onNavigate(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.7rem",
        padding: "0.58rem 1rem", width: "100%",
        fontSize: "0.875rem",
        fontWeight: isActive ? 700 : 500,
        color: textColor,
        background: bg,
        borderRadius: 10, border: "none", cursor: "pointer",
        textAlign: "left", transition: "color 0.12s, background 0.12s",
        position: "relative",
      }}
    >
      {isActive && (
        <span style={{
          position: "absolute", left: 0, top: "18%", bottom: "18%",
          width: 3, borderRadius: 99, background: "#FFB300",
        }} />
      )}
      <Ico c={iconColor} />
      {item.label}
    </button>
  );
}

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div style={{
      minHeight: "100vh", background: "#f0f4f0",
      display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "1.5rem",
      fontFamily: "'Manrope', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@900&family=Manrope:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#c8e6c9;border-radius:99px}
      `}</style>

      <nav style={{
        width: 245, background: "#fff", borderRadius: 16,
        boxShadow: "0px 5px 8.6px 0px rgba(131,199,87,1)",
        display: "flex", flexDirection: "column",
        maxHeight: "95vh", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "1.1rem 1.2rem 1rem", borderBottom: "1px solid #f0f0f0" }}>
          <span style={{
            fontFamily: "'Merriweather', serif", fontWeight: 900,
            fontSize: "1.3rem", color: "#4CAF50",
          }}>Gestiloc</span>
        </div>

        {/* Menu */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem 0.6rem 0.6rem" }}>
          <div style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.10em",
            color: "#bbb", textTransform: "uppercase",
            padding: "0.4rem 1rem 0.6rem", whiteSpace: "nowrap",
          }}>
            Menu Locataire
          </div>

          {menuItems.map((item) => (
            <div key={item.id}>
              {item.id === "settings" && (
                <div style={{ borderTop: "1px solid #f0f0f0", margin: "0.5rem 0.4rem" }} />
              )}
              <NavItem item={item} activeTab={activeTab} onNavigate={setActiveTab} />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
