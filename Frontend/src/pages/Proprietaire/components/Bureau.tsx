import React from 'react';
import { Home, Building, Users, FileText, DollarSign, CheckCircle, Plus } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface BureauProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Bureau: React.FC<BureauProps> = ({ notify }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Ajouter un Bien',
      description: 'Enregistrez un nouveau bien immobilier',
      icon: <Building className="h-5 w-5" />,
      onClick: () => navigate('/proprietaire/ajouter-bien')
    },
    {
      title: 'Ajouter un Locataire',
      description: 'Créer un nouveau profil locataire',
      icon: <Users className="h-5 w-5" />,
      onClick: () => navigate('/proprietaire/ajouter-locataire')
    },
    {
      title: 'Nouvelle Location',
      description: 'Créer un nouveau contrat de bail',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => navigate('/proprietaire/nouvelle-location')
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord</h1>
        <p className="text-slate-500 mt-2">Vue d'ensemble de votre gestion immobilière</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Biens Actifs', value: '2', icon: Building, color: 'blue' },
          { label: 'Locataires', value: '3', icon: Users, color: 'green' },
          { label: 'Locations Actives', value: '2', icon: Home, color: 'purple' },
          { label: 'Revenus Mensuels', value: '2 500 FCFA', icon: DollarSign, color: 'orange' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const colorClass = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600'
          }[stat.color];

          return (
            <Card key={idx} className="p-6 flex flex-col gap-4">
              <div className={`p-3 rounded-lg w-fit ${colorClass}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Actions rapides simplifiées */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left w-full"
            >
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                {action.icon}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{action.title}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
              </div>
              <div className="ml-auto text-blue-600">
                <Plus className="h-5 w-5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Dernière Activité</h2>
        <div className="space-y-4">
          {[
            { title: 'Loyer reçu', desc: 'Appartement 42 - 850 FCFA', time: 'Aujourd\'hui' },
            { title: 'État des lieux créé', desc: 'Nouveau bien - Appt 15', time: 'Hier' },
            { title: 'Document ajouté', desc: 'Bail signé - Locataire Jean D.', time: 'Il y a 3 jours' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-4">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
