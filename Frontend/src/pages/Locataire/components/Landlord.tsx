import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  ChevronDown, 
  X, 
  MapPin, 
  CreditCard, 
  FileText, 
  User,
  Building,
  Users,
  Mail,
  ChevronsLeft,
  ChevronsRight,
  Phone,
  Calendar,
  Clock,
  Shield,
  Key,
  Home,
  Briefcase,
  Award,
  Star,
  Loader,
  PenTool,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserPlus,
  UserCheck,
  Building2,
  Crown,
  MailOpen,
  MessageCircle,
  Copy,
  Check,
  Download,
  Share2,
  Printer,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Users2,
  UserCircle,
  UserCog,
  UserMinus,
  UserX,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Menu,
  ArrowLeft,
  Sparkles,
  FileSignature,
  CheckSquare,
  StickyNote,
  Folder,
  Wrench,
  DollarSign,
  Gift,
  Heart,
  ThumbsUp,
  Share,
  Link,
  Globe,
  Map,
  Navigation,
  Compass,
  Camera,
  Video,
  Mic,
  Send,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import api from '@/services/api';

interface LandlordProps {
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface Personne {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  avatar: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  type: string;
  sous_type?: string;
  role: string;
  is_creator?: boolean;
  company_name?: string;
  is_professional?: boolean;
  permissions?: string[];
  delegation_type?: string;
  delegated_at?: string;
  expires_at?: string;
}

export const Landlord: React.FC<LandlordProps> = ({ notify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Personne | null>(null);
  const [creator, setCreator] = useState<Personne | null>(null);
  const [landlord, setLandlord] = useState<Personne | null>(null);
  const [coOwners, setCoOwners] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchLandlordInfo();
  }, []);

  const fetchLandlordInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tenant/landlord-info');
      if (response.data.success) {
        setCreator(response.data.creator || null);
        setLandlord(response.data.landlord || null);
        setCoOwners(response.data.co_owners || []);
        setPropertyInfo(response.data.property || null);
        if (!response.data.creator && !response.data.landlord && response.data.co_owners.length === 0) {
          setError('Aucune information trouvée');
        }
      } else {
        setError(response.data.message || 'Erreur lors du chargement');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      notify('Erreur lors du chargement des informations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const allPeople = [
    ...(creator ? [{ ...creator, filterType: 'creator' }] : []),
    ...(landlord ? [{ ...landlord, filterType: 'landlord' }] : []),
    ...coOwners.map(co => ({ ...co, filterType: 'coowner' }))
  ].map(person => ({
    ...person,
    role: person.role || 'Non défini',
    type: person.type || 'Non défini',
    telephone: person.telephone || 'Non renseigné',
    email: person.email || 'Non renseigné',
    adresse: person.adresse || 'Non renseignée',
    ville: person.ville || 'Non renseignée',
    codePostal: person.codePostal || '',
    pays: person.pays || 'Sénégal',
    permissions: person.permissions || []
  }));

  const getFilteredPeople = () => {
    let filtered = allPeople;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.telephone && p.telephone.includes(searchTerm)) ||
        (p.company_name && p.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filtered;
  };

  const filteredPeople = getFilteredPeople();
  const totalPages = Math.ceil(filteredPeople.length / parseInt(itemsPerPage));
  const paginatedPeople = filteredPeople.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  const openModal = (person: Personne) => setSelectedPerson(person);
  const closeModal = () => setSelectedPerson(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(type);
    setTimeout(() => setCopiedEmail(null), 2000);
    notify(`${type === 'email' ? 'Email' : 'Téléphone'} copié !`, 'success');
  };

  const getRoleColor = (role: string) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    if (role.includes('Créateur')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (role.includes('foncier')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (role.includes('Agence')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('Créateur')) return <Crown size={14} className="text-purple-600" />;
    if (role.includes('foncier')) return <Building size={14} className="text-blue-600" />;
    if (role.includes('Agence')) return <Briefcase size={14} className="text-orange-600" />;
    return <User size={14} className="text-green-600" />;
  };

  const getPermissionColor = (permission: string) => {
    switch(permission) {
      case 'Consultation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Modification': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Gestion des baux': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Collecte des loyers': return 'bg-green-100 text-green-800 border-green-200';
      case 'Gestion des interventions': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch(permission) {
      case 'Consultation': return <Eye size={12} className="text-blue-600" />;
      case 'Modification': return <Edit size={12} className="text-yellow-600" />;
      case 'Gestion des baux': return <FileText size={12} className="text-purple-600" />;
      case 'Collecte des loyers': return <DollarSign size={12} className="text-green-600" />;
      case 'Gestion des interventions': return <Wrench size={12} className="text-orange-600" />;
      default: return <Shield size={12} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <div className="relative">
            <Loader className="w-16 h-16 text-[#529D21] animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Chargement des informations...</p>
          <p className="text-sm text-gray-400 mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error && allPeople.length === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">Information non disponible</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchLandlordInfo}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors inline-flex items-center gap-2 shadow-lg shadow-red-200"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fadeIn"> 

      {/* ===== MODAL — CORRIGÉ : flex column + scroll sur le contenu ===== */}
      {selectedPerson && (
      <div
  className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-16 p-4 animate-fadeIn"
  onClick={closeModal}
>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col animate-slideUp"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          > 
            {/* Bandeau header — flex-shrink-0 pour qu'il ne rétrécisse pas */}
            <div className="relative flex-shrink-0 h-20 bg-gradient-to-r from-[#529D21] to-[#F5A623] rounded-t-2xl">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors text-white"
              >
                <X size={20} />
              </button>
              {/* Avatar qui déborde sur la zone scrollable */}
              <div className="absolute -bottom-12 left-6 z-10">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-3xl ${
                    selectedPerson.role.includes('Créateur') ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                    selectedPerson.role.includes('foncier') ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                    selectedPerson.role.includes('Agence') ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                    'bg-gradient-to-br from-green-500 to-green-700'
                  }`}>
                    {selectedPerson.avatar || '?'}
                  </div>
                </div>
              </div>
            </div>

            {/* Zone scrollable — flex-1 + overflow-y-auto */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="pt-16 px-6 pb-2">

                {/* Nom et rôle */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedPerson.prenom} {selectedPerson.nom}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border ${getRoleColor(selectedPerson.role)}`}>
                        {getRoleIcon(selectedPerson.role)}
                        {selectedPerson.role}
                      </span>
                      {selectedPerson.is_creator && (
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                          <PenTool size={12} />
                          Créateur du bien
                        </span>
                      )}
                      {selectedPerson.is_professional && (
                        <span className="px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                          <Briefcase size={12} />
                          Professionnel
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(selectedPerson.email, 'email')}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                      title="Copier l'email"
                    >
                      {copiedEmail === 'email' ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600 group-hover:text-[#529D21]" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(selectedPerson.telephone, 'phone')}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                      title="Copier le téléphone"
                    >
                      {copiedEmail === 'phone' ? <Check size={18} className="text-green-600" /> : <Phone size={18} className="text-gray-600 group-hover:text-[#529D21]" />}
                    </button>
                    <a href={`mailto:${selectedPerson.email}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors group" title="Envoyer un email">
                      <Mail size={18} className="text-gray-600 group-hover:text-[#529D21]" />
                    </a>
                    <a href={`tel:${selectedPerson.telephone}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors group" title="Appeler">
                      <PhoneCall size={18} className="text-gray-600 group-hover:text-[#529D21]" />
                    </a>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#529D21]/30 transition-colors">
                    <div className="flex items-center gap-2 text-[#529D21] mb-2">
                      <Mail size={16} />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-gray-900 font-medium break-all">{selectedPerson.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#529D21]/30 transition-colors">
                    <div className="flex items-center gap-2 text-[#529D21] mb-2">
                      <Phone size={16} />
                      <span className="text-sm font-medium">Téléphone</span>
                    </div>
                    <p className="text-gray-900 font-medium">{selectedPerson.telephone}</p>
                  </div>
                </div>

                {/* Sections détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 text-gray-700">
                      <MapPin size={16} className="text-[#529D21]" />
                      <h4 className="font-semibold">Adresse</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Adresse:</span> <span className="text-gray-700">{selectedPerson.adresse}</span></p>
                      <p><span className="text-gray-500">Ville:</span> <span className="text-gray-700">{selectedPerson.ville}</span></p>
                      <p><span className="text-gray-500">Code postal:</span> <span className="text-gray-700">{selectedPerson.codePostal}</span></p>
                   
                    </div>
                  </div>

                  {selectedPerson.company_name && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3 text-gray-700">
                        <Briefcase size={16} className="text-[#529D21]" />
                        <h4 className="font-semibold">Entreprise</h4>
                      </div>
                      <p className="font-medium text-gray-900">{selectedPerson.company_name}</p>
                      <p className="text-sm text-gray-500 mt-1">Professionnel</p>
                    </div>
                  )}

                  {selectedPerson.permissions && selectedPerson.permissions.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3 text-gray-700">
                        <Shield size={16} className="text-[#529D21]" />
                        <h4 className="font-semibold">Permissions</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPerson.permissions.map((perm, index) => (
                          <span key={index} className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 border ${getPermissionColor(perm)}`}>
                            {getPermissionIcon(perm)}
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPerson.delegated_at && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3 text-gray-700">
                        <Calendar size={16} className="text-[#529D21]" />
                        <h4 className="font-semibold">Délégation</h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-500">Délégué le:</span>{' '}
                          <span className="text-gray-700 font-medium">
                            {new Date(selectedPerson.delegated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </p>
                        {selectedPerson.expires_at && (
                          <p>
                            <span className="text-gray-500">Expire le:</span>{' '}
                            <span className="text-gray-700 font-medium">
                              {new Date(selectedPerson.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </p>
                        )}
                        <p className="mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {selectedPerson.delegation_type === 'full' ? 'Délégation totale' : 'Délégation partielle'}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bien concerné */}
                {propertyInfo && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-[#529D21]/5 to-[#F5A623]/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Home size={16} className="text-[#529D21]" />
                        <h4 className="font-semibold text-gray-900">Bien concerné</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{propertyInfo.name}</p>
                          <p className="text-sm text-gray-600">{propertyInfo.address}</p>
                        </div>
                        <span className="px-3 py-1.5 bg-[#529D21]/10 text-[#529D21] rounded-lg text-xs font-medium">
                          Bien actuel
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer fixe — flex-shrink-0 */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Fermer
              </button>
              <button className="px-6 py-2.5 bg-gradient-to-r from-[#529D21] to-[#F5A623] text-white rounded-xl hover:shadow-lg transition-all font-medium">
                Contacter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header simplifié */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 animate-slideDown">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users2 className="w-6 h-6 text-[#529D21]" />
              Intervenants
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPeople.length} personne{filteredPeople.length > 1 ? 's' : ''} trouvée{filteredPeople.length > 1 ? 's' : ''}
            </p>
          </div>
          {propertyInfo && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#529D21]/10 to-[#F5A623]/10 px-4 py-2 rounded-xl">
              <Home size={16} className="text-[#529D21]" />
              <span className="text-sm font-medium text-gray-700">{propertyInfo.name}</span>
              <span className="text-xs text-gray-500">- {propertyInfo.address}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone ou entreprise..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#529D21]/20 focus:border-[#529D21] transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="w-full sm:w-44 flex items-center justify-between gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:border-[#529D21] hover:bg-gray-50 transition-all">
                <span>{itemsPerPage} lignes</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-fadeIn">
                  {['5', '10', '25', '50', '100'].map((n) => (
                    <button key={n} onClick={() => { setItemsPerPage(n); setShowDropdown(false); setCurrentPage(1); }} className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${itemsPerPage === n ? 'bg-[#529D21]/10 text-[#529D21] font-medium' : ''}`}>
                      {n} lignes
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau simplifié - sans colonne Rôle */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-slideUp">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Personne</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Téléphone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPeople.length > 0 ? (
                paginatedPeople.map((person, index) => {
                  let avatarGradient = 'from-green-500 to-green-600';
                  let avatarIcon = <User size={20} />;
                  if (person.role.includes('Créateur')) { avatarGradient = 'from-purple-500 to-purple-700'; avatarIcon = <Crown size={20} />; }
                  else if (person.role.includes('foncier')) { avatarGradient = 'from-blue-500 to-blue-700'; avatarIcon = <Building size={20} />; }
                  else if (person.role.includes('Agence')) { avatarGradient = 'from-orange-500 to-orange-700'; avatarIcon = <Briefcase size={20} />; }
                  return (
                    <tr key={person.id + index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                            {person.avatar ? <span className="font-bold text-lg">{person.avatar}</span> : avatarIcon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{person.prenom} {person.nom}</span>
                              {person.is_creator && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Créateur</span>}
                            </div>
                            {person.company_name && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Briefcase size={12} />{person.company_name}</p>
                            )}
                            {person.permissions && person.permissions.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {person.permissions.slice(0, 2).map((perm, idx) => (
                                  <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPermissionColor(perm)}`}>{perm}</span>
                                ))}
                                {person.permissions.length > 2 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">+{person.permissions.length - 2}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#529D21] font-medium flex items-center gap-1"><Phone size={14} className="text-gray-400" />{person.telephone}</span>
                        <button onClick={() => copyToClipboard(person.telephone, `phone-${person.id}`)} className="text-xs text-gray-400 hover:text-[#529D21] mt-1 flex items-center gap-1"><Copy size={10} />Copier</button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#529D21] font-medium flex items-center gap-1"><Mail size={14} className="text-gray-400" /><span className="truncate max-w-[150px]">{person.email}</span></span>
                        <button onClick={() => copyToClipboard(person.email, `email-${person.id}`)} className="text-xs text-gray-400 hover:text-[#529D21] mt-1 flex items-center gap-1"><Copy size={10} />Copier</button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openModal(person)} className="p-2.5 bg-gradient-to-r from-[#529D21]/10 to-[#F5A623]/10 rounded-xl hover:from-[#529D21]/20 hover:to-[#F5A623]/20 transition-all" title="Voir les détails">
                            <Eye size={18} className="text-gray-600 hover:text-[#529D21] transition-colors" />
                          </button>
                          <a href={`mailto:${person.email}`} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors" title="Envoyer un email">
                            <Mail size={18} className="text-gray-400 hover:text-[#529D21]" />
                          </a>
                          <a href={`tel:${person.telephone}`} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors" title="Appeler">
                            <Phone size={18} className="text-gray-400 hover:text-[#529D21]" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Users size={32} className="text-gray-400" /></div>
                      <p className="text-gray-500 font-medium">Aucune personne trouvée</p>
                      <p className="text-sm text-gray-400 mt-1">Essayez de modifier votre recherche</p>
                      <button onClick={() => { setSearchTerm(''); }} className="mt-4 px-4 py-2 bg-[#529D21] text-white rounded-lg hover:bg-[#529D21]/90 transition-colors">
                        Réinitialiser la recherche
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredPeople.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Affichage de <span className="font-medium">{(currentPage - 1) * parseInt(itemsPerPage) + 1}</span> à{' '}
              <span className="font-medium">{Math.min(currentPage * parseInt(itemsPerPage), filteredPeople.length)}</span>{' '}
              sur <span className="font-medium">{filteredPeople.length}</span> résultats
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:bg-white disabled:cursor-not-allowed transition-colors"><ChevronsLeft size={16} /></button>
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:bg-white disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
              <span className="px-4 py-2 bg-[#529D21] text-white rounded-lg font-medium">{currentPage} / {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:bg-white disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:bg-white disabled:cursor-not-allowed transition-colors"><ChevronsRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {allPeople.length === 0 && !error && (
        <div className="mt-6 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><Info size={32} className="text-yellow-600" /></div>
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">Aucune information disponible</h3>
          <p className="text-yellow-600 max-w-md mx-auto">Aucun intervenant n'est associé à votre location pour le moment.</p>
        </div>
      )}
    </div>
  );
};