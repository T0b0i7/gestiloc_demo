import { useState } from "react";

interface SVGProps {
  children?: React.ReactNode;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  strokeLinecap?: "inherit" | "round" | "butt" | "square" | undefined;
  strokeLinejoin?: "inherit" | "round" | "bevel" | "miter" | undefined;
  viewBox?: string;
  width?: number;
  height?: number;
}

const ic = (c: string): SVGProps => ({ stroke: c, fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" });

const Icons = {
  LayoutDashboard: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Home: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  Building: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
  Receipt: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M4 2v20l3-2 2 2 3-2 3 2 2-2 3 2V2l-3 2-2-2-3 2-3-2-2 2-3-2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  FileText: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  ),
  Wrench: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  CheckSquare: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  StickyNote: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h8l6-6V4a2 2 0 00-2-2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Calendar: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  CreditCard: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Settings: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 01-2.83 0l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  LogOut: ({ c }) => (
    <svg viewBox="0 0 24 24" width={19} height={19} {...ic(c)}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const menuItems = [
  { id: "dashboard",     label: "Tableau de bord",  icon: "LayoutDashboard" },
  { id: "location",      label: "Ma location",       icon: "Home"            },
  { id: "landlord",      label: "Mon propriétaire",  icon: "Building"        },
  { id: "receipts",      label: "Mes quittances",    icon: "Receipt"         },
  { id: "documents",     label: "Documents",         icon: "FileText"        },
  { id: "interventions", label: "Mes interventions", icon: "Wrench"          },
  { id: "tasks",         label: "Mes tâches",        icon: "CheckSquare"     },
  { id: "notes",         label: "Mes notes",         icon: "StickyNote"      },
  { id: "notice",        label: "Préavis",           icon: "Calendar"        },
  { id: "payments",      label: "Paiements",         icon: "CreditCard"      },
  { id: "settings",      label: "Paramètres",        icon: "Settings"        },
  { id: "logout",        label: "Déconnexion",       icon: "LogOut", isLogout: true },
];

function NavItem({ item, activeTab, onNavigate }) {
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

export default function App() {
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
