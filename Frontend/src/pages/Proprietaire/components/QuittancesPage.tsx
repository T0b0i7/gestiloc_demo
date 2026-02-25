import React, { useState } from 'react';
import { Plus, Search, Settings, Eye } from 'lucide-react';

interface QuittanceData {
    id: string;
    statutBadge: string;
    statutBadgeColor: string;
    titre: string;
    lieu: string;
    periode: string;
    paiementRecu: string;
    loyer: string;
    charges: string;
    totalPaye: string;
    creeLe: string;
}

const mockQuittances: QuittanceData[] = [
    {
        id: '1', statutBadge: '✓ ENVOYÉE LE 30 JAN 2025', statutBadgeColor: '#83C757',
        titre: 'Quittance Février 2025', lieu: 'Jean-Pierre Roussel • La Rochelle',
        periode: 'Février 2025', paiementRecu: '29 Jan 2025',
        loyer: '950 €', charges: '110 €', totalPaye: '1 060 €',
        creeLe: 'Créé le 29 Jan 2025',
    },
    {
        id: '2', statutBadge: '📧 EN ATTENTE D\'ENVOI', statutBadgeColor: '#f59e0b',
        titre: 'Quittance Février 2025', lieu: 'Montée Alba • Villeurbanne',
        periode: 'Février 2025', paiementRecu: '05 Fév 2025',
        loyer: '720 €', charges: '95 €', totalPaye: '815 €',
        creeLe: 'Créé le 05 Fev 2025',
    },
    {
        id: '3', statutBadge: '✓ ENVOYÉE LE 31 JAN 2025', statutBadgeColor: '#83C757',
        titre: 'Quittance Janvier 2025', lieu: 'Sophia Bernard • Paris 15ème',
        periode: 'Janvier 2025', paiementRecu: '28 Jan 2025',
        loyer: '1 200 €', charges: '180 €', totalPaye: '1 380 €',
        creeLe: 'Créé le 28 Jan 2025',
    },
    {
        id: '4', statutBadge: '✓ ENVOYÉE LE 02 FÉV 2025', statutBadgeColor: '#83C757',
        titre: 'Quittance Février 2025', lieu: 'Thomas Moreau • Marseille',
        periode: 'Février 2025', paiementRecu: '01 Fév 2025',
        loyer: '1 100 €', charges: '150 €', totalPaye: '1 250 €',
        creeLe: 'Créé le 01 Fev 2025',
    },
    {
        id: '5', statutBadge: '✓ ENVOYÉE LE 29 JAN 2025', statutBadgeColor: '#83C757',
        titre: 'Quittance Janvier 2025', lieu: 'Marie Lefevre • Lyon 6ème',
        periode: 'Janvier 2025', paiementRecu: '27 Jan 2025',
        loyer: '980 €', charges: '140 €', totalPaye: '1 120 €',
        creeLe: 'Créé le 27 Jan 2025',
    },
    {
        id: '6', statutBadge: '📧 EN ATTENTE D\'ENVOI', statutBadgeColor: '#f59e0b',
        titre: 'Quittance Janvier 2025', lieu: 'Antoine Mercier • Bordeaux',
        periode: 'Janvier 2025', paiementRecu: '04 Fév 2025',
        loyer: '870 €', charges: '105 €', totalPaye: '975 €',
        creeLe: 'Créé le 04 Fev 2025',
    },
];

interface QuittancesLoyersPageProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const QuittancesLoyersPage: React.FC<QuittancesLoyersPageProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const filters = ['Tous', 'A envoyer', 'En attente', 'Par an'];

    const filtered = mockQuittances.filter(q =>
        q.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'QUITTANCES ÉMISES', value: '142', color: '#1a1a1a' },
        { label: 'CE MOIS-CI', value: '18', color: '#83C757' },
        { label: 'EN ATTENTE D\'ENVOI', value: '5', color: '#f59e0b' },
        { label: 'TOTAL ENCAISSÉ', value: '45 780 €', color: '#83C757' },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .ql-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .ql-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .ql-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .ql-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; }
        .ql-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ql-add-btn:hover { background: #72b44a; }
        .ql-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .ql-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .ql-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .ql-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .ql-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; }
        .ql-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .ql-filter-btn.active { background: #83C757; color: #fff; }
        .ql-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .ql-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .ql-filter-ttl { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .ql-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .ql-search-row { display: flex; gap: 12px; align-items: stretch; }
        .ql-search-wrap { flex: 1; position: relative; }
        .ql-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .ql-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .ql-search-input::placeholder { color: #83C757; font-weight: 600; }
        .ql-btn-display { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #d1d5db; background: #fff; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; cursor: pointer; }
        .ql-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ql-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .ql-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .ql-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .ql-item-titre { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .ql-item-lieu { font-size: 0.75rem; color: #ef4444; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .ql-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .ql-detail-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .ql-detail-value { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .ql-total-row { margin-top: 4px; }
        .ql-total-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .ql-total-value { font-size: 1.05rem; font-weight: 800; color: #83C757; margin: 0; }
        .ql-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .ql-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .ql-footer-actions { display: flex; gap: 6px; }
        .ql-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; color: #9ca3af; }
        .ql-icon-btn.green { color: #83C757; }
        .ql-icon-btn.orange { color: #f59e0b; }
        @media (max-width: 1400px) { .ql-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .ql-grid { grid-template-columns: repeat(2, 1fr); } .ql-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .ql-grid { grid-template-columns: 1fr; } .ql-stats { grid-template-columns: 1fr; } .ql-header { flex-direction: column; gap: 12px; } }
        @media (max-width: 480px) { .ql-page { padding: 1rem 0.5rem 2rem; } .ql-title { font-size: 1.3rem; } .ql-filters { gap: 6px; } .ql-filter-btn { padding: 6px 14px; font-size: 0.75rem; } }
      `}</style>

            <div className="ql-page">
                <div className="ql-header">
                    <div>
                        <h1 className="ql-title">Quittances de loyers</h1>
                        <p className="ql-subtitle">Créez et générez vos quittances de loyer après réception des paiements. Envoyez automatiquement les quittances à vos locataires.</p>
                    </div>
                    <button className="ql-add-btn" onClick={() => notify('Création quittance à venir', 'info')}>
                        <Plus size={15} /> Créer une quittance de loyer
                    </button>
                </div>

                <div className="ql-stats">
                    {stats.map(s => (
                        <div className="ql-stat" key={s.label}>
                            <p className="ql-stat-label">{s.label}</p>
                            <p className="ql-stat-value" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="ql-filters">
                    {filters.map(f => (
                        <button key={f} className={`ql-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
                    ))}
                </div>

                <div className="ql-card">
                    <p className="ql-filter-ttl">FILTRER PAR BIEN</p>
                    <select className="ql-select"><option>Tous les biens</option></select>
                </div>

                <div className="ql-card">
                    <div className="ql-search-row">
                        <div className="ql-search-wrap">
                            <Search size={16} className="ql-search-icon" />
                            <input className="ql-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button className="ql-btn-display"><Settings size={15} /> Affichage</button>
                    </div>
                </div>

                <div className="ql-grid">
                    {filtered.map(q => (
                        <div className="ql-item" key={q.id}>
                            <div className="ql-item-top">
                                <span className="ql-badge" style={{ background: q.statutBadgeColor + '20', color: q.statutBadgeColor }}>{q.statutBadge}</span>
                                <p className="ql-item-titre">{q.titre}</p>
                                <p className="ql-item-lieu">📍 {q.lieu}</p>
                                <div className="ql-detail-row">
                                    <div><p className="ql-detail-label">Période</p><p className="ql-detail-value">{q.periode}</p></div>
                                    <div><p className="ql-detail-label">Paiement reçu</p><p className="ql-detail-value">{q.paiementRecu}</p></div>
                                </div>
                                <div className="ql-detail-row">
                                    <div><p className="ql-detail-label">Loyer</p><p className="ql-detail-value" style={{ color: '#83C757' }}>{q.loyer}</p></div>
                                    <div><p className="ql-detail-label">Charges</p><p className="ql-detail-value">{q.charges}</p></div>
                                </div>
                                <div className="ql-total-row">
                                    <p className="ql-total-label">Total payé</p>
                                    <p className="ql-total-value">{q.totalPaye}</p>
                                </div>
                            </div>
                            <div className="ql-footer">
                                <span className="ql-footer-date">{q.creeLe}</span>
                                <div className="ql-footer-actions">
                                    <button className="ql-icon-btn">👁️</button>
                                    <button className="ql-icon-btn green">📥</button>
                                    <button className="ql-icon-btn orange">📧</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default QuittancesLoyersPage;
