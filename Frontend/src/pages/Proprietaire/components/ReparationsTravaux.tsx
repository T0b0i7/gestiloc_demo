import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';

interface RTProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface Intervention {
    status: string;
    statusColor: string;
    statusBg: string;
    title: string;
    locataire: string;
    bien: string;
    details: { label: string; value: string }[];
    devisLabel: string;
    devisValue: string;
    devisColor: string;
    footerDate: string;
    footerIcons: string[];
}

const interventions: Intervention[] = [
    {
        status: 'URGENT', statusColor: '#dc2626', statusBg: '#fef2f2',
        title: 'Fuite d\'eau salle de bain',
        locataire: 'Sophie Bernard', bien: 'Paris 15ème',
        details: [
            { label: 'TYPE', value: 'Plomberie' },
            { label: 'PRIORITÉ', value: 'Urgente' },
            { label: 'DEMANDÉ LE', value: '05 Fev 2025' },
            { label: 'PRESTATAIRE', value: 'À affecter' },
        ],
        devisLabel: 'DEVIS ESTIMÉ', devisValue: '350 €', devisColor: '#1a1a1a',
        footerDate: 'Créé le 03 Fev 2025',
        footerIcons: ['🟢', '📞', '✏️'],
    },
    {
        status: 'EN COURS', statusColor: '#f59e0b', statusBg: '#fffbeb',
        title: 'Remplacement chaudière',
        locataire: 'Montée Alba', bien: 'Villeurbanne',
        details: [
            { label: 'TYPE', value: 'Chauffage' },
            { label: 'PRIORITÉ', value: 'Moyenne' },
            { label: 'DÉBUT TRAVAUX', value: '03 Fev 2025' },
            { label: 'PRESTATAIRE', value: 'Chauffage Pro' },
        ],
        devisLabel: 'DEVIS ACCEPTÉ', devisValue: '2 800 €', devisColor: '#83C757',
        footerDate: 'En progrès · 10 Fev 2025',
        footerIcons: ['🟢', '📊', '📂'],
    },
    {
        status: 'PLANIFIÉE', statusColor: '#3b82f6', statusBg: '#eff6ff',
        title: 'Révision annuelle chaudière',
        locataire: 'Jean-Pierre Roussel', bien: 'La Rochelle',
        details: [
            { label: 'TYPE', value: 'Chauffage' },
            { label: 'PRIORITÉ', value: 'Faible' },
            { label: 'DATE PRÉVUE', value: '15 Fev 2025' },
            { label: 'PRESTATAIRE', value: 'Gaz Service Plus' },
        ],
        devisLabel: 'DEVIS', devisValue: '125 €', devisColor: '#1a1a1a',
        footerDate: 'Planifié le 28 Jan 2025',
        footerIcons: ['🟢', '📊', '❌'],
    },
    {
        status: 'URGENT', statusColor: '#dc2626', statusBg: '#fef2f2',
        title: 'Panne électrique cuisine',
        locataire: 'Martin Dupont', bien: 'Boulogne-Billancourt',
        details: [
            { label: 'TYPE', value: 'Electricité' },
            { label: 'PRIORITÉ', value: 'Urgente' },
            { label: 'DEMANDÉ LE', value: '06 Fev 2025' },
            { label: 'PRESTATAIRE', value: 'Electro Express' },
        ],
        devisLabel: 'DEVIS EN ATTENTE', devisValue: '—', devisColor: '#9ca3af',
        footerDate: 'Intervention prévue aujourd\'hui',
        footerIcons: ['🟢', '📞', '✏️'],
    },
    {
        status: 'EN COURS', statusColor: '#f59e0b', statusBg: '#fffbeb',
        title: 'Réparation volets roulants',
        locataire: 'Thomas Moreau', bien: 'Marseille',
        details: [
            { label: 'TYPE', value: 'Menuiserie' },
            { label: 'PRIORITÉ', value: 'Moyenne' },
            { label: 'DÉBUT TRAVAUX', value: '01 Fev 2025' },
            { label: 'PRESTATAIRE', value: 'Fermetures Plus' },
        ],
        devisLabel: 'DEVIS ACCEPTÉ', devisValue: '580 €', devisColor: '#83C757',
        footerDate: 'Fin prévue · 08 Fev 2025',
        footerIcons: ['🟢', '📊', '📂'],
    },
    {
        status: 'TERMINÉE', statusColor: '#16a34a', statusBg: '#f0fdf4',
        title: 'Changement serrure porte d\'entrée',
        locataire: 'Marie Lefevre', bien: 'Lyon 6ème',
        details: [
            { label: 'TYPE', value: 'Serrurerie' },
            { label: 'DATE RÉALISATION', value: '30 Jan 2025' },
            { label: 'PRESTATAIRE', value: 'Serrure Service' },
            { label: 'FACTURE', value: 'Payée' },
        ],
        devisLabel: 'COÛT FINAL', devisValue: '195 €', devisColor: '#1a1a1a',
        footerDate: 'Terminé le 30 Jan 2025',
        footerIcons: ['🟢', '📊', '🟠'],
    },
];

const ReparationsTravaux: React.FC<RTProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const filters = ['Tous', 'Urgentes', 'En cours', 'Planifiées', 'Terminées'];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .rt-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }

        /* Header */
        .rt-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 16px; }
        .rt-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 8px 0; }
        .rt-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; line-height: 1.5; max-width: 580px; }
        .rt-btn-create { display: inline-flex; align-items: center; gap: 8px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 12px 28px; font-family: 'Manrope', sans-serif; font-size: 0.88rem; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.15s; }
        .rt-btn-create:hover { background: #72b44a; }

        /* Stats */
        .rt-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 1.5rem; }
        .rt-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.3rem; border-left: 4px solid #83C757; }
        .rt-stat-label { font-size: 0.6rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 6px 0; }
        .rt-stat-value { font-size: 1.3rem; font-weight: 900; margin: 0; color: #83C757; }

        /* Filters */
        .rt-filters { display: flex; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .rt-filter-btn { padding: 9px 26px; border-radius: 22px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .rt-filter-btn.active { background: #83C757; color: #fff; }
        .rt-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .rt-filter-btn:not(.active):hover { background: #e5e7eb; }

        /* Filter card */
        .rt-filter-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; }
        .rt-filter-ttl { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .rt-filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
        .rt-select { width: 100%; padding: 0.65rem 0.95rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.84rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; box-sizing: border-box; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        .rt-search-wrap { position: relative; }
        .rt-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .rt-search-input { width: 100%; padding: 0.65rem 0.95rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #374151; background: #fff; outline: none; box-sizing: border-box; }
        .rt-search-input::placeholder { color: #83C757; font-weight: 600; }

        /* Grid */
        .rt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }

        /* Card */
        .rt-card { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
        .rt-card-body { padding: 1.2rem 1.3rem 0.8rem; flex: 1; }
        .rt-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 6px; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 10px; }
        .rt-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
        .rt-card-title { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .rt-card-location { font-size: 0.75rem; color: #83C757; font-weight: 600; margin: 0 0 14px 0; display: flex; align-items: center; gap: 4px; }

        /* Detail rows */
        .rt-details { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 10px; }
        .rt-detail { padding: 6px 0; }
        .rt-detail-label { font-size: 0.58rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .rt-detail-value { font-size: 0.78rem; font-weight: 600; color: #374151; margin: 0; }

        /* Devis row */
        .rt-devis { padding-top: 8px; border-top: 1px solid #f3f4f6; margin-bottom: 0; }
        .rt-devis-label { font-size: 0.58rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .rt-devis-value { font-size: 1.05rem; font-weight: 800; margin: 0; }

        /* Progress bar */
        .rt-progress-row { margin-top: 4px; }
        .rt-progress-label { font-size: 0.58rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .rt-progress-bar { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
        .rt-progress-fill { height: 100%; background: #83C757; border-radius: 3px; }
        .rt-progress-pct { font-size: 0.72rem; font-weight: 700; color: #83C757; margin-top: 2px; }

        /* Footer */
        .rt-card-footer { padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; background: #fafafa; }
        .rt-footer-date { font-size: 0.7rem; color: #9ca3af; font-weight: 500; }
        .rt-footer-actions { display: flex; gap: 8px; }
        .rt-action-dot { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; cursor: pointer; border: none; }

        /* Responsive */
        @media (max-width: 1400px) { .rt-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1100px) { .rt-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .rt-grid { grid-template-columns: 1fr; }
          .rt-stats { grid-template-columns: repeat(2, 1fr); }
          .rt-header { flex-direction: column; gap: 12px; }
          .rt-filter-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .rt-page { padding: 1rem 0.5rem 2rem; }
          .rt-stats { grid-template-columns: 1fr; }
          .rt-title { font-size: 1.3rem; }
          .rt-filters { gap: 6px; }
          .rt-filter-btn { padding: 7px 16px; font-size: 0.78rem; }
        }
      `}</style>

            <div className="rt-page">
                {/* Header */}
                <div className="rt-header">
                    <div>
                        <h1 className="rt-title">Répartitions et travaux</h1>
                        <p className="rt-subtitle">
                            Gérez vos interventions, suivez les demandes de vos locataires et planifiez les travaux.
                            Centralisez tous les devis, factures et suivis de chantier au même endroit.
                        </p>
                    </div>
                    <button className="rt-btn-create" onClick={() => notify('Création intervention à venir', 'info')}>
                        <Plus size={16} strokeWidth={3} /> Créer une intervention
                    </button>
                </div>

                {/* Stats */}
                <div className="rt-stats">
                    <div className="rt-stat">
                        <p className="rt-stat-label">INTERVENTIONS URGENTES</p>
                        <p className="rt-stat-value">3</p>
                    </div>
                    <div className="rt-stat">
                        <p className="rt-stat-label">EN COURS</p>
                        <p className="rt-stat-value">5</p>
                    </div>
                    <div className="rt-stat">
                        <p className="rt-stat-label">PLANIFIÉES</p>
                        <p className="rt-stat-value">8</p>
                    </div>
                    <div className="rt-stat">
                        <p className="rt-stat-label">COÛT TOTAL 2025</p>
                        <p className="rt-stat-value">12 450 €</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="rt-filters">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`rt-filter-btn ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Filter Card */}
                <div className="rt-filter-card">
                    <p className="rt-filter-ttl">FILTRE</p>
                    <div className="rt-filter-row">
                        <select className="rt-select"><option>Tous les biens</option></select>
                        <select className="rt-select"><option>Toutes les années</option></select>
                    </div>
                    <div className="rt-search-wrap">
                        <Search size={16} className="rt-search-icon" />
                        <input className="rt-search-input" placeholder="Rechercher" />
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="rt-grid">
                    {interventions.map((item, idx) => (
                        <div className="rt-card" key={idx}>
                            <div className="rt-card-body">
                                {/* Badge */}
                                <span className="rt-badge" style={{ background: item.statusBg, color: item.statusColor }}>
                                    <span className="rt-badge-dot" style={{ background: item.statusColor }}></span>
                                    {item.status}
                                </span>

                                {/* Title & Location */}
                                <p className="rt-card-title">{item.title}</p>
                                <p className="rt-card-location">
                                    📍 {item.locataire} · {item.bien}
                                </p>

                                {/* Details 2x2 */}
                                <div className="rt-details">
                                    {item.details.map((d, i) => (
                                        <div className="rt-detail" key={i}>
                                            <p className="rt-detail-label">{d.label}</p>
                                            <p className="rt-detail-value">{d.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Devis */}
                                <div className="rt-devis">
                                    <p className="rt-devis-label">{item.devisLabel}</p>
                                    <p className="rt-devis-value" style={{ color: item.devisColor }}>{item.devisValue}</p>
                                </div>

                                {/* Progress bar for EN COURS */}
                                {item.status === 'EN COURS' && (
                                    <div className="rt-progress-row">
                                        <p className="rt-progress-label">AVANCEMENT</p>
                                        <div className="rt-progress-bar">
                                            <div className="rt-progress-fill" style={{ width: idx === 1 ? '60%' : '85%' }}></div>
                                        </div>
                                        <p className="rt-progress-pct">{idx === 1 ? '60%' : '85%'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="rt-card-footer">
                                <span className="rt-footer-date">{item.footerDate}</span>
                                <div className="rt-footer-actions">
                                    {item.footerIcons.map((icon, i) => (
                                        <span key={i} className="rt-action-dot" style={{
                                            background: i === 0 ? '#dcfce7' : i === 1 ? '#eff6ff' : i === 2 ? '#fef3c7' : '#f3f4f6',
                                        }}>
                                            {icon}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ReparationsTravaux;
