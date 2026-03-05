import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Bell, Save, LogOut } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ProfileProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
    onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ notify, onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Fake API call
    setTimeout(() => {
        setIsLoading(false);
        notify('Vos informations ont été mises à jour', 'success');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>

      <div className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <div className="relative">
             <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" />
             <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors border-2 border-white">
                 <User size={14} />
             </button>
         </div>
         <div>
             <h2 className="text-xl font-bold text-slate-900">Jean Dupont</h2>
             <p className="text-slate-500">Locataire Principal</p>
             <div className="mt-2 flex gap-2">
                 <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Dossier complet</span>
             </div>
         </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Informations Personnelles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="email" defaultValue="jean.dupont@email.com" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="tel" defaultValue="06 12 34 56 78" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" />
                    </div>
                </div>
            </div>
        </Card>

        <Card title="Sécurité & Préférences">
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Lock size={20} className="text-slate-500"/>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Mot de passe</p>
                            <p className="text-xs text-slate-500">Dernière modification il y a 3 mois</p>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" type="button">Modifier</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Bell size={20} className="text-slate-500"/>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Notifications</p>
                            <p className="text-xs text-slate-500">Email et SMS activés</p>
                        </div>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"/>
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                    </div>
                </div>
             </div>
        </Card>

        <div className="flex items-center justify-between pt-4">
            <Button variant="danger" type="button" onClick={onLogout} icon={<LogOut size={18}/>}>
                Déconnexion
            </Button>
            
            <Button type="submit" icon={isLoading ? undefined : <Save size={18}/>} disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
        </div>
      </form>
    </div>
  );
};
