import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Users, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Tab } from '../types';

interface SettingsProps {
  onNavigate?: (tab: Tab) => void;
  notify?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface ProfileData {
  civility: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  phone: string;
  company: string;
  isCompany: boolean;
  address1: string;
  address2: string;
  city: string;
  zipCode: string;
  country: string;
}

const countries = [
  'France', 'Belgique', 'Suisse', 'Luxembourg', 'Allemagne', 'Espagne', 'Italie',
  'Pays-Bas', 'Autriche', 'Portugal', 'Pologne', 'Tchéquie', 'Hongrie', 'Roumanie',
  'Grèce', 'Croatie', 'Slovénie', 'Slovaquie', 'Irlande', 'Royaume-Uni', 'Danemark',
  'Suède', 'Norvège', 'Finlande', 'Islande', 'Canada', 'États-Unis', 'Mexique'
];

export const Settings: React.FC<SettingsProps> = ({ onNavigate, notify }) => {
  const [formData, setFormData] = useState<ProfileData>({
    civility: 'M.',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    mobile: '06 12 34 56 78',
    phone: '01 23 45 67 89',
    company: 'Dupont Immobilier',
    isCompany: false,
    address1: '123 Rue de la Paix',
    address2: '',
    city: 'Paris',
    zipCode: '75001',
    country: 'France'
  });

  const [isSaving, setIsSaving] = useState(false);

  const calculateProgress = () => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.mobile,
      formData.address1,
      formData.city,
      formData.zipCode,
      formData.country
    ];
    const filledFields = fields.filter(f => f && f.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const progress = calculateProgress();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    if (notify) {
      notify('Profil mis à jour avec succès', 'success');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <div className="flex items-center gap-6">
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
              <User className="w-10 h-10" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Bureau</h1>
            <p className="text-slate-600 mt-1">Merci de vous être inscrit ! Nous sommes heureux de vous avoir à bord ! Dites-nous un peu plus sur vous afin de compléter votre profil.</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Complétude du profil</h3>
          <span className="text-lg font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 mt-3">Votre profil est prêt à <span className="font-semibold text-slate-900">{progress}%</span></p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations Personnelles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Civility */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Civilité <span className="text-red-500">*</span>
              </label>
              <select
                name="civility"
                value={formData.civility}
                onChange={handleInputChange}
                title="Sélectionner votre civilité"
                aria-label="Civilité"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="M.">M.</option>
                <option value="Mme">Mme</option>
                <option value="Mlle">Mlle</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Votre prénom"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Votre nom"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre.email@example.com"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Mobile <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select 
                  title="Indicatif téléphonique"
                  aria-label="Indicatif téléphonique"
                  className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option>🇫🇷 +33</option>
                </select>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="06 12 34 56 78"
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Téléphone
              </label>
              <div className="flex gap-2">
                <select 
                  title="Indicatif téléphonique"
                  aria-label="Indicatif téléphonique"
                  className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option>🇫🇷 +33</option>
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="01 23 45 67 89"
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            Société
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isCompany"
                name="isCompany"
                checked={formData.isCompany}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-slate-300"
              />
              <label htmlFor="isCompany" className="text-sm font-medium text-slate-900">
                JE NE SUIS PAS UNE SOCIÉTÉ
              </label>
            </div>

            {!formData.isCompany && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Nom de la société (optionnel)"
                  title="Nom de la société"
                  aria-label="Nom de la société"
                  className="w-full px-4 py-2.5 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Adresse
          </h2>

          <div className="space-y-4">
            {/* Address 1 */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                placeholder="123 Rue de la Paix"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Adresse 2 (optionnel)
              </label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                placeholder="Appartement, suite, etc."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City, Zip, Country */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Paris"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Code Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="75001"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Pays <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  title="Sélectionner votre pays"
                  aria-label="Pays"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Required Fields Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-900">
            Les champs marqués d'un astérisque (<span className="text-red-500">*</span>) sont obligatoires.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 justify-center">
          <Button 
            variant="secondary" 
            onClick={() => onNavigate?.('dashboard' as Tab)}
          >
            Annuler
          </Button>
          <Button 
            variant="primary"
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Enregistrer le profil
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
