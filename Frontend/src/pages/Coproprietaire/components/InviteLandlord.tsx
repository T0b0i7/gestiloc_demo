import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Building,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  ChevronRight
} from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';

interface InviteLandlordProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

interface InviteForm {
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  is_professional: boolean;
  license_number?: string;
  address_billing?: string;
  ifu?: string;
  rccm?: string;
  vat_number?: string;
}

export const InviteLandlord: React.FC<InviteLandlordProps> = ({ notify }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<InviteForm>({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    is_professional: false,
    license_number: '',
    address_billing: '',
    ifu: '',
    rccm: '',
    vat_number: ''
  });

  const handleInputChange = (field: keyof InviteForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.email && formData.first_name && formData.last_name;
      case 2:
        if (formData.is_professional) {
          return formData.company_name && formData.ifu && formData.rccm;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
      notify('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/landlords/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        notify('Invitation envoyée avec succès!', 'success');
        // Reset form
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          company_name: '',
          phone: '',
          is_professional: false,
          license_number: '',
          address_billing: '',
          ifu: '',
          rccm: '',
          vat_number: ''
        });
        setStep(1);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi de l\'invitation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      notify(error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      notify('Veuillez remplir tous les champs obligatoires', 'error');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* En-tête */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-24 h-24 bg-green-50 rounded-[2.5rem] mx-auto mb-8 shadow-xl shadow-green-900/5 border border-green-100/50">
          <UserPlus className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-merriweather tracking-tight">
          Inviter un propriétaire
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto font-medium font-manrope text-lg leading-relaxed">
          Étendez votre réseau de gestion en invitant de nouveaux propriétaires à déléguer leurs biens sur votre plateforme.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4 py-8">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-lg font-black transition-all duration-500 shadow-xl ${step >= stepNumber
                ? 'bg-green-600 text-white shadow-green-600/30 scale-110'
                : 'bg-white border-2 border-gray-100 text-gray-300'
                }`}>
                {stepNumber}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest font-manrope ${step >= stepNumber ? 'text-green-600' : 'text-gray-300'}`}>
                {stepNumber === 1 ? 'Identité' : stepNumber === 2 ? 'Profil' : 'Validation'}
              </span>
            </div>
            {stepNumber < 3 && (
              <div className="w-16 h-1 mt-[-20px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-700"
                  style={{ width: step > stepNumber ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-10 md:p-14 rounded-[3.5rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -mr-32 -mt-32 -z-1" />

        <form onSubmit={handleSubmit} className="space-y-10 relative">
          {/* Étape 1: Informations de base */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-50 pb-6">
                <h2 className="text-2xl font-black text-gray-900 font-merriweather flex items-center gap-3">
                  <User className="w-6 h-6 text-green-600" />
                  Informations personnelles
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                    placeholder="Ex: Jean"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Nom de famille</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                    placeholder="Ex: Dupont"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Adresse Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                      placeholder="jean.dupont@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Numéro de téléphone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                      placeholder="+229 00 00 00 00"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-4 group cursor-pointer bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.is_professional ? 'bg-green-600 border-green-600 shadow-lg shadow-green-600/20' : 'bg-white border-gray-200'}`}>
                    {formData.is_professional && <CheckCircle className="w-5 h-5 text-white" />}
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.is_professional}
                      onChange={(e) => handleInputChange('is_professional', e.target.checked)}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-900 font-manrope">Propriétaire professionnel</p>
                    <p className="text-[10px] font-bold text-gray-400 font-manrope uppercase tracking-wider">Cochez si vous invitez une agence ou une société immobilière</p>
                  </div>
                  <Building className={`w-6 h-6 transition-colors ${formData.is_professional ? 'text-green-600' : 'text-gray-300'}`} />
                </label>
              </div>
            </div>
          )}

          {/* Étape 2: Informations professionnelles */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-50 pb-6">
                <h2 className="text-2xl font-black text-gray-900 font-merriweather flex items-center gap-3">
                  <Building className="w-6 h-6 text-green-600" />
                  Profil {formData.is_professional ? 'Professionnel' : 'Particulier'}
                </h2>
              </div>

              {formData.is_professional ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 lg:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Nom de l'entreprise</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                      placeholder="Ex: GestiLoc Agence"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Identifiant Fiscal (IFU)</label>
                    <input
                      type="text"
                      value={formData.ifu}
                      onChange={(e) => handleInputChange('ifu', e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                      placeholder="1234567890123"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Registre du Commerce (RCCM)</label>
                    <input
                      type="text"
                      value={formData.rccm}
                      onChange={(e) => handleInputChange('rccm', e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                      placeholder="BJ-COT-2023-B-001"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Numéro de TVA</label>
                    <input
                      type="text"
                      value={formData.vat_number}
                      onChange={(e) => handleInputChange('vat_number', e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                      placeholder="BJ123456789"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope ml-2">Numéro de Licence</label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 shadow-sm appearance-none"
                      placeholder="LIC-2023-0001"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                    <UserPlus className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 font-merriweather mb-2">Particulier</h3>
                  <p className="text-gray-400 font-manrope font-medium px-8">
                    Le propriétaire est un particulier. Aucune information fiscale ou commerciale supplémentaire n'est requise à cette étape.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-50 pb-6">
                <h2 className="text-2xl font-black text-gray-900 font-merriweather flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Récapitulatif de l'invitation
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-white shadow-inner space-y-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Intervenant</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-green-600/20">
                      {formData.first_name?.[0]}{formData.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900 font-manrope">{formData.first_name} {formData.last_name}</p>
                      <p className="text-sm font-medium text-gray-500 font-manrope">{formData.email}</p>
                    </div>
                  </div>
                  {formData.phone && (
                    <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-gray-900 font-manrope">{formData.phone}</span>
                    </div>
                  )}
                </div>

                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-white shadow-inner space-y-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-manrope">Détails Profil</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 font-manrope">Type :</span>
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-700 font-manrope shadow-sm">
                        {formData.is_professional ? 'Professionnel' : 'Particulier'}
                      </span>
                    </div>
                    {formData.is_professional && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500 font-manrope">Entreprise :</span>
                          <span className="text-sm font-black text-gray-900 font-manrope truncate max-w-[150px]">{formData.company_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500 font-manrope">IFU :</span>
                          <span className="text-sm font-black text-gray-900 font-manrope">{formData.ifu}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-green-50/50 border border-green-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-green-800 font-manrope">Notification Automatique</p>
                  <p className="text-xs font-medium text-green-600 font-manrope leading-relaxed mt-1">
                    Un lien d'invitation sécurisé sera envoyé à l'adresse <b>{formData.email}</b>. Ce lien permettra au propriétaire de configurer son mot de passe et d'activer son espace dédié.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-gray-50">
            <div className="w-full sm:w-auto">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl border-gray-100 text-gray-500 font-black font-manrope hover:bg-gray-50 transition-all"
                >
                  Précédent
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep()}
                  className="w-full sm:w-auto px-12 py-6 bg-green-600 hover:bg-green-700 text-white rounded-[1.5rem] font-black font-manrope shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Continuer
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-6 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] font-black font-manrope shadow-xl shadow-gray-900/20 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyse et Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Envoyer l'invitation</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
