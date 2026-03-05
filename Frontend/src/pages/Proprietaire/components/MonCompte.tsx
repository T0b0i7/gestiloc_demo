import React, { useState } from 'react';

interface MonCompteProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const MonCompte: React.FC<MonCompteProps> = ({ notify }) => {
    const [nom, setNom] = useState('Stéphane Dubois');
    const [email, setEmail] = useState('stephane.dubois@email.com');
    const [tel, setTel] = useState('+33 6 12 34 56 78');
    const [adresse, setAdresse] = useState('12 Rue de la Paix, 75002 Paris');

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .mc-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .mc-card { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1.5rem 2rem; }
        .mc-title { font-family: 'Merriweather', serif; font-size: 1.15rem; font-weight: 800; margin: 0 0 4px 0; }
        .mc-subtitle { font-size: 0.78rem; color: #9ca3af; margin: 0 0 24px 0; }
        .mc-photo-row { display: flex; align-items: center; gap: 16px; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6; margin-bottom: 20px; }
        .mc-avatar { width: 56px; height: 56px; border-radius: 50%; background: #83C757; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.4rem; font-weight: 800; flex-shrink: 0; }
        .mc-photo-info { flex: 1; }
        .mc-photo-label { font-size: 0.85rem; font-weight: 700; margin: 0 0 2px 0; }
        .mc-photo-desc { font-size: 0.72rem; color: #9ca3af; margin: 0; }
        .mc-photo-btns { display: flex; gap: 8px; }
        .mc-btn-outline { background: #fff; border: 1.5px solid #d1d5db; border-radius: 10px; padding: 7px 18px; font-family: 'Manrope', sans-serif; font-size: 0.78rem; font-weight: 700; color: #374151; cursor: pointer; }
        .mc-btn-red { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 7px 18px; font-family: 'Manrope', sans-serif; font-size: 0.78rem; font-weight: 700; color: #ef4444; cursor: pointer; }
        .mc-field { padding: 18px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
        .mc-field:last-of-type { border-bottom: none; }
        .mc-field-left { flex: 1; }
        .mc-field-label { font-size: 0.85rem; font-weight: 700; margin: 0 0 2px 0; }
        .mc-field-desc { font-size: 0.72rem; color: #9ca3af; margin: 0; }
        .mc-input { padding: 0.55rem 1rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #1a1a1a; outline: none; min-width: 260px; background: #fff; box-sizing: border-box; }
        .mc-input:focus { border-color: #83C757; }
        .mc-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f3f4f6; }
        .mc-btn-cancel { background: #fff; border: 1.5px solid #d1d5db; border-radius: 10px; padding: 10px 28px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; color: #374151; cursor: pointer; }
        .mc-btn-save { background: #83C757; border: none; border-radius: 10px; padding: 10px 28px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; color: #fff; cursor: pointer; }
        .mc-btn-save:hover { background: #72b44a; }
        @media (max-width: 640px) {
          .mc-photo-row { flex-direction: column; text-align: center; }
          .mc-photo-btns { justify-content: center; }
          .mc-field { flex-direction: column; align-items: flex-start; gap: 8px; }
          .mc-input { min-width: 100%; width: 100%; }
          .mc-actions { flex-direction: column; }
          .mc-btn-cancel, .mc-btn-save { width: 100%; text-align: center; }
          .mc-card { padding: 1rem; }
        }
        @media (max-width: 480px) {
          .mc-page { padding: 1rem 0.5rem 2rem; }
        }
      `}</style>
            <div className="mc-page">
                <div className="mc-card">
                    <p className="mc-title">Informations personnelles</p>
                    <p className="mc-subtitle">Gérez vos informations de profil et vos coordonnées</p>

                    <div className="mc-photo-row">
                        <div className="mc-avatar">S</div>
                        <div className="mc-photo-info">
                            <p className="mc-photo-label">Photo de profil</p>
                            <p className="mc-photo-desc">Format JPG, PNG ou GIF (max 2MB)</p>
                        </div>
                        <div className="mc-photo-btns">
                            <button className="mc-btn-outline" onClick={() => notify('Changement photo à venir', 'info')}>Changer</button>
                            <button className="mc-btn-red" onClick={() => notify('Suppression photo à venir', 'info')}>Supprimer</button>
                        </div>
                    </div>

                    <div className="mc-field">
                        <div className="mc-field-left"><p className="mc-field-label">Nom complet</p><p className="mc-field-desc">Votre nom tel qu'il apparaît sur vos documents</p></div>
                        <input className="mc-input" value={nom} onChange={e => setNom(e.target.value)} />
                    </div>
                    <div className="mc-field">
                        <div className="mc-field-left"><p className="mc-field-label">Adresse email</p><p className="mc-field-desc">Utilisée pour la connexion et les notifications</p></div>
                        <input className="mc-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="mc-field">
                        <div className="mc-field-left"><p className="mc-field-label">Téléphone</p><p className="mc-field-desc">Pour les notifications importantes</p></div>
                        <input className="mc-input" type="tel" value={tel} onChange={e => setTel(e.target.value)} />
                    </div>
                    <div className="mc-field">
                        <div className="mc-field-left"><p className="mc-field-label">Adresse</p><p className="mc-field-desc">Votre adresse principale</p></div>
                        <input className="mc-input" value={adresse} onChange={e => setAdresse(e.target.value)} />
                    </div>

                    <div className="mc-actions">
                        <button className="mc-btn-cancel">Annuler</button>
                        <button className="mc-btn-save" onClick={() => notify('Modifications enregistrées', 'success')}>Enregistrer les modifications</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MonCompte;
