import React, { useEffect, useState } from 'react';
import {
  FileText,
  Calendar,
  User,
  Eye,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  XCircle,
  MapPin
} from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';
import { Skeleton } from '../../Proprietaire/components/ui/Skeleton';

interface AuditEntry {
  id: number;
  action: string;
  old_values?: any;
  new_values?: any;
  reason?: string;
  performed_by: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  ip_address?: string;
  delegation: {
    property: {
      name: string;
      address: string;
      city: string;
    };
  };
}

interface DelegationAuditProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const DelegationAudit: React.FC<DelegationAuditProps> = ({ notify }) => {
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedAudit, setSelectedAudit] = useState<AuditEntry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/my-delegation-audits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des audits');
      }

      const data = await response.json();
      const auditsData = data.audits?.data || data.audits || [];
      setAudits(auditsData);
      setFilteredAudits(auditsData);
    } catch (error) {
      console.warn('API Warning (silenced):', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    let filtered = audits;

    if (actionFilter !== 'all') {
      filtered = filtered.filter(a => a.action === actionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.delegation?.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.delegation?.property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.performed_by?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.action?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAudits(filtered);
  }, [audits, searchTerm, actionFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <CheckCircle className="w-6 h-6" />;
      case 'revoked': return <XCircle className="w-6 h-6" />;
      case 'updated': return <Settings className="w-6 h-6" />;
      case 'expired': return <AlertCircle className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-50 text-green-600 border-green-100';
      case 'revoked': return 'bg-red-50 text-red-600 border-red-100';
      case 'updated': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'expired': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'created': return 'Créée';
      case 'revoked': return 'Révoquée';
      case 'updated': return 'Modifiée';
      case 'expired': return 'Expirée';
      default: return action;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) { return dateString; }
  };

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues || !newValues) return null;
    const changes: string[] = [];
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key]) {
        const fieldNames: Record<string, string> = {
          'status': 'Statut',
          'expires_at': 'Date d\'expiration',
          'notes': 'Notes',
          'permissions': 'Permissions'
        };
        const fieldName = fieldNames[key] || key;
        changes.push(`${fieldName}: ${oldValues[key] || 'n/a'} → ${newValues[key] || 'n/a'}`);
      }
    });
    return changes.length > 0 ? changes : null;
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
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-10 rounded-[2.5rem] border-gray-100 shadow-xl shadow-green-900/5 bg-white relative overflow-hidden">
              <div className="flex gap-6 items-center">
                <div className="h-14 w-14 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="space-y-2 flex-grow">
                  <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-6 w-1/2 bg-gray-50 rounded-lg animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4" style={{ fontFamily: "'Merriweather', serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-merriweather tracking-tight">Journal d'audit</h1>
          <p className="text-gray-400 font-manrope font-medium text-lg max-w-2xl">
            {filteredAudits.length} activité{filteredAudits.length > 1 ? 's' : ''} enregistrée{filteredAudits.length > 1 ? 's' : ''} sur votre patrimoine délégué.
          </p>
        </div>
        <Button
          onClick={fetchAudits}
          className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-10 py-7 text-xs font-black font-manrope shadow-[0_20px_50px_rgba(22,163,74,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none uppercase tracking-widest"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Actualiser</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <Card className="lg:col-span-8 p-3 rounded-[2.5rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600 w-6 h-6 transition-colors group-focus-within:text-green-700" />
            <input
              type="text"
              placeholder="Rechercher une action, propriété ou utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-manrope placeholder:text-gray-300 appearance-none"
            />
          </div>
        </Card>

        <Card className="lg:col-span-4 p-3 rounded-[2rem] border-gray-100 shadow-2xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="flex items-center px-4">
            <Filter className="w-5 h-5 text-green-600 mr-2" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full py-5 bg-white border border-transparent rounded-[1.5rem] text-sm font-black text-gray-700 outline-none cursor-pointer font-manrope appearance-none"
            >
              <option value="all">Filtre d'actions</option>
              <option value="created">Créations</option>
              <option value="updated">Modifications</option>
              <option value="revoked">Révocations</option>
              <option value="expired">Expirations</option>
            </select>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        {filteredAudits.length === 0 ? (
          <Card className="p-32 text-center bg-gray-50/20 rounded-[5rem] border-dashed border-gray-200">
            <div className="bg-white w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-200/50 relative">
              <FileText className="w-10 h-10 text-green-100" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 rounded-full w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 font-merriweather tracking-tight">
              Journal de bord vide
            </h3>
            <p className="text-gray-400 font-manrope font-medium text-lg max-w-sm mx-auto leading-relaxed">
              {searchTerm
                ? `Aucune activité trouvée pour "${searchTerm}".`
                : 'Les activités majeures sur vos délégations seront listées ici avec précision.'
              }
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAudits.map((audit) => (
              <div
                key={audit.id}
                onClick={() => {
                  setSelectedAudit(audit);
                  setShowDetailsModal(true);
                }}
                className="group p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-green-900/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer bg-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-10"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 opacity-20 group-hover:opacity-100 rounded-full -mr-16 -mt-16 blur-2xl transition-all" />

                <div className={`relative z-10 w-20 h-20 rounded-[2rem] flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm flex-shrink-0 ${getActionColor(audit.action)}`}>
                  {getActionIcon(audit.action)}
                </div>

                <div className="flex-grow space-y-6 relative z-10">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${getActionColor(audit.action)}`}>
                      {getActionText(audit.action)}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 font-manrope bg-gray-50 px-4 py-2 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-green-600" />
                      {formatDate(audit.created_at)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-gray-900 font-merriweather leading-tight group-hover:text-green-700 transition-colors">
                      {audit.delegation?.property?.name || 'Patrimoine Global'}
                    </h4>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-bold text-gray-500 font-manrope">{audit.delegation?.property?.address}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-black text-[10px] text-emerald-600 uppercase">
                        {audit.performed_by?.first_name?.[0]}{audit.performed_by?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Réalisé par</p>
                        <p className="text-sm font-bold text-gray-700 font-manrope">{audit.performed_by?.first_name} {audit.performed_by?.last_name}</p>
                      </div>
                    </div>
                    {audit.ip_address && (
                      <div className="hidden lg:block">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Adresse Source</p>
                        <p className="text-sm font-black text-gray-400 font-manrope">{audit.ip_address}</p>
                      </div>
                    )}
                  </div>

                  {audit.reason && (
                    <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100 flex items-start gap-5 group-hover:bg-green-100/30 transition-colors">
                      <AlertCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-black text-green-800 italic font-manrope leading-relaxed">« {audit.reason} »</p>
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex items-center justify-end md:self-stretch">
                  <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white hover:bg-green-600 transition-all shadow-xl shadow-gray-900/10 group-hover:scale-110 active:scale-90 h-fit">
                    <Eye className="w-8 h-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetailsModal && selectedAudit && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
          <Card className="bg-white rounded-[4rem] p-12 max-w-3xl w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-none relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <div className="relative">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-gray-900 font-merriweather">Preuve d'Audit</h2>
                  <p className="text-gray-400 font-manrope font-black text-[10px] uppercase tracking-widest">Indexation Log #AUD-{selectedAudit.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-5 rounded-3xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                >
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4 font-manrope">Événement Traceur</p>
                    <div className="flex items-center gap-6 bg-green-50/50 p-6 rounded-[2.5rem] border border-green-100">
                      <div className={`p-4 rounded-2xl shadow-sm bg-white ${getActionColor(selectedAudit.action)}`}>
                        {getActionIcon(selectedAudit.action)}
                      </div>
                      <div>
                        <p className="text-xl font-black text-gray-900 uppercase font-manrope">{getActionText(selectedAudit.action).toUpperCase()}</p>
                        <p className="text-xs font-bold text-gray-500 font-manrope">{formatDate(selectedAudit.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 font-manrope">Bien Immobilier</p>
                    <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                      <p className="text-lg font-black text-gray-900 font-merriweather">{selectedAudit.delegation?.property?.name}</p>
                      <p className="text-sm font-bold text-gray-500 font-manrope mt-2 leading-relaxed">
                        {selectedAudit.delegation?.property?.address}<br />{selectedAudit.delegation?.property?.city}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4 font-manrope">Acteur de l'action</p>
                    <div className="bg-green-50/30 p-8 rounded-[2.5rem] border border-green-100/50 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-[2rem] bg-green-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-green-600/30 mb-4">
                        {selectedAudit.performed_by?.first_name?.[0]}{selectedAudit.performed_by?.last_name?.[0]}
                      </div>
                      <p className="text-xl font-black text-gray-900 font-merriweather">
                        {selectedAudit.performed_by?.first_name} {selectedAudit.performed_by?.last_name}
                      </p>
                      <p className="text-sm font-black text-green-600 font-manrope mt-1">{selectedAudit.performed_by?.email}</p>
                      {selectedAudit.ip_address && (
                        <p className="text-[10px] font-black text-gray-300 uppercase mt-4 tracking-widest">IP: {selectedAudit.ip_address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedAudit.old_values && selectedAudit.new_values && (
                <div className="mt-12 pt-12 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 font-manrope">Différentiel de données</p>
                  <div className="bg-gray-900 rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-20" />
                    <div className="space-y-4">
                      {formatChanges(selectedAudit.old_values, selectedAudit.new_values) ? (
                        formatChanges(selectedAudit.old_values, selectedAudit.new_values)?.map((change, index) => (
                          <div key={index} className="flex gap-4 items-start pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-lg font-black text-white font-manrope">{change}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 font-black text-center uppercase tracking-widest">Aucune modification détectée.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-16 text-center">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-[2rem] px-24 py-8 text-xs font-black uppercase tracking-[0.3em] font-manrope shadow-2xl transition-all active:scale-95 border-none"
                >
                  Archiver la vue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
