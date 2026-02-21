import React, { useState, useEffect } from 'react';
import { Save, FileText, MessageSquare, Receipt, CheckCircle, Home, Calendar, Briefcase, Phone, Mail, MapPin, User, Users, Edit2, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';

interface UserData {
  id: number;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  email_verified_at: string | null;
  language?: string;
}

interface TenantData {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  birth_place: string | null;
  marital_status: string | null;
  profession: string | null;
  employer: string | null;
  annual_income: number | null;
  monthly_income: number | null;
  contract_type: string | null;
  status: string;
  employer_address?: string | null;
}

interface AddressData {
  street: string | null;
  complement: string | null;
  zip_code: string | null;
  city: string | null;
  country: string | null;
}

interface EmergencyData {
  full_name: string | null;
  relationship: string | null;
  phone: string | null;
  email: string | null;
}

interface GuarantorData {
  name: string | null;
  phone: string | null;
  email: string | null;
  profession: string | null;
  income: number | null;
  monthly_income: number | null;
  address: string | null;
  birth_date: string | null;
  birth_place: string | null;
}

interface StatsData {
  rents_paid: number;
  total_payments: number;
  total_paid_amount: number;
  documents: number;
  messages: number;
  active_leases: number;
  total_leases: number;
  maintenance_requests: number;
  open_maintenance_requests: number;
  member_since: string;
  member_date: string;
  verified: boolean;
  is_active: boolean;
  is_candidate: boolean;
}

interface ProfileData {
  user: UserData;
  tenant: TenantData;
  address: AddressData;
  emergency_contact: EmergencyData;
  guarantor: GuarantorData;
  stats: StatsData;
}

interface ProfileProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
  onLogout?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ notify }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // États pour les formulaires
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    birth_place: '',
    marital_status: ''
  });

  const [address, setAddress] = useState({
    street: '',
    complement: '',
    zip_code: '',
    city: '',
    country: ''
  });

  const [professional, setProfessional] = useState({
    profession: '',
    employer: '',
    employer_address: '',
    contract_type: '',
    annual_income: '',
    monthly_income: ''
  });

  const [emergency, setEmergency] = useState({
    full_name: '',
    relationship: '',
    phone: '',
    email: ''
  });

  const [guarantor, setGuarantor] = useState({
    name: '',
    phone: '',
    email: '',
    profession: '',
    income: '',
    monthly_income: '',
    address: '',
    birth_date: '',
    birth_place: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const handleApiError = async (response: Response) => {
    if (response.status === 422) {
      const errorData = await response.json();
      setValidationErrors(errorData.errors || {});
      
      // Formater les messages d'erreur pour la notification
      const errorMessages = Object.values(errorData.errors || {}).flat();
      return {
        success: false,
        message: errorMessages.join(', ') || 'Erreur de validation'
      };
    }
    
    if (response.status === 500) {
      return {
        success: false,
        message: 'Erreur serveur. Veuillez réessayer plus tard.'
      };
    }
    
    return {
      success: false,
      message: `Erreur ${response.status}: ${response.statusText}`
    };
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${getApiUrl()}/tenant/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur chargement');
      }

      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        setProfile(data);
        
        setPersonalInfo({
          first_name: data.tenant.first_name || '',
          last_name: data.tenant.last_name || '',
          email: data.tenant.email || data.user.email || '',
          phone: data.tenant.phone || data.user.phone || '',
          birth_date: data.tenant.birth_date || '',
          birth_place: data.tenant.birth_place || '',
          marital_status: data.tenant.marital_status || ''
        });

        setAddress({
          street: data.address.street || '',
          complement: data.address.complement || '',
          zip_code: data.address.zip_code || '',
          city: data.address.city || '',
          country: data.address.country || 'Bénin'
        });

        setProfessional({
          profession: data.tenant.profession || '',
          employer: data.tenant.employer || '',
          employer_address: data.tenant.employer_address || '',
          contract_type: data.tenant.contract_type || '',
          annual_income: data.tenant.annual_income ? data.tenant.annual_income.toString() : '',
          monthly_income: data.tenant.monthly_income ? data.tenant.monthly_income.toString() : ''
        });

        setEmergency({
          full_name: data.emergency_contact.full_name || '',
          relationship: data.emergency_contact.relationship || '',
          phone: data.emergency_contact.phone || '',
          email: data.emergency_contact.email || ''
        });

        setGuarantor({
          name: data.guarantor.name || '',
          phone: data.guarantor.phone || '',
          email: data.guarantor.email || '',
          profession: data.guarantor.profession || '',
          income: data.guarantor.income ? data.guarantor.income.toString() : '',
          monthly_income: data.guarantor.monthly_income ? data.guarantor.monthly_income.toString() : '',
          address: data.guarantor.address || '',
          birth_date: data.guarantor.birth_date || '',
          birth_place: data.guarantor.birth_place || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      notify('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async () => {
    try {
      setSaving(true);
      setValidationErrors({});
      
      const token = getToken();
      const response = await fetch(`${getApiUrl()}/tenant/profile/personal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(personalInfo)
      });

      if (!response.ok) {
        const errorData = await handleApiError(response);
        notify(errorData.message, 'error');
        return;
      }

      const result = await response.json();
      if (result.success) {
        notify('Informations personnelles enregistrées', 'success');
        await loadProfile();
        setActiveSection(null);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      notify('Erreur de connexion au serveur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      setSaving(true);
      setValidationErrors({});
      
      const token = getToken();
      const response = await fetch(`${getApiUrl()}/tenant/profile/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(address)
      });

      if (!response.ok) {
        const errorData = await handleApiError(response);
        notify(errorData.message, 'error');
        return;
      }

      const result = await response.json();
      if (result.success) {
        notify('Adresse enregistrée', 'success');
        await loadProfile();
        setActiveSection(null);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      notify('Erreur de connexion au serveur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfessional = async () => {
    try {
      setSaving(true);
      setValidationErrors({});
      
      const token = getToken();
      const response = await fetch(`${getApiUrl()}/tenant/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(professional)
      });

      if (!response.ok) {
        const errorData = await handleApiError(response);
        notify(errorData.message, 'error');
        return;
      }

      const result = await response.json();
      if (result.success) {
        notify('Informations professionnelles enregistrées', 'success');
        await loadProfile();
        setActiveSection(null);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      notify('Erreur de connexion au serveur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmergency = async () => {
    try {
      setSaving(true);
      setValidationErrors({});
      
      const token = getToken();
      const response = await fetch(`${getApiUrl()}/tenant/profile/emergency`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(emergency)
      });

      if (!response.ok) {
        const errorData = await handleApiError(response);
        notify(errorData.message, 'error');
        return;
      }

      const result = await response.json();
      if (result.success) {
        notify('Contact d\'urgence enregistré', 'success');
        await loadProfile();
        setActiveSection(null);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      notify('Erreur de connexion au serveur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGuarantor = async () => {
    try {
      setSaving(true);
      setValidationErrors({});
      
      const token = getToken();
      const response = await fetch(`${getApiUrl()}/tenant/profile/guarantor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(guarantor)
      });

      if (!response.ok) {
        const errorData = await handleApiError(response);
        notify(errorData.message, 'error');
        return;
      }

      const result = await response.json();
      if (result.success) {
        notify('Informations du garant enregistrées', 'success');
        await loadProfile();
        setActiveSection(null);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      notify('Erreur de connexion au serveur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelPersonal = () => {
    if (profile) {
      setPersonalInfo({
        first_name: profile.tenant.first_name || '',
        last_name: profile.tenant.last_name || '',
        email: profile.tenant.email || profile.user.email || '',
        phone: profile.tenant.phone || profile.user.phone || '',
        birth_date: profile.tenant.birth_date || '',
        birth_place: profile.tenant.birth_place || '',
        marital_status: profile.tenant.marital_status || ''
      });
    }
    setValidationErrors({});
    setActiveSection(null);
  };

  const cancelAddress = () => {
    if (profile) {
      setAddress({
        street: profile.address.street || '',
        complement: profile.address.complement || '',
        zip_code: profile.address.zip_code || '',
        city: profile.address.city || '',
        country: profile.address.country || 'Bénin'
      });
    }
    setValidationErrors({});
    setActiveSection(null);
  };

  const cancelProfessional = () => {
    if (profile) {
      setProfessional({
        profession: profile.tenant.profession || '',
        employer: profile.tenant.employer || '',
        employer_address: profile.tenant.employer_address || '',
        contract_type: profile.tenant.contract_type || '',
        annual_income: profile.tenant.annual_income ? profile.tenant.annual_income.toString() : '',
        monthly_income: profile.tenant.monthly_income ? profile.tenant.monthly_income.toString() : ''
      });
    }
    setValidationErrors({});
    setActiveSection(null);
  };

  const cancelEmergency = () => {
    if (profile) {
      setEmergency({
        full_name: profile.emergency_contact.full_name || '',
        relationship: profile.emergency_contact.relationship || '',
        phone: profile.emergency_contact.phone || '',
        email: profile.emergency_contact.email || ''
      });
    }
    setValidationErrors({});
    setActiveSection(null);
  };

  const cancelGuarantor = () => {
    if (profile) {
      setGuarantor({
        name: profile.guarantor.name || '',
        phone: profile.guarantor.phone || '',
        email: profile.guarantor.email || '',
        profession: profile.guarantor.profession || '',
        income: profile.guarantor.income ? profile.guarantor.income.toString() : '',
        monthly_income: profile.guarantor.monthly_income ? profile.guarantor.monthly_income.toString() : '',
        address: profile.guarantor.address || '',
        birth_date: profile.guarantor.birth_date || '',
        birth_place: profile.guarantor.birth_place || ''
      });
    }
    setValidationErrors({});
    setActiveSection(null);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erreur de chargement du profil</div>
      </div>
    );
  }

  const initials = `${personalInfo.first_name.charAt(0) || ''}${personalInfo.last_name.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header Banner avec texte blanc */}
      <div 
        className="rounded-xl p-6 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, rgba(82, 157, 33, 0.95) 0%, rgba(62, 127, 23, 0.98) 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30 backdrop-blur-sm">
            {initials || '👤'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{personalInfo.first_name} {personalInfo.last_name}</h1>
            <p className="text-white/90 text-sm">{personalInfo.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.stats.verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs text-white border border-white/30">
                  <CheckCircle size={12} className="text-white" />
                  Locataire vérifié
                </span>
              )}
              {profile.stats.active_leases > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs text-white border border-white/30">
                  <Home size={12} className="text-white" />
                  {profile.stats.active_leases} location{profile.stats.active_leases > 1 ? 's' : ''} active{profile.stats.active_leases > 1 ? 's' : ''}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs text-white border border-white/30">
                <Calendar size={12} className="text-white" />
                Membre depuis {profile.stats.member_since}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-green-50 flex items-center justify-center">
            <Receipt className="text-green-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-green-600">{profile.stats.rents_paid}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Loyers payés</div>
          <div className="text-sm text-gray-600 mt-1 font-semibold">{formatCurrency(profile.stats.total_paid_amount)}</div>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-blue-600">{profile.stats.documents}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Documents</div>
          <div className="text-sm text-gray-600 mt-1">Quittances</div>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-purple-50 flex items-center justify-center">
            <MessageSquare className="text-purple-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-purple-600">{profile.stats.messages}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Messages</div>
          <div className="text-sm text-gray-600 mt-1">Notes et échanges</div>
        </Card>
      </div>

      {/* Personal Information */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-green-600" />
              Informations personnelles
            </h2>
            <p className="text-sm text-gray-500">Vos informations de contact et identité</p>
          </div>
          {activeSection !== 'personal' && (
            <button
              onClick={() => setActiveSection('personal')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <Edit2 size={16} />
              Modifier
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              value={personalInfo.first_name}
              onChange={(e) => {
                setPersonalInfo({ ...personalInfo, first_name: e.target.value });
                if (validationErrors.first_name) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.first_name;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'personal'}
              placeholder="Votre prénom"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.first_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.first_name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.first_name[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={personalInfo.last_name}
              onChange={(e) => {
                setPersonalInfo({ ...personalInfo, last_name: e.target.value });
                if (validationErrors.last_name) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.last_name;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'personal'}
              placeholder="Votre nom"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.last_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.last_name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.last_name[0]}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={personalInfo.email}
            disabled
            className="w-full px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Utilisé pour la connexion et les notifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => {
                setPersonalInfo({ ...personalInfo, phone: e.target.value });
                if (validationErrors.phone) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.phone;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'personal'}
              placeholder="Votre numéro de téléphone"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.phone && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.phone[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Situation familiale</label>
            <select
              value={personalInfo.marital_status}
              onChange={(e) => {
                setPersonalInfo({ ...personalInfo, marital_status: e.target.value });
                if (validationErrors.marital_status) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.marital_status;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'personal'}
              className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.marital_status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="" className="text-gray-500">Sélectionnez</option>
              <option value="single" className="text-gray-900">Célibataire</option>
              <option value="married" className="text-gray-900">Marié(e)</option>
              <option value="divorced" className="text-gray-900">Divorcé(e)</option>
              <option value="widowed" className="text-gray-900">Veuf/Veuve</option>
              <option value="pacsed" className="text-gray-900">Pacsé(e)</option>
            </select>
            {validationErrors.marital_status && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.marital_status[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input
              type="date"
              value={personalInfo.birth_date}
              onChange={(e) => {
                setPersonalInfo({ ...personalInfo, birth_date: e.target.value });
                if (validationErrors.birth_date) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.birth_date;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'personal'}
              className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.birth_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.birth_date && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.birth_date[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
            <input
              type="text"
              value={personalInfo.birth_place}
              onChange={(e) => {
                setPersonalInfo({ ...personalInfo, birth_place: e.target.value });
                if (validationErrors.birth_place) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.birth_place;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'personal'}
              placeholder="Votre lieu de naissance"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.birth_place ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.birth_place && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.birth_place[0]}
              </p>
            )}
          </div>
        </div>

        {activeSection === 'personal' && (
          <div className="flex gap-3 animate-fadeIn">
            <button
              onClick={handleSavePersonal}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'rgba(82, 157, 33, 0.82)' }}
            >
              <Save size={16} />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button
              onClick={cancelPersonal}
              disabled={saving}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}
      </Card>

      {/* Current Address */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              Adresse actuelle
            </h2>
            <p className="text-sm text-gray-500">Votre adresse de résidence</p>
          </div>
          {activeSection !== 'address' && (
            <button
              onClick={() => setActiveSection('address')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <Edit2 size={16} />
              Modifier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={address.street}
              onChange={(e) => {
                setAddress({ ...address, street: e.target.value });
                if (validationErrors.street) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.street;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'address'}
              placeholder="Votre adresse"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.street ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.street && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.street[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complément</label>
            <input
              type="text"
              value={address.complement}
              onChange={(e) => {
                setAddress({ ...address, complement: e.target.value });
                if (validationErrors.complement) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.complement;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'address'}
              placeholder="Appartement, étage, etc."
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.complement ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.complement && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.complement[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
            <input
              type="text"
              value={address.zip_code}
              onChange={(e) => {
                setAddress({ ...address, zip_code: e.target.value });
                if (validationErrors.zip_code) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.zip_code;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'address'}
              placeholder="Code postal"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.zip_code ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.zip_code && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.zip_code[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => {
                setAddress({ ...address, city: e.target.value });
                if (validationErrors.city) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.city;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'address'}
              placeholder="Votre ville"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.city && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.city[0]}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
          <input
            type="text"
            value={address.country}
            onChange={(e) => {
              setAddress({ ...address, country: e.target.value });
              if (validationErrors.country) {
                const newErrors = { ...validationErrors };
                delete newErrors.country;
                setValidationErrors(newErrors);
              }
            }}
            disabled={activeSection !== 'address'}
            placeholder="Pays"
            className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
              validationErrors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.country && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {validationErrors.country[0]}
            </p>
          )}
        </div>

        {activeSection === 'address' && (
          <div className="flex gap-3 animate-fadeIn">
            <button
              onClick={handleSaveAddress}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'rgba(82, 157, 33, 0.82)' }}
            >
              <Save size={16} />
              Enregistrer
            </button>
            <button
              onClick={cancelAddress}
              disabled={saving}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}
      </Card>

      {/* Professional Information */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase size={20} className="text-green-600" />
              Informations professionnelles
            </h2>
            <p className="text-sm text-gray-500">Votre situation professionnelle</p>
          </div>
          {activeSection !== 'professional' && (
            <button
              onClick={() => setActiveSection('professional')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <Edit2 size={16} />
              Modifier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <input
              type="text"
              value={professional.profession}
              onChange={(e) => {
                setProfessional({ ...professional, profession: e.target.value });
                if (validationErrors.profession) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.profession;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'professional'}
              placeholder="Votre profession"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.profession ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.profession && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.profession[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employeur</label>
            <input
              type="text"
              value={professional.employer}
              onChange={(e) => {
                setProfessional({ ...professional, employer: e.target.value });
                if (validationErrors.employer) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.employer;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'professional'}
              placeholder="Nom de l'employeur"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.employer ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.employer && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.employer[0]}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de l'employeur</label>
          <input
            type="text"
            value={professional.employer_address}
            onChange={(e) => {
              setProfessional({ ...professional, employer_address: e.target.value });
              if (validationErrors.employer_address) {
                const newErrors = { ...validationErrors };
                delete newErrors.employer_address;
                setValidationErrors(newErrors);
              }
            }}
            disabled={activeSection !== 'professional'}
            placeholder="Adresse de l'employeur"
            className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
              validationErrors.employer_address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.employer_address && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {validationErrors.employer_address[0]}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
          <select
            value={professional.contract_type}
            onChange={(e) => {
              setProfessional({ ...professional, contract_type: e.target.value });
              if (validationErrors.contract_type) {
                const newErrors = { ...validationErrors };
                delete newErrors.contract_type;
                setValidationErrors(newErrors);
              }
            }}
            disabled={activeSection !== 'professional'}
            className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
              validationErrors.contract_type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="" className="text-gray-500">Sélectionnez</option>
            <option value="cdi" className="text-gray-900">CDI</option>
            <option value="cdd" className="text-gray-900">CDD</option>
            <option value="interim" className="text-gray-900">Intérim</option>
            <option value="freelance" className="text-gray-900">Freelance</option>
            <option value="retired" className="text-gray-900">Retraité</option>
            <option value="unemployed" className="text-gray-900">Sans emploi</option>
            <option value="student" className="text-gray-900">Étudiant</option>
          </select>
          {validationErrors.contract_type && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {validationErrors.contract_type[0]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenu annuel (FCFA)</label>
            <input
              type="number"
              value={professional.annual_income}
              onChange={(e) => {
                setProfessional({ ...professional, annual_income: e.target.value });
                if (validationErrors.annual_income) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.annual_income;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'professional'}
              placeholder="Revenu annuel"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.annual_income ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.annual_income && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.annual_income[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenu mensuel (FCFA)</label>
            <input
              type="number"
              value={professional.monthly_income}
              onChange={(e) => {
                setProfessional({ ...professional, monthly_income: e.target.value });
                if (validationErrors.monthly_income) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.monthly_income;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'professional'}
              placeholder="Revenu mensuel"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.monthly_income ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.monthly_income && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.monthly_income[0]}
              </p>
            )}
          </div>
        </div>

        {activeSection === 'professional' && (
          <div className="flex gap-3 animate-fadeIn">
            <button
              onClick={handleSaveProfessional}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'rgba(82, 157, 33, 0.82)' }}
            >
              <Save size={16} />
              Enregistrer
            </button>
            <button
              onClick={cancelProfessional}
              disabled={saving}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}
      </Card>

      {/* Emergency Contact */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone size={20} className="text-green-600" />
              Contact d'urgence
            </h2>
            <p className="text-sm text-gray-500">Personne à contacter en cas d'urgence</p>
          </div>
          {activeSection !== 'emergency' && (
            <button
              onClick={() => setActiveSection('emergency')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <Edit2 size={16} />
              Modifier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={emergency.full_name}
              onChange={(e) => {
                setEmergency({ ...emergency, full_name: e.target.value });
                if (validationErrors.full_name) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.full_name;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'emergency'}
              placeholder="Nom de la personne à contacter"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.full_name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.full_name[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien de parenté</label>
            <input
              type="text"
              value={emergency.relationship}
              onChange={(e) => {
                setEmergency({ ...emergency, relationship: e.target.value });
                if (validationErrors.relationship) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.relationship;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'emergency'}
              placeholder="Ex: Époux, Parent, Ami..."
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.relationship ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.relationship && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.relationship[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={emergency.phone}
              onChange={(e) => {
                setEmergency({ ...emergency, phone: e.target.value });
                if (validationErrors.phone) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.phone;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'emergency'}
              placeholder="Numéro de téléphone"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.phone && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.phone[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={emergency.email}
              onChange={(e) => {
                setEmergency({ ...emergency, email: e.target.value });
                if (validationErrors.email) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.email;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'emergency'}
              placeholder="Adresse email"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.email[0]}
              </p>
            )}
          </div>
        </div>

        {activeSection === 'emergency' && (
          <div className="flex gap-3 animate-fadeIn">
            <button
              onClick={handleSaveEmergency}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'rgba(82, 157, 33, 0.82)' }}
            >
              <Save size={16} />
              Enregistrer
            </button>
            <button
              onClick={cancelEmergency}
              disabled={saving}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}
      </Card>

      {/* Guarantor Information */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-green-600" />
              Informations du garant
            </h2>
            <p className="text-sm text-gray-500">Personne se portant garant pour votre location</p>
          </div>
          {activeSection !== 'guarantor' && (
            <button
              onClick={() => setActiveSection('guarantor')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <Edit2 size={16} />
              Modifier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={guarantor.name}
              onChange={(e) => {
                setGuarantor({ ...guarantor, name: e.target.value });
                if (validationErrors.name) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.name;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              placeholder="Nom du garant"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.name[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <input
              type="text"
              value={guarantor.profession}
              onChange={(e) => {
                setGuarantor({ ...guarantor, profession: e.target.value });
                if (validationErrors.profession) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.profession;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              placeholder="Profession du garant"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.profession ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.profession && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.profession[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={guarantor.phone}
              onChange={(e) => {
                setGuarantor({ ...guarantor, phone: e.target.value });
                if (validationErrors.phone) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.phone;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              placeholder="Téléphone du garant"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.phone && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.phone[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={guarantor.email}
              onChange={(e) => {
                setGuarantor({ ...guarantor, email: e.target.value });
                if (validationErrors.email) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.email;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              placeholder="Email du garant"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.email[0]}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input
            type="text"
            value={guarantor.address}
            onChange={(e) => {
              setGuarantor({ ...guarantor, address: e.target.value });
              if (validationErrors.address) {
                const newErrors = { ...validationErrors };
                delete newErrors.address;
                setValidationErrors(newErrors);
              }
            }}
            disabled={activeSection !== 'guarantor'}
            placeholder="Adresse du garant"
            className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
              validationErrors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.address && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {validationErrors.address[0]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input
              type="date"
              value={guarantor.birth_date}
              onChange={(e) => {
                setGuarantor({ ...guarantor, birth_date: e.target.value });
                if (validationErrors.birth_date) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.birth_date;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.birth_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.birth_date && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.birth_date[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
            <input
              type="text"
              value={guarantor.birth_place}
              onChange={(e) => {
                setGuarantor({ ...guarantor, birth_place: e.target.value });
                if (validationErrors.birth_place) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.birth_place;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              placeholder="Lieu de naissance"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.birth_place ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.birth_place && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.birth_place[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenu annuel (FCFA)</label>
            <input
              type="number"
              value={guarantor.income}
              onChange={(e) => {
                setGuarantor({ ...guarantor, income: e.target.value });
                if (validationErrors.income) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.income;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              placeholder="Revenu annuel"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.income ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.income && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.income[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenu mensuel (FCFA)</label>
            <input
              type="number"
              value={guarantor.monthly_income}
              onChange={(e) => {
                setGuarantor({ ...guarantor, monthly_income: e.target.value });
                if (validationErrors.monthly_income) {
                  const newErrors = { ...validationErrors };
                  delete newErrors.monthly_income;
                  setValidationErrors(newErrors);
                }
              }}
              disabled={activeSection !== 'guarantor'}
              placeholder="Revenu mensuel"
              className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200 ${
                validationErrors.monthly_income ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.monthly_income && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.monthly_income[0]}
              </p>
            )}
          </div>
        </div>

        {activeSection === 'guarantor' && (
          <div className="flex gap-3 animate-fadeIn">
            <button
              onClick={handleSaveGuarantor}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'rgba(82, 157, 33, 0.82)' }}
            >
              <Save size={16} />
              Enregistrer
            </button>
            <button
              onClick={cancelGuarantor}
              disabled={saving}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}
      </Card>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};