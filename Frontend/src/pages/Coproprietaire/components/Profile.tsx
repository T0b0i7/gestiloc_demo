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
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Profil non trouvé
        </h3>
        <p className="text-gray-600">
          Impossible de charger les informations du profil.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Modifier
            </Button>
          ) : (
            <>
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
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Biens délégués</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.statistics?.delegated_properties_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Baux actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.statistics?.active_leases_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Loyers collectés</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(profile.statistics?.total_rent_collected || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {profile.status || 'Actif'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.first_name || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.last_name || '—'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.email || '—'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.phone || '—'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{formatDate(profile.date_of_birth)}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro d'identité
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.id_number || ''}
                  onChange={(e) => handleInputChange('id_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.id_number || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.address || '—'}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Informations professionnelles</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.company_name || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.company_name || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse de facturation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address_billing || ''}
                  onChange={(e) => handleInputChange('address_billing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.address_billing || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de licence
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.license_number || ''}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.license_number || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFU
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.ifu || ''}
                  onChange={(e) => handleInputChange('ifu', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.ifu || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RCCM
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.rccm || ''}
                  onChange={(e) => handleInputChange('rccm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.rccm || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro TVA
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.vat_number || ''}
                  onChange={(e) => handleInputChange('vat_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.vat_number || '—'}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Statut: {profile.is_professional ? 'Professionnel' : 'Particulier'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Informations du compte</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="text-gray-900">{profile.email || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email vérifié</p>
            <div className="flex items-center gap-2">
              {profile.user?.email_verified_at ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Oui</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600">Non</span>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date d'inscription</p>
            <p className="text-gray-900">{formatDate(profile.user?.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dernière connexion</p>
            <p className="text-gray-900">{formatDate(profile.user?.last_login_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Membre depuis</p>
            <p className="text-gray-900">{formatDate(profile.joined_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dernière mise à jour</p>
            <p className="text-gray-900">{formatDate(profile.updated_at)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
