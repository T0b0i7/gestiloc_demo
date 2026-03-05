import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Download, Search, Filter, Plus, Eye, Edit, Trash2, Calendar, Building, User, FileSignature, FileCheck, Home, MapPin } from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';
import { coOwnerApi } from '@/services/coOwnerApi';

interface DocumentsProps {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

interface Document {
  id: number;
  uniqueKey: string;
  name: string;
  type: 'lease' | 'receipt' | 'notice' | 'contract' | 'other' | 'inventory';
  subType?: 'entry' | 'exit';
  file_path: string;
  file_size: number;
  created_at: string;
  archived_at?: string;
  property?: {
    id: number;
    name: string;
  };
  tenant?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  metadata?: {
    startDate?: string;
    endDate?: string;
    duration?: string;
    monthlyRent?: number;
    visitDate?: string;
    generalState?: string;
    deposit?: number;
    period?: string;
    count?: number;
    total?: number;
    company?: string;
    files?: number;
    premium?: number;
  };
}

export const CoOwnerDocuments: React.FC<DocumentsProps> = ({ onNavigate, notify }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lease' | 'inventory' | 'receipt' | 'other'>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const [leases, receipts, notices, inventories] = await Promise.all([
        coOwnerApi.getLeases(),
        coOwnerApi.getRentReceipts(),
        coOwnerApi.getNotices(),
        coOwnerApi.getInventories?.() || Promise.resolve([])
      ]);

      const documentsList: Document[] = [
        ...leases.map(lease => ({
          id: lease.id,
          uniqueKey: `lease-${lease.id}`,
          name: `Contrat de bail - ${lease.tenant?.first_name || ''} ${lease.tenant?.last_name || ''}`,
          type: 'lease' as const,
          file_path: `/api/leases/${lease.id}/pdf`,
          file_size: lease.file_size || 0,
          created_at: lease.created_at,
          archived_at: lease.end_date || lease.updated_at,
          property: lease.property,
          tenant: lease.tenant,
          metadata: {
            startDate: lease.start_date,
            endDate: lease.end_date,
            duration: lease.duration,
            monthlyRent: lease.monthly_rent
          }
        })),
        ...receipts.map(receipt => ({
          id: receipt.id,
          uniqueKey: `receipt-${receipt.id}`,
          name: `Quittances annuelles ${receipt.year || receipt.paid_month?.split('-')[0]}`,
          type: 'receipt' as const,
          file_path: `/api/receipts/${receipt.id}/pdf`,
          file_size: receipt.file_size || 0,
          created_at: receipt.created_at,
          archived_at: receipt.created_at,
          property: receipt.property,
          tenant: receipt.lease?.tenant,
          metadata: {
            period: receipt.year || receipt.paid_month,
            count: receipt.count || 1,
            total: receipt.total_amount
          }
        })),
        ...inventories.map((inventory: any) => ({
          id: inventory.id,
          uniqueKey: `inventory-${inventory.id}`,
          name: `État des lieux ${inventory.type === 'entry' ? 'entrée' : 'sortie'} - ${inventory.tenant?.first_name || ''} ${inventory.tenant?.last_name || ''}`,
          type: 'inventory' as const,
          subType: inventory.type,
          file_path: `/api/inventories/${inventory.id}/pdf`,
          file_size: inventory.file_size || 0,
          created_at: inventory.created_at,
          archived_at: inventory.date || inventory.updated_at,
          property: inventory.property,
          tenant: inventory.tenant,
          metadata: {
            visitDate: inventory.date,
            generalState: inventory.general_state,
            deposit: inventory.deposit_amount || 0
          }
        })),
        ...notices.map(notice => ({
          id: notice.id,
          uniqueKey: `notice-${notice.id}`,
          name: notice.title,
          type: 'other' as const,
          file_path: `/api/notices/${notice.id}/pdf`,
          file_size: notice.file_size || 0,
          created_at: notice.created_at,
          archived_at: notice.created_at,
          property: notice.property,
          tenant: notice.tenant
        }))
      ];

      setDocuments(documentsList);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      notify('Erreur lors du chargement des documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = documents.length;
    const leases = documents.filter(d => d.type === 'lease').length;
    const inventories = documents.filter(d => d.type === 'inventory').length;
    const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
    
    const sizeInGB = totalSize > 0 
      ? (totalSize / (1024 * 1024 * 1024)).toFixed(1) 
      : '0';
    
    return {
      total,
      leases,
      inventories,
      usedSpace: `${sizeInGB} GB`
    };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tenant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tenant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      
      const matchesYear = yearFilter === 'all' || 
        (doc.archived_at && new Date(doc.archived_at).getFullYear().toString() === yearFilter);
      
      const matchesProperty = propertyFilter === 'all' || 
        doc.property?.id.toString() === propertyFilter;

      return matchesSearch && matchesType && matchesYear && matchesProperty;
    });
  }, [documents, searchTerm, typeFilter, yearFilter, propertyFilter]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    documents.forEach(doc => {
      if (doc.archived_at) {
        years.add(new Date(doc.archived_at).getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [documents]);

  const availableProperties = useMemo(() => {
    const props = new Map();
    documents.forEach(doc => {
      if (doc.property && !props.has(doc.property.id)) {
        props.set(doc.property.id, doc.property);
      }
    });
    return Array.from(props.values());
  }, [documents]);

  const handleDownload = (document: Document) => {
    window.open(document.file_path, '_blank');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Archivage de documents</h1>
            <p className="text-gray-600 mt-2">Retrouvez tous vos documents archivés : anciens baux, états des lieux terminés, quittances passées. Gardez un historique complet de votre gestion locative.</p>
          </div>
          <button className="bg-[#70AE48] hover:bg-[#5d8f3a] text-white px-6 py-3 rounded-full flex items-center gap-2 font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Ajouter un document
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-full" />
          ))}
        </div>

        <Card className="p-6">
          <Skeleton className="h-20 w-full" />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Archivage de documents</h1>
          <p className="text-gray-600">
            Retrouvez tous vos documents archivés : anciens baux, états des lieux terminés, quittances passées.
            Gardez un historique complet de votre gestion locative.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Documents archivés</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Baux terminés</p>
          <p className="text-3xl font-bold text-gray-900">{stats.leases}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">EDL archivés</p>
          <p className="text-3xl font-bold text-gray-900">{stats.inventories}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Espace utilisé</p>
          <p className="text-3xl font-bold text-gray-900">{stats.usedSpace}</p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
            typeFilter === 'all'
              ? 'bg-[#70AE48] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setTypeFilter('lease')}
          className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
            typeFilter === 'lease'
              ? 'bg-[#70AE48] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Contrat de bails
        </button>
        <button
          onClick={() => setTypeFilter('inventory')}
          className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
            typeFilter === 'inventory'
              ? 'bg-[#70AE48] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Etats des lieux
        </button>
        <button
          onClick={() => setTypeFilter('receipt')}
          className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
            typeFilter === 'receipt'
              ? 'bg-[#70AE48] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Quittances
        </button>
        <button
          onClick={() => setTypeFilter('other')}
          className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
            typeFilter === 'other'
              ? 'bg-[#70AE48] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Autres documents
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Filtre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <select 
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#70AE48] focus:border-transparent"
            >
              <option value="all">Tous les biens</option>
              {availableProperties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#70AE48] focus:border-transparent"
            >
              <option value="all">Toutes les années</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70AE48] focus:border-transparent"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Aucun document ne correspond à votre recherche.' : 'Aucun document disponible.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => {
            const isLease = document.type === 'lease';
            const isReceipt = document.type === 'receipt';
            const isInventory = document.type === 'inventory';
            const isInsurance = document.name.toLowerCase().includes('assurance');
            
            return (
              <div key={document.uniqueKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Badge */}
                  <div className="mb-4">
                    {isLease && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                        BAIL TERMINÉ
                      </span>
                    )}
                    {isInventory && document.subType === 'exit' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <span className="mr-1">🏠</span>
                        EDL SORTIE
                      </span>
                    )}
                    {isInventory && document.subType === 'entry' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <span className="mr-1">🏠</span>
                        EDL ENTRÉE
                      </span>
                    )}
                    {isReceipt && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                        QUITTANCES {document.metadata?.period}
                      </span>
                    )}
                    {isInsurance && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <span className="mr-1">📋</span>
                        ASSURANCE {document.metadata?.period}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    {document.name}
                  </h3>

                  {/* Property Location */}
                  {document.property && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 text-[#70AE48]" />
                      <span className="text-sm">{document.property.name}</span>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {isLease && document.metadata && (
                      <>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Début bail</p>
                          <p className="font-medium text-gray-900">{formatDate(document.metadata.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Fin bail</p>
                          <p className="font-medium text-gray-900">{formatDate(document.metadata.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Durée</p>
                          <p className="font-medium text-gray-900">{document.metadata.duration || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Loyer mensuel</p>
                          <p className="font-medium text-gray-900">{formatCurrency(document.metadata.monthlyRent)}</p>
                        </div>
                      </>
                    )}
                    
                    {isInventory && document.metadata && (
                      <>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Date visite</p>
                          <p className="font-medium text-gray-900">{formatDate(document.metadata.visitDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Type</p>
                          <p className="font-medium text-gray-900">{document.subType === 'entry' ? 'Entrée' : 'Sortie'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">État général</p>
                          <p className="font-medium text-gray-900">{document.metadata.generalState || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Retenue caution</p>
                          <p className="font-medium text-gray-900">{formatCurrency(document.metadata.deposit)}</p>
                        </div>
                      </>
                    )}

                    {isReceipt && document.metadata && (
                      <>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Période</p>
                          <p className="font-medium text-gray-900">Année {document.metadata.period}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Nombre</p>
                          <p className="font-medium text-gray-900">{document.metadata.count} quittances</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Total encaissé</p>
                          <p className="font-medium text-gray-900">{formatCurrency(document.metadata.total)}</p>
                        </div>
                      </>
                    )}

                    {isInsurance && document.metadata && (
                      <>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Période</p>
                          <p className="font-medium text-gray-900">Année {document.metadata.period}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Compagnie</p>
                          <p className="font-medium text-gray-900">{document.metadata.company || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Documents</p>
                          <p className="font-medium text-gray-900">{document.metadata.files} fichiers</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Prime</p>
                          <p className="font-medium text-gray-900">{formatCurrency(document.metadata.premium)}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Archivé le {formatDate(document.archived_at || document.created_at)}
                    </span>
                    <button
                      onClick={() => handleDownload(document)}
                      className="p-2 text-[#70AE48] hover:bg-[#70AE48]/10 rounded-full transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};