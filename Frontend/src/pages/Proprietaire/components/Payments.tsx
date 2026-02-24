import React, { useState } from "react";
import {
  Plus,
  Search,
  Settings,
  Check,
  AlertTriangle,
  FileText,
  Download,
  Mail,
  Eye,
  BarChart3,
} from "lucide-react";

/* ─── Types ─── */

interface PaymentRow {
  id: string;
  locataire: string;
  email: string;
  bien: string;
  montant: string;
  echeance: string;
  statut: "paid" | "late" | "pending";
  datePaiement: string;
  mode: string;
}

interface PaymentsProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

/* ─── Mock data ─── */

const mockPayments: PaymentRow[] = [
  {
    id: "1",
    locataire: "Jean Dupont",
    email: "jean@gmail.com",
    bien: "Appartement 12 - Agla Boulevard de la marina",
    montant: "60 000 FCFA",
    echeance: "05 Fév 2026",
    statut: "paid",
    datePaiement: "03 Fév 2026",
    mode: "Virement",
  },
  {
    id: "2",
    locataire: "sophia Amane",
    email: "sophia@gmail.com",
    bien: "Villa moderne - Fidjrossè Rue des Cocotiers",
    montant: "150 000 FCFA",
    echeance: "09 Mai 2026",
    statut: "late",
    datePaiement: "-",
    mode: "Virement",
  },
  {
    id: "3",
    locataire: "Jean Dupont",
    email: "jean@gmail.com",
    bien: "Studio cosy - Centre-ville Avenue Steinmetz",
    montant: "200 000 FCFA",
    echeance: "05 Juin 2026",
    statut: "pending",
    datePaiement: "-",
    mode: "Virement",
  },
];

/* ─── Component ─── */

export const Payments: React.FC<PaymentsProps> = ({ notify }) => {
  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [linesPerPage, setLinesPerPage] = useState("100");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = mockPayments.filter(
    (p) =>
      p.locataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statutBadge = (statut: PaymentRow["statut"]) => {
    switch (statut) {
      case "paid":
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 12px", borderRadius: 6,
            background: "#dcfce7", color: "#166534",
            fontSize: "0.72rem", fontWeight: 700,
          }}>
            <Check size={12} /> Payé
          </span>
        );
      case "late":
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 12px", borderRadius: 6,
            background: "#fee2e2", color: "#991b1b",
            fontSize: "0.72rem", fontWeight: 700,
          }}>
            <AlertTriangle size={12} /> En retard
          </span>
        );
      case "pending":
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 12px", borderRadius: 6,
            background: "#fef3c7", color: "#92400e",
            fontSize: "0.72rem", fontWeight: 700,
          }}>
            ⏳ En attente
          </span>
        );
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');

        .pm-page {
          padding: 1.5rem 2.5rem 3rem;
          font-family: 'Manrope', sans-serif;
          color: #1a1a1a;
        }

        /* Header */
        .pm-header {
          margin-bottom: 1.5rem;
        }
        .pm-title {
          font-family: 'Merriweather', serif;
          font-size: 1.55rem;
          font-weight: 900;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }
        .pm-subtitle {
          font-size: 0.82rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }

        /* Tabs */
        .pm-tabs {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          border-bottom: 1.5px solid #e5e7eb;
          margin-bottom: 1.25rem;
        }
        .pm-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          padding: 8px 0 12px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #9ca3af;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1.5px;
          transition: all 0.15s;
        }
        .pm-tab.active {
          color: #4b8c2a;
          border-bottom-color: #83C757;
        }
        .pm-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          border-radius: 4px;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 0 4px;
        }
        .pm-tab.active .pm-tab-count {
          background: #83C757;
          color: #fff;
        }
        .pm-tab:not(.active) .pm-tab-count {
          background: #e5e7eb;
          color: #6b7280;
        }

        /* Card */
        .pm-card {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }

        /* Filter */
        .pm-filter-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #4b5563;
          letter-spacing: 0.06em;
          margin: 0 0 14px 0;
        }
        .pm-filter-row {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 3rem;
        }
        .pm-filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pm-filter-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #374151;
        }
        .pm-select {
          width: 100%;
          padding: 0.6rem 2.2rem 0.6rem 0.85rem;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          font-size: 0.82rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          color: #6b7280;
          background: #fff;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          cursor: pointer;
          box-sizing: border-box;
        }

        /* Search */
        .pm-search-row {
          display: flex;
          gap: 12px;
          align-items: stretch;
        }
        .pm-search-wrap {
          flex: 1;
          position: relative;
        }
        .pm-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #83C757;
          pointer-events: none;
        }
        .pm-search-input {
          width: 100%;
          padding: 0.65rem 0.85rem 0.65rem 2.6rem;
          border: 1.5px solid #83C757;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          color: #83C757;
          background: #fff;
          outline: none;
          box-sizing: border-box;
        }
        .pm-search-input::placeholder { color: #83C757; font-weight: 600; }
        .pm-search-input:focus { box-shadow: 0 0 0 3px rgba(131,199,87,0.12); color: #1a1a1a; }
        .pm-btn-display {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1.5px solid #d1d5db;
          background: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pm-btn-display:hover { background: #f9fafb; }

        /* Stats */
        .pm-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 1.25rem;
        }
        .pm-stat {
          background: rgba(237, 237, 237, 1);
          border-radius: 33px;
          padding: 1.4rem 1.5rem;
          border-left-width: 11px;
          border-left-style: solid;
          border-top: none;
          border-right: none;
          border-bottom: none;
        }
        .pm-stat.green { border-left-color: rgba(87, 190, 21, 1); }
        .pm-stat.blue { border-left-color: rgba(0, 132, 255, 1); }
        .pm-stat.red { border-left-color: rgba(255, 81, 81, 1); }
        .pm-stat.orange { border-left-color: rgba(255, 157, 0, 1); }
        .pm-stat-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #6b7280;
          margin: 0 0 10px 0;
        }
        .pm-stat-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }
        .pm-stat-value img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }
        .pm-stat-sub {
          font-size: 0.72rem;
          font-weight: 500;
          color: #9ca3af;
          margin: 0;
        }

        /* Action buttons */
        .pm-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .pm-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }
        .pm-action-btn.green {
          background: #83C757;
          color: #fff;
        }
        .pm-action-btn.green:hover { background: #72b44a; }
        .pm-action-btn.gray {
          background: rgba(232, 232, 232, 1);
          color: #374151;
        }
        .pm-action-btn.gray:hover { background: #d4d4d4; }

        /* Table */
        .pm-table-card {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 14px;
          overflow: hidden;
        }
        .pm-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pm-table thead th {
          text-align: left;
          padding: 12px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        .pm-table tbody td {
          padding: 14px;
          font-size: 0.78rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .pm-table tbody tr:last-child td { border-bottom: none; }
        .pm-table tbody tr:hover { background: #fafefe; }

        .pm-action-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px;
          color: #9ca3af;
          transition: color 0.15s;
        }
        .pm-action-icon:hover { color: #374151; }

        @media (max-width: 768px) {
          .pm-stats { grid-template-columns: 1fr 1fr; }
          .pm-filter-row { grid-template-columns: 1fr; gap: 1rem; }
        }
      `}</style>

      <div className="pm-page">
        {/* Header */}
        <div className="pm-header">
          <h1 className="pm-title">Gestion des paiements</h1>
          <p className="pm-subtitle">Créez et recevez/confirmez en quelques clics et en toute sécurité</p>
        </div>

        {/* Tabs */}
        <div className="pm-tabs">
          <button
            className={`pm-tab ${activeTab === "actifs" ? "active" : ""}`}
            onClick={() => setActiveTab("actifs")}
          >
            <span>✓</span> Actifs
            <span className="pm-tab-count">{mockPayments.length}</span>
          </button>
          <button
            className={`pm-tab ${activeTab === "archives" ? "active" : ""}`}
            onClick={() => setActiveTab("archives")}
          >
            <span>📁</span> Archives
            <span className="pm-tab-count">0</span>
          </button>
        </div>

        {/* Filter */}
        <div className="pm-card">
          <p className="pm-filter-title">FILTRER - UTILISEZ LES OPTIONS CI-DESSOUS</p>
          <div className="pm-filter-row">
            <div className="pm-filter-field">
              <span className="pm-filter-label">Bien</span>
              <select className="pm-select" value={filterBien} onChange={(e) => setFilterBien(e.target.value)}>
                <option>Tous les biens</option>
              </select>
            </div>
            <div className="pm-filter-field">
              <span className="pm-filter-label">Lignes par page</span>
              <select className="pm-select" value={linesPerPage} onChange={(e) => setLinesPerPage(e.target.value)}>
                <option value="25">25 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="pm-card">
          <div className="pm-search-row">
            <div className="pm-search-wrap">
              <Search size={16} className="pm-search-icon" />
              <input
                type="text"
                className="pm-search-input"
                placeholder="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="pm-btn-display">
              <Settings size={15} />
              Affichage
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="pm-stats">
          <div className="pm-stat green">
            <p className="pm-stat-label">Loyers attendus</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/cash.png" alt="cash" />
              245 000 FCFA
            </p>
            <p className="pm-stat-sub">5 paiements ce mois</p>
          </div>
          <div className="pm-stat blue">
            <p className="pm-stat-label">Loyers reçus</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/checklist.png" alt="checklist" />
              180 000 FCFA
            </p>
            <p className="pm-stat-sub">5 paiements ce mois</p>
          </div>
          <div className="pm-stat red">
            <p className="pm-stat-label">En retard</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/Error.png" alt="error" />
              65 000 FCFA
            </p>
            <p className="pm-stat-sub">2 paiements en retard</p>
          </div>
          <div className="pm-stat orange">
            <p className="pm-stat-label">Taux de recouvrement</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/Bar chart.png" alt="chart" />
              73%
            </p>
            <p className="pm-stat-sub">+5% vs mois dernier</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pm-actions">
          <button className="pm-action-btn green" onClick={() => notify("Formulaire d'enregistrement à venir", "info")}>
            <Plus size={15} />
            Enregistrer un paiement
          </button>
          <button className="pm-action-btn gray" onClick={() => notify("Fonction rappels à venir", "info")}>
            <AlertTriangle size={15} />
            Rappels
          </button>
          <button className="pm-action-btn gray" onClick={() => notify("Génération quittances à venir", "info")}>
            <FileText size={15} />
            Quittances
          </button>
          <button className="pm-action-btn gray" onClick={() => notify("Export à venir", "info")}>
            <Download size={15} />
            Exporter
          </button>
        </div>

        {/* Table */}
        <div className="pm-table-card">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Locataire</th>
                <th>Bien</th>
                <th>Montant</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th>Date de paiement</th>
                <th>Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.locataire}</div>
                      <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{p.email}</div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 180, fontSize: "0.75rem" }}>{p.bien}</td>
                  <td style={{ fontWeight: 700 }}>{p.montant}</td>
                  <td>{p.echeance}</td>
                  <td>{statutBadge(p.statut)}</td>
                  <td>{p.datePaiement}</td>
                  <td>{p.mode}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button className="pm-action-icon" title="Plus">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                      <button className="pm-action-icon" title="Mail">
                        <Mail size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Payments;
