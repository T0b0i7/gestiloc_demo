
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Home, AlertCircle, Users, DollarSign, Building, Zap, ChevronRight, MapPin, CheckCircle, Clock, Plus, UserPlus, FileSignature, FileText } from 'lucide-react';
import EtatsLieux from '@/pages/Admin/components/EtatsLieux';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';
import { Tab } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, notify }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  // Data for charts
  const financialData = [
    { month: 'Jan', revenus: 12500, depenses: 3200 },
    { month: 'Fév', revenus: 12500, depenses: 3800 },
    { month: 'Mar', revenus: 12500, depenses: 2900 },
    { month: 'Avr', revenus: 12500, depenses: 4100 },
    { month: 'Mai', revenus: 12500, depenses: 3400 },
    { month: 'Jun', revenus: 12500, depenses: 3600 },
  ];

  const occupationData = [
    { name: 'Loués', value: 7, fill: '#10b981' },
    { name: 'Vacants', value: 1, fill: '#fbbf24' }
  ];

  const transactionData = [
    { type: 'Loyer Studio', amount: '+1200 €', date: '28 Nov', icon: '✓', color: 'text-green-600' },
    { type: 'Maintenance', amount: '-350 €', date: '26 Nov', icon: '-', color: 'text-red-600' },
    { type: 'Loyer Montmartre', amount: '+1800 €', date: '25 Nov', icon: '✓', color: 'text-green-600' },
    { type: 'Assurance', amount: '-520 €', date: '22 Nov', icon: '-', color: 'text-red-600' },
  ];

  const kpis = [
    {
      label: 'Revenus Mensuels',
      value: '12 500 €',
      trend: '+2.5%',
      isPositive: true,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      label: 'Taux d\'Occupation',
      value: '87.5%',
      trend: '+5%',
      isPositive: true,
      icon: <Home className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Nombre de Biens',
      value: '8',
      trend: '+1',
      isPositive: true,
      icon: <Building className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Alertes Actives',
      value: '2',
      trend: '-1',
      isPositive: false,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const recentProperties = [
    { 
      id: 1, 
      name: 'Résidence Les Hortensias', 
      address: 'Paris 2e', 
      status: 'Loué', 
      rent: '2 500 €/mois',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=200',
      locataire: 'M. Dupont'
    },
    { 
      id: 2, 
      name: 'Appartement Montmartre', 
      address: 'Paris 18e', 
      status: 'Vacant', 
      rent: '1 800 €/mois',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200',
      locataire: 'Disponible'
    },
    { 
      id: 3, 
      name: 'Studio République', 
      address: 'Paris 11e', 
      status: 'Travaux', 
      rent: '1 200 €/mois',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200',
      locataire: 'En rénovation'
    }
  ];

  const alerts = [
    { type: 'impayé', message: 'Impayé locataire Lot 5 - Montant: 850 €', severity: 'high', icon: '⚠️' },
    { type: 'assurance', message: 'Renouvellement assurance responsabilité civile le 15 Déc', severity: 'medium', icon: '📋' },
    { type: 'document', message: 'Diagnostic Plomb expirant dans 30 jours', severity: 'medium', icon: '📄' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Tableau de Bord Propriétaire</h1>
          <p className="text-slate-500 mt-2 text-lg">Bienvenue ! Voici l'état de votre patrimoine immobilier</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => onNavigate('documents')}>Mes Documents</Button>
          <Button variant="primary" onClick={() => onNavigate('properties')}>Ajouter un Bien</Button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Zap className="w-6 h-6 text-blue-600" />
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Add Property */}
          <Link 
            to="/proprietaire/ajouter-bien"
            className="group relative block bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Building className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">+ Ajouter un Bien</h3>
                <p className="text-sm text-slate-500 mt-1">Enregistrez un nouveau bien immobilier</p>
              </div>
              <div className="mt-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Créer</span>
              </div>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </div>
          </Link>

          {/* Add Tenant */}
          <Link 
            to="/proprietaire/ajouter-locataire"
            className="group relative block bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <UserPlus className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">+ Ajouter un Locataire</h3>
                <p className="text-sm text-slate-500 mt-1">Enregistrez un nouveau locataire</p>
              </div>
              <div className="mt-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Créer</span>
              </div>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-emerald-600" />
            </div>
          </Link>

          {/* Add Rental */}
          <Link 
            to="/proprietaire/nouvelle-location"
            className="group relative block bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FileSignature className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">+ Nouvelle Location</h3>
                <p className="text-sm text-slate-500 mt-1">Créez un nouveau contrat de location</p>
              </div>
              <div className="mt-2">
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Créer</span>
              </div>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </div>
          </Link>
        </div>
      </div>

      {/* Section États des lieux */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">États des lieux</h2>
          <Link 
            to="/proprietaire/documents/etats-des-lieux"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
          >
            Voir tout <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <Card className="p-6">
          <div className="border rounded-lg overflow-hidden">
            <EtatsLieux propertyId="1" /> {/* Remplacez "1" par l'ID du bien actuel ou la logique appropriée */}
          </div>
        </Card>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all">
            <div className={`w-12 h-12 rounded-lg ${kpi.color} flex items-center justify-center mb-4`}>
              {kpi.icon}
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between gap-3">
              <span className="text-3xl font-bold text-slate-900">{kpi.value}</span>
              <div className={`flex items-center gap-1 text-sm font-semibold ${kpi.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'} px-2 py-1 rounded`}>
                {kpi.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenues vs Expenses Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Analyse Financière</h2>
                <p className="text-sm text-slate-500 mt-1">Revenus vs Dépenses (6 derniers mois)</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('finances')}>Voir détails →</Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => `${value} €`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenus" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="depenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Properties Grid */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Mes Biens</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('properties')}>Voir tous →</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onNavigate('properties')}>
                  <div className="relative h-32 overflow-hidden">
                    <img src={property.image} alt={property.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      property.status === 'Loué' ? 'bg-emerald-100 text-emerald-700' :
                      property.status === 'Vacant' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {property.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{property.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin size={12} />
                      {property.address}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500">Loyer</p>
                      <p className="font-bold text-emerald-600">{property.rent}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Occupation Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Taux d'Occupation</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={occupationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {occupationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Loués</span>
                <span className="font-bold text-emerald-600">7/8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Vacants</span>
                <span className="font-bold text-amber-600">1/8</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Transactions Récentes</h2>
            <div className="space-y-3">
              {transactionData.map((transaction, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      transaction.color.includes('green') ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {transaction.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{transaction.type}</p>
                      <p className="text-xs text-slate-500">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${transaction.color}`}>{transaction.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Widget */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Alertes
              </h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{alerts.length}</span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'high' 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-amber-50 border-amber-500'
                }`}>
                  <div className="flex gap-2">
                    <span className="text-lg">{alert.icon}</span>
                    <p className={`text-xs font-medium ${
                      alert.severity === 'high' ? 'text-red-900' : 'text-amber-900'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IA Assistant CTA */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold text-lg">GestiBot Assistant</h3>
            </div>
            <p className="text-sm text-blue-100 mb-4">Explorez les analyses avancées et optimisez votre rentabilité avec notre IA.</p>
            <Button 
              variant="primary" 
              className="w-full bg-white text-blue-600 hover:bg-blue-50" 
              onClick={() => onNavigate('ai-assistant')}
            >
              Lancer l'assistant →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
