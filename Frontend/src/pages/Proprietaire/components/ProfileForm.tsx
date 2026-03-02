import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/Button';
import styles from './ProfileForm.module.css';

interface FormData {
  civility: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  phone: string;
  company: boolean;
}

interface ProfileFormProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ notify }) => {
  const [formData, setFormData] = useState<FormData>({
    civility: 'Choisir',
    firstname: 'Jean',
    lastname: 'Dupont',
    email: 'jean.dupont@gmail.com',
    mobile: '+33 6 12 34 56 78',
    phone: '+33 6 12 34 56 78',
    company: false
  });

  const [profileCompletion] = useState(50);
  const [showCompanyAlert, setShowCompanyAlert] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = () => {
    notify('Profil mis à jour avec succès !', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert Section */}
      {showCompanyAlert && (
        <div className="flex gap-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 text-sm">Besoin d'un compte limité ?</h4>
            <p className="text-sm text-yellow-700 mt-1">Créez un compte entreprise pour permettre à plusieurs utilisateurs d'accéder à votre patrimoine immobilier.</p>
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.company}
                onChange={handleInputChange}
                name="company"
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-yellow-900 font-medium">Je suis une entreprise</span>
            </label>
          </div>
          <button 
            onClick={() => setShowCompanyAlert(false)}
            className="text-yellow-600 hover:text-yellow-700 flex-shrink-0"
            title="Fermer l'alerte"
            aria-label="Fermer cette alerte"
          >
            ✕
          </button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Bienvenue sur GestiLoc!</h2>
          <p className="text-slate-600 mt-2">
            Merci de vous être inscrit ! Nous sommes heureux de vous avoir à bord ! Dites nous un peu plus sur vous afin de compléter votre profil.
          </p>
        </div>
        
        {/* Profile Completion Indicator */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 min-w-fit">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Profil</p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">Votre profil est prêt à <span className="font-semibold">{profileCompletion}%</span></p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Personal Info */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Informations personnelles</h3>
          
          <div className="space-y-4">
            {/* Civility */}
            <div className="space-y-1.5">
              <label htmlFor="civility" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Civilité*</label>
              <select 
                id="civility"
                name="civility"
                value={formData.civility}
                onChange={handleInputChange}
                title="Sélectionner votre civilité"
                aria-label="Civilité"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                <option>Choisir</option>
                <option value="M">Monsieur</option>
                <option value="Mme">Madame</option>
                <option value="Non-binary">Non-binaire</option>
              </select>
            </div>

            {/* Firstname */}
            <div className="space-y-1.5">
              <label htmlFor="firstname" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prénom*</label>
              <input 
                id="firstname"
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                title="Votre prénom"
                placeholder="Jean"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Lastname */}
            <div className="space-y-1.5">
              <label htmlFor="lastname" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom*</label>
              <input 
                id="lastname"
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                title="Votre nom"
                placeholder="Dupont"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Contact</h3>
          
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail*</label>
              <input 
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                title="Votre adresse e-mail"
                placeholder="jean.dupont@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <label htmlFor="mobile" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile*</label>
              <div className="flex gap-2">
                <select title="Code pays" aria-label="Code pays mobile" className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option>🇫🇷 +33</option>
                  <option>🇧🇪 +32</option>
                  <option>🇨🇭 +41</option>
                </select>
                <input 
                  id="mobile"
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  title="Votre numéro de téléphone mobile"
                  placeholder="6 12 34 56 78"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Téléphone</label>
              <div className="flex gap-2">
                <select title="Code pays" aria-label="Code pays téléphone" className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option>🇫🇷 +33</option>
                  <option>🇧🇪 +32</option>
                  <option>🇨🇭 +41</option>
                </select>
                <input 
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  title="Votre numéro de téléphone fixe"
                  placeholder="6 12 34 56 78"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Section - Conditional */}
      {formData.company && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">Société</h3>
          
          <div className="bg-red-50 flex items-center gap-3 p-4 rounded-xl border border-red-200">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">
              <span className="font-semibold">Je ne suis pas une société.</span> Convertir mon compte personnel en compte entreprise supprimera mes données personnelles.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-slate-200">
        <Button 
          variant="ghost"
          className="flex-1"
        >
          Annuler
        </Button>
        <Button 
          variant="default"
          onClick={handleSave}
          icon={<Check size={16} />}
          className="flex-1"
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
};
