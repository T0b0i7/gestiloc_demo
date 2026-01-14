import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Plus, Mail, Phone, MapPin, AlertCircle, Shield, Eye, UserPlus, MoreVertical, CheckCircle, Ban } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'landlord' | 'tenant' | 'manager';
  status: 'active' | 'inactive' | 'suspended';
  location: string;
  joined_date: string;
  last_active: string;
  properties_count?: number;
  leases_count?: number;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '+229 90 00 00 01',
      role: 'admin',
      status: 'active',
      location: 'Cotonou',
      joined_date: '2023-06-15',
      last_active: '2024-01-15T10:30:00',
      properties_count: 0,
    },
    {
      id: '2',
      name: 'Marie Leblanc',
      email: 'marie.leblanc@example.com',
      phone: '+229 90 00 00 02',
      role: 'landlord',
      status: 'active',
      location: 'Abomey-Calavi',
      joined_date: '2023-08-20',
      last_active: '2024-01-14T15:45:00',
      properties_count: 5,
    },
    {
      id: '3',
      name: 'Marc Leroy',
      email: 'marc.leroy@example.com',
      phone: '+229 90 00 00 03',
      role: 'tenant',
      status: 'active',
      location: 'Porto-Novo',
      joined_date: '2023-09-10',
      last_active: '2024-01-15T08:20:00',
      leases_count: 2,
    },
    {
      id: '4',
      name: 'Alice Dupont',
      email: 'alice.dupont@example.com',
      phone: '+229 90 00 00 04',
      role: 'tenant',
      status: 'active',
      location: 'Parakou',
      joined_date: '2023-10-05',
      last_active: '2024-01-13T12:15:00',
      leases_count: 1,
    },
    {
      id: '5',
      name: 'Paul Moreau',
      email: 'paul.moreau@example.com',
      phone: '+229 90 00 00 05',
      role: 'landlord',
      status: 'inactive',
      location: 'Cotonou',
      joined_date: '2023-07-25',
      last_active: '2023-12-20T10:00:00',
      properties_count: 3,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState('joined_date_desc');

  // État pour le nouvel utilisateur
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'tenant' as 'admin' | 'landlord' | 'tenant' | 'manager',
    location: '',
  });

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrateur',
      landlord: 'Propriétaire',
      tenant: 'Locataire',
      manager: 'Gestionnaire',
    };
    return labels[role as keyof typeof labels];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-50 text-red-700 border-red-200',
      landlord: 'bg-blue-50 text-blue-700 border-blue-200',
      tenant: 'bg-green-50 text-green-700 border-green-200',
      manager: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return colors[role as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'text-green-600 bg-green-50';
    if (status === 'inactive') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredUsers = users
    .filter(user => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchTerm)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'joined_date_asc':
          return new Date(a.joined_date).getTime() - new Date(b.joined_date).getTime();
        case 'joined_date_desc':
          return new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const handleDeactivate = (id: string) => {
    if (!window.confirm('Désactiver cet utilisateur?')) return;
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: 'inactive' as const } : u
    ));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;
    setUsers(users.filter(u => u.id !== id));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: 'active' as const,
      location: newUser.location,
      joined_date: new Date().toISOString().split('T')[0],
      last_active: new Date().toISOString(),
      avatarUrl: `https://picsum.photos/100/100?random=${Date.now()}`,
    } as User;

    setUsers([user, ...users]);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'tenant',
      location: '',
    });
    setShowAddModal(false);
    alert('Utilisateur ajouté avec succès!');
  };

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(u => u.status === 'active').length;
  const adminCount = filteredUsers.filter(u => u.role === 'admin').length;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-in-out;
        }
      `}</style>

      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-500 mt-1">Gérez tous les utilisateurs de la plateforme</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <UserPlus size={20} />
            Nouvel Utilisateur
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <Mail size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wider">Utilisateurs Actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeUsers}</p>
              </div>
              <div className="bg-green-600 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-semibold uppercase tracking-wider">Administrateurs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{adminCount}</p>
              </div>
              <div className="bg-red-600 text-white p-3 rounded-lg">
                <Shield size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Chercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Rôle */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="landlord">Propriétaire</option>
              <option value="tenant">Locataire</option>
              <option value="manager">Gestionnaire</option>
            </select>

            {/* Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">✅ Actifs</option>
              <option value="inactive">⏸️ Inactifs</option>
              <option value="suspended">🚫 Suspendus</option>
            </select>
          </div>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
          >
            <option value="joined_date_desc">Plus récemment inscrits</option>
            <option value="joined_date_asc">Plus anciennement inscrits</option>
            <option value="name_asc">Nom (A-Z)</option>
            <option value="name_desc">Nom (Z-A)</option>
          </select>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Localisation</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Inscrit</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
                      <p className="text-gray-500 text-lg font-medium">Aucun utilisateur trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {user.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                          {user.status === 'active' && '✓ Actif'}
                          {user.status === 'inactive' && '○ Inactif'}
                          {user.status === 'suspended' && '✕ Suspendu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.joined_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-2 rounded-lg transition-all"
                            title="Éditer"
                          >
                            <Edit2 size={16} />
                          </button>
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 p-2 rounded-lg transition-all"
                              title="Désactiver"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all animate-slideUp">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{getRoleLabel(selectedUser.role)}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">Email</label>
                    <p className="text-lg font-bold text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <label className="text-xs font-bold text-green-600 uppercase tracking-wider block mb-2">Téléphone</label>
                    <p className="text-lg font-bold text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <label className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-2">Localisation</label>
                    <p className="text-lg font-bold text-gray-900">{selectedUser.location}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <label className="text-xs font-bold text-orange-600 uppercase tracking-wider block mb-2">Rôle</label>
                    <p className="text-lg font-bold text-gray-900">{getRoleLabel(selectedUser.role)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">Statut</label>
                    <p className={`text-lg font-bold ${selectedUser.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedUser.status === 'active' ? '✓ Actif' : '○ Inactif'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Inscrit le</label>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(selectedUser.joined_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
                >
                  Fermer
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
                  <Edit2 size={18} />
                  Éditer
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Modal Ajouter Nouvel Utilisateur */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
              {/* Header Modal */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Nouvel Utilisateur</h2>
                  <p className="text-sm text-gray-600 mt-1">Ajouter un nouvel utilisateur à la plateforme</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
  
              {/* Content Modal */}
              <div className="p-6 space-y-6">
                {/* Formulaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom complet */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom Complet *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Ex: jean.dupont@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
  
                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Ex: +229 90 00 00 01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
  
                  {/* Rôle */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rôle</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                    >
                      <option value="tenant">Locataire</option>
                      <option value="landlord">Propriétaire</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
  
                  {/* Localisation */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Localisation</label>
                    <input
                      type="text"
                      value={newUser.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Ex: Cotonou"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
  
              {/* Footer Modal */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <UserPlus size={18} />
                  Ajouter l'Utilisateur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
    );
  }