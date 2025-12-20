import React, { useState } from 'react';
import { Plus, Search, Settings, Building, Trash2, MoreVertical } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CreateImmeubles } from './CreateImmeubles';

interface Immeuble {
  id: string;
  name: string;
  address: string;
  superficie: number;
  lots: number;
  description: string;
}

interface ImmeublesProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Immeubles: React.FC<ImmeublesProps> = ({ notify }) => {
  const [immeubles, setImmeubles] = useState<Immeuble[]>([]);
  const [activeTab, setActiveTab] = useState<'actifs' | 'archives'>('actifs');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredImmeubles = immeubles.filter(immeuble =>
    immeuble.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    immeuble.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddImmeuble = () => {
    setShowCreateForm(true);
  };

  const handleDeleteImmeuble = (id: string) => {
    setImmeubles(immeubles.filter(immeuble => immeuble.id !== id));
    notify('Immeuble supprimé', 'success');
  };

  if (showCreateForm) {
    return <CreateImmeubles onBack={() => setShowCreateForm(false)} notify={notify} />;
  }

  const handleEditImmeuble = (id: string) => {
    notify('Fonction "Éditer un immeuble" en développement', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Immeubles</h1>
          <p className="text-slate-500 mt-1">Gérez vos immeubles et leurs tantièmes</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleAddImmeuble}>
          Nouvel Immeuble
        </Button>
      </div>

      {/* Notification d'Upgrade */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">⭐</span>
          <div>
            <p className="font-semibold text-green-900">Besoin d'un compte illimité ?</p>
            <p className="text-sm text-green-700">Passer un compte premium à partir de 4,90FCFA/mois</p>
          </div>
        </div>
        <Button variant="secondary" size="sm">ACHETER UN COMPTE PREMIUM</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('actifs')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'actifs'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ✓ Actifs ({filteredImmeubles.length})
        </button>
        <button
          onClick={() => setActiveTab('archives')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'archives'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📋 Archives (0)
        </button>
      </div>

      {/* Information Box */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-lg">ℹ️</span>
          Information
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            Cette section s'adresse aux propriétaires d'immeubles ou de biens immobiliers divisés en lots individuels.
          </p>
          <p>
            Elle permet de renseigner les tantièmes ou d'appliquer des clés de répartition particulières, afin de ventiler équitablement les charges communes entre les différents lots.
          </p>
          <p>
            Vous devriez créer les lots dans la rubrique{' '}
            <a href="#" className="text-blue-600 font-semibold hover:underline">
              Biens
            </a>
            {' '}avant de pouvoir remplir ce formulaire.
          </p>
        </div>
      </Card>

      {/* Search and Settings */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Rechercher des immeubles"
            aria-label="Rechercher des immeubles"
          />
        </div>
        <Button variant="ghost" size="sm" icon={<Settings size={16} />}>
          Affichage
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        {filteredImmeubles.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Immeuble</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Superficie</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Lots</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredImmeubles.map((immeuble) => (
                <tr key={immeuble.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{immeuble.name}</p>
                        <p className="text-xs text-slate-500">{immeuble.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{immeuble.superficie} m²</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {immeuble.lots} lots
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 line-clamp-1">{immeuble.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditImmeuble(immeuble.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Éditer"
                        aria-label="Éditer cet immeuble"
                      >
                        <MoreVertical size={16} className="text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteImmeuble(immeuble.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                        aria-label="Supprimer cet immeuble"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <div className="mb-4">
              <svg width="150" height="150" viewBox="0 0 150 150" className="mx-auto opacity-50">
                <rect x="30" y="50" width="90" height="70" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="45" y1="50" x2="45" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="60" y1="50" x2="60" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="75" y1="50" x2="75" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="90" y1="50" x2="90" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="105" y1="50" x2="105" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="30" y1="65" x2="120" y2="65" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="30" y1="80" x2="120" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="30" y1="95" x2="120" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="30" y1="110" x2="120" y2="110" stroke="#cbd5e1" strokeWidth="1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Il n'y a rien par ici...</h3>
            <p className="text-slate-600 mb-6">
              Cette page permet de gérer vos immeubles. Renseignez les tantièmes de chaque bien, afin de ventiler les dépenses communes.
            </p>
            <Button variant="primary" onClick={handleAddImmeuble}>Nouvel immeuble</Button>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100">
        <h3 className="font-semibold text-slate-900 mb-3">Comment pourrions-nous améliorer notre site pour vous?</h3>
        <textarea
          placeholder="Veuillez saisir vos idées et vos suggestions..."
          className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          title="Formulaire de feedback"
          aria-label="Formulaire de feedback"
        />
      </Card>
    </div>
  );
};
