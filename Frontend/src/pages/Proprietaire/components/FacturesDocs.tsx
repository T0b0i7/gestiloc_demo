import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Receipt } from 'lucide-react';
import { invoiceService } from '@/services/api';

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

// Les données seront chargées depuis l'API
const TYPE_CONFIG: Record<string, { label: string, color: string }> = {
    'repair': { label: 'FACTURE TRAVAUX', color: '#f59e0b' },
    'charge': { label: 'FACTURE CHARGE', color: '#0ea5e9' },
    'deposit': { label: 'CAUTION', color: '#ef4444' },
    'rent': { label: 'FACTURE LOYER', color: '#83C757' },
};

interface FacturesDocsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const FacturesDocs: React.FC<FacturesDocsProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [factureList, setFactureList] = useState<FactureData[]>([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ totalDoc: 0, countMonth: 0, totalExpenses: 0, toRenew: 0 });

    const filters = ['Tous', 'Travaux', 'Charges', 'Cautions', 'Loyers'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await invoiceService.listInvoices();

            let totalExpenses = 0;
            let countMonth = 0;
            const now = new Date();

            const mapped = (data || []).map((f: any) => {
                const config = TYPE_CONFIG[f.type] || { label: f.type?.toUpperCase() || 'FACTURE', color: '#6b7280' };
                const amount = parseFloat(f.amount_total || 0);

                if (f.type !== 'rent') totalExpenses += amount;

                const createdAt = new Date(f.created_at);
                if (createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()) {
                    countMonth++;
                }

                return {
                    id: String(f.id),
                    typeBadge: config.label,
                    typeBadgeColor: config.color,
                    titre: `${config.label} - #${f.id}`,
                    lieu: f.lease?.property?.address || 'Bien inconnu',
                    champ1Label: 'LOCATAIRE',
                    champ1Value: f.lease?.tenant ? `${f.lease.tenant.first_name} ${f.lease.tenant.last_name}` : 'Inconnu',
                    champ2Label: 'DATE',
                    champ2Value: new Date(f.due_date).toLocaleDateString('fr-FR'),
                    champ3Label: 'STATUT',
                    champ3Value: f.status?.toUpperCase() || 'SOLDE',
                    champ4Label: 'MONTANT',
                    champ4Value: `${amount.toLocaleString()} FCFA`,
                    dateBas: `Ajouté le ${new Date(f.created_at).toLocaleDateString('fr-FR')}`,
                };
            });

            setFactureList(mapped);
            setKpis({
                totalDoc: mapped.length,
                countMonth: countMonth,
                totalExpenses: totalExpenses,
                toRenew: 0 // Logique à définir si besoin
            });
        } catch (error) {
            console.error('Erreur factures:', error);
            notify('Erreur lors du chargement des factures', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = factureList.filter(f =>
        f.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'TOTAL DOCUMENTS', value: String(kpis.totalDoc), color: '#1a1a1a' },
        { label: 'FACTURES CE MOIS', value: String(kpis.countMonth), color: '#1a1a1a' },
        { label: 'DÉPENSES TOTALES', value: `${kpis.totalExpenses.toLocaleString()} FCFA`, color: '#83C757' },
        { label: 'À RENOUVELER', value: '0', color: '#f59e0b' },
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
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
                            <Loader2 className="animate-spin" size={32} color="#83C757" />
                            <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: 600 }}>Chargement des factures...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map(f => (
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
                                        {f.champ4Label && <div><p className="fd-detail-label">{f.champ4Label}</p><p className="fd-detail-value" style={{ color: f.champ4Value.includes('FCFA') ? '#83C757' : '#1a1a1a' }}>{f.champ4Value}</p></div>}
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
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '18px', border: '2px dashed #e5e7eb' }}>
                            <div style={{ width: '64px', height: '64px', background: '#f0f9eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Receipt size={32} color="#83C757" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Aucune facture</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                Vous n'avez pas encore de factures ou de documents enregistrés.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FacturesDocs;
