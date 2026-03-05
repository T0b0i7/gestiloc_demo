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
  Users,
  ChevronRight,
  UserCheck,
  Building2
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import api from '@/services/api';

interface InviteCoOwnerProps {
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
  invitation_type: 'co_owner' | 'agency';
}

export const InviteCoOwner: React.FC<InviteCoOwnerProps> = ({ notify }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
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
    vat_number: '',
    invitation_type: 'co_owner'
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
        // Validation de base pour tous
        return formData.email && formData.first_name && formData.last_name;
      case 2:
        // Validation spécifique selon le type
        if (formData.invitation_type === 'agency') {
          // Pour une agence: IFU et RCCM obligatoires
          return formData.ifu && formData.rccm;
        }
        return true; // Pour co-propriétaire, pas de validation spécifique
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      const message = formData.invitation_type === 'agency' 
        ? 'Veuillez remplir l\'IFU et le RCCM pour l\'agence'
        : 'Veuillez remplir tous les champs obligatoires';
      notify(message, 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/co-owners/invite', formData);

      if (response.data) {
        const successMessage = formData.invitation_type === 'agency'
          ? 'Agence invitée avec succès!'
          : 'Co-propriétaire invité avec succès!';
        notify(successMessage, 'success');
        
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
          vat_number: '',
          invitation_type: 'co_owner'
        });
        setStep(1);
        setShowTypeSelection(true);
      } else {
        throw new Error('Erreur lors de l\'envoi de l\'invitation');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de l\'invitation';
      notify(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectInvitationType = (type: 'co_owner' | 'agency') => {
    setFormData(prev => ({
      ...prev,
      invitation_type: type,
      is_professional: type === 'agency' // Une agence est toujours professionnelle
    }));
    setShowTypeSelection(false);
    setStep(1);
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      const message = formData.invitation_type === 'agency'
        ? 'Veuillez remplir l\'IFU et le RCCM pour l\'agence'
        : 'Veuillez remplir tous les champs obligatoires';
      notify(message, 'error');
    }
  };

  const prevStep = () => {
    if (step === 1) {
      setShowTypeSelection(true);
    } else {
      setStep(step - 1);
    }
  };

  // Écran de sélection du type d'invitation
  if (showTypeSelection) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête */}
        <br />
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inviter un gestionnaire
          </h1>
          <p className="text-gray-600">
            Choisissez le type de gestionnaire que vous souhaitez inviter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte Co-propriétaire */}
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => selectInvitationType('co_owner')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Co-propriétaire
              </h3>
              <p className="text-gray-600 text-sm">
                Invitez un co-propriétaire à gérer vos biens ensemble. Peut être un particulier ou un professionnel.
              </p>
              <div className="space-y-2 text-sm text-gray-500 text-left w-full">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Gestion conjointe des biens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Permissions contrôlées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Particulier ou Professionnel</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  selectInvitationType('co_owner');
                }}
              >
                <span className="flex items-center justify-center">
                  Choisir <ChevronRight className="w-4 h-4 ml-2" />
                </span>
              </button>
            </div>
          </Card>

          {/* Carte Agence */}
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => selectInvitationType('agency')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Agence Immobilière
              </h3>
              <p className="text-gray-600 text-sm">
                Invitez une agence professionnelle pour gérer vos biens. Documents professionnels obligatoires.
              </p>
              <div className="space-y-2 text-sm text-gray-500 text-left w-full">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Gestion professionnelle</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Documents légaux requis (IFU, RCCM)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Facturation professionnelle</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  selectInvitationType('agency');
                }}
              >
                <span className="flex items-center justify-center">
                  Choisir <ChevronRight className="w-4 h-4 ml-2" />
                </span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête dynamique */}
      <div className="text-center">
        <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${
          formData.invitation_type === 'agency' ? 'bg-purple-100' : 'bg-blue-100'
        }`}>
          {formData.invitation_type === 'agency' ? (
            <Building2 className="w-8 h-8 text-purple-600" />
          ) : (
            <UserCheck className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {formData.invitation_type === 'agency' ? 'Inviter une agence' : 'Inviter un co-propriétaire'}
        </h1>
        <p className="text-gray-600">
          {formData.invitation_type === 'agency' 
            ? 'Invitez une agence immobilière professionnelle pour gérer vos biens'
            : 'Invitez un co-propriétaire à gérer vos biens ensemble avec des permissions contrôlées'
          }
        </p>
        
        {/* Bouton pour changer de type */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowTypeSelection(true)}
          className="mt-4"
        >
          Changer de type d'invitation
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? formData.invitation_type === 'agency' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNumber 
                  ? formData.invitation_type === 'agency' ? 'bg-purple-600' : 'bg-blue-600'
                  : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1: Informations de base (pour tous) */}
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
                      placeholder={formData.invitation_type === 'agency' ? "Gérant prénom" : "Prénom"}
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
                      placeholder={formData.invitation_type === 'agency' ? "Gérant nom" : "Nom"}
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
                      placeholder={formData.invitation_type === 'agency' ? "contact@agence.com" : "email@exemple.com"}
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
            </div>
          )}

          {/* Étape 2: Informations spécifiques selon le type */}
          {step === 2 && (
            <div className="space-y-6">
              {formData.invitation_type === 'agency' ? (
                // SECTION AGENCE
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Informations de l'agence
                  </h2>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-purple-800">
                        Pour une agence, les documents légaux sont obligatoires
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'agence
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Immobilier Excellence"
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
                        required
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
                        required
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse de facturation
                      </label>
                      <input
                        type="text"
                        value={formData.address_billing}
                        onChange={(e) => handleInputChange('address_billing', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Rue du Commerce, Cotonou"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // SECTION CO-PROPRIÉTAIRE
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Informations complémentaires
                  </h2>
                  
                  <div className="text-center py-8">
                    <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Le co-propriétaire est un particulier. Aucune information supplémentaire requise.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Vous pouvez passer directement à l'étape de confirmation
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Confirmation de l'invitation
                </h2>
                
                <div className={`p-6 rounded-lg space-y-4 ${
                  formData.invitation_type === 'agency' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${
                      formData.invitation_type === 'agency' ? 'text-purple-600' : 'text-green-500'
                    }`} />
                    <span className="font-medium">
                      {formData.invitation_type === 'agency' ? 'Agence à inviter:' : 'Co-propriétaire à inviter:'}
                    </span>
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
                        {formData.invitation_type === 'agency' 
                          ? 'Agence Immobilière' 
                          : 'Co-propriétaire Particulier'}
                      </p>
                    </div>
                  </div>

                  {(formData.invitation_type === 'agency' && (formData.company_name || formData.ifu || formData.rccm)) && (
                    <div className="border-t pt-4">
                      <p className="font-medium mb-2">Informations de l'agence:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {formData.company_name && (
                          <div>
                            <span className="text-gray-600">Agence:</span>
                            <p className="font-medium">{formData.company_name}</p>
                          </div>
                        )}
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
                        {formData.vat_number && (
                          <div>
                            <span className="text-gray-600">Numéro TVA:</span>
                            <p className="font-medium">{formData.vat_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`border rounded-lg p-4 ${
                  formData.invitation_type === 'agency' 
                    ? 'bg-purple-50 border-purple-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={`w-5 h-5 ${
                      formData.invitation_type === 'agency' ? 'text-purple-600' : 'text-blue-600'
                    } mt-0.5`} />
                    <div>
                      <p className={`text-sm ${
                        formData.invitation_type === 'agency' ? 'text-purple-800' : 'text-blue-800'
                      }`}>
                        Un email d'invitation sera envoyé à {formData.email}. 
                        {formData.invitation_type === 'agency' 
                          ? ' L\'agence pourra créer son compte et commencer à gérer vos biens.' 
                          : ' Le co-propriétaire pourra créer son compte et commencer à gérer vos biens.'}
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
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Précédent
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTypeSelection(true)}
                  disabled={loading}
                >
                  Retour au choix
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep()}
                  className={formData.invitation_type === 'agency' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {step === 2 && formData.invitation_type === 'co_owner' ? 'Confirmer' : 'Suivant'}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center space-x-2 ${
                    formData.invitation_type === 'agency' ? 'bg-purple-600 hover:bg-purple-700' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>
                        {formData.invitation_type === 'agency' 
                          ? 'Inviter l\'agence' 
                          : 'Inviter le co-propriétaire'}
                      </span>
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