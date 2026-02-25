import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend);

interface Transaction {
    date: string; type: string; typeColor: string; description: string; bien: string; categorie: string; montant: string; montantColor: string;
}

const transactions: Transaction[] = [
    { date: '06 Fev 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Montée Alba', bien: 'Villeurbanne', categorie: 'Loyer', montant: '+695 €', montantColor: '#83C757' },
    { date: '05 Fev 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Réparation chaudière', bien: 'Villeurbanne', categorie: 'Travaux', montant: '-365 €', montantColor: '#ef4444' },
    { date: '03 Fev 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Thomas Moreau', bien: 'Marseille', categorie: 'Loyer', montant: '+1 250 €', montantColor: '#83C757' },
    { date: '02 Fev 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Assurance PNO 2025', bien: 'Paris 15ème', categorie: 'Assurance', montant: '-420 €', montantColor: '#ef4444' },
    { date: '01 Fev 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Sophie Bernard', bien: 'Paris 15ème', categorie: 'Loyer', montant: '+1 380 €', montantColor: '#83C757' },
    { date: '30 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Jean-Pierre Roussel', bien: 'La Rochelle', categorie: 'Loyer', montant: '+1 060 €', montantColor: '#83C757' },
    { date: '28 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Relève électricité Janvier', bien: 'Villeurbanne', categorie: 'Charges', montant: '-88 €', montantColor: '#ef4444' },
    { date: '25 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Réparation gouttière', bien: 'Marseille', categorie: 'Travaux', montant: '-245 €', montantColor: '#ef4444' },
    { date: '20 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Taxe foncière 2024', bien: 'La Rochelle', categorie: 'Taxes', montant: '-1 280 €', montantColor: '#ef4444' },
    { date: '15 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Assurance GLI 2025', bien: 'Boulogne-Bil.', categorie: 'Assurance', montant: '-280 €', montantColor: '#ef4444' },
    { date: '15 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Diagnostic DPE', bien: 'Boulogne-Bil.', categorie: 'Diagnostics', montant: '-85 €', montantColor: '#ef4444' },
    { date: '05 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Marie Lefevre', bien: 'Lyon 6ème', categorie: 'Loyer', montant: '+1 120 €', montantColor: '#83C757' },
    { date: '03 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Thomas Moreau', bien: 'Marseille', categorie: 'Loyer', montant: '+1 250 €', montantColor: '#83C757' },
    { date: '02 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Montée Alba', bien: 'Villeurbanne', categorie: 'Loyer', montant: '+695 €', montantColor: '#83C757' },
    { date: '01 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Sophie Bernard', bien: 'Paris 15ème', categorie: 'Loyer', montant: '+1 380 €', montantColor: '#83C757' },
];

interface ComptaProps { notify: (msg: string, type: 'success' | 'info' | 'error') => void; }

const ComptabilitePage: React.FC<ComptaProps> = ({ notify }) => {
    const barRef = useRef<HTMLCanvasElement>(null);
    const donutRef = useRef<HTMLCanvasElement>(null);
    const barInst = useRef<ChartJS | null>(null);
    const donutInst = useRef<ChartJS | null>(null);
    const [activeFilter, setActiveFilter] = useState('Toutes les transactions');
    const filters = ['Toutes les transactions', 'Revenus', 'Charges', 'Janvier 2025', 'Février 2025'];

    useEffect(() => {
        if (!barRef.current) return;
        if (barInst.current) barInst.current.destroy();
        barInst.current = new ChartJS(barRef.current, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], datasets: [
                    { label: 'Loyers reçus', data: [4200, 3800, 4500, 4100, 4800, 4600], backgroundColor: '#4CAF50', borderRadius: 3, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.8 },
                    { label: 'Loyers attendus', data: [5000, 5000, 5000, 5000, 5000, 5000], backgroundColor: '#FF9800', borderRadius: 3, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.8 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, border: { display: false } }, y: { beginAtZero: true, max: 6000, grid: { color: '#efefef' }, border: { display: false } } } }
        });
        return () => { if (barInst.current) barInst.current.destroy(); };
    }, []);

    useEffect(() => {
        if (!donutRef.current) return;
        if (donutInst.current) donutInst.current.destroy();
        donutInst.current = new ChartJS(donutRef.current, {
            type: 'doughnut',
            data: { labels: ['Occupés', 'Vacants'], datasets: [{ data: [12, 3], backgroundColor: ['#4CAF50', '#FF9800'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } } as any
        });
        return () => { if (donutInst.current) donutInst.current.destroy(); };
    }, []);

    const summaryRevenu = [
        { label: 'Loyers perçus', value: '45 780 €' },
        { label: 'Charges récupérées', value: '3 240 €' },
        { label: 'Autres revenus', value: '450 €' },
        { label: 'Total revenus', value: '+49 470 €', isTotal: true },
    ];
    const summaryCharge = [
        { label: 'Travaux et réparations', value: '5 960 €' },
        { label: 'Charges non récupérables', value: '2 450 €' },
        { label: 'Assurances', value: '1 080 €' },
        { label: 'Taxe foncière', value: '2 960 €' },
        { label: 'Total charges', value: '12 450 €', isTotal: true },
    ];
    const summaryBien = [
        { label: 'Paris 15ème', value: '+18 840 €' },
        { label: 'La Rochelle', value: '+9 780 €' },
        { label: 'Lyon 6ème', value: '+5 980 €' },
        { label: 'Autres biens (6)', value: '+17 980 €' },
        { label: 'Résultat total', value: '+19 355 €', isTotal: true },
    ];

    return (
        <div className="cp-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
                .cp-page { padding: 1.5rem 1.5rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; max-width: 1400px; margin: 0 auto; box-sizing: border-box; }
                .cp-header { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
                @media (min-width: 768px) { .cp-header { flex-direction: row; align-items: flex-start; justify-content: space-between; } }
                
                .cp-title { font-family: 'Merriweather', serif; font-size: clamp(1.4rem, 4vw, 1.8rem); font-weight: 900; margin: 0 0 8px 0; color: #111; }
                .cp-subtitle { font-size: 0.85rem; font-weight: 500; color: #6b7280; margin: 0; line-height: 1.6; max-width: 600px; }
                .cp-header-btns { display: flex; gap: 0.75rem; width: 100%; }
                @media (min-width: 768px) { .cp-header-btns { width: auto; } }
                
                .cp-btn-export, .cp-btn-add { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 14px; padding: 12px 24px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
                .cp-btn-export { background: #fee2e2; color: #ef4444; }
                .cp-btn-export:hover { background: #fecaca; }
                .cp-btn-add { background: #83C757; color: #fff; box-shadow: 0 4px 12px rgba(131,199,87,0.2); }
                .cp-btn-add:hover { background: #72b44a; transform: translateY(-1px); }

                .cp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
                .cp-stat { background: #fff; border: 1.5px solid #eef2ee; border-radius: 20px; padding: 1.5rem; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .cp-stat:hover { transform: translateY(-2px); border-color: #d6e4d6; }
                .cp-stat-label { font-size: 0.65rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px 0; }
                .cp-stat-value { font-size: 1.4rem; font-weight: 850; margin: 0; }
                .cp-stat-sub { font-size: 0.75rem; font-weight: 600; color: #6b7280; margin: 6px 0 0 0; }

                .cp-charts { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                @media (min-width: 1024px) { .cp-charts { grid-template-columns: 2fr 1fr; } }
                
                .cp-chart-card { background: #fff; border: 1.5px solid #eef2ee; border-radius: 24px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .cp-chart-title { font-family: 'Merriweather', serif; font-size: 1rem; font-weight: 800; margin: 0; color: #1a1a1a; }
                .cp-chart-wrap { height: 260px; width: 100%; position: relative; }
                
                .cp-summaries { display: grid; grid-template-columns: 1fr; gap: 1.25rem; margin-bottom: 2rem; }
                @media (min-width: 768px) { .cp-summaries { grid-template-columns: repeat(3, 1fr); } }
                
                .cp-summary { background: #fff; border: 1.5px solid #eef2ee; border-radius: 20px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .cp-summary-title { font-size: 0.75rem; font-weight: 800; color: #9ca3af; display: flex; align-items: center; gap: 10px; margin: 0 0 1.5rem 0; text-transform: uppercase; letter-spacing: 0.05em; }
                .cp-summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 0.82rem; font-weight: 600; color: #4b5563; }
                .cp-summary-row.total { border-top: 1.5px dashed #f3f4f6; margin-top: 10px; padding-top: 15px; font-weight: 850; color: #111; }

                .cp-filters { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
                .cp-filter-btn { flex-shrink: 0; padding: 10px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .cp-filter-btn.active { background: #83C757; color: #fff; box-shadow: 0 4px 10px rgba(131,199,87,0.2); }
                .cp-filter-btn:not(.active) { background: #f3f4f6; color: #6b7280; }

                .cp-filter-card { background: #fff; border: 1.5px solid #eef2ee; border-radius: 24px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .cp-filter-row { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem; }
                @media (min-width: 640px) { .cp-filter-row { grid-template-columns: repeat(2, 1fr); } }
                
                .cp-table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 20px; border: 1.5px solid #eef2ee; background: #fff; }
                .cp-table { width: 100%; border-collapse: collapse; min-width: 850px; }
                .cp-table th { text-align: left; font-size: 0.65rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; padding: 16px; border-bottom: 1px solid #f9fafb; background: #fafbfc; }
                .cp-table td { padding: 16px; font-size: 0.85rem; border-bottom: 1px solid #f9fafb; color: #4b5563; }
                .cp-table tr:hover { background: #fdfdfd; }
                .cp-type-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .cp-donut-data { display: flex; justify-content: center; gap: 24px; margin-top: 20px; }
                .cp-donut-item { text-align: center; }
                .cp-donut-v { font-size: 1.2rem; font-weight: 850; margin: 0; }
                .cp-donut-l { font-size: 0.7rem; color: #9ca3af; margin: 0; font-weight: 700; }
                
                .cp-search { width: 100%; padding: 12px 16px; borderRadius: 12px; border: 1.5px solid #83C757; color: #83C757; font-weight: 600; outline: none; box-sizing: border-box; }
                .cp-search::placeholder { color: #83C757; opacity: 0.7; }
            `}</style>

            <div className="cp-header">
                <div>
                    <h1 className="cp-title">Comptabilité et travaux</h1>
                    <p className="cp-subtitle">Suivez vos revenus et dépenses locatives en temps réel. Exportez vos données comptables et générez vos déclarations fiscales.</p>
                </div>
                <div className="cp-header-btns">
                    <button className="cp-btn-export" onClick={() => notify('Export à venir', 'info')}><Download size={15} /> Exporter</button>
                    <button className="cp-btn-add" onClick={() => notify('Ajout transaction à venir', 'info')}><Plus size={15} /> Ajouter une transaction</button>
                </div>
            </div>

            <div className="cp-stats">
                <div className="cp-stat" style={{ borderLeftColor: '#83C757' }}><p className="cp-stat-label">RÉSULTAT NET</p><p className="cp-stat-value" style={{ color: '#83C757' }}>+ 33 330 €</p></div>
                <div className="cp-stat" style={{ borderLeftColor: '#3b82f6' }}><p className="cp-stat-label">REVENUS LOCATIFS</p><p className="cp-stat-value">45 780 €</p><p className="cp-stat-sub">6 biens en location</p></div>
                <div className="cp-stat" style={{ borderLeftColor: '#ef4444' }}><p className="cp-stat-label">CHARGES TOTALES</p><p className="cp-stat-value" style={{ color: '#ef4444' }}>12 450 €</p><p className="cp-stat-sub">5 catégories</p></div>
                <div className="cp-stat" style={{ borderLeftColor: '#f59e0b' }}><p className="cp-stat-label">TAUX DE RENTABILITÉ</p><p className="cp-stat-value">5.8%</p><p className="cp-stat-sub">Net annuel</p></div>
            </div>

            <div className="cp-charts">
                <div className="cp-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <p className="cp-chart-title">Loyers</p>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700 }}>Cette année ▼</span>
                    </div>
                    <div className="cp-chart-wrap"><canvas ref={barRef}></canvas></div>
                </div>
                <div className="cp-chart-card">
                    <p className="cp-chart-title" style={{ marginBottom: 16 }}>Taux d'occupation</p>
                    <div className="cp-chart-wrap" style={{ height: 180 }}><canvas ref={donutRef}></canvas></div>
                    <div className="cp-donut-data">
                        <div className="cp-donut-item"><p className="cp-donut-v" style={{ color: '#4CAF50' }}>12</p><p className="cp-donut-l">Occupés</p></div>
                        <div className="cp-donut-item"><p className="cp-donut-v" style={{ color: '#FF9800' }}>3</p><p className="cp-donut-l">Vacants</p></div>
                    </div>
                </div>
            </div>

            <div className="cp-summaries">
                <div className="cp-summary">
                    <p className="cp-summary-title">🟢 Revenus par catégorie</p>
                    {summaryRevenu.map(r => (<div className={`cp-summary-row ${r.isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span style={{ color: r.isTotal ? '#83C757' : 'inherit' }}>{r.value}</span></div>))}
                </div>
                <div className="cp-summary">
                    <p className="cp-summary-title">🔴 Charges par catégorie</p>
                    {summaryCharge.map(r => (<div className={`cp-summary-row ${r.isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span style={{ color: r.isTotal ? '#ef4444' : 'inherit' }}>{r.value}</span></div>))}
                </div>
                <div className="cp-summary">
                    <p className="cp-summary-title">🔵 Répartition par bien</p>
                    {summaryBien.map(r => (<div className={`cp-summary-row ${r.isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span style={{ color: r.isTotal ? '#83C757' : 'inherit' }}>{r.value}</span></div>))}
                </div>
            </div>

            <div className="cp-filters">
                {filters.map(f => (<button key={f} className={`cp-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>))}
            </div>

            <div className="cp-filter-card">
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Filtrer les transactions</p>
                <div className="cp-filter-row">
                    <select className="cp-select" style={{ border: '1.5px solid #eef2ee', borderRadius: 12, padding: '10px 14px' }}><option>Tous les biens</option></select>
                    <select className="cp-select" style={{ border: '1.5px solid #eef2ee', borderRadius: 12, padding: '10px 14px' }}><option>Toutes les catégories</option></select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="cp-search" placeholder="Rechercher une transaction..." />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>142 transactions trouvées</span>
                </div>
            </div>

            <h2 className="cp-title" style={{ fontSize: '1.2rem', marginBottom: 16 }}>Dernières transactions</h2>
            <div className="cp-table-container">
                <table className="cp-table">
                    <thead><tr><th>DATE</th><th>TYPE</th><th>DESCRIPTION</th><th>BIEN</th><th>CATÉGORIE</th><th>MONTANT</th></tr></thead>
                    <tbody>
                        {transactions.map((t, i) => (
                            <tr key={i}>
                                <td>{t.date}</td>
                                <td><span className="cp-type-badge" style={{ background: t.typeColor + '15', color: t.typeColor }}>{t.type}</span></td>
                                <td style={{ fontWeight: 700, color: '#111' }}>{t.description}</td>
                                <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.bien}</td>
                                <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.categorie}</td>
                                <td style={{ fontWeight: 850, color: t.montantColor }}>{t.montant}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComptabilitePage;
