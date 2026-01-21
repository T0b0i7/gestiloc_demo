import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Building,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inviter un propriétaire
        </h1>
        <p className="text-gray-600">
          Invitez un propriétaire à rejoindre votre réseau et gérez des biens ensemble
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1: Informations de base */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Informations de base
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="jean.dupont@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+229 00 00 00 00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_professional}
                    onChange={(e) => handleInputChange('is_professional', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Propriétaire professionnel (entreprise/agence)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Étape 2: Informations professionnelles */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {formData.is_professional ? 'Informations professionnelles' : 'Informations complémentaires'}
                </h2>
                
                {formData.is_professional ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'entreprise *
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Immobilier Pro"
                        required={formData.is_professional}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de licence
                      </label>
                      <input
                        type="text"
                        value={formData.license_number}
                        onChange={(e) => handleInputChange('license_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="LIC-001234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFU *
                      </label>
                      <input
                        type="text"
                        value={formData.ifu}
                        onChange={(e) => handleInputChange('ifu', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234567890123"
                        required={formData.is_professional}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RCCM *
                      </label>
                      <input
                        type="text"
                        value={formData.rccm}
                        onChange={(e) => handleInputChange('rccm', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="BJ-1234-5678-BJ-2023"
                        required={formData.is_professional}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro TVA
                      </label>
                      <input
                        type="text"
                        value={formData.vat_number}
                        onChange={(e) => handleInputChange('vat_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="BJ123456789"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Le propriétaire est un particulier. Aucune information supplémentaire requise.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Confirmation de l'invitation
                </h2>
                
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Invitation à envoyer:</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nom complet:</span>
                      <p className="font-medium">
                        {formData.first_name} {formData.last_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    {formData.phone && (
                      <div>
                        <span className="text-gray-600">Téléphone:</span>
                        <p className="font-medium">{formData.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium">
                        {formData.is_professional ? 'Professionnel' : 'Particulier'}
                      </p>
                    </div>
                  </div>

                  {formData.is_professional && formData.company_name && (
                    <div className="border-t pt-4">
                      <p className="font-medium mb-2">Informations professionnelles:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Entreprise:</span>
                          <p className="font-medium">{formData.company_name}</p>
                        </div>
                        {formData.ifu && (
                          <div>
                            <span className="text-gray-600">IFU:</span>
                            <p className="font-medium">{formData.ifu}</p>
                          </div>
                        )}
                        {formData.rccm && (
                          <div>
                            <span className="text-gray-600">RCCM:</span>
                            <p className="font-medium">{formData.rccm}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        Un email d'invitation sera envoyé à {formData.email}. 
                        Le propriétaire pourra créer son compte et rejoindre votre réseau.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between pt-6">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep()}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
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
