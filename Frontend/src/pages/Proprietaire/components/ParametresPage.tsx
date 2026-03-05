import React, { useState } from 'react';

interface ParametresPageProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ParametresPage: React.FC<ParametresPageProps> = ({ notify }) => {
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifRappel, setNotifRappel] = useState(true);
    const [notifEcheance, setNotifEcheance] = useState(true);
    const [notifTravaux, setNotifTravaux] = useState(true);
    const [notifMensuelle, setNotifMensuelle] = useState(false);
    const [sauvAuto, setSauvAuto] = useState(true);
    const [modeClassique, setModeClassique] = useState(false);

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
        <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#83C757' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
        </div>
    );

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .sp-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .sp-section { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1.5rem; margin-bottom: 1.25rem; }
        .sp-section-title { font-family: 'Merriweather', serif; font-size: 1rem; font-weight: 800; margin: 0 0 4px 0; }
        .sp-section-sub { font-size: 0.78rem; color: #9ca3af; margin: 0 0 18px 0; }
        .sp-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .sp-row:last-child { border-bottom: none; }
        .sp-row-left { flex: 1; }
        .sp-row-label { font-size: 0.82rem; font-weight: 700; margin: 0 0 2px 0; }
        .sp-row-desc { font-size: 0.72rem; color: #9ca3af; margin: 0; }
        .sp-row-action { font-size: 0.78rem; font-weight: 700; color: #83C757; cursor: pointer; background: none; border: none; font-family: 'Manrope', sans-serif; }
        .sp-row-action.red { color: #ef4444; }
        .sp-plan { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #83C757; border-radius: 14px; padding: 1.5rem; margin-bottom: 18px; }
        .sp-plan-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; background: #83C757; color: #fff; font-size: 0.68rem; font-weight: 800; margin-bottom: 8px; }
        .sp-plan-price { font-size: 1.4rem; font-weight: 900; margin: 0 0 4px 0; }
        .sp-plan-period { font-size: 0.72rem; color: #6b7280; margin: 0 0 12px 0; }
        .sp-plan-features { list-style: none; padding: 0; margin: 0 0 14px 0; }
        .sp-plan-features li { font-size: 0.78rem; padding: 3px 0; color: #374151; }
        .sp-plan-features li::before { content: '✓ '; color: #83C757; font-weight: 700; }
        .sp-plan-btn { background: #83C757; color: #fff; border: none; border-radius: 10px; padding: 8px 22px; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .sp-select { padding: 0.5rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: transparent; outline: none; min-width: 160px; }
        .sp-info-banner { background: #f0fdf4; border: 1.5px solid #83C757; border-radius: 10px; padding: 10px 16px; font-size: 0.78rem; color: #166534; margin-top: 10px; }
        .sp-danger { background: #fff; border: 1.5px solid #fecaca; border-radius: 14px; padding: 1.5rem; margin-bottom: 1.25rem; }
        .sp-danger-title { font-family: 'Merriweather', serif; font-size: 1rem; font-weight: 800; color: #ef4444; margin: 0 0 4px 0; }
        .sp-danger-sub { font-size: 0.72rem; color: #9ca3af; margin: 0 0 18px 0; }
        .sp-btn-outline-danger { background: #fff; border: 1.5px solid #ef4444; color: #ef4444; border-radius: 10px; padding: 8px 18px; font-family: 'Manrope', sans-serif; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
        .sp-btn-danger { background: #ef4444; border: none; color: #fff; border-radius: 10px; padding: 8px 18px; font-family: 'Manrope', sans-serif; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
      `}</style>
            <div className="sp-page">
                {/* Notifications */}
                <div className="sp-section">
                    <p className="sp-section-title">Préférences de notifications</p>
                    <p className="sp-section-sub">Choisissez comment vous souhaitez être notifié</p>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Notifications par email</p><p className="sp-row-desc">Recevez les notifications importantes par email</p></div><Toggle checked={notifEmail} onChange={setNotifEmail} /></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Rappels de paiements</p><p className="sp-row-desc">Alertes pour les loyers à recevoir</p></div><Toggle checked={notifRappel} onChange={setNotifRappel} /></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Échéance de bail</p><p className="sp-row-desc">Notifications avant les renouvellements de baux</p></div><Toggle checked={notifEcheance} onChange={setNotifEcheance} /></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Travaux et réparations</p><p className="sp-row-desc">Alertes pour les interventions</p></div><Toggle checked={notifTravaux} onChange={setNotifTravaux} /></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Newsletter mensuelle</p><p className="sp-row-desc">Conseils et actualités de la gestion locative</p></div><Toggle checked={notifMensuelle} onChange={setNotifMensuelle} /></div>
                </div>

                {/* Abonnement */}
                <div className="sp-section">
                    <p className="sp-section-title">Abonnement</p>
                    <p className="sp-section-sub">Votre plan actuel et vos options de facturation</p>
                    <div className="sp-plan">
                        <span className="sp-plan-badge">Plan Premium</span>
                        <p className="sp-plan-price">29,99 €</p>
                        <p className="sp-plan-period">par mois • Renouvelé le 15 mars 2025</p>
                        <ul className="sp-plan-features">
                            <li>Biens illimités</li>
                            <li>Stockage illimité</li>
                            <li>Génération automatique des documents</li>
                            <li>Export prioritaire</li>
                            <li>Rapports comptables avancés</li>
                        </ul>
                        <button className="sp-plan-btn">Gérer l'abonnement</button>
                    </div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Moyen de paiement</p><p className="sp-row-desc">Carte Bancaire **** 4242</p></div><button className="sp-row-action">Modifier</button></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Historique de facturation</p><p className="sp-row-desc">Télécharger les factures</p></div><button className="sp-row-action">Voir l'historique</button></div>
                </div>

                {/* Apparence */}
                <div className="sp-section">
                    <p className="sp-section-title">Apparence</p>
                    <p className="sp-section-sub">Personnalisez l'interface de l'application</p>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Thème</p><p className="sp-row-desc">Choisir le thème de l'application</p></div><select className="sp-select"><option>Clair</option><option>Sombre</option></select></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Langue</p><p className="sp-row-desc">Langue de l'interface</p></div><select className="sp-select"><option>Français</option><option>English</option></select></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Format horaire</p><p className="sp-row-desc">Format d'affichage des dates et heures</p></div><select className="sp-select"><option>International (2027-1)</option></select></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Format de date</p><p className="sp-row-desc">Comment afficher les dates</p></div><select className="sp-select"><option>JJ/MM/AAAA</option></select></div>
                </div>

                {/* Sécurité */}
                <div className="sp-section">
                    <p className="sp-section-title">Sécurité</p>
                    <p className="sp-section-sub">Protégez votre compte et vos données</p>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Mot de passe</p><p className="sp-row-desc">Dernière modification il y a 3 mois</p></div><button className="sp-row-action">Changer le mot de passe</button></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Authentification à deux facteurs</p><p className="sp-row-desc">Sécurisez davantage votre compte</p></div><Toggle checked={false} onChange={() => notify('2FA à venir', 'info')} /></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Sessions actives</p><p className="sp-row-desc">Gérer les appareils connectés</p></div><button className="sp-row-action">Voir les sessions</button></div>
                    <div className="sp-info-banner">ℹ️ Nous recommandons d'activer l'authentification à deux facteurs pour une sécurité optimale de vos informations.</div>
                </div>

                {/* Paramètres avancés */}
                <div className="sp-section">
                    <p className="sp-section-title">Paramètres avancés</p>
                    <p className="sp-section-sub">Options de configuration avancées</p>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Exporter les données</p><p className="sp-row-desc">Téléchargez vos données au format JSON</p></div><button className="sp-row-action">Exporter</button></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Sauvegarde automatique</p><p className="sp-row-desc">Sauvegarder automatiquement mes données</p></div><Toggle checked={sauvAuto} onChange={setSauvAuto} /></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Mode classique</p><p className="sp-row-desc">Activer les fonctionnalités en développement</p></div><Toggle checked={modeClassique} onChange={setModeClassique} /></div>
                </div>

                {/* Zone de danger */}
                <div className="sp-danger">
                    <p className="sp-danger-title">Zone de danger</p>
                    <p className="sp-danger-sub">Ces actions sont irréversibles. Assurez-vous de bien comprendre les conséquences avant de les exécuter.</p>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Désactiver le compte</p><p className="sp-row-desc">Désactiver temporairement votre compte</p></div><button className="sp-btn-outline-danger" onClick={() => notify('Désactivation à venir', 'info')}>Désactiver</button></div>
                    <div className="sp-row"><div className="sp-row-left"><p className="sp-row-label">Supprimer le compte</p><p className="sp-row-desc">Supprimer définitivement votre compte et toutes vos données</p></div><button className="sp-btn-danger" onClick={() => notify('Suppression à venir', 'info')}>Supprimer le compte</button></div>
                </div>
            </div>
        </>
    );
};

export default ParametresPage;
