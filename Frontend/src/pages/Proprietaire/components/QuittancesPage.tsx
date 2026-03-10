import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, Eye, Loader2, FileText } from 'lucide-react';
import { rentReceiptService } from '@/services/api';

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

// Les données seront chargées depuis l'API
const STATUT_CONFIG: Record<string, { label: string, color: string }> = {
    'issued': { label: '✓ ÉMISE', color: '#83C757' },
    'draft': { label: '📧 BROUILLON', color: '#f59e0b' },
};

interface QuittancesLoyersPageProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const QuittancesLoyersPage: React.FC<QuittancesLoyersPageProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [quittanceList, setQuittanceList] = useState<QuittanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ totalEncaisse: 0, count: 0, cebMonth: 0, waiting: 0 });

    const filters = ['Tous', 'Par an'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await rentReceiptService.listIndependent();

            let total = 0;
            let monthCount = 0;
            let waitingCount = 0;
            const now = new Date();

            const mapped = (data || []).map((q: any) => {
                const config = STATUT_CONFIG[q.status] || { label: q.status.toUpperCase(), color: '#6b7280' };
                const tenantName = q.tenant ? `${q.tenant.first_name || ''} ${q.tenant.last_name || ''}` : 'Inconnu';
                const propertyName = q.property?.name || q.property?.address || 'Bien inconnu';

                const amount = parseFloat(q.amount_paid || 0);
                total += amount;

                const createdAt = new Date(q.created_at);
                if (createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()) {
                    monthCount++;
                }

                if (q.status === 'draft') waitingCount++;

                return {
                    id: String(q.id),
                    statutBadge: config.label,
                    statutBadgeColor: config.color,
                    titre: `Quittance - ${q.paid_month || '—'}`,
                    lieu: `${tenantName.trim()} • ${propertyName}`,
                    periode: q.paid_month || '—',
                    paiementRecu: q.issued_date ? new Date(q.issued_date).toLocaleDateString('fr-FR') : '—',
                    loyer: `${amount.toLocaleString()} FCFA`,
                    charges: 'Inclues',
                    totalPaye: `${amount.toLocaleString()} FCFA`,
                    creeLe: `Créé le ${new Date(q.created_at).toLocaleDateString('fr-FR')}`,
                };
            });

            setQuittanceList(mapped);
            setKpis({
                totalEncaisse: total,
                count: mapped.length,
                cebMonth: monthCount,
                waiting: waitingCount
            });
        } catch (error) {
            console.error('Erreur quittances:', error);
            notify('Erreur lors du chargement des quittances', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = quittanceList.filter(q =>
        q.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'QUITTANCES ÉMISES', value: String(kpis.count), color: '#1a1a1a' },
        { label: 'CE MOIS-CI', value: String(kpis.cebMonth), color: '#83C757' },
        { label: 'BROUILLONS', value: String(kpis.waiting), color: '#f59e0b' },
        { label: 'TOTAL ENCAISSÉ', value: `${kpis.totalEncaisse.toLocaleString()} FCFA`, color: '#83C757' },
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
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
                            <Loader2 className="animate-spin" size={32} color="#83C757" />
                            <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: 600 }}>Chargement des quittances...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map(q => (
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
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '18px', border: '2px dashed #e5e7eb' }}>
                            <div style={{ width: '64px', height: '64px', background: '#f0f9eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <FileText size={32} color="#83C757" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Aucune quittance de loyer</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                Vous n'avez pas encore émis de quittances de loyer.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default QuittancesLoyersPage;
