import React, { useEffect, useState, useMemo } from 'react';
import { FileText, DollarSign, Download, Calendar, Search, Plus } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi, type CoOwnerRentReceipt } from '@/services/coOwnerApi';

interface RentReceiptsListProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const RentReceiptsList: React.FC<RentReceiptsListProps> = ({ onNavigate, notify }) => {
  const [receipts, setReceipts] = useState<CoOwnerRentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await coOwnerApi.getRentReceipts();
      setReceipts(data);
    } catch (error: any) {
      console.error('Error fetching rent receipts:', error);
      notify('Erreur lors du chargement des quittances', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchesSearch = 
        receipt.paid_month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.lease?.tenant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.lease?.tenant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const handleGenerateReceipt = async (leaseId: number, month: string) => {
    try {
      await coOwnerApi.generateRentReceipt(leaseId, month);
      notify('Quittance générée avec succès', 'success');
    } catch (error: any) {
      console.error('Error generating receipt:', error);
      notify('Erreur lors de la génération de la quittance', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quittances</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">Quittances</h1>
        <Button onClick={() => onNavigate('receipts/generate')}>
          <Plus className="w-4 h-4 mr-2" />
          Générer une quittance
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une quittance..."
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
            <option value="paid">Payées</option>
            <option value="pending">En attente</option>
            <option value="overdue">En retard</option>
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
              <p className="text-xl font-bold text-gray-900">{receipts.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-xl font-bold text-gray-900">
                {receipts.reduce((sum, r) => sum + (parseFloat(r.amount_paid) || 0), 0).toFixed(2)} €
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Receipts Grid */}
      {filteredReceipts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune quittance trouvée
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Aucune quittance ne correspond à votre recherche.' : 'Aucune quittance trouvée pour les propriétés déléguées.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quittance {receipt.paid_month}
                    </h3>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(receipt.status)}`}>
                      {getStatusLabel(receipt.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/api/receipts/${receipt.id}/pdf`, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Quittance #{receipt.id}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Montant: {receipt.amount_paid} €
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Émise: {new Date(receipt.issued_date).toLocaleDateString('fr-FR')}
                  </div>
                  
                  {receipt.payment_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Payée: {new Date(receipt.payment_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Propriété: {receipt.property?.name || 'Bien #' + (receipt as any).property_id}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Locataire: {receipt.lease?.tenant?.first_name} {receipt.lease?.tenant?.last_name}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
