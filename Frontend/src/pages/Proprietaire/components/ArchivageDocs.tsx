import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';

interface ArchiveDoc {
    id: string;
    typeBadge: string;
    typeBadgeColor: string;
    titre: string;
    bien: string;
    champ1Label: string; champ1Value: string;
    champ2Label: string; champ2Value: string;
    champ3Label: string; champ3Value: string;
    champ4Label: string; champ4Value: string;
    dateBas: string;
}

const mockArchives: ArchiveDoc[] = [
    { id: '1', typeBadge: 'BAIL TERMINÉ', typeBadgeColor: '#f59e0b', titre: 'Contrat de bail - Paul Martin', bien: 'Appartement Lyon 5ème', champ1Label: 'DÉBUT BAIL', champ1Value: '01 Sep 2021', champ2Label: 'FIN BAIL', champ2Value: '31 Aoû 2024', champ3Label: 'DURÉE', champ3Value: '3 ans', champ4Label: 'LOYER MENSUEL', champ4Value: '850 €', dateBas: 'Archivé le 31 Aoû 2024' },
    { id: '2', typeBadge: 'EDL SORTIE', typeBadgeColor: '#ef4444', titre: 'État des lieux sortie - Paul Martin', bien: 'Appartement Lyon 5ème', champ1Label: 'DATE VISITE', champ1Value: '30 Aoû 2024', champ2Label: 'TYPE', champ2Value: 'Sortie', champ3Label: 'ÉTAT GÉNÉRAL', champ3Value: 'Bon', champ4Label: 'RETENUE CAUTION', champ4Value: '0 €', dateBas: 'Archivé le 31 Aoû 2024' },
    { id: '3', typeBadge: 'QUITTANCES 2023', typeBadgeColor: '#83C757', titre: 'Quittances annuelles 2023', bien: 'Jean-Pierre Kouassi • La Rochelle', champ1Label: 'PÉRIODE', champ1Value: 'Année 2023', champ2Label: 'NOMBRE', champ2Value: '12 quittances', champ3Label: 'TOTAL ENCAISSÉ', champ3Value: '12 720 €', champ4Label: '', champ4Value: '', dateBas: 'Archivé le 31 Déc 2023' },
    { id: '4', typeBadge: 'BAIL TERMINÉ', typeBadgeColor: '#f59e0b', titre: 'Contrat de bail - Sophie Durand', bien: 'Studio Paris 11ème', champ1Label: 'DÉBUT BAIL', champ1Value: '15 Mar 2020', champ2Label: 'FIN BAIL', champ2Value: '14 Mar 2023', champ3Label: 'DURÉE', champ3Value: '3 ans', champ4Label: 'LOYER MENSUEL', champ4Value: '720 €', dateBas: 'Archivé le 14 Mar 2023' },
    { id: '5', typeBadge: 'EDL ENTRÉE', typeBadgeColor: '#83C757', titre: 'État des lieux entrée - Paul Martin', bien: 'Appartement Lyon 5ème', champ1Label: 'DATE VISITE', champ1Value: '01 Sep 2021', champ2Label: 'TYPE', champ2Value: 'Entrée', champ3Label: 'ÉTAT GÉNÉRAL', champ3Value: 'Neuf', champ4Label: 'DÉPÔT DE GARANTIE', champ4Value: '850 €', dateBas: 'Archivé le 31 Aoû 2024' },
    { id: '6', typeBadge: 'ASSURANCE 2022', typeBadgeColor: '#3b82f6', titre: 'Dossier assurance PNO 2022', bien: 'Montée Alba • Villeurbanne', champ1Label: 'PÉRIODE', champ1Value: 'Année 2022', champ2Label: 'PARTENAIRE', champ2Value: 'Allianz', champ3Label: 'DOCUMENTS', champ3Value: '4 fichiers', champ4Label: 'PRIME', champ4Value: '380 €', dateBas: 'Archivé le 31 Déc 2022' },
    { id: '7', typeBadge: 'EDL SORTIE', typeBadgeColor: '#ef4444', titre: 'État des lieux sortie - Sophie Durand', bien: 'Studio Paris 11ème', champ1Label: 'DATE VISITE', champ1Value: '14 Mar 2023', champ2Label: 'TYPE', champ2Value: 'Sortie', champ3Label: 'ÉTAT GÉNÉRAL', champ3Value: 'Satisfaisant', champ4Label: 'RETENUE CAUTION', champ4Value: '150 €', dateBas: 'Archivé le 14 Mar 2023' },
    { id: '8', typeBadge: 'QUITTANCES 2022', typeBadgeColor: '#83C757', titre: 'Quittances annuelles 2022', bien: 'Sophia Bernard • Paris 15ème', champ1Label: 'PÉRIODE', champ1Value: 'Année 2022', champ2Label: 'NOMBRE', champ2Value: '12 quittances', champ3Label: 'TOTAL ENCAISSÉ', champ3Value: '16 560 €', champ4Label: '', champ4Value: '', dateBas: 'Archivé le 31 Déc 2022' },
    { id: '9', typeBadge: 'BAIL TERMINÉ', typeBadgeColor: '#f59e0b', titre: 'Contrat de bail - Marc Petit', bien: 'T2 Marseille 8ème', champ1Label: 'DÉBUT BAIL', champ1Value: '01 Avr 2019', champ2Label: 'FIN BAIL', champ2Value: '31 Mar 2022', champ3Label: 'DURÉE', champ3Value: '3 ans', champ4Label: 'LOYER MENSUEL', champ4Value: '680 €', dateBas: 'Archivé le 31 Mar 2022' },
];

interface ArchiveDocsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ArchivageDocs: React.FC<ArchiveDocsProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const filters = ['Tous', 'Contrat de bails', 'Etats des lieux', 'Quittances', 'Autres documents'];
    const stats = [
        { label: 'DOCUMENTS ARCHIVÉS', value: '245', color: '#1a1a1a' },
        { label: 'BAUX TERMINÉS', value: '18', color: '#1a1a1a' },
        { label: 'EDL ARCHIVÉS', value: '36', color: '#1a1a1a' },
        { label: 'ESPACE UTILISÉ', value: '2.4 GB', color: '#1a1a1a' },
    ];
    const filtered = mockArchives.filter(d => d.titre.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .ar-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .ar-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .ar-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .ar-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; max-width: 550px; }
        .ar-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ar-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .ar-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .ar-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .ar-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .ar-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .ar-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .ar-filter-btn.active { background: #83C757; color: #fff; }
        .ar-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .ar-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .ar-filter-ttl { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .ar-filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 14px; }
        .ar-select { width: 100%; padding: 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; box-sizing: border-box; }
        .ar-search-wrap { position: relative; }
        .ar-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .ar-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .ar-search-input::placeholder { color: #83C757; font-weight: 600; }
        .ar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ar-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .ar-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .ar-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.60rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .ar-item-titre { font-size: 0.92rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .ar-item-bien { font-size: 0.75rem; color: #ef4444; font-weight: 500; margin: 0 0 14px 0; }
        .ar-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .ar-detail-label { font-size: 0.60rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .ar-detail-value { font-size: 0.78rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .ar-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .ar-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .ar-footer-actions { display: flex; gap: 6px; }
        .ar-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; }
        @media (max-width: 1400px) { .ar-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .ar-grid { grid-template-columns: repeat(2, 1fr); } .ar-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .ar-grid { grid-template-columns: 1fr; } .ar-stats { grid-template-columns: 1fr; } .ar-filter-row { grid-template-columns: 1fr; } .ar-header { flex-direction: column; gap: 12px; } }
        @media (max-width: 480px) { .ar-page { padding: 1rem 0.5rem 2rem; } .ar-title { font-size: 1.3rem; } .ar-filters { gap: 6px; } .ar-filter-btn { padding: 6px 14px; font-size: 0.75rem; } }
      `}</style>
            <div className="ar-page">
                <div className="ar-header">
                    <div>
                        <h1 className="ar-title">Archivage de documents</h1>
                        <p className="ar-subtitle">Retrouvez tous vos documents archivés : anciens baux, états des lieux terminés, quittances passées. Gardez un historique complet de votre gestion locative.</p>
                    </div>
                    <button className="ar-add-btn" onClick={() => notify('Ajout document à venir', 'info')}><Plus size={15} /> Ajouter un document</button>
                </div>
                <div className="ar-stats">{stats.map(s => (<div className="ar-stat" key={s.label}><p className="ar-stat-label">{s.label}</p><p className="ar-stat-value" style={{ color: s.color }}>{s.value}</p></div>))}</div>
                <div className="ar-filters">{filters.map(f => (<button key={f} className={`ar-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>))}</div>
                <div className="ar-card">
                    <p className="ar-filter-ttl">FILTRE</p>
                    <div className="ar-filter-row"><select className="ar-select"><option>Tous les biens</option></select><select className="ar-select"><option>Toutes les années</option></select></div>
                    <div className="ar-search-wrap"><Search size={16} className="ar-search-icon" /><input className="ar-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                </div>
                <div className="ar-grid">
                    {filtered.map(d => (
                        <div className="ar-item" key={d.id}>
                            <div className="ar-item-top">
                                <span className="ar-badge" style={{ background: d.typeBadgeColor + '20', color: d.typeBadgeColor }}>{d.typeBadge}</span>
                                <p className="ar-item-titre">{d.titre}</p>
                                <p className="ar-item-bien">📍 {d.bien}</p>
                                <div className="ar-detail-row"><div><p className="ar-detail-label">{d.champ1Label}</p><p className="ar-detail-value">{d.champ1Value}</p></div><div><p className="ar-detail-label">{d.champ2Label}</p><p className="ar-detail-value">{d.champ2Value}</p></div></div>
                                <div className="ar-detail-row"><div><p className="ar-detail-label">{d.champ3Label}</p><p className="ar-detail-value">{d.champ3Value}</p></div>{d.champ4Label && <div><p className="ar-detail-label">{d.champ4Label}</p><p className="ar-detail-value">{d.champ4Value}</p></div>}</div>
                            </div>
                            <div className="ar-footer"><span className="ar-footer-date">{d.dateBas}</span><div className="ar-footer-actions"><button className="ar-icon-btn">👁️</button><button className="ar-icon-btn" style={{ color: '#83C757' }}>📥</button><button className="ar-icon-btn" style={{ color: '#f59e0b' }}>✏️</button></div></div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ArchivageDocs;
