import React, { useEffect, useState, useMemo } from 'react';
import { Building, Users, Mail, Phone, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi, type CoOwnerTenant } from '@/services/coOwnerApi';

interface TenantsListProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const TenantsList: React.FC<TenantsListProps> = ({ onNavigate, notify }) => {
  const [tenants, setTenants] = useState<CoOwnerTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getTenants();
      setTenants(data);
    } catch (error: any) {
      console.error('Error fetching tenants:', error);
      notify('Erreur lors du chargement des locataires', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant => 
      tenant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  const handleDelete = async (tenantId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?')) {
      return;
    }

    try {
      await coOwnerApi.deleteTenant(tenantId);
      setTenants(tenants.filter(t => t.id !== tenantId));
      notify('Locataire supprimé avec succès', 'success');
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      notify('Erreur lors de la suppression du locataire', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Locataires</h1>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un locataire
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Locataires</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un locataire
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un locataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{tenants.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tenants Grid */}
      {filteredTenants.length === 0 ? (
        <Card className="p-12 text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun locataire trouvé
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Aucun locataire ne correspond à votre recherche.' : 'Commencez par ajouter votre premier locataire.'}
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un locataire
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tenant.first_name} {tenant.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{tenant.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate(`tenants/${tenant.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tenant.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {tenant.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {tenant.phone}
                    </div>
                  )}
                  {tenant.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {tenant.address}
                    </div>
                  )}
                  {tenant.id_number && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      N° {tenant.id_number}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Tenant Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un locataire</h3>
              <p className="text-gray-600 mb-6">
                Fonctionnalité à implémenter...
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setShowAddModal(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
