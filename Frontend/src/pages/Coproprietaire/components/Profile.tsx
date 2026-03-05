import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  DollarSign,
  Edit2,
  Save,
  X,
  FileText,
  Shield,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Globe,
  CreditCard,
  FileSignature,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  Lock,
} from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { coOwnerApi } from '@/services/coOwnerApi';

interface ProfileProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate, notify }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'account'>('personal');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getProfile();
      setProfile(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        date_of_birth: data.date_of_birth,
        id_number: data.id_number,
        company_name: data.company_name,
        address_billing: data.address_billing,
        license_number: data.license_number,
        ifu: data.ifu,
        rccm: data.rccm,
        vat_number: data.vat_number,
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      notify('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await coOwnerApi.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      notify('Profil mis à jour avec succès', 'success');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      notify('Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Déterminer si c'est une agence ou un professionnel
  const isAgency = profile?.co_owner_type === 'agency';
  const isProfessional = profile?.is_professional;
  const isSimpleCoOwner = !isAgency && !isProfessional;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-xl">
                  <div className="w-6 h-6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="relative inline-block">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] rounded-full blur-xl opacity-30 animate-pulse"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-slide-up">
          Profil non trouvé
        </h3>
        <p className="text-gray-600 animate-slide-up delay-75">
          Impossible de charger les informations du profil.
        </p>
        <Button 
          onClick={fetchProfile} 
          className="mt-6 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] hover:from-[#5d8f3a] hover:to-[#70AE48] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header avec dégradé vert */}
      <div className="bg-gradient-to-r from-[#70AE48] via-[#8BC34A] to-[#70AE48] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                {isAgency ? (
                  <Building2 className="w-6 h-6" />
                ) : isProfessional ? (
                  <BriefcaseBusiness className="w-6 h-6" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Mon Profil
                </h1>
                <p className="text-green-100">
                  {isAgency ? 'Agence immobilière' : isProfessional ? 'Professionnel' : 'Copropriétaire'} • Gérez vos informations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                <span>Statut: {profile.status || 'Actif'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Membre depuis {formatDate(profile.joined_at)}</span>
              </div>
              {isAgency && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Building2 className="w-3 h-3" />
                  <span>Agence Immobilière</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Modifier le profil
              </Button>
            ) : (
              <div className="flex gap-3 animate-slide-up">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      first_name: profile.first_name,
                      last_name: profile.last_name,
                      email: profile.email,
                      phone: profile.phone,
                      address: profile.address,
                      date_of_birth: profile.date_of_birth,
                      id_number: profile.id_number,
                      company_name: profile.company_name,
                      address_billing: profile.address_billing,
                      license_number: profile.license_number,
                      ifu: profile.ifu,
                      rccm: profile.rccm,
                      vat_number: profile.vat_number,
                    });
                  }}
                  disabled={saving}
                  className="text-white
                    bg-gradient-to-r from-[#70AE48] to-[#8BC34A]
                    hover:from-[#5d8f3a] hover:to-[#70AE48]
                    border border-white/20 backdrop-blur-sm
                    transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 text-white 
                    bg-gradient-to-r from-[#70AE48] to-[#8BC34A]
                    hover:from-[#5d8f3a] hover:to-[#70AE48]
                    hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards avec animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 hover:border-green-200 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] rounded-xl shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Biens délégués</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {profile.statistics?.delegated_properties_count || 0}
              </p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] rounded-full"></div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 hover:border-green-200 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-75">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Baux actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {profile.statistics?.active_leases_count || 0}
              </p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] rounded-full"></div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 hover:border-green-200 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] rounded-xl shadow-lg">
             <span className="text-white font-bold text-lg">FCFA</span>

            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Loyers collectés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(profile.statistics?.total_rent_collected || 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-[#70AE48] to-[#8BC34A] rounded-full"></div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border border-amber-100 hover:border-amber-200 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-125">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Statut</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${profile.status === 'active' ? 'bg-[#70AE48] animate-pulse' : 'bg-yellow-500'}`}></div>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {profile.status || 'Actif'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
        </Card>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === 'personal' 
              ? 'text-[#70AE48] border-b-2 border-[#70AE48] bg-green-50' 
              : 'text-gray-600 hover:text-[#70AE48] hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              Informations personnelles
            </div>
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === 'professional' 
              ? 'text-[#70AE48] border-b-2 border-[#70AE48] bg-green-50' 
              : 'text-gray-600 hover:text-[#70AE48] hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="w-4 h-4" />
              Informations professionnelles
            </div>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === 'account' 
              ? 'text-[#70AE48] border-b-2 border-[#70AE48] bg-green-50' 
              : 'text-gray-600 hover:text-[#70AE48] hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Compte et sécurité
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Informations personnelles */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#70AE48]" />
                    Identité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                          placeholder="Votre prénom"
                        />
                      ) : (
                        <div className="p-3 bg-white border border-gray-200 rounded-xl">
                          <p className="text-gray-900 font-medium">{profile.first_name || '—'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                          placeholder="Votre nom"
                        />
                      ) : (
                        <div className="p-3 bg-white border border-gray-200 rounded-xl">
                          <p className="text-gray-900 font-medium">{profile.last_name || '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#70AE48]" />
                    Informations de naissance
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de naissance
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200"
                      />
                    ) : (
                      <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{formatDate(profile.date_of_birth)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#70AE48]" />
                    Contact
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                          placeholder="votre@email.com"
                        />
                      ) : (
                        <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">{profile.email || '—'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                          placeholder="+229 XX XX XX XX"
                        />
                      ) : (
                        <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">{profile.phone || '—'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                          placeholder="Votre adresse complète"
                        />
                      ) : (
                        <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{profile.address || '—'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro d'identité
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.id_number || ''}
                          onChange={(e) => handleInputChange('id_number', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                          placeholder="Numéro d'identité"
                        />
                      ) : (
                        <div className="p-3 bg-white border border-gray-200 rounded-xl">
                          <p className="text-gray-900">{profile.id_number || '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informations professionnelles */}
          {activeTab === 'professional' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {isAgency ? (
                      <Building2 className="w-5 h-5 text-[#70AE48]" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-[#70AE48]" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isAgency ? 'Informations de l\'agence' : 'Informations professionnelles'}
                    </h3>
                  </div>
                  
                  {isSimpleCoOwner && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      <Lock className="w-3 h-3" />
                      Lecture seule
                    </div>
                  )}
                </div>
                
                {isSimpleCoOwner && isEditing && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#70AE48] mt-0.5" />
                      <div>
                        <p className="font-medium text-[#70AE48]">
                          Informations professionnelles non modifiables
                        </p>
                        <p className="text-sm text-[#70AE48] mt-1">
                          En tant que copropriétaire simple, vous ne pouvez pas modifier les informations professionnelles.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise
                    </label>
                    {isEditing && (isAgency || isProfessional) ? (
                      <input
                        type="text"
                        value={formData.company_name || ''}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                        placeholder="Nom de l'entreprise"
                      />
                    ) : (
                      <div className={`p-3 border border-gray-200 rounded-xl ${isSimpleCoOwner && !isEditing ? 'bg-gray-50' : 'bg-white'}`}>
                        <p className="text-gray-900">{profile.company_name || '—'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse de facturation
                    </label>
                    {isEditing && (isAgency || isProfessional) ? (
                      <input
                        type="text"
                        value={formData.address_billing || ''}
                        onChange={(e) => handleInputChange('address_billing', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                        placeholder="Adresse de facturation"
                      />
                    ) : (
                      <div className={`p-3 border border-gray-200 rounded-xl ${isSimpleCoOwner && !isEditing ? 'bg-gray-50' : 'bg-white'}`}>
                        <p className="text-gray-900">{profile.address_billing || '—'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de licence
                    </label>
                    {isEditing && (isAgency || isProfessional) ? (
                      <input
                        type="text"
                        value={formData.license_number || ''}
                        onChange={(e) => handleInputChange('license_number', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                        placeholder="Numéro de licence"
                      />
                    ) : (
                      <div className={`p-3 border border-gray-200 rounded-xl ${isSimpleCoOwner && !isEditing ? 'bg-gray-50' : 'bg-white'}`}>
                        <p className="text-gray-900">{profile.license_number || '—'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFU
                    </label>
                    {isEditing && (isAgency || isProfessional) ? (
                      <input
                        type="text"
                        value={formData.ifu || ''}
                        onChange={(e) => handleInputChange('ifu', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                        placeholder="Numéro IFU"
                      />
                    ) : (
                      <div className={`p-3 border border-gray-200 rounded-xl ${isSimpleCoOwner && !isEditing ? 'bg-gray-50' : 'bg-white'}`}>
                        <p className="text-gray-900">{profile.ifu || '—'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RCCM
                    </label>
                    {isEditing && (isAgency || isProfessional) ? (
                      <input
                        type="text"
                        value={formData.rccm || ''}
                        onChange={(e) => handleInputChange('rccm', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                        placeholder="Numéro RCCM"
                      />
                    ) : (
                      <div className={`p-3 border border-gray-200 rounded-xl ${isSimpleCoOwner && !isEditing ? 'bg-gray-50' : 'bg-white'}`}>
                        <p className="text-gray-900">{profile.rccm || '—'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro TVA
                    </label>
                    {isEditing && (isAgency || isProfessional) ? (
                      <input
                        type="text"
                        value={formData.vat_number || ''}
                        onChange={(e) => handleInputChange('vat_number', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-green-300 rounded-xl focus:ring-2 focus:ring-[#70AE48] focus:border-[#70AE48] transition-all duration-200 placeholder-gray-500"
                        placeholder="Numéro TVA"
                      />
                    ) : (
                      <div className={`p-3 border border-gray-200 rounded-xl ${isSimpleCoOwner && !isEditing ? 'bg-gray-50' : 'bg-white'}`}>
                        <p className="text-gray-900">{profile.vat_number || '—'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-white rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#70AE48]" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Statut: {isAgency ? 'Agence Immobilière' : isProfessional ? 'Professionnel' : 'Copropriétaire Simple'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isAgency 
                          ? 'Vous êtes enregistré en tant qu\'agence immobilière' 
                          : isProfessional
                            ? 'Vous êtes enregistré en tant que professionnel' 
                            : 'Vous êtes enregistré en tant que copropriétaire simple'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informations du compte */}
          {activeTab === 'account' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#70AE48]" />
                  Informations du compte
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                    <p className="text-sm text-gray-600 mb-2">Email</p>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 font-medium">{profile.email || '—'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                    <p className="text-sm text-gray-600 mb-2">Email vérifié</p>
                    <div className="flex items-center gap-3">
                      {profile.user?.email_verified_at ? (
                        <>
                          <div className="relative">
                            <CheckCircle className="w-5 h-5 text-[#70AE48]" />
                            <div className="absolute inset-0 bg-[#70AE48] rounded-full blur-sm animate-ping opacity-75"></div>
                          </div>
                          <span className="text-[#70AE48] font-medium">Vérifié</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />
                          <span className="text-amber-600 font-medium">En attente</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                    <p className="text-sm text-gray-600 mb-2">Date d'inscription</p>
                    <p className="text-gray-900 font-medium">{formatDate(profile.user?.created_at)}</p>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                    <p className="text-sm text-gray-600 mb-2">Dernière connexion</p>
                    <p className="text-gray-900 font-medium">{formatDate(profile.user?.last_login_at)}</p>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                    <p className="text-sm text-gray-600 mb-2">Membre depuis</p>
                    <p className="text-gray-900 font-medium">{formatDate(profile.joined_at)}</p>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                    <p className="text-sm text-gray-600 mb-2">Dernière mise à jour</p>
                    <p className="text-gray-900 font-medium">{formatDate(profile.updated_at)}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-[#70AE48]" />
                    Sécurité du compte
                  </h4>
                  <p className="text-sm text-gray-600">
                    Pour des raisons de sécurité, certaines modifications nécessitent une vérification supplémentaire.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-3 border-green-200 text-[#70AE48] hover:bg-green-50"
                    onClick={() => notify('Fonctionnalité en développement', 'info')}
                  >
                    Modifier le mot de passe
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message d'état en édition */}
      {isEditing && (
        <div className="fixed bottom-6 right-6 animate-slide-up">
          <div className="bg-gradient-to-r from-[#70AE48] to-[#8BC34A] text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
            <Edit2 className="w-5 h-5 animate-pulse" />
            <div>
              <p className="font-medium text-white">Mode édition activé</p>
              <p className="text-sm text-green-100">N'oubliez pas d'enregistrer vos modifications</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};