import React, { useState } from 'react';
import { Search, Filter, Eye, Download, Trash2, Plus, File, FileText, AlertCircle, Upload, Share2, Lock, Edit2 } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'receipt' | 'report' | 'other';
  category: string;
  size: string;
  uploaded_by: string;
  created_at: string;
  related_to: string;
  shared_with: number;
  is_private: boolean;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrat de Bail - Apt 5B',
      type: 'contract',
      category: 'Baux',
      size: '2.4 MB',
      uploaded_by: 'Admin',
      created_at: '2024-01-10T10:30:00',
      related_to: 'Marc Leroy',
      shared_with: 2,
      is_private: false,
    },
    {
      id: '2',
      name: 'Facture Loyer Janvier 2024',
      type: 'invoice',
      category: 'Factures',
      size: '845 KB',
      uploaded_by: 'Admin',
      created_at: '2024-01-15T14:20:00',
      related_to: 'Alice Dupont',
      shared_with: 1,
      is_private: false,
    },
    {
      id: '3',
      name: 'Quittance de Loyer',
      type: 'receipt',
      category: 'Quittances',
      size: '512 KB',
      uploaded_by: 'Tenant',
      created_at: '2024-01-14T09:15:00',
      related_to: 'Jean Michel',
      shared_with: 0,
      is_private: true,
    },
    {
      id: '4',
      name: 'Rapport d\'Inspection',
      type: 'report',
      category: 'Rapports',
      size: '1.2 MB',
      uploaded_by: 'Inspector',
      created_at: '2024-01-12T11:45:00',
      related_to: 'Villa 4 chambres',
      shared_with: 3,
      is_private: false,
    },
    {
      id: '5',
      name: 'État des Lieux Initial',
      type: 'report',
      category: 'États des Lieux',
      size: '3.8 MB',
      uploaded_by: 'Admin',
      created_at: '2024-01-11T16:00:00',
      related_to: 'Studio Avenue',
      shared_with: 2,
      is_private: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState('created_at_desc');

  // État pour le nouveau document
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'other' as 'contract' | 'invoice' | 'receipt' | 'report' | 'other',
    category: '',
    related_to: '',
    is_private: false,
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      contract: '📜',
      invoice: '💰',
      receipt: '✅',
      report: '📊',
      other: '📄',
    };
    return icons[type as keyof typeof icons];
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      contract: 'Contrat',
      invoice: 'Facture',
      receipt: 'Quittance',
      report: 'Rapport',
      other: 'Autre',
    };
    return labels[type as keyof typeof labels];
  };

  const getTypeColor = (type: string) => {
    const colors = {
      contract: 'bg-blue-50 text-blue-700 border-blue-200',
      invoice: 'bg-green-50 text-green-700 border-green-200',
      receipt: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      report: 'bg-purple-50 text-purple-700 border-purple-200',
      other: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[type as keyof typeof colors];
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.name.toLowerCase().includes(searchLower) ||
        doc.category.toLowerCase().includes(searchLower) ||
        doc.related_to.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const handleDelete = (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document?')) return;
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleShare = (id: string) => {
    alert(`Partage du document #${id}`);
  };

  const handleEdit = (id: string) => {
    alert(`Édition du document #${id}`);
  };

  const handleAddDocument = () => {
    if (!newDocument.name || !newDocument.category || !newDocument.related_to) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const document: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      type: newDocument.type,
      category: newDocument.category,
      size: '0 KB', // Sera mis à jour lors de l'upload réel
      uploaded_by: 'Admin',
      created_at: new Date().toISOString(),
      related_to: newDocument.related_to,
      shared_with: 0,
      is_private: newDocument.is_private,
    };

    setDocuments([document, ...documents]);
    setNewDocument({
      name: '',
      type: 'other',
      category: '',
      related_to: '',
      is_private: false,
    });
    setShowAddModal(false);
    alert('Document ajouté avec succès!');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setNewDocument(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const totalDocs = filteredDocuments.length;
  const totalSize = filteredDocuments.reduce((acc, doc) => {
    const sizeNum = parseFloat(doc.size);
    return acc + sizeNum;
  }, 0);

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
            <h1 className="text-4xl font-bold text-gray-900">Gestion des Documents</h1>
            <p className="text-gray-500 mt-1">Organisez et gérez tous vos documents importants</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={20} />
            Nouveau Document
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalDocs}</p>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wider">Taille Totale</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalSize.toFixed(1)} MB</p>
              </div>
              <div className="bg-green-600 text-white p-3 rounded-lg">
                <File size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wider">Partagés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{documents.filter(d => !d.is_private).length}</p>
              </div>
              <div className="bg-purple-600 text-white p-3 rounded-lg">
                <Share2 size={24} />
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
            >
              <option value="all">Tous les types</option>
              <option value="contract">📜 Contrats</option>
              <option value="invoice">💰 Factures</option>
              <option value="receipt">✅ Quittances</option>
              <option value="report">📊 Rapports</option>
            </select>
          </div>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
          >
            <option value="created_at_desc">Plus récents d'abord</option>
            <option value="created_at_asc">Plus anciens d'abord</option>
            <option value="name_asc">Nom (A-Z)</option>
            <option value="name_desc">Nom (Z-A)</option>
          </select>
        </div>

        {/* Tableau des documents */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lié À</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Taille</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
                      <p className="text-gray-500 text-lg font-medium">Aucun document trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{doc.name}</p>
                            {doc.is_private && (
                              <div className="flex items-center gap-1 mt-1">
                                <Lock size={12} className="text-red-600" />
                                <span className="text-xs text-red-600">Privé</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(doc.type)}`}>
                          {getTypeLabel(doc.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{doc.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{doc.related_to}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.size}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowModal(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(doc.id)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-2 rounded-lg transition-all"
                            title="Éditer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleShare(doc.id)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-all"
                            title="Partager"
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-all"
                            title="Télécharger"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
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
        {showModal && selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all animate-slideUp">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getTypeIcon(selectedDoc.type)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDoc.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedDoc.category}</p>
                  </div>
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
                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">Type</label>
                    <p className="text-lg font-bold text-gray-900">{getTypeLabel(selectedDoc.type)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <label className="text-xs font-bold text-green-600 uppercase tracking-wider block mb-2">Taille</label>
                    <p className="text-lg font-bold text-gray-900">{selectedDoc.size}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <label className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-2">Téléchargé par</label>
                    <p className="text-lg font-bold text-gray-900">{selectedDoc.uploaded_by}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <label className="text-xs font-bold text-orange-600 uppercase tracking-wider block mb-2">Date</label>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(selectedDoc.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 col-span-2">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">Lié À</label>
                    <p className="text-lg font-bold text-gray-900">{selectedDoc.related_to}</p>
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
                <button
                  onClick={() => handleEdit(selectedDoc.id)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                >
                  <Edit2 size={18} />
                  Éditer
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
                  <Download size={18} />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nouveau Document */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
              {/* Header Modal */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Nouveau Document</h2>
                  <p className="text-sm text-gray-600 mt-1">Ajouter un nouveau document au système</p>
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
                  {/* Nom du document */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom du Document *</label>
                    <input
                      type="text"
                      value={newDocument.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Contrat de Bail - Apt 5B"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                    <select
                      value={newDocument.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                    >
                      <option value="contract">📜 Contrat</option>
                      <option value="invoice">💰 Facture</option>
                      <option value="receipt">✅ Quittance</option>
                      <option value="report">📊 Rapport</option>
                      <option value="other">📄 Autre</option>
                    </select>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie *</label>
                    <input
                      type="text"
                      value={newDocument.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="Ex: Baux, Factures, Quittances..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Lié à */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lié à *</label>
                    <input
                      type="text"
                      value={newDocument.related_to}
                      onChange={(e) => handleInputChange('related_to', e.target.value)}
                      placeholder="Ex: Marc Leroy, Villa 4 chambres..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Upload de fichier simulé */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fichier</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Cliquez pour sélectionner un fichier</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>

                  {/* Privé/Public */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Visibilité</label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!newDocument.is_private}
                          onChange={() => handleInputChange('is_private', false)}
                          className="mr-2"
                        />
                        <span className="text-sm">Public (partageable)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={newDocument.is_private}
                          onChange={() => handleInputChange('is_private', true)}
                          className="mr-2"
                        />
                        <Lock size={16} className="mr-1 text-red-600" />
                        <span className="text-sm">Privé</span>
                      </label>
                    </div>
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
                  onClick={handleAddDocument}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={18} />
                  Ajouter le Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
