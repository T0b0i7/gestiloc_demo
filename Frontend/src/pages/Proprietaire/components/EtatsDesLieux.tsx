import React, { useState } from 'react';
import { Plus, Search, Settings } from 'lucide-react';

interface EdlData {
    id: string;
    typeBadge: string;
    typeBadgeColor: string;
    titre: string;
    bien: string;
    locataire: string;
    date: string;
    etatGeneral: string;
    signe: string;
    photos: number;
    creeLe: string;
}

const mockEdl: EdlData[] = [
    {
        id: '1', typeBadge: 'ÉTAT DES LIEUX D\'ENTRÉE', typeBadgeColor: '#83C757',
        titre: 'EDL - Monts Athis', bien: 'Appartement 12 - Agla',
        locataire: 'Monts Athis', date: '28 Déc 2025',
        etatGeneral: 'Très bon', signe: '✓ Oui', photos: 12,
        creeLe: 'Créé le 28 Déc 2025',
    },
    {
        id: '2', typeBadge: 'ÉTAT DES LIEUX D\'ENTRÉE', typeBadgeColor: '#83C757',
        titre: 'EDL - Sophie Bernard', bien: 'Villa moderne - Fidjrossè',
        locataire: 'Sophie Bernard', date: '15 Fév 2026',
        etatGeneral: 'Excellent', signe: '✓ Oui', photos: 18,
        creeLe: 'Créé le 14 Fév 2026',
    },
    {
        id: '3', typeBadge: 'ÉTAT DES LIEUX DE SORTIE', typeBadgeColor: '#ef4444',
        titre: 'EDL - Martin Dupont', bien: 'Studio cosy - Centre-ville',
        locataire: 'Martin Dupont', date: '30 Jan 2026',
        etatGeneral: 'Bon', signe: '✓ Oui', photos: 15,
        creeLe: 'Créé le 30 Jan 2026',
    },
    {
        id: '4', typeBadge: 'ÉTAT DES LIEUX D\'ENTRÉE', typeBadgeColor: '#83C757',
        titre: 'EDL - Jean-Pierre Kouassi', bien: 'Appartement 8 - Akpakpa',
        locataire: 'J-P Kouassi', date: '01 Mar 2026',
        etatGeneral: 'Très bon', signe: '⏳ En attente', photos: 10,
        creeLe: 'Créé le 28 Fév 2026',
    },
];

interface EtatsDesLieuxProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const EtatsDesLieux: React.FC<EtatsDesLieuxProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = mockEdl.filter(e => {
        const matchSearch = e.titre.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeFilter === 'Entrée') return matchSearch && e.typeBadge.includes('ENTRÉE');
        if (activeFilter === 'Sortie') return matchSearch && e.typeBadge.includes('SORTIE');
        return matchSearch;
    });

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .edl-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .edl-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .edl-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .edl-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; }
        .edl-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .edl-add-btn:hover { background: #72b44a; }

        .edl-filters-bar { display: inline-flex; align-items: center; gap: 6px; background: rgba(243, 243, 243, 1); border-radius: 28px; padding: 5px 8px; margin-bottom: 1.25rem; }
        .edl-filter-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.15s; background: transparent; color: #374151; }
        .edl-filter-btn.active { background: #83C757; color: #fff; }
        .edl-filter-icon { width: 22px; height: 22px; object-fit: contain; }

        .edl-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .edl-filter-title { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .edl-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .edl-search-row { display: flex; gap: 12px; align-items: stretch; }
        .edl-search-wrap { flex: 1; position: relative; }
        .edl-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .edl-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .edl-search-input::placeholder { color: #83C757; font-weight: 600; }
        .edl-btn-display { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #d1d5db; background: #fff; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; cursor: pointer; }

        .edl-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .edl-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; border-left: 4px solid #e5e7eb; }
        .edl-item.entree { border-left: 4px solid #83C757; }
        .edl-item.sortie { border-left: 4px solid #ef4444; }
        .edl-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .edl-type-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 8px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .edl-badge-icon { width: 14px; height: 14px; object-fit: contain; }
        .edl-item-titre { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .edl-item-bien { font-size: 0.75rem; color: #ef4444; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .edl-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .edl-detail-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .edl-detail-value { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .edl-photos { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; background: #f3f4f6; font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-top: 6px; }
        .edl-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .edl-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .edl-footer-actions { display: flex; gap: 8px; align-items: center; }
        .edl-action-btn { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
        .edl-action-btn img { width: 20px; height: 20px; object-fit: contain; }
        .edl-action-dots { background: none; border: none; cursor: pointer; padding: 4px; font-size: 1.1rem; color: #9ca3af; line-height: 1; }

        @media (max-width: 1400px) { .edl-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .edl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .edl-grid { grid-template-columns: 1fr; } .edl-header { flex-direction: column; gap: 12px; } }
        @media (max-width: 480px) { .edl-page { padding: 1rem 0.5rem 2rem; } .edl-title { font-size: 1.3rem; } .edl-filters { gap: 6px; } .edl-filter-btn { padding: 6px 14px; font-size: 0.75rem; } }
      `}</style>

            <div className="edl-page">
                <div className="edl-header">
                    <div>
                        <h1 className="edl-title">Etats des lieux</h1>
                        <p className="edl-subtitle">Documentez l'état de vos biens avec photos et descriptions détaillées. Générez des PDF professionnels en quelques clics.</p>
                    </div>
                    <button className="edl-add-btn" onClick={() => notify('Création état des lieux à venir', 'info')}>
                        <Plus size={15} /> Créer un nouvel etat de lieu
                    </button>
                </div>

                {/* Barre de filtres dans un rectangle gris arrondi */}
                <div className="edl-filters-bar">
                    <button className={`edl-filter-btn ${activeFilter === 'Tous' ? 'active' : ''}`} onClick={() => setActiveFilter('Tous')}>
                        Tous
                    </button>
                    <button className={`edl-filter-btn ${activeFilter === 'Entrée' ? 'active' : ''}`} onClick={() => setActiveFilter('Entrée')}>
                        <img src="/Ressource_gestiloc/entree.png" alt="" className="edl-filter-icon" /> Entrée
                    </button>
                    <button className={`edl-filter-btn ${activeFilter === 'Sortie' ? 'active' : ''}`} onClick={() => setActiveFilter('Sortie')}>
                        <img src="/Ressource_gestiloc/sortie.png" alt="" className="edl-filter-icon" /> Sortie
                    </button>
                </div>

                <div className="edl-card">
                    <p className="edl-filter-title">FILTRER PAR BIEN</p>
                    <select className="edl-select"><option>Tous les biens</option></select>
                </div>

                <div className="edl-card">
                    <div className="edl-search-row">
                        <div className="edl-search-wrap">
                            <Search size={16} className="edl-search-icon" />
                            <input className="edl-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button className="edl-btn-display"><Settings size={15} /> Affichage</button>
                    </div>
                </div>

                <div className="edl-grid">
                    {filtered.map(e => {
                        const isEntree = e.typeBadge.includes('ENTRÉE');
                        return (
                            <div className={`edl-item ${isEntree ? 'entree' : 'sortie'}`} key={e.id}>
                                <div className="edl-item-top">
                                    <span className="edl-type-badge" style={{ background: e.typeBadgeColor + '20', color: e.typeBadgeColor }}>
                                        <img src={isEntree ? '/Ressource_gestiloc/entree.png' : '/Ressource_gestiloc/sortie.png'} alt="" className="edl-badge-icon" />
                                        {e.typeBadge}
                                    </span>
                                    <p className="edl-item-titre">{e.titre}</p>
                                    <p className="edl-item-bien">📍 {e.bien}</p>
                                    <div className="edl-detail-row">
                                        <div><p className="edl-detail-label">Locataire</p><p className="edl-detail-value">{e.locataire}</p></div>
                                        <div><p className="edl-detail-label">Date</p><p className="edl-detail-value">{e.date}</p></div>
                                    </div>
                                    <div className="edl-detail-row">
                                        <div><p className="edl-detail-label">État général</p><p className="edl-detail-value">{e.etatGeneral}</p></div>
                                        <div><p className="edl-detail-label">Signé</p><p className="edl-detail-value">{e.signe}</p></div>
                                    </div>
                                    <div className="edl-photos">📷 {e.photos} photos</div>
                                </div>
                                <div className="edl-footer">
                                    <span className="edl-footer-date">{e.creeLe}</span>
                                    <div className="edl-footer-actions">
                                        <button className="edl-action-btn" title="Télécharger">📥</button>
                                        <button className="edl-action-btn" title="Modifier">✏️</button>
                                        <button className="edl-action-dots" title="Plus">⋮</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default EtatsDesLieux;
