import React, { useState } from 'react';
import { Plus, Search, Settings, Eye, EyeOff, MoreVertical, Home, Download } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CreateLot } from './CreateLot';

interface Lot {
  id: string;
  type: string;
  superficie: number;
  pieces: number;
  locataire: string | null;
  loyer: number | null;
  etat: 'disponible' | 'loue' | 'travaux' | 'indisponible';
  visible: boolean;
}

interface LotsProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Lots: React.FC<LotsProps> = ({ notify }) => {
  const [lots, setLots] = useState<Lot[]>([
    {
      id: 'LOT-001',
      type: 'Appartement T2',
      superficie: 45,
      pieces: 2,
      locataire: 'Jean Dupont',
      loyer: 850,
      etat: 'loue',
      visible: true
    },
    {
      id: 'LOT-002',
      type: 'Studio',
      superficie: 25,
      pieces: 1,
      locataire: null,
      loyer: null,
      etat: 'disponible',
      visible: true
    },
    {
      id: 'LOT-003',
      type: 'Bureau',
      superficie: 60,
      pieces: 1,
      locataire: 'SARL Tech',
      loyer: 1200,
      etat: 'loue',
      visible: true
    }
  ]);

  const [filterType, setFilterType] = useState('Tout type');
  const [filterLocation, setFilterLocation] = useState('Avec et sans location');
  const [filterStatus, setFilterStatus] = useState('Tous les états');
  const [activeTab, setActiveTab] = useState<'actifs' | 'archives'>('actifs');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateLot, setShowCreateLot] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getEtatColor = (etat: string) => {
    switch (etat) {
      case 'loue':
        return 'bg-green-100 text-green-800';
      case 'disponible':
        return 'bg-blue-100 text-blue-800';
      case 'travaux':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getEtatLabel = (etat: string) => {
    switch (etat) {
      case 'loue':
        return 'Loué';
      case 'disponible':
        return 'Disponible';
      case 'travaux':
        return 'En travaux';
      default:
        return 'Indisponible';
    }
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.locataire?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Tout type' || lot.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  const handleAddLot = () => {
    setShowMenu(true);
  };

  const handleToggleVisible = (id: string) => {
    setLots(lots.map(lot => 
      lot.id === id ? { ...lot, visible: !lot.visible } : lot
    ));
    notify('Visibilité mise à jour', 'success');
  };

  const handleDeleteLot = (id: string) => {
    setLots(lots.filter(lot => lot.id !== id));
    notify('Lot supprimé', 'success');
  };

  // Show CreateLot form
  if (showCreateLot) {
    return <CreateLot onBack={() => setShowCreateLot(false)} notify={notify} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lots</h1>
          <p className="text-slate-500 mt-1">Gérez vos propriétés et lots immobiliers</p>
        </div>
        <div className="relative">
          <Button 
            variant="primary" 
            icon={<Plus size={16} />} 
            onClick={handleAddLot}
          >
            Nouveau Lot
          </Button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
              <button
                onClick={() => {
                  setShowCreateLot(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-slate-700 font-medium flex items-center gap-2 border-b border-slate-200"
              >
                <Plus size={16} className="text-blue-600" />
                Nouveau lot
              </button>
              <button
                onClick={() => {
                  notify('Fonction "Importer" en développement', 'info');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-slate-700 font-medium flex items-center gap-2"
              >
                <Download size={16} className="text-green-600" />
                Importer
              </button>
            </div>
          )}
          
          {/* Close menu when clicking outside */}
          {showMenu && (
            <div 
              className="fixed inset-0 z-0" 
              onClick={() => setShowMenu(false)}
            />
          )}
        </div>
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
          ✓ Actifs ({filteredLots.length})
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

      {/* Filters */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Filtrer <span className="text-slate-400 font-normal">Utilisez les options pour filtrer</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">Type</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              title="Filtrer par type de bien"
              aria-label="Filtrer par type de bien"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Tout type</option>
              <option>Appartement</option>
              <option>Studio</option>
              <option>Bureau</option>
              <option>Atelier</option>
              <option>Garage</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">Location</label>
            <select 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              title="Filtrer par location"
              aria-label="Filtrer par location"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Avec et sans location</option>
              <option>Avec location</option>
              <option>Sans location</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">État</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              title="Filtrer par état"
              aria-label="Filtrer par état"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Tous les états</option>
              <option>Disponible</option>
              <option>Loué</option>
              <option>En travaux</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Search and Settings */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Rechercher des lots"
            aria-label="Rechercher des lots"
          />
        </div>
        <Button variant="ghost" size="sm" icon={<Settings size={16} />}>
          Affichage
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        {filteredLots.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Lot</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Superficie</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Pièces</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Locataire</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Loyer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">État</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Visibilité</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{lot.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-900">{lot.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{lot.superficie} m²</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{lot.pieces}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{lot.locataire || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      {lot.loyer ? `${lot.loyer.toLocaleString()} FCFA` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getEtatColor(lot.etat)}`}>
                      {getEtatLabel(lot.etat)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleVisible(lot.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      title={lot.visible ? 'Masquer' : 'Afficher'}
                      aria-label={lot.visible ? 'Masquer ce lot' : 'Afficher ce lot'}
                    >
                      {lot.visible ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteLot(lot.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Supprimer"
                      aria-label="Supprimer ce lot"
                    >
                      <MoreVertical size={16} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <div className="mb-4">
              <svg width="150" height="150" viewBox="0 0 150 150" className="mx-auto opacity-50">
                <rect x="50" y="40" width="60" height="80" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="65" y1="50" x2="85" y2="50" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="65" y1="60" x2="85" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="65" y1="70" x2="85" y2="70" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="65" cy="100" r="8" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="85" cy="100" r="8" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Il n'y a rien par ici...</h3>
            <p className="text-slate-600 mb-6">Cette page permet de gérer les biens immobiliers.</p>
            <Button variant="primary" onClick={handleAddLot}>Créer un lot</Button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-2">💡 Conseil écologique</h3>
        <p className="text-sm text-slate-600">
          Utilisez les quittances électroniques pour réduire la consommation de papier et préserver l'environnement.
        </p>
      </Card>
    </div>
  );
};
