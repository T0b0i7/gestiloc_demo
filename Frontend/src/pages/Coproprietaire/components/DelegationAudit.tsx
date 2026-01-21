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
  XCircle
} from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';

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
      console.error('Erreur:', error);
      notify('Erreur lors du chargement des audits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    let filtered = audits;

    // Filtrage par action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(a => a.action === actionFilter);
    }

    // Filtrage par recherche
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
      case 'created': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'revoked': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'updated': return <Settings className="w-4 h-4 text-blue-500" />;
      case 'expired': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        changes.push(`${fieldName}: ${oldValues[key]} → ${newValues[key]}`);
      }
    });

    return changes.length > 0 ? changes : null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
          <p className="text-gray-600 mt-1">
            {filteredAudits.length} entrée{filteredAudits.length > 1 ? 's' : ''} trouvée{filteredAudits.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={fetchAudits}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une action, propriété ou utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les actions</option>
              <option value="created">Créées</option>
              <option value="updated">Modifiées</option>
              <option value="revoked">Révoquées</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Liste des audits */}
      <Card className="p-6">
        {filteredAudits.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || actionFilter !== 'all' 
                ? 'Aucune entrée trouvée' 
                : 'Aucune entrée d\'audit'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || actionFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Les activités sur vos délégations apparaîtront ici'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAudits.map((audit) => (
              <div
                key={audit.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedAudit(audit);
                  setShowDetailsModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(audit.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(audit.action)}`}>
                          {getActionText(audit.action)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(audit.created_at)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-gray-900">
                          {audit.delegation?.property?.name || 'Propriété inconnue'}
                        </p>
                        <p className="text-gray-600">
                          {audit.delegation?.property?.address}, {audit.delegation?.property?.city}
                        </p>
                        <p className="text-gray-600">
                          Par {audit.performed_by?.first_name} {audit.performed_by?.last_name} 
                          ({audit.performed_by?.email})
                        </p>
                        {audit.reason && (
                          <p className="text-gray-600 italic">
                            Raison: {audit.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAudit(audit);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de détails */}
      {showDetailsModal && selectedAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Détails de l'audit
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Action</h3>
                <div className="flex items-center space-x-2">
                  {getActionIcon(selectedAudit.action)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedAudit.action)}`}>
                    {getActionText(selectedAudit.action)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Propriété</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedAudit.delegation?.property?.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAudit.delegation?.property?.address}, {selectedAudit.delegation?.property?.city}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations</h3>
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm">{formatDate(selectedAudit.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Utilisateur:</span>
                    <span className="text-sm">
                      {selectedAudit.performed_by?.first_name} {selectedAudit.performed_by?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm">{selectedAudit.performed_by?.email}</span>
                  </div>
                  {selectedAudit.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Adresse IP:</span>
                      <span className="text-sm">{selectedAudit.ip_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedAudit.reason && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Raison</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{selectedAudit.reason}</p>
                  </div>
                </div>
              )}

              {selectedAudit.old_values && selectedAudit.new_values && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Modifications</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    {formatChanges(selectedAudit.old_values, selectedAudit.new_values) ? (
                      <ul className="space-y-1">
                        {formatChanges(selectedAudit.old_values, selectedAudit.new_values)?.map((change, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {change}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">Aucune modification détectée</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
