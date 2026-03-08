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
  file_size: string | number;
  created_at?: string;
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
    period?: string | number;
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
      console.warn('Error fetching documents (silenced):', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = documents.length;
    const leases = documents.filter(d => d.type === 'lease').length;
    const inventories = documents.filter(d => d.type === 'inventory').length;
    const totalSize = documents.reduce((acc, doc) => acc + Number(doc.file_size || 0), 0);

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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '-';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    const n = Number(amount ?? 0);
    return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n) + " FCFA";
  };

  if (loading) {
    return (
      <div className="space-y-8 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-4 w-64 bg-gray-50 rounded-lg animate-pulse" />
          </div>
          <div className="h-14 w-40 bg-gray-100 rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-8 rounded-[2rem] border-gray-100 shadow-xl shadow-green-900/5 bg-white relative overflow-hidden">
              <div className="h-4 w-24 bg-gray-100 rounded-lg animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-50 rounded-lg animate-pulse" />
            </Card>
          ))}
        </div>

        <div className="h-40 w-full bg-gray-100/50 rounded-[3rem] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-merriweather tracking-tight">
            Documents Archivés
          </h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">
            Retrouvez l'historique complet de vos baux, états des lieux et quittances passées.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <Card className="p-2 rounded-[3.5rem] bg-gray-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-none relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-30" />

        <div className="relative grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800/50">
          <div className="p-8 md:p-10 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] font-manrope">Total archivé</p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <FileSignature className="w-6 h-6 text-gray-500" />
              <p className="text-4xl font-black text-white font-merriweather">{stats.total}</p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] font-manrope">Baux terminés</p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <FileCheck className="w-6 h-6 text-gray-500" />
              <p className="text-4xl font-black text-white font-merriweather">{stats.leases}</p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em] font-manrope">EDL archivés</p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Building className="w-6 h-6 text-gray-500" />
              <p className="text-4xl font-black text-white font-merriweather">{stats.inventories}</p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-manrope">Espace utilisé</p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Home className="w-6 h-6 text-gray-500" />
              <p className="text-4xl font-black text-white font-merriweather text-nowrap">{stats.usedSpace}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Extended Filters Section */}
      <Card className="p-10 rounded-[4rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-16 -mt-16 blur-2xl" />

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-4 relative z-10 transition-all">
          {[
            { id: 'all', label: 'Tout explorer' },
            { id: 'lease', label: 'Baux Historiques' },
            { id: 'inventory', label: 'États des Lieux' },
            { id: 'receipt', label: 'Quittances' },
            { id: 'other', label: 'Autres Documents' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id as any)}
              className={`px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${typeFilter === type.id
                ? 'bg-green-600 text-white shadow-[0_15px_40px_-5px_rgba(22,163,74,0.3)] scale-105'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 active:scale-95'
                } font-manrope`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Search & Property/Year Selects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-6 h-6 transition-transform group-focus-within:scale-110" />
            <input
              type="text"
              placeholder="Rechercher un fichier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 appearance-none shadow-sm"
            />
          </div>

          <div className="relative group">
            <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5 pointer-events-none" />
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] text-sm font-bold text-gray-900 outline-none cursor-pointer font-manrope appearance-none shadow-sm"
            >
              <option value="all">Toutes les Propriétés</option>
              {availableProperties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.name}</option>
              ))}
            </select>
          </div>

          <div className="relative group">
            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5 pointer-events-none" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] text-sm font-bold text-gray-900 outline-none cursor-pointer font-manrope appearance-none shadow-sm"
            >
              <option value="all">Toutes les Années</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card className="p-24 text-center rounded-[5rem] border-gray-100 shadow-inner bg-gray-50/20 border-dashed">
          <div className="w-40 h-40 bg-white rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-gray-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-50 rounded-full animate-pulse opacity-50" />
            <FileText className="w-16 h-16 text-green-100 relative z-10" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-6 font-merriweather tracking-tight">
            Coffre-fort vide
          </h3>
          <p className="text-gray-400 font-manrope max-w-sm mx-auto mb-12 text-lg font-medium leading-relaxed">
            {searchTerm
              ? `Nous n'avons rien trouvé pour "${searchTerm}".`
              : 'Aucun document archivé n\'est disponible pour le moment.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocuments.map((document) => {
            const isLease = document.type === 'lease';
            const isReceipt = document.type === 'receipt';
            const isInventory = document.type === 'inventory';

            return (
              <Card key={document.uniqueKey} className="overflow-hidden rounded-[3.5rem] border-gray-100 shadow-xl shadow-green-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group flex flex-col h-full relative border-t-8 border-t-green-600/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 opacity-20 group-hover:opacity-100 rounded-full -mr-16 -mt-16 blur-2xl transition-all" />

                <div className="p-10 flex-grow relative">
                  {/* Badge & Action */}
                  <div className="mb-8 flex justify-between items-start">
                    <div className="space-y-4">
                      {isLease && (
                        <span className="px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600/70 border border-emerald-100 font-manrope">Bail Passé</span>
                      )}
                      {isInventory && (
                        <span className="px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-600/70 border border-yellow-100 font-manrope">État des Lieux</span>
                      )}
                      {isReceipt && (
                        <span className="px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600/70 border border-green-100 font-manrope">Quittance Archivée</span>
                      )}
                      {(!isLease && !isInventory && !isReceipt) && (
                        <span className="px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100 font-manrope">Archive Web</span>
                      )}
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Doc Ref. #{document.id}</p>
                    </div>

                    <button
                      onClick={() => handleDownload(document)}
                      className="p-5 rounded-[1.5rem] bg-gray-900 text-white hover:bg-green-600 transition-all shadow-xl shadow-gray-900/10 group-hover:scale-110 active:scale-90"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 mb-6 font-merriweather leading-snug group-hover:text-green-700 transition-colors">
                    {document.name}
                  </h3>

                  {/* Context */}
                  {document.property && (
                    <div className="flex items-center gap-4 text-sm font-black text-gray-900 mb-8 font-manrope bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span className="truncate">{document.property.name}</span>
                    </div>
                  )}

                  {/* Detailed Table-like Grid */}
                  <div className="space-y-6 pt-6 border-t border-gray-50/50">
                    {isLease && document.metadata && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Période de Validité</p>
                          <p className="text-xs font-bold text-gray-600">{formatDate(document.metadata.startDate)} — {formatDate(document.metadata.endDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Loyer à l'époque</p>
                          <p className="text-xs font-black text-green-600">{formatCurrency(document.metadata.monthlyRent)}</p>
                        </div>
                      </div>
                    )}

                    {isInventory && document.metadata && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Date de Visite</p>
                          <p className="text-xs font-bold text-gray-600">{formatDate(document.metadata.visitDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Dépôt de Garantie</p>
                          <p className="text-xs font-black text-gray-900">{formatCurrency(document.metadata.deposit)}</p>
                        </div>
                      </div>
                    )}

                    {!isLease && !isInventory && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 font-manrope uppercase">Document édité le {formatDate(document.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer file info */}
                <div className="p-10 bg-gray-50/50 backdrop-blur-sm flex items-center justify-between border-t border-white/50 group-hover:bg-green-600 transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0" />
                  <div className="relative z-10 flex items-center gap-3">
                    <FileSignature className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-gray-400 group-hover:text-green-200 uppercase transition-colors">Taille Digitale</p>
                      <p className="text-xs font-black text-gray-900 group-hover:text-white transition-colors">{(Number(document.file_size) / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button className="relative z-10 text-[10px] font-black text-green-600 group-hover:text-white uppercase tracking-widest flex items-center gap-2 group/btn">
                    <span>Consulter</span>
                    <Eye className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
