import React, { useState } from 'react';
import { Plus, Search, Settings } from 'lucide-react';

interface ContratData {
    id: string;
    typeBadge: string;
    typeBadgeColor: string;
    titre: string;
    bien: string;
    loyerMensuel: string;
    depotGarantie: string;
    dateDebut: string;
    dateFin: string;
    statut: 'actif' | 'attente';
    creeLe: string;
}

const mockContrats: ContratData[] = [
    {
        id: '1', typeBadge: 'BAIL D\'HABITATION NU', typeBadgeColor: '#83C757',
        titre: 'Contrat - Monts Athis', bien: 'Appartement 12 - Agla',
        loyerMensuel: '60 000 FCFA', depotGarantie: '120 000 FCFA',
        dateDebut: '01 Jan 2026', dateFin: '31 Déc 2026',
        statut: 'actif', creeLe: 'Créé le 28 Déc 2025',
    },
    {
        id: '2', typeBadge: 'BAIL MEUBLÉ', typeBadgeColor: '#f59e0b',
        titre: 'Contrat - Sophie Bernard', bien: 'Villa moderne - Fidjrossè',
        loyerMensuel: '150 000 FCFA', depotGarantie: '300 000 FCFA',
        dateDebut: '15 Fév 2026', dateFin: '14 Fév 2027',
        statut: 'actif', creeLe: 'Créé le 10 Fev 2026',
    },
    {
        id: '3', typeBadge: 'BAIL D\'HABITATION NU', typeBadgeColor: '#83C757',
        titre: 'Contrat - Jean-Pierre Kouassi', bien: 'Appartement 8 - Akpakpa',
        loyerMensuel: '50 000 FCFA', depotGarantie: '100 000 FCFA',
        dateDebut: '01 Mar 2026', dateFin: '28 Fév 2027',
        statut: 'attente', creeLe: 'Créé le 04 Fev 2026',
    },
];

interface ContratsBauxProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ContratsBaux: React.FC<ContratsBauxProps> = ({ notify }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filtered = mockContrats.filter(c =>
        c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.bien.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .cb-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .cb-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .cb-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .cb-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; }
        .cb-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
        .cb-add-btn:hover { background: #72b44a; }
        .cb-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .cb-filter-title { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .cb-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .cb-search-row { display: flex; gap: 12px; align-items: stretch; }
        .cb-search-wrap { flex: 1; position: relative; }
        .cb-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .cb-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .cb-search-input::placeholder { color: #83C757; font-weight: 600; }
        .cb-btn-display { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #d1d5db; background: #fff; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; cursor: pointer; }
        .cb-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .cb-contrat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; padding: 0; overflow: hidden; display: flex; flex-direction: column; }
        .cb-contrat-top { padding: 1.1rem 1.3rem 0.7rem; }
        .cb-type-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .cb-contrat-titre { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .cb-contrat-bien { font-size: 0.75rem; color: #ef4444; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .cb-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .cb-detail-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .cb-detail-value { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .cb-status-actif { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; background: #dcfce7; color: #166534; font-size: 0.72rem; font-weight: 700; }
        .cb-status-attente { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; background: #fef3c7; color: #92400e; font-size: 0.72rem; font-weight: 700; }
        .cb-contrat-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .cb-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .cb-footer-actions { display: flex; gap: 6px; }
        .cb-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #9ca3af; transition: color 0.15s; }
        .cb-icon-btn:hover { color: #374151; }
        .cb-icon-btn.green { color: #83C757; }
        .cb-icon-btn.orange { color: #f59e0b; }
        @media (max-width: 1400px) { .cb-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .cb-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .cb-grid { grid-template-columns: 1fr; }
          .cb-header { flex-direction: column; gap: 12px; }
          .cb-add-btn { width: 100%; justify-content: center; }
          .cb-search-row { flex-direction: column; }
          .cb-btn-display { width: 100%; height: 44px; justify-content: center; }
          .cb-card { padding: 1rem; }
        }
        @media (max-width: 480px) { .cb-page { padding: 1rem 0.5rem 2rem; } .cb-title { font-size: 1.2rem; } }
      `}</style>

            <div className="cb-page">
                <div className="cb-header">
                    <div>
                        <h1 className="cb-title">Contrats de bail</h1>
                        <p className="cb-subtitle">Générez automatiquement vos contrats de bail personnalisés en quelques clics. Documents conformes et prêts à signer.</p>
                    </div>
                    <button className="cb-add-btn" onClick={() => notify('Création contrat à venir', 'info')}>
                        <Plus size={15} /> Contrat de bail
                    </button>
                </div>

                <div className="cb-card">
                    <p className="cb-filter-title">FILTRER PAR BIEN</p>
                    <select className="cb-select"><option>Tous les biens</option></select>
                </div>

                <div className="cb-card">
                    <div className="cb-search-row">
                        <div className="cb-search-wrap">
                            <Search size={16} className="cb-search-icon" />
                            <input className="cb-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button className="cb-btn-display"><Settings size={15} /> Affichage</button>
                    </div>
                </div>

                <div className="cb-grid">
                    {filtered.map(c => (
                        <div className="cb-contrat" key={c.id}>
                            <div className="cb-contrat-top">
                                <span className="cb-type-badge" style={{ background: c.typeBadgeColor + '20', color: c.typeBadgeColor }}>{c.typeBadge}</span>
                                <p className="cb-contrat-titre">{c.titre}</p>
                                <p className="cb-contrat-bien">📍 {c.bien}</p>
                                <div className="cb-detail-row">
                                    <div><p className="cb-detail-label">Loyer mensuel</p><p className="cb-detail-value">{c.loyerMensuel}</p></div>
                                    <div><p className="cb-detail-label">Dépôt de garantie</p><p className="cb-detail-value">{c.depotGarantie}</p></div>
                                </div>
                                <div className="cb-detail-row">
                                    <div><p className="cb-detail-label">Date de début</p><p className="cb-detail-value">{c.dateDebut}</p></div>
                                    <div><p className="cb-detail-label">Date de fin</p><p className="cb-detail-value">{c.dateFin}</p></div>
                                </div>
                                {c.statut === 'actif'
                                    ? <span className="cb-status-actif">✓ Actif</span>
                                    : <span className="cb-status-attente">⏳ En attente de signature</span>
                                }
                            </div>
                            <div className="cb-contrat-footer">
                                <span className="cb-footer-date">{c.creeLe}</span>
                                <div className="cb-footer-actions">
                                    <button className="cb-icon-btn green" title="Télécharger">📥</button>
                                    <button className="cb-icon-btn orange" title="Modifier">✏️</button>
                                    <button className="cb-icon-btn" title="Plus">⋮</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ContratsBaux;
