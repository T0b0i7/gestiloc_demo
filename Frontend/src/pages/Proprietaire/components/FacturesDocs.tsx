import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';

interface FactureData {
    id: string;
    typeBadge: string;
    typeBadgeColor: string;
    titre: string;
    lieu: string;
    champ1Label: string; champ1Value: string;
    champ2Label: string; champ2Value: string;
    champ3Label: string; champ3Value: string;
    champ4Label: string; champ4Value: string;
    dateBas: string;
}

const mockFactures: FactureData[] = [
    {
        id: '1', typeBadge: 'FACTURE TRAVAUX', typeBadgeColor: '#f59e0b',
        titre: 'Réparation fuite d\'eau', lieu: 'Thomas Moreau • Marseille',
        champ1Label: 'PRESTATAIRE', champ1Value: 'Plomberie Express',
        champ2Label: 'DATE', champ2Value: '15 Jan 2025',
        champ3Label: 'N° FACTURE', champ3Value: 'PL-2025-0089',
        champ4Label: 'MONTANT TTC', champ4Value: '245 €',
        dateBas: 'Ajouté le 15 Jan 2025',
    },
    {
        id: '2', typeBadge: 'DIAGNOSTIC AMIANTE', typeBadgeColor: '#ef4444',
        titre: 'Diagnostic amiante avant travaux', lieu: 'Marie Lefevre • Lyon 6ème',
        champ1Label: 'DIAGNOSTIQUEUR', champ1Value: 'Control Habitat',
        champ2Label: 'DATE VISITE', champ2Value: '05 Jan 2025',
        champ3Label: 'RÉSULTAT', champ3Value: 'Absence d\'amiante',
        champ4Label: 'COÛT', champ4Value: '180 €',
        dateBas: 'Ajouté le 05 Jan 2025',
    },
    {
        id: '3', typeBadge: 'ASSURANCE GLI', typeBadgeColor: '#3b82f6',
        titre: 'Garantie Loyers Impayés 2025', lieu: 'Martin Dupont • Boulogne-Billancourt',
        champ1Label: 'COMPAGNIE', champ1Value: 'Garantme',
        champ2Label: 'VALIDITÉ', champ2Value: '01/01 - 31/12/25',
        champ3Label: 'N° POLICE', champ3Value: 'GLI-789456123',
        champ4Label: 'PRIME ANNUELLE', champ4Value: '280 €',
        dateBas: 'Ajouté le 10 Jan 2025',
    },
    {
        id: '4', typeBadge: 'FACTURE TRAVAUX', typeBadgeColor: '#f59e0b',
        titre: 'Remise en peinture appartement', lieu: 'Antoine Mercier • Bordeaux',
        champ1Label: 'PRESTATAIRE', champ1Value: 'Color Pro',
        champ2Label: 'DATE', champ2Value: '20 Déc 2024',
        champ3Label: 'N° FACTURE', champ3Value: 'CP-2024-1245',
        champ4Label: 'MONTANT TTC', champ4Value: '1 850 €',
        dateBas: 'Payé le 20 Déc 2024',
    },
    {
        id: '5', typeBadge: 'FACTURE EAU', typeBadgeColor: '#0ea5e9',
        titre: 'Consommation eau Janvier 2025', lieu: 'Jean-Pierre Roussel • La Rochelle',
        champ1Label: 'FOURNISSEUR', champ1Value: 'Veolia Eau',
        champ2Label: 'PÉRIODE', champ2Value: 'Jan 2025',
        champ3Label: 'CONSOMMATION', champ3Value: '12 m³',
        champ4Label: 'MONTANT TTC', champ4Value: '45 €',
        dateBas: 'Ajouté le 02 Fev 2025',
    },
    {
        id: '6', typeBadge: 'CERTIFICAT', typeBadgeColor: '#8b5cf6',
        titre: 'Certificat conformité électrique', lieu: 'Claire Dubois • Nantes',
        champ1Label: 'ORGANISME', champ1Value: 'Consuel',
        champ2Label: 'DATE D\'ÉMISSION', champ2Value: '18 Déc 2024',
        champ3Label: 'N° ATTESTATION', champ3Value: 'CON-2024-89456',
        champ4Label: '', champ4Value: 'Conforme',
        dateBas: 'Ajouté le 18 Déc 2024',
    },
    {
        id: '7', typeBadge: 'FACTURE TRAVAUX', typeBadgeColor: '#f59e0b',
        titre: 'Réparation chaudière', lieu: 'Montée Alba • Villeurbanne',
        champ1Label: 'PRESTATAIRE', champ1Value: 'Chauffage Pro',
        champ2Label: 'DATE', champ2Value: '28 Jan 2025',
        champ3Label: 'N° FACTURE', champ3Value: 'F-2025-0042',
        champ4Label: 'MONTANT TTC', champ4Value: '385 €',
        dateBas: 'Ajouté le 28 Jan 2025',
    },
    {
        id: '8', typeBadge: 'ASSURANCE HABITATION', typeBadgeColor: '#22c55e',
        titre: 'Assurance PNO 2025', lieu: 'Sophia Bernard • Paris 15ème',
        champ1Label: 'COMPAGNIE', champ1Value: 'AXA Assurances',
        champ2Label: 'VALIDITÉ', champ2Value: '01/01 - 31/12/25',
        champ3Label: 'N° CONTRAT', champ3Value: 'AXA-45678912',
        champ4Label: 'PRIME ANNUELLE', champ4Value: '420 €',
        dateBas: 'Ajouté le 15 Jan 2025',
    },
    {
        id: '9', typeBadge: 'DIAGNOSTIC DPE', typeBadgeColor: '#06b6d4',
        titre: 'Diagnostic performance énergétique', lieu: 'Martin Dupont • Boulogne-Billancourt',
        champ1Label: 'DIAGNOSTIQUEUR', champ1Value: 'Expert Diag',
        champ2Label: 'DATE VISITE', champ2Value: '10 Jan 2025',
        champ3Label: 'VALIDITÉ', champ3Value: 'Jusqu\'au 10/01/35',
        champ4Label: 'CLASSE ÉNERGIE', champ4Value: 'C (120 kWh/m²)',
        dateBas: 'Ajouté le 10 Jan 2025',
    },
    {
        id: '10', typeBadge: 'TAXE FONCIÈRE', typeBadgeColor: '#dc2626',
        titre: 'Taxe foncière 2024', lieu: 'Jean-Pierre Roussel • La Rochelle',
        champ1Label: 'ANNÉE FISCALE', champ1Value: '2024',
        champ2Label: 'DATE LIMITE', champ2Value: '15 Oct 2024',
        champ3Label: 'RÉFÉRENCE', champ3Value: 'TF-2024-8945',
        champ4Label: 'MONTANT', champ4Value: '1 280 €',
        dateBas: 'Payé le 12 Oct 2024',
    },
    {
        id: '11', typeBadge: 'FACTURE ÉNERGIE', typeBadgeColor: '#eab308',
        titre: 'Électricité Janvier 2025', lieu: 'Montée Alba • Villeurbanne',
        champ1Label: 'FOURNISSEUR', champ1Value: 'EDF',
        champ2Label: 'PÉRIODE', champ2Value: 'Jan 2025',
        champ3Label: 'N° CLIENT', champ3Value: '1234567890',
        champ4Label: 'MONTANT TTC', champ4Value: '88 €',
        dateBas: 'Ajouté le 05 Fev 2025',
    },
    {
        id: '12', typeBadge: 'ATTESTATION', typeBadgeColor: '#a855f7',
        titre: 'Attestation entretien chaudière', lieu: 'Sophia Bernard • Paris 15ème',
        champ1Label: 'PRESTATAIRE', champ1Value: 'Gaz Service Plus',
        champ2Label: 'DATE ENTRETIEN', champ2Value: '20 Déc 2024',
        champ3Label: 'VALIDITÉ', champ3Value: 'Jusqu\'au 20/12/25',
        champ4Label: 'COÛT', champ4Value: '125 €',
        dateBas: 'Ajouté le 20 Déc 2024',
    },
];

interface FacturesDocsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const FacturesDocs: React.FC<FacturesDocsProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const filters = ['Tous', 'Facture', 'Travaux', 'Assurances', 'Diagnostics', 'Autres'];

    const filtered = mockFactures.filter(f =>
        f.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'TOTAL DOCUMENTS', value: '87', color: '#1a1a1a' },
        { label: 'FACTURES CE MOIS', value: '12', color: '#1a1a1a' },
        { label: 'DÉPENSES 2025', value: '8 450 €', color: '#83C757' },
        { label: 'À RENOUVELER', value: '3', color: '#f59e0b' },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .fd-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .fd-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .fd-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .fd-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; max-width: 600px; }
        .fd-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .fd-add-btn:hover { background: #72b44a; }
        .fd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .fd-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .fd-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .fd-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .fd-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .fd-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .fd-filter-btn.active { background: #83C757; color: #fff; }
        .fd-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .fd-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .fd-filter-title { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .fd-filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 14px; }
        .fd-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .fd-search-wrap { position: relative; }
        .fd-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .fd-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .fd-search-input::placeholder { color: #83C757; font-weight: 600; }
        .fd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .fd-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .fd-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .fd-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.60rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .fd-item-titre { font-size: 0.92rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .fd-item-lieu { font-size: 0.75rem; color: #ef4444; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .fd-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .fd-detail-label { font-size: 0.60rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .fd-detail-value { font-size: 0.78rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .fd-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .fd-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .fd-footer-actions { display: flex; gap: 6px; }
        .fd-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; color: #9ca3af; }
        .fd-icon-btn.green { color: #83C757; }
        .fd-icon-btn.orange { color: #f59e0b; }
        @media (max-width: 1400px) { .fd-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .fd-grid { grid-template-columns: repeat(2, 1fr); } .fd-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .fd-grid { grid-template-columns: 1fr; }
          .fd-stats { grid-template-columns: repeat(2, 1fr); }
          .fd-filter-row { grid-template-columns: 1fr; }
          .fd-header { flex-direction: column; gap: 12px; }
          .fd-add-btn { width: 100%; justify-content: center; }
          .fd-card { padding: 1rem; }
          .fd-filters { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
          .fd-filter-btn { flex-shrink: 0; }
        }
        @media (max-width: 480px) {
          .fd-page { padding: 1rem 0.5rem 2rem; }
          .fd-title { font-size: 1.2rem; }
          .fd-stats { grid-template-columns: 1fr; }
          .fd-filter-btn { padding: 6px 14px; font-size: 0.75rem; }
        }
      `}</style>

            <div className="fd-page">
                <div className="fd-header">
                    <div>
                        <h1 className="fd-title">Factures et documents divers</h1>
                        <p className="fd-subtitle">Centralisez tous vos documents importants : factures de travaux, assurances, diagnostics, attestations. Gardez une trace de toutes vos dépenses et documents administratifs.</p>
                    </div>
                    <button className="fd-add-btn" onClick={() => notify('Ajout document à venir', 'info')}>
                        <Plus size={15} /> Ajouter un document
                    </button>
                </div>

                <div className="fd-stats">
                    {stats.map(s => (
                        <div className="fd-stat" key={s.label}>
                            <p className="fd-stat-label">{s.label}</p>
                            <p className="fd-stat-value" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="fd-filters">
                    {filters.map(f => (
                        <button key={f} className={`fd-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
                    ))}
                </div>

                <div className="fd-card">
                    <p className="fd-filter-title">FILTRER PAR BIEN ET PAR TYPE</p>
                    <div className="fd-filter-row">
                        <select className="fd-select"><option>Tous les biens</option></select>
                        <select className="fd-select"><option>Tous les types</option></select>
                    </div>
                    <div className="fd-search-wrap">
                        <Search size={16} className="fd-search-icon" />
                        <input className="fd-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="fd-grid">
                    {filtered.map(f => (
                        <div className="fd-item" key={f.id}>
                            <div className="fd-item-top">
                                <span className="fd-badge" style={{ background: f.typeBadgeColor + '20', color: f.typeBadgeColor }}>{f.typeBadge}</span>
                                <p className="fd-item-titre">{f.titre}</p>
                                <p className="fd-item-lieu">📍 {f.lieu}</p>
                                <div className="fd-detail-row">
                                    <div><p className="fd-detail-label">{f.champ1Label}</p><p className="fd-detail-value">{f.champ1Value}</p></div>
                                    <div><p className="fd-detail-label">{f.champ2Label}</p><p className="fd-detail-value">{f.champ2Value}</p></div>
                                </div>
                                <div className="fd-detail-row">
                                    <div><p className="fd-detail-label">{f.champ3Label}</p><p className="fd-detail-value">{f.champ3Value}</p></div>
                                    {f.champ4Label && <div><p className="fd-detail-label">{f.champ4Label}</p><p className="fd-detail-value" style={{ color: f.champ4Value.includes('€') ? '#83C757' : '#1a1a1a' }}>{f.champ4Value}</p></div>}
                                </div>
                            </div>
                            <div className="fd-footer">
                                <span className="fd-footer-date">{f.dateBas}</span>
                                <div className="fd-footer-actions">
                                    <button className="fd-icon-btn">👁️</button>
                                    <button className="fd-icon-btn green">📥</button>
                                    <button className="fd-icon-btn orange">✏️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default FacturesDocs;
