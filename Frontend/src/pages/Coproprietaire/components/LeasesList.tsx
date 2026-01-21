import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Home, Users, Calendar, DollarSign, Edit, Plus } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi, type CoOwnerLease } from '@/services/coOwnerApi';

interface LeasesListProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const LeasesList: React.FC<LeasesListProps> = ({ onNavigate, notify }) => {
  const [leases, setLeases] = useState<CoOwnerLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getLeases();
      setLeases(data);
    } catch (error: any) {
      console.error('Error fetching leases:', error);
      notify('Erreur lors du chargement des baux', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const filteredLeases = useMemo(() => {
    return leases.filter(lease => {
      const matchesSearch = 
        lease.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.tenant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.tenant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.tenant?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leases, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'expired': return 'Expiré';
      case 'terminated': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const handleTerminateLease = async (leaseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir résilier ce bail ?')) {
      return;
    }

    try {
      await coOwnerApi.terminateLease(leaseId, new Date().toISOString().split('T')[0]);
      setLeases(leases.map(l => 
        l.id === leaseId ? { ...l, status: 'terminated' } : l
      ));
      notify('Bail résilié avec succès', 'success');
    } catch (error: any) {
      console.error('Error terminating lease:', error);
      notify('Erreur lors de la résiliation du bail', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Baux</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">Baux</h1>
        <Button onClick={() => onNavigate('leases/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau bail
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1 p-4">
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un bail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="expired">Expirés</option>
            <option value="terminated">Terminés</option>
          </select>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{leases.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-xl font-bold text-gray-900">
                {leases.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leases Grid */}
      {filteredLeases.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun bail trouvé
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Aucun bail ne correspond à votre recherche.' : 'Aucun bail trouvé pour les propriétés déléguées.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => (
            <Card key={lease.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bail #{lease.id}
                    </h3>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(lease.status)}`}>
                      {getStatusLabel(lease.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate(`leases/${lease.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {lease.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTerminateLease(lease.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Home className="w-4 h-4 mr-2" />
                    {lease.property?.name || 'Propriété #' + lease.property_id}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {lease.tenant?.first_name} {lease.tenant?.last_name}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {lease.rent_amount} €/mois
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Début: {new Date(lease.start_date).toLocaleDateString('fr-FR')}
                  </div>
                  
                  {lease.end_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fin: {new Date(lease.end_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
