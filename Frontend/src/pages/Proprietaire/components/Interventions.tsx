import React, { useState } from 'react';
import { AlertTriangle, Camera, Calendar, ChevronRight, CheckCircle, Clock, Droplet, Zap, Thermometer, HelpCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface InterventionsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Interventions: React.FC<InterventionsProps> = ({ notify }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const interventions = [
    { id: 1, title: 'Fuite robinet cuisine', type: 'Plomberie', status: 'En cours', date: '22/11/2025 AM', provider: 'Plomberie Express', icon: Droplet },
    { id: 2, title: 'Panne radiateur salon', type: 'Chauffage', status: 'Terminé', date: '15/10/2025', provider: 'Chauffage Pro', icon: Thermometer },
  ];

  const handleSubmit = () => {
    if(!selectedType) {
        notify('Veuillez sélectionner un type d\'urgence', 'error');
        return;
    }
    notify('Déclaration envoyée au propriétaire', 'success');
    setShowForm(false);
  }

  if (showForm) {
    return (
        <div className="max-w-2xl mx-auto animate-slide-up space-y-6">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-4">
                ← Retour à la liste
            </button>
            
            <Card title="Déclarer un incident">
                <div className="space-y-6">
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
                                        ? 'border-primary bg-blue-50 ring-2 ring-primary/20' 
                                        : 'border-gray-200 hover:border-primary hover:bg-slate-50'
                                    }`}
                                >
                                    {type === 'Fuite' && <Droplet className={`${selectedType === type ? 'text-primary' : 'text-blue-500'} mb-2`} />}
                                    {type === 'Électricité' && <Zap className={`${selectedType === type ? 'text-primary' : 'text-yellow-500'} mb-2`} />}
                                    {type === 'Chauffage' && <Thermometer className={`${selectedType === type ? 'text-primary' : 'text-red-500'} mb-2`} />}
                                    {type === 'Autre' && <HelpCircle className={`${selectedType === type ? 'text-primary' : 'text-gray-500'} mb-2`} />}
                                    <span className="text-xs font-medium">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
                        <textarea className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border min-h-[100px]" placeholder="Décrivez le problème, sa localisation..." />
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary cursor-pointer transition-colors">
                            <Camera className="mb-2" size={24} />
                            <span className="text-sm">Glissez des photos ou cliquez pour parcourir</span>
                        </div>
                    </div>
                    
                    {/* Calendar (Mock) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilités pour intervention</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[1, 2, 3, 4].map(day => (
                                <div key={day} className="flex-shrink-0 w-16 h-20 border border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-all active:scale-95">
                                    <span className="text-xs text-gray-500">Nov</span>
                                    <span className="text-lg font-bold text-gray-900">{22 + day}</span>
                                    <span className="text-xs text-gray-400">Lun</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
                        <Button variant="primary" onClick={handleSubmit}>Envoyer la déclaration</Button>
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
            <Card key={item.id} className="group cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-start md:items-center gap-4">
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
                    </div>
                    <button className="hidden md:block p-2 text-gray-400 hover:text-primary transition-colors">
                        <ChevronRight />
                    </button>
                </div>
                <div className="mt-4 md:hidden flex justify-end">
                    <Button variant="secondary" size="sm">Voir détails</Button>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
};
