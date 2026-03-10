import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, Loader2, FileText } from 'lucide-react';
import { invoiceService } from '@/services/api';

interface AvisData {
    id: string;
    statutBadge: string;
    statutBadgeColor: string;
    titre: string;
    lieu: string;
    periode: string;
    echeance: string;
    montantLoyer: string;
    charges: string;
    envoyeLe: string;
}

// Les données seront chargées depuis l'API
const STATUT_CONFIG: Record<string, { label: string, color: string }> = {
    'paid': { label: '✓ PAYÉ', color: '#83C757' },
    'pending': { label: '⏳ EN ATTENTE', color: '#6b7280' },
    'overdue': { label: '🚨 EN RETARD', color: '#ef4444' },
    'partially_paid': { label: '📂 PARTIELLEMENT PAYÉ', color: '#f59e0b' },
};

interface AvisEcheanceProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const AvisEcheance: React.FC<AvisEcheanceProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [avisList, setAvisList] = useState<AvisData[]>([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ total: 0, waiting: 0, overdue: 0, count: 0 });

    const filters = ['Tous', 'En attente', 'Payés', 'En retard'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await invoiceService.listInvoices();
            const filteredInvoices = (data || []).filter((inv: any) => inv.type === 'rent');

            let totalAmount = 0;
            let waitingAmount = 0;
            let overdueAmount = 0;

            const mapped = filteredInvoices.map((inv: any) => {
                const config = STATUT_CONFIG[inv.status] || { label: inv.status.toUpperCase(), color: '#6b7280' };
                const tenantName = inv.lease?.tenant ? `${inv.lease.tenant.first_name || ''} ${inv.lease.tenant.last_name || ''}` : 'Inconnu';
                const propertyName = inv.lease?.property?.name || inv.lease?.property?.address || 'Bien inconnu';

                const amount = parseFloat(inv.amount_total || 0);
                totalAmount += amount;
                if (inv.status === 'pending') waitingAmount += amount;
                if (inv.status === 'overdue') overdueAmount += amount;

                return {
                    id: String(inv.id),
                    statutBadge: config.label,
                    statutBadgeColor: config.color,
                    titre: `Avis - ${tenantName.trim()}`,
                    lieu: propertyName,
                    periode: inv.period_start ? new Date(inv.period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—',
                    echeance: new Date(inv.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                    montantLoyer: `${amount.toLocaleString()} FCFA`,
                    charges: 'Inclues',
                    envoyeLe: `Créé le ${new Date(inv.created_at).toLocaleDateString('fr-FR')}`,
                };
            });

            setAvisList(mapped);
            setKpis({
                total: totalAmount,
                waiting: waitingAmount,
                overdue: overdueAmount,
                count: mapped.length
            });
        } catch (error) {
            console.error('Erreur avis:', error);
            notify('Erreur lors du chargement des avis', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = avisList.filter(a =>
        a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'TOTAL À RECEVOIR', value: `${kpis.total.toLocaleString()} FCFA`, color: '#83C757' },
        { label: 'EN ATTENTE', value: `${kpis.waiting.toLocaleString()} FCFA`, color: '#f59e0b' },
        { label: 'EN RETARD', value: `${kpis.overdue.toLocaleString()} FCFA`, color: '#ef4444' },
        { label: 'TOTAL AVIS', value: `${kpis.count} avis`, color: '#1a1a1a' },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .ae-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .ae-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .ae-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .ae-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; }
        .ae-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ae-add-btn:hover { background: #72b44a; }
        .ae-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .ae-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .ae-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .ae-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .ae-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; }
        .ae-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .ae-filter-btn.active { background: #83C757; color: #fff; }
        .ae-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .ae-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .ae-filter-title { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .ae-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .ae-search-row { display: flex; gap: 12px; align-items: stretch; }
        .ae-search-wrap { flex: 1; position: relative; }
        .ae-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .ae-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .ae-search-input::placeholder { color: #83C757; font-weight: 600; }
        .ae-btn-display { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #d1d5db; background: #fff; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; cursor: pointer; }
        .ae-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ae-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .ae-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .ae-status-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .ae-item-titre { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .ae-item-lieu { font-size: 0.75rem; color: #ef4444; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .ae-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .ae-detail-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .ae-detail-value { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .ae-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .ae-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .ae-footer-actions { display: flex; gap: 6px; }
        .ae-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; color: #9ca3af; }
        .ae-icon-btn.green { color: #83C757; }
        .ae-icon-btn.orange { color: #f59e0b; }
        @media (max-width: 1400px) { .ae-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .ae-grid { grid-template-columns: repeat(2, 1fr); } .ae-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .ae-grid { grid-template-columns: 1fr; }
          .ae-stats { grid-template-columns: repeat(2, 1fr); }
          .ae-header { flex-direction: column; gap: 12px; }
          .ae-add-btn { width: 100%; justify-content: center; }
          .ae-search-row { flex-direction: column; }
          .ae-btn-display { width: 100%; height: 44px; justify-content: center; }
          .ae-card { padding: 1rem; }
          .ae-filters { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
          .ae-filter-btn { flex-shrink: 0; }
        }
        @media (max-width: 480px) {
          .ae-page { padding: 1rem 0.5rem 2rem; }
          .ae-title { font-size: 1.2rem; }
          .ae-stats { grid-template-columns: 1fr; }
          .ae-filter-btn { padding: 6px 14px; font-size: 0.75rem; }
        }
      `}</style>

            <div className="ae-page">
                <div className="ae-header">
                    <div>
                        <h1 className="ae-title">Avis d'échéance</h1>
                        <p className="ae-subtitle">Créez vos avis d'échéance de loyer et suivez les paiements attendus. Générez automatiquement les avis pour vos locataires.</p>
                    </div>
                    <button className="ae-add-btn" onClick={() => notify('Création avis à venir', 'info')}>
                        <Plus size={15} /> Créer un nouvel avis d'échéance
                    </button>
                </div>

                <div className="ae-stats">
                    {stats.map(s => (
                        <div className="ae-stat" key={s.label}>
                            <p className="ae-stat-label">{s.label}</p>
                            <p className="ae-stat-value" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="ae-filters">
                    {filters.map(f => (
                        <button key={f} className={`ae-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
                    ))}
                </div>

                <div className="ae-card">
                    <p className="ae-filter-title">FILTRER PAR BIEN</p>
                    <select className="ae-select"><option>Tous les biens</option></select>
                </div>

                <div className="ae-card">
                    <div className="ae-search-row">
                        <div className="ae-search-wrap">
                            <Search size={16} className="ae-search-icon" />
                            <input className="ae-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button className="ae-btn-display"><Settings size={15} /> Affichage</button>
                    </div>
                </div>

                <div className="ae-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
                            <Loader2 className="animate-spin" size={32} color="#83C757" />
                            <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: 600 }}>Chargement des avis...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map(a => (
                            <div className="ae-item" key={a.id}>
                                <div className="ae-item-top">
                                    <span className="ae-status-badge" style={{ background: a.statutBadgeColor + '20', color: a.statutBadgeColor }}>{a.statutBadge}</span>
                                    <p className="ae-item-titre">{a.titre}</p>
                                    <p className="ae-item-lieu">📍 {a.lieu}</p>
                                    <div className="ae-detail-row">
                                        <div><p className="ae-detail-label">Période</p><p className="ae-detail-value">{a.periode}</p></div>
                                        <div><p className="ae-detail-label">Échéance</p><p className="ae-detail-value">{a.echeance}</p></div>
                                    </div>
                                    <div className="ae-detail-row">
                                        <div><p className="ae-detail-label">Montant loyer</p><p className="ae-detail-value" style={{ color: '#83C757' }}>{a.montantLoyer}</p></div>
                                        <div><p className="ae-detail-label">Charges</p><p className="ae-detail-value">{a.charges}</p></div>
                                    </div>
                                </div>
                                <div className="ae-footer">
                                    <span className="ae-footer-date">{a.envoyeLe}</span>
                                    <div className="ae-footer-actions">
                                        <button className="ae-icon-btn">👁️</button>
                                        <button className="ae-icon-btn orange">✏️</button>
                                        <button className="ae-icon-btn green">📥</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '18px', border: '2px dashed #e5e7eb' }}>
                            <div style={{ width: '64px', height: '64px', background: '#f0f9eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <FileText size={32} color="#83C757" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Aucun avis d'échéance</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Vous n'avez pas encore d'avis d'échéance générés.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AvisEcheance;
