import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Download, Search, Filter, Plus, Eye, Edit, Trash2, Calendar, Building, User, FileSignature, FileCheck, Home } from 'lucide-react';
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
  uniqueKey: string; // Ajout de la clé unique
  name: string;
  type: 'lease' | 'receipt' | 'notice' | 'contract' | 'other';
  file_path: string;
  file_size: number;
  created_at: string;
  property?: {
    id: number;
    name: string;
  };
  tenant?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export const CoOwnerDocuments: React.FC<DocumentsProps> = ({ onNavigate, notify }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lease' | 'receipt' | 'notice' | 'contract' | 'other'>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données depuis différentes sources
      const [leases, receipts, notices] = await Promise.all([
        coOwnerApi.getLeases(),
        coOwnerApi.getRentReceipts(),
        coOwnerApi.getNotices()
      ]);

      // Transformer en documents unifiés
      const documentsList: Document[] = [
        ...leases.map(lease => ({
          id: lease.id,
          uniqueKey: `lease-${lease.id}`, // Clé unique
          name: `Bail - ${lease.property?.name || 'Bien #' + lease.property_id}`,
          type: 'lease' as const,
          file_path: `/api/leases/${lease.id}/pdf`,
          file_size: 0,
          created_at: lease.created_at,
          property: lease.property,
          tenant: lease.tenant
        })),
        ...receipts.map(receipt => ({
          id: receipt.id,
          uniqueKey: `receipt-${receipt.id}`, // Clé unique
          name: `Quittance - ${receipt.paid_month}`,
          type: 'receipt' as const,
          file_path: `/api/receipts/${receipt.id}/pdf`,
          file_size: 0,
          created_at: receipt.created_at,
          property: receipt.property,
          tenant: receipt.lease?.tenant
        })),
        ...notices.map(notice => ({
          id: notice.id,
          uniqueKey: `notice-${notice.id}`, // Clé unique
          name: `Notification - ${notice.title}`,
          type: 'notice' as const,
          file_path: `/api/notices/${notice.id}/pdf`,
          file_size: 0,
          created_at: notice.created_at,
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

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tenant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tenant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || doc.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, typeFilter]);

  const handleDownload = (document: Document) => {
    window.open(document.file_path, '_blank');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lease': return FileSignature;
      case 'receipt': return FileCheck;
      case 'notice': return FileText;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lease': return 'Bail';
      case 'receipt': return 'Quittance';
      case 'notice': return 'Notification';
      case 'contract': return 'Contrat';
      default: return 'Autre';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lease': return 'bg-blue-100 text-blue-800';
      case 'receipt': return 'bg-green-100 text-green-800';
      case 'notice': return 'bg-yellow-100 text-yellow-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un document
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
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <Button onClick={() => onNavigate('baux')}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <FileSignature className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Baux</p>
              <p className="text-xl font-bold text-gray-900">
                {documents.filter(d => d.type === 'lease').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <FileCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quittances</p>
              <p className="text-xl font-bold text-gray-900">
                {documents.filter(d => d.type === 'receipt').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Notifications</p>
              <p className="text-xl font-bold text-gray-900">
                {documents.filter(d => d.type === 'notice').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="lease">Baux</option>
              <option value="receipt">Quittances</option>
              <option value="notice">Notifications</option>
              <option value="contract">Contrats</option>
              <option value="other">Autres</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Aucun document ne correspond à votre recherche.' : 'Aucun document disponible.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => {
            const Icon = getTypeIcon(document.type);
            return (
              <Card key={document.uniqueKey} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {document.name}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(document.type)}`}>
                      {getTypeLabel(document.type)}
                    </div>

                    {document.property && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {document.property.name}
                        </span>
                      </div>
                    )}

                    {document.tenant && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {document.tenant.first_name} {document.tenant.last_name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(document.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {document.file_size > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{formatFileSize(document.file_size)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
