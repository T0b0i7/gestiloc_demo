import React from 'react';
import { MapPin, Home, Ruler, Maximize, Wifi, Thermometer, Zap, Layers } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface PropertyProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Property: React.FC<PropertyProps> = ({ notify }) => {
  
  const handleDownloadDPE = () => {
    notify('Diagnostic de Performance Énergétique téléchargé', 'success');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-md group">
        <img 
          src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600" 
          alt="Appartement" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2 py-1 bg-primary text-xs font-bold rounded uppercase tracking-wider">Loué</span>
               <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-xs font-medium rounded flex items-center gap-1">
                 <MapPin size={12}/> Paris 2e
               </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Résidence Les Hortensias - Apt 42</h1>
            <p className="text-slate-200 text-sm mt-1">15 Rue de la Paix, 75002 Paris • 1er Étage</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="flex flex-col items-center justify-center p-4 text-center hover:border-primary/50 transition-colors">
                <Ruler className="text-primary mb-2" size={24} />
                <span className="text-2xl font-bold text-slate-900">45 <span className="text-sm text-slate-500">m²</span></span>
                <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Surface</span>
             </Card>
             <Card className="flex flex-col items-center justify-center p-4 text-center hover:border-primary/50 transition-colors">
                <Home className="text-primary mb-2" size={24} />
                <span className="text-2xl font-bold text-slate-900">2 <span className="text-sm text-slate-500">Pièces</span></span>
                <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Type T2</span>
             </Card>
             <Card className="flex flex-col items-center justify-center p-4 text-center hover:border-primary/50 transition-colors">
                <Layers className="text-primary mb-2" size={24} />
                <span className="text-2xl font-bold text-slate-900">1 <span className="text-sm text-slate-500">er</span></span>
                <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Étage</span>
             </Card>
             <Card className="flex flex-col items-center justify-center p-4 text-center hover:border-primary/50 transition-colors">
                <Maximize className="text-primary mb-2" size={24} />
                <span className="text-2xl font-bold text-slate-900">2.80 <span className="text-sm text-slate-500">m</span></span>
                <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">HSP</span>
             </Card>
          </div>

          <Card title="Équipements & Services">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Wifi, label: "Fibre Optique", val: "Installée" },
                { icon: Thermometer, label: "Chauffage", val: "Gaz Collectif" },
                { icon: Zap, label: "Électricité", val: "Remise à neuf 2023" },
                { icon: Layers, label: "Sol", val: "Parquet chêne" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md shadow-sm text-slate-600">
                      <item.icon size={18} />
                    </div>
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-sm text-slate-500">{item.val}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Energy Performance */}
        <div className="space-y-6">
            <Card title="Performance Énergétique">
               <div className="space-y-6">
                  {/* DPE Scale */}
                  <div>
                     <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">DPE (Consommation)</span>
                        <span className="text-sm font-bold text-green-600">Classe C</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
                        <div className="w-[15%] bg-green-600 h-full"></div>
                        <div className="w-[15%] bg-green-400 h-full"></div>
                        <div className="w-[20%] bg-yellow-400 h-full border-r-2 border-white relative">
                           <div className="absolute top-0 right-0 w-0.5 h-full bg-black/20"></div>
                        </div>
                        <div className="w-[15%] bg-orange-400 h-full opacity-30"></div>
                        <div className="w-[15%] bg-red-400 h-full opacity-30"></div>
                        <div className="w-[20%] bg-red-600 h-full opacity-30"></div>
                     </div>
                     <p className="text-xs text-slate-500 mt-2">135 kWh/m²/an</p>
                  </div>

                  {/* GES Scale */}
                  <div>
                     <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">GES (Emissions)</span>
                        <span className="text-sm font-bold text-blue-600">Classe C</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
                        <div className="w-[20%] bg-blue-200 h-full opacity-50"></div>
                        <div className="w-[20%] bg-blue-300 h-full opacity-50"></div>
                        <div className="w-[20%] bg-blue-500 h-full relative">
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                        <div className="w-[40%] bg-purple-800 h-full opacity-20"></div>
                     </div>
                     <p className="text-xs text-slate-500 mt-2">24 kg CO₂/m²/an</p>
                  </div>
                  
                  <Button variant="secondary" size="sm" className="w-full mt-4" onClick={handleDownloadDPE}>
                    Télécharger le rapport complet
                  </Button>
               </div>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
               <h3 className="font-bold text-blue-900 mb-2">Gestionnaire</h3>
               <div className="flex items-center gap-3 mb-4">
                 <img src="https://ui-avatars.com/api/?name=Agence+Immo&background=random" className="w-10 h-10 rounded-full" alt="Agence" />
                 <div>
                   <p className="font-medium text-sm text-blue-900">Agence Immobilière Centrale</p>
                   <p className="text-xs text-blue-600">01 23 45 67 89</p>
                 </div>
               </div>
               <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => notify("Message automatique envoyé à l'agence", "success")}>Contacter</Button>
            </Card>
        </div>
      </div>
    </div>
  );
};
