import React, { useState } from 'react';
import { AlertTriangle, Camera, Calendar, ChevronRight, CheckCircle, Clock, Droplet, Zap, Thermometer, HelpCircle, Edit2, Trash2, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';

interface Intervention {
  id: number;
  title: string;
  type: string;
  status: string;
  date: string;
  provider: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description?: string;
}

interface InterventionsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Interventions: React.FC<InterventionsProps> = ({ notify }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([
    { id: 1, title: 'Fuite robinet cuisine', type: 'Plomberie', status: 'En cours', date: '22/11/2025 AM', provider: 'Plomberie Express', icon: Droplet, description: 'Fuite au robinet de la cuisine' },
    { id: 2, title: 'Panne radiateur salon', type: 'Chauffage', status: 'Terminé', date: '15/10/2025', provider: 'Chauffage Pro', icon: Thermometer, description: 'Radiateur ne chauffe plus' },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', type: '', description: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // CREATE - Ajouter une nouvelle intervention
  const handleSubmit = () => {
    if(!selectedType || !formData.title.trim()) {
        notify('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (editingId) {
      // UPDATE
      setInterventions(interventions.map(i => 
        i.id === editingId 
          ? { ...i, title: formData.title, type: selectedType, description: formData.description }
          : i
      ));
      notify('Intervention modifiée', 'success');
      setEditingId(null);
    } else {
      // CREATE
      const newIntervention: Intervention = {
        id: Math.max(...interventions.map(i => i.id), 0) + 1,
        title: formData.title,
        type: selectedType,
        status: 'Planifié',
        date: new Date().toLocaleDateString('fr-FR'),
        provider: 'En attente',
        icon: selectedType === 'Plomberie' ? Droplet : selectedType === 'Électricité' ? Zap : selectedType === 'Chauffage' ? Thermometer : HelpCircle,
        description: formData.description
      };
      setInterventions([...interventions, newIntervention]);
      notify('Déclaration envoyée au propriétaire', 'success');
    }
    setShowForm(false);
    setFormData({ title: '', type: '', description: '' });
    setSelectedType(null);
  };

  // UPDATE - Éditer une intervention
  const handleEditClick = (intervention: Intervention) => {
    setEditingId(intervention.id);
    setFormData({ title: intervention.title, type: intervention.type, description: intervention.description || '' });
    setSelectedType(intervention.type);
    setShowForm(true);
  };

  // DELETE - Supprimer une intervention
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setInterventions(interventions.filter(i => i.id !== deleteId));
      notify('Intervention supprimée', 'success');
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  if (showForm) {
    return (
        <div className="max-w-2xl mx-auto animate-slide-up space-y-6">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-4">
                ← Retour à la liste
            </button>
            
            <Card title={editingId ? "Modifier l'intervention" : "Déclarer un incident"}>
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre du problème</label>
                        <input 
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3"
                          placeholder="Ex: Fuite robinet cuisine"
                        />
                    </div>

                    {/* Urgency Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Type d'urgence</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Fuite', 'Électricité', 'Chauffage', 'Autre'].map((type) => (
                                <button 
                                    key={type} 
                                    onClick={() => setSelectedType(type)}
                                    className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                                        selectedType === type 
                                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20' 
                                        : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    {type === 'Fuite' && <Droplet className={`${selectedType === type ? 'text-blue-600' : 'text-blue-500'} mb-2`} />}
                                    {type === 'Électricité' && <Zap className={`${selectedType === type ? 'text-blue-600' : 'text-yellow-500'} mb-2`} />}
                                    {type === 'Chauffage' && <Thermometer className={`${selectedType === type ? 'text-blue-600' : 'text-red-500'} mb-2`} />}
                                    {type === 'Autre' && <HelpCircle className={`${selectedType === type ? 'text-blue-600' : 'text-gray-500'} mb-2`} />}
                                    <span className="text-xs font-medium">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
                        <textarea 
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3 min-h-[100px]" 
                          placeholder="Décrivez le problème, sa localisation..." 
                        />
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-600 cursor-pointer transition-colors">
                            <Camera className="mb-2" size={24} />
                            <span className="text-sm">Glissez des photos ou cliquez pour parcourir</span>
                        </div>
                    </div>
                    
                    {/* Calendar (Mock) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilités pour intervention</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[1, 2, 3, 4].map(day => (
                                <div key={day} className="flex-shrink-0 w-16 h-20 border border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all active:scale-95">
                                    <span className="text-xs text-gray-500">Nov</span>
                                    <span className="text-lg font-bold text-gray-900">{22 + day}</span>
                                    <span className="text-xs text-gray-400">Lun</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                          setFormData({ title: '', type: '', description: '' });
                          setSelectedType(null);
                        }}>Annuler</Button>
                        <Button variant="primary" onClick={handleSubmit}>
                          {editingId ? 'Modifier' : 'Envoyer la déclaration'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
        <Button variant="primary" onClick={() => setShowForm(true)} icon={<AlertTriangle size={18} />}>
            Signaler un problème
        </Button>
      </div>

      <div className="grid gap-4">
        {interventions.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-all">
                <div className="flex items-start md:items-center gap-4 justify-between">
                    <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                        <div className={`p-3 rounded-full shrink-0 ${item.status === 'En cours' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            <item.icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                <Badge variant={item.status === 'En cours' ? 'warning' : 'success'}>{item.status}</Badge>
                            </div>
                            <div className="mt-1 flex flex-col md:flex-row text-sm text-gray-500 md:gap-4">
                                <span className="flex items-center gap-1"><Calendar size={14}/> {item.date}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> {item.provider}</span>
                            </div>
                            {item.description && <p className="text-sm text-gray-600 mt-2">{item.description}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          aria-label="Éditer l'intervention"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label="Supprimer l'intervention"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-4 md:hidden flex justify-end">
                    <Button variant="secondary" size="sm">Voir détails</Button>
                </div>
            </Card>
        ))}
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Supprimer l'intervention">
        <div className="space-y-4">
          <p className="text-gray-700">Êtes-vous sûr de vouloir supprimer cette intervention ? Cette action est irréversible.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
