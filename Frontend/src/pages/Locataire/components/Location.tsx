import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  Building, 
  User, 
  DollarSign, 
  Clock, 
  MoreHorizontal, 
  X, 
  UserPlus, 
  Loader,
  Filter,
  MapPin,
  Calendar,
  Home,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Info
} from 'lucide-react';
import api from '@/services/api';

interface LocationProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Location {
  id: number;
  property: {
    id: number;
    name: string;
    address: string;
    city?: string;
  };
  landlord: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  rent_amount: number;
  charges_amount?: number;
  balance: number;
  start_date: string;
  end_date: string | null;
  status: string;
  guarantee_deposit?: number;
}

export const Location: React.FC<LocationProps> = ({ notify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    nom: '',
    message: `Bonjour,

Je voudrais vous faire découvrir Gestiloc, une plateforme de gestion locative.

Vous pouvez créer votre compte gratuitement et gérer votre bien en ligne.

Cordialement`
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tenant/my-leases');
      setLocations(response.data);
    } catch (error) {
      console.error('Erreur chargement locations:', error);
      notify?.('Erreur lors du chargement des locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteForm.email || !inviteForm.nom) {
      notify?.('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setSendingInvite(true);
    try {
      const response = await api.post('/tenant/invite-landlord', {
        email: inviteForm.email,
        name: inviteForm.nom,
        message: inviteForm.message
      });

      if (response.data.success) {
        notify?.('Invitation envoyée avec succès !', 'success');
        setShowInviteModal(false);
        setInviteForm({
          email: '',
          nom: '',
          message: `Bonjour,

Je voudrais vous faire découvrir Gestiloc, une plateforme de gestion locative.

Vous pouvez créer votre compte gratuitement et gérer votre bien en ligne.

Cordialement`
        });
      } else {
        notify?.(response.data.message || "Erreur lors de l'envoi", 'error');
      }
    } catch (error: any) {
      console.error('Erreur envoi invitation:', error);
      notify?.(error.response?.data?.message || "Erreur lors de l'envoi de l'invitation", 'error');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const calculateDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) return 'En cours';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mois` : ''}`;
    }
    return `${diffMonths} mois`;
  };

  // Filtrage et tri
  const filteredLocations = locations
    .filter(loc => {
      const matchesSearch = 
        loc.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.landlord.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.property.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'active') return matchesSearch && loc.status === 'active';
      if (filterStatus === 'terminated') return matchesSearch && loc.status === 'terminated';
      if (filterStatus === 'late') return matchesSearch && loc.balance > 0;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField as keyof Location];
      let bValue: any = b[sortField as keyof Location];
      
      if (sortField === 'property') aValue = a.property.name;
      if (sortField === 'landlord') aValue = a.landlord.name;
      if (sortField === 'rent_amount') aValue = a.rent_amount;
      if (sortField === 'balance') aValue = a.balance;
      
      if (sortField === 'property') bValue = b.property.name;
      if (sortField === 'landlord') bValue = b.landlord.name;
      if (sortField === 'rent_amount') bValue = b.rent_amount;
      if (sortField === 'balance') bValue = b.balance;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredLocations.length / rowsPerPage);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
  };

  const getStatusBadge = (status: string, balance: number) => {
    if (balance > 0) {
      return {
        label: 'En retard',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertCircle size={14} className="text-red-600" />
      };
    }
    if (status === 'active') {
      return {
        label: 'Actif',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle size={14} className="text-green-600" />
      };
    }
    if (status === 'terminated') {
      return {
        label: 'Terminé',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <Clock size={14} className="text-gray-600" />
      };
    }
    return {
      label: status,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Info size={14} className="text-gray-600" />
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="w-6 h-6 text-green-700 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Chargement de vos locations...</p>
          <p className="text-sm text-gray-400 mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Modal Invitation */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !sendingInvite && setShowInviteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 text-white px-6 py-4 flex items-center justify-between"
              style={{ backgroundColor: "#70AE48" }}>
              <h2 className="text-xl font-semibold text-white">
                Inviter votre propriétaire
              </h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                disabled={sendingInvite}
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Information</span>
                  <br />
                  Faites découvrir Gestiloc à votre bailleur en lui envoyant une invitation par email.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email du bailleur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="email@exemple.com"
                    disabled={sendingInvite}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du bailleur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteForm.nom}
                    onChange={(e) => setInviteForm({...inviteForm, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Nom du propriétaire"
                    disabled={sendingInvite}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                    disabled={sendingInvite}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={sendingInvite}
              >
                Annuler
              </button>
              <button
                onClick={handleSendInvite}
                disabled={sendingInvite}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingInvite && <Loader size={16} className="animate-spin" />}
                {sendingInvite ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 animate-slideDown">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              Filtrer mes locations
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredLocations.length} location{filteredLocations.length > 1 ? 's' : ''} trouvée{filteredLocations.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
          >
            <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
            Inviter un propriétaire
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                <Home size={20} />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Total locations</p>
                <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {locations.filter(l => l.status === 'active' && l.balance === 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200 hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-yellow-600 font-medium">En cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {locations.filter(l => l.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200 hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium">En retard</p>
                <p className="text-2xl font-bold text-gray-900">
                  {locations.filter(l => l.balance > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:w-48">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            >
              <option value={10}>10 lignes</option>
              <option value={25}>25 lignes</option>
              <option value={50}>50 lignes</option>
              <option value={100}>100 lignes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un bien ou un propriétaire..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="late">En retard</option>
              <option value="terminated">Terminés</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Table Section - Sans bouton Voir */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-slideUp">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600 transition-colors"
                  onClick={() => handleSort('property')}
                >
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-gray-500" />
                    Bien
                    {sortField === 'property' && (
                      <span className="text-green-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600 transition-colors"
                  onClick={() => handleSort('landlord')}
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    Propriétaire
                    {sortField === 'landlord' && (
                      <span className="text-green-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600 transition-colors"
                  onClick={() => handleSort('rent_amount')}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-500" />
                    Loyer
                    {sortField === 'rent_amount' && (
                      <span className="text-green-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600 transition-colors"
                  onClick={() => handleSort('balance')}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    Solde
                    {sortField === 'balance' && (
                      <span className="text-green-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    Durée
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLocations.length > 0 ? (
                paginatedLocations.map((location, index) => {
                  const status = getStatusBadge(location.status, location.balance);
                  return (
                    <tr 
                      key={location.id} 
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                            <Building size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{location.property.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {location.property.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{location.landlord.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail size={10} />
                            {location.landlord.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{formatMoney(location.rent_amount)}</p>
                        {location.charges_amount && location.charges_amount > 0 && (
                          <p className="text-xs text-gray-500">dont {formatMoney(location.charges_amount)} de charges</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 border ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                          {location.balance > 0 && (
                            <span className="text-xs font-medium text-red-600">
                              {formatMoney(location.balance)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{calculateDuration(location.start_date, location.end_date)}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(location.start_date).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Building size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Aucune location trouvée</p>
                      <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos filtres de recherche</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterStatus('all');
                        }}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLocations.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Affichage <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> à{' '}
              <span className="font-medium">
                {Math.min(currentPage * rowsPerPage, filteredLocations.length)}
              </span>{' '}
              sur <span className="font-medium">{filteredLocations.length}</span> résultats
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Location;