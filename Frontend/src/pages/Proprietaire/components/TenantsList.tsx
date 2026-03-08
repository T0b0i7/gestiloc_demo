import React, { useEffect, useState } from "react";
import { Plus, Search, Settings, Users, Trash2, Mail, Phone, Clock, RefreshCw, Eye, Edit, UserCheck, UserX, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { tenantService, TenantApi, TenantIndexResponse } from "@/services/api";

interface Locataire {
  id: string;
  nom: string;
  type: string;
  bien: string;
  telephone: string;
  email: string;
  solde: number;
  etat: "actif" | "inactif" | "suspendu" | "invited";
  modeles: string[];
  is_invited?: boolean;
}

interface LocatairesProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const TenantsList: React.FC<LocatairesProps> = ({ notify }) => {
  const navigate = useNavigate();

  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [searchTerm, setSearchTerm] = useState("");
  const [linesPerPage, setLinesPerPage] = useState("100");

  /* ─── Mapper API → UI ─── */
  const mapTenantApiToLocataire = (tenant: TenantApi): Locataire => {
    const nom = [tenant.first_name, tenant.last_name].filter(Boolean).join(" ") || tenant.email || "Locataire sans nom";

    const bien = tenant.property
      ? `${tenant.property.name ?? "Bien"} – ${tenant.property.address}${tenant.property.city ? ` (${tenant.property.city})` : ""}`
      : "Aucun bien";

    let etat: Locataire["etat"] = "actif";
    if (tenant.status === "invited") etat = "invited";
    else if (tenant.status === "inactive") etat = "inactif";
    else if (tenant.status === "suspended") etat = "suspendu";

    return {
      id: String(tenant.id),
      nom,
      type: "Personne Physique",
      bien,
      telephone: tenant.phone || "Non renseigné",
      email: tenant.email || "—",
      solde: 0,
      etat,
      modeles: [],

    };
  };

  /* ─── Fetch ─── */
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: TenantIndexResponse = await tenantService.listTenants();
      const mapped = (res.tenants || []).map(mapTenantApiToLocataire);
      setLocataires(mapped);
    } catch (err: any) {
      const message = err?.message || "Impossible de charger les locataires";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  /* ─── Filters ─── */
  const filteredLocataires = locataires.filter((l) => {
    const matchSearch =
      l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBien = filterBien === "Tous les biens" || l.bien.includes(filterBien);
    const matchTab = activeTab === "actifs" ? true : false;
    return matchSearch && matchBien && matchTab;
  });

  const biensUniques = Array.from(new Set(locataires.map((l) => l.bien)));
  const actifCount = locataires.filter((l) => l.etat === "actif" || l.etat === "invited").length;

  /* ─── Actions ─── */
  const handleAdd = () => navigate("/proprietaire/ajouter-locataire");


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');

        .tl-page {
          padding: 1.5rem 2.5rem 3rem;
          font-family: 'Manrope', sans-serif;
          color: #1a1a1a;
        }

        /* Header */
        .tl-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .tl-title {
          font-family: 'Merriweather', serif;
          font-size: 1.55rem;
          font-weight: 900;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }
        .tl-subtitle {
          font-size: 0.82rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0;
        }
        .tl-btn-add {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          background: #83C757;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .tl-btn-add:hover { background: #72b44a; }

        /* Tabs */
        .tl-tabs {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          border-bottom: 1.5px solid #e5e7eb;
          margin-bottom: 1.25rem;
        }
        .tl-tab {
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
        .tl-tab.active {
          color: #4b8c2a;
          border-bottom-color: #83C757;
        }
        .tl-tab-icon {
          font-size: 0.82rem;
        }
        .tl-tab-count {
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
        .tl-tab.active .tl-tab-count {
          background: #83C757;
          color: #fff;
        }
        .tl-tab:not(.active) .tl-tab-count {
          background: #e5e7eb;
          color: #6b7280;
        }

        /* Card */
        .tl-card {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }

        /* Filter section */
        .tl-filter-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #4b5563;
          letter-spacing: 0.06em;
          margin: 0 0 14px 0;
        }
        .tl-filter-row {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 3rem;
        }
        .tl-filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tl-filter-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #374151;
        }
        .tl-select {
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

        /* Search row */
        .tl-search-row {
          display: flex;
          gap: 12px;
          align-items: stretch;
        }
        .tl-search-wrap {
          flex: 1;
          position: relative;
        }
        .tl-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .tl-search-input {
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
        .tl-search-input::placeholder { color: #83C757; font-weight: 600; }
        .tl-search-input:focus { box-shadow: 0 0 0 3px rgba(131,199,87,0.12); color: #83C757; }

        .tl-btn-display {
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
        .tl-btn-display:hover { background: #f9fafb; border-color: #9ca3af; }

        /* Table */
        .tl-table-card {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 14px;
          overflow: hidden;
        }
        .tl-table {
          width: 100%;
          border-collapse: collapse;
        }
        .tl-table thead th {
          text-align: left;
          padding: 12px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        .tl-table tbody td {
          padding: 14px;
          font-size: 0.78rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .tl-table tbody tr:last-child td { border-bottom: none; }
        .tl-table tbody tr:hover { background: #fafefe; }

        .tl-type-badge {
          color: #83C757;
          font-weight: 700;
          font-size: 0.78rem;
        }
        .tl-solde {
          font-weight: 600;
          font-size: 0.78rem;
          color: #83C757;
        }
        .tl-modele {
          font-size: 0.78rem;
          color: #83C757;
        }

        .tl-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px;
          color: #9ca3af;
          transition: color 0.15s;
        }
        .tl-action-btn:hover { color: #374151; }

        /* Empty */
        .tl-empty {
          text-align: center;
          padding: 3.5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .tl-empty-icon {
          margin: 0 0 18px 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tl-empty-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }
        .tl-empty-text {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0 0 14px 0;
          font-weight: 500;
        }
        .tl-empty-link {
          color: #83C757;
          font-weight: 700;
          text-decoration: underline;
          cursor: pointer;
          font-size: 0.8rem;
          background: none;
          border: none;
          font-family: 'Manrope', sans-serif;
        }
        .tl-empty-link:hover { color: #4b8c2a; }

        /* Loading */
        .tl-loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 0.85rem;
        }
      `}</style>

      <div className="tl-page">
        {/* Header */}
        <div className="tl-header">
          <div>
            <h1 className="tl-title">Liste des locataires</h1>
            <p className="tl-subtitle">Créez un nouveau contrat entre un bien et un locataire</p>
          </div>
          <button className="tl-btn-add" onClick={handleAdd}>
            <Plus size={15} />
            Ajouter un locataire
          </button>
        </div>

        {/* Tabs */}
        <div className="tl-tabs">
          <button
            className={`tl-tab ${activeTab === "actifs" ? "active" : ""}`}
            onClick={() => setActiveTab("actifs")}
          >
            <span className="tl-tab-icon">✓</span>
            Actifs
            <span className="tl-tab-count">{actifCount}</span>
          </button>
          <button
            className={`tl-tab ${activeTab === "archives" ? "active" : ""}`}
            onClick={() => setActiveTab("archives")}
          >
            <span className="tl-tab-icon">📁</span>
            Archives
            <span className="tl-tab-count">0</span>
          </button>
        </div>

        {/* Filters card */}
        <div className="tl-card">
          <p className="tl-filter-title">FILTRER - UTILISEZ LES OPTIONS CI-DESSOUS</p>
          <div className="tl-filter-row">
            <div className="tl-filter-field">
              <span className="tl-filter-label">Bien</span>
              <select
                className="tl-select"
                value={filterBien}
                onChange={(e) => setFilterBien(e.target.value)}
              >
                <option>Tous les biens</option>
                {biensUniques.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="tl-filter-field">
              <span className="tl-filter-label">Lignes par page</span>
              <select
                className="tl-select"
                value={linesPerPage}
                onChange={(e) => setLinesPerPage(e.target.value)}
              >
                <option value="25">25 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="tl-card">
          <div className="tl-search-row">
            <div className="tl-search-wrap">
              <Search size={16} className="tl-search-icon" style={{ color: "#83C757" }} />
              <input
                type="text"
                className="tl-search-input"
                placeholder="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="tl-btn-display">
              <Settings size={15} />
              Affichage
            </button>
          </div>
        </div>

        {/* Table OR empty state */}
        <div className="tl-table-card">
          {/* Removed loading indicator as requested by user */}

          {!loading && !error && filteredLocataires.length > 0 && (
            <table className="tl-table">
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Type</th>
                  <th>Bien</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Solde</th>
                  <th>Etat</th>
                  <th>Modèle</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocataires.map((loc) => (
                  <tr key={loc.id}>
                    <td style={{ fontWeight: 600 }}>{loc.nom}</td>
                    <td><span className="tl-type-badge">{loc.type}</span></td>
                    <td>{loc.bien}</td>
                    <td>{loc.telephone}</td>
                    <td>{loc.email}</td>
                    <td><span className="tl-solde">{loc.solde} FCFA</span></td>
                    <td>Inconnu</td>
                    <td><span className="tl-modele">0 Modèle</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <button className="tl-action-btn" title="Voir">
                          <Eye size={14} />
                        </button>
                        <button className="tl-action-btn" title="Plus">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>
                        <button className="tl-action-btn" title="Mail">
                          <Mail size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredLocataires.length === 0 && (
            <div className="tl-empty">
              {/* Dark silhouette user icon matching screenshot */}
              <div className="tl-empty-icon">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="20" r="9" fill="#4b5563" />
                  <path d="M10 48C10 38.059 18.059 30 28 30C37.941 30 46 38.059 46 48" fill="#4b5563" />
                </svg>
              </div>
              <p className="tl-empty-title">Aucun locataire trouvé</p>
              <p className="tl-empty-text">
                Vous pouvez inviter vos locataires pour leur donner accès à la zone membres.
              </p>
              <button className="tl-empty-link" onClick={handleAdd}>
                Créer un locataire
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TenantsList;