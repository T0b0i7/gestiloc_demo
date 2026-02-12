import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Home,
  AlertCircle,
  DollarSign,
  Building,
  Zap,
  ChevronRight,
  MapPin,
  FileText,
  Handshake,
  Briefcase,
  Users,
  Plus,
  Bell,
  Download,
  Calendar,
} from "lucide-react";
import { Card } from "../../Proprietaire/components/ui/Card";
import { Button } from "../../Proprietaire/components/ui/Button";
import { Skeleton } from "../../Proprietaire/components/ui/Skeleton";
import { Tab } from "../types";
import { PropertyModal } from './PropertyModal';

import {
  coOwnerApi,
  type CoOwnerProperty,
  type CoOwnerLease,
  type CoOwnerRentReceipt,
  type CoOwnerNotice,
  type PropertyDelegation,
  type CoOwnerProfile,
} from "@/services/coOwnerApi";

interface CoOwnerDashboardProps {
  onNavigate: (tab: Tab) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    isFinite(n) ? n : 0
  );

export const CoOwnerDashboard: React.FC<CoOwnerDashboardProps> = ({ onNavigate, notify }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoOwnerProfile | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<CoOwnerProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileData = await coOwnerApi.getProfile();
      setProfile(profileData);
    } catch (e: any) {
      console.error(e);
      notify(e?.message || "Impossible de charger le tableau de bord", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handlePropertyUpdated = () => {
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Impossible de charger les données du tableau de bord.</p>
        <Button onClick={fetchProfile} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  const dashboardData = profile.dashboard_data || {
    subscription: { plan: 'Permanent', renewal_date: '15 Mars 2026' },
    rent_data: [],
    graph_max: 5000,
    occupancy_data: { occupied: 0, vacant: 0, total: 0, occupancy_rate: 0 },
    recent_documents: [],
    quick_actions: [],
    kpis: {
      expected_rent: 0,
      received_rent: 0,
      occupancy_rate: 0,
      occupied_properties: 0,
      total_properties: 0,
      active_delegations: 0,
      active_alerts: 0
    }
  };

  const { subscription, rent_data, graph_max, occupancy_data, recent_documents, quick_actions, kpis } = dashboardData;
  const isAgency = profile.is_professional;

  // Générer l'échelle verticale dynamique
  const generateScale = (max: number) => {
    const steps = 5;
    const step = max / steps;
    const scale = [];
    for (let i = steps; i >= 0; i--) {
      scale.push(Math.round(i * step));
    }
    return scale;
  };

  const verticalScale = generateScale(graph_max);

  return (
    <div className="p-6 space-y-8">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Bienvenue sur Gestiloc{profile.company_name ? `, ${profile.company_name}` : ''} !
            </h1>
            <p className="text-slate-600 text-lg">
              Merci de vous être inscrit ! Nous sommes heureux de vous avoir à bord ! 
              Dites-nous un peu plus sur vous afin de compléter votre profil et de profiter 
              pleinement de toutes nos fonctionnalités.
            </p>
          </div>
          
        
        </div>
      </div>

  <div className="rounded-xl p-4 min-w-[200px] 
                bg-gradient-to-br from-blue-50 to-sky-100
                border border-blue-200 
                shadow-md
                grid grid-cols-2 gap-y-2">
  
  <span className="text-sm text-blue-600">Abonnement</span>
  <span className="text-sm font-semibold text-blue-800 text-right">
    {subscription.plan}
  </span>

  <span className="text-sm text-blue-600">Renouvellement</span>
  <span className="text-sm font-medium text-blue-900 text-right">
    {subscription.renewal_date}
  </span>
</div>


      {/* Section 1-2-3 avec image à droite */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Texte à gauche */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Pour démarrer, c'est simple comme 1, 2, 3...
            </h2>
            
            <div className="space-y-6">
              {quick_actions.map((action, index) => (
                <div 
                  key={action.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                 
                >
                  <div className="text-2xl font-bold text-blue-600">{(index + 1) + '\uFE0F\u20E3'}</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{action.title}</h3>
                    <p className="text-slate-600">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image à droite */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Dashboard illustration"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des loyers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Loyers</h2>
          
          </div>
          
          {/* Échelle verticale dynamique */}
          <div className="flex h-64 mb-2">
            <div className="flex flex-col justify-between mr-4 text-right text-sm text-slate-500">
              {verticalScale.map((value, index) => (
                <div key={index}>{value.toLocaleString('fr-FR')}</div>
              ))}
            </div>
            
            {/* Graphique */}
            <div className="flex-1 flex items-end space-x-4">
              {rent_data.map((item, index) => {
                const receivedHeight = (item.received / graph_max) * 180;
                const expectedHeight = ((item.expected - item.received) / graph_max) * 180;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    {/* Barres empilées */}
                    <div className="w-full flex flex-col items-center">
                      <div 
                        className="w-6 bg-blue-500 rounded-t-lg"
                        style={{ height: `${Math.max(0, receivedHeight)}px` }}
                      ></div>
                      <div 
                        className="w-6 bg-blue-300 rounded-b-lg mt-1"
                        style={{ height: `${Math.max(0, expectedHeight)}px` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-2">{item.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Légende */}
          <div className="flex justify-center space-x-8 mt-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-slate-700">Loyers reçus</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-300 rounded mr-2"></div>
              <span className="text-sm text-slate-700">Loyers attendus</span>
            </div>
          </div>
        </div>

        {/* Graphique Taux d'occupation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Cette année</h2>
          
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-blue-700">{occupancy_data.occupancy_rate}%</div>
            <div className="text-sm text-slate-500">Taux d'occupation</div>
          </div>
          
          {/* Graphique circulaire simplifié */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              {/* Cercle de fond */}
              <div className="absolute inset-0 rounded-full border-8 border-slate-200"></div>
              
              {/* Portion occupée */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-blue-500"
                style={{
                  clipPath: `inset(0 ${100 - occupancy_data.occupancy_rate}% 0 0)`,
                }}
              ></div>
              
              {/* Portion vacante */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-blue-300"
                style={{
                  clipPath: `inset(0 0 0 ${occupancy_data.occupancy_rate}%)`,
                }}
              ></div>
            </div>
          </div>
          
          {/* Légende et chiffres */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">{occupancy_data.occupied}</div>
              <div className="text-sm text-slate-600">Occupés</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-300">{occupancy_data.vacant}</div>
              <div className="text-sm text-slate-600">Vacants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents récents */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Nouveaux documents</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('documents')}>
            Voir tous <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {recent_documents.length > 0 ? (
            recent_documents.map((doc, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{doc.title}</div>
                    <div className="text-sm text-slate-500">{doc.date}</div>
                  </div>
                </div>
                
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Aucun document récent</p>
            </div>
          )}
        </div>
      </div>

      {/* KPIs en bas */}


      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notify={notify}
        onUpdate={handlePropertyUpdated}
        isAgency={isAgency}
      />
    </div>
  );
};