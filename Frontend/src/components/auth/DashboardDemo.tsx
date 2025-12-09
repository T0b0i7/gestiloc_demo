import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Home, AlertCircle, Users, DollarSign, Building, CheckCircle, Calendar, Wrench, FileText, ArrowUpRight } from 'lucide-react';

const DashboardDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'landlord' | 'tenant'>('landlord');

  const landlordKPIs = [
    {
      label: 'Revenus Mensuels',
      value: '12 500 €',
      trend: '+2.5%',
      isPositive: true,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      label: 'Taux d\'Occupation',
      value: '87.5%',
      trend: '+5%',
      isPositive: true,
      icon: <Home className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Nombre de Biens',
      value: '8',
      trend: '+1',
      isPositive: true,
      icon: <Building className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const tenantWidgets = [
    {
      title: 'Loyer de Novembre',
      value: '850.00 €',
      status: 'À jour',
      statusColor: 'bg-green-100 text-green-700',
      icon: <CheckCircle className="w-6 h-6" />,
      iconBg: 'bg-green-100 text-green-600',
      subtitle: 'Payé par virement le 28/11'
    },
    {
      title: 'Prochaine Échéance',
      value: '01 Déc',
      status: 'À venir',
      statusColor: 'bg-blue-100 text-blue-700',
      icon: <Calendar className="w-6 h-6" />,
      iconBg: 'bg-blue-100 text-blue-600',
      subtitle: 'Prélèvement auto activé'
    }
  ];

  return (
    <motion.div
      className="max-w-md relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Demo Badge */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 px-4">
        <span className="text-sm font-bold">DÉMO - Aperçu des Tableaux de Bord</span>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 mx-4 mt-4 rounded-lg">
        <button
          onClick={() => setActiveTab('landlord')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'landlord'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Propriétaire
        </button>
        <button
          onClick={() => setActiveTab('tenant')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tenant'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Locataire
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'landlord' ? (
            <motion.div
              key="landlord"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Tableau de Bord Propriétaire</h3>
                <p className="text-sm text-slate-500">Gestion de votre patrimoine</p>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2">
                {landlordKPIs.map((kpi, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center mb-2 mx-auto`}>
                      {kpi.icon}
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-slate-900">{kpi.value}</p>
                    <div className={`flex items-center justify-center gap-1 text-xs font-semibold mt-1 ${
                      kpi.isPositive ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {kpi.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {kpi.trend}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini Chart */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Analyse Financière</p>
                <div className="flex items-end justify-between h-16">
                  {[40, 60, 45, 70, 55, 65].map((height, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-emerald-500 rounded-t w-full max-w-4"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-slate-500 mt-1">M{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Properties Preview */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Mes Biens (3/8)</p>
                <div className="space-y-2">
                  {[
                    { name: 'Résidence Les Hortensias', status: 'Loué', rent: '2 500 €' },
                    { name: 'Appartement Montmartre', status: 'Vacant', rent: '1 800 €' },
                    { name: 'Studio République', status: 'Travaux', rent: '1 200 €' }
                  ].map((property, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 truncate">{property.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          property.status === 'Loué' ? 'bg-emerald-100 text-emerald-700' :
                          property.status === 'Vacant' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {property.status}
                        </span>
                        <span className="text-slate-600 font-medium">{property.rent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tenant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Tableau de Bord Locataire</h3>
                <p className="text-sm text-slate-500">Gestion de votre location</p>
              </div>

              {/* Status Cards */}
              <div className="space-y-3">
                {tenantWidgets.map((widget, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${widget.iconBg}`}>
                        {widget.icon}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${widget.statusColor}`}>
                        {widget.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{widget.title}</h4>
                    <p className="text-lg font-bold text-slate-900 mb-1">{widget.value}</p>
                    <p className="text-xs text-slate-500">{widget.subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Property Info */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Mon Logement</p>
                <div className="bg-white rounded-lg p-2 mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Résidence Les Hortensias</span>
                    <span className="text-slate-700 font-medium">Apt 42 • Paris 2e</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <span className="text-slate-500 block">Surface</span>
                      <span className="font-bold text-slate-900">45 m²</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-500 block">Type</span>
                      <span className="font-bold text-slate-900">T2</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-500 block">DPE</span>
                      <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <FileText size={14} />
                  Quittances
                </button>
                <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <ArrowUpRight size={14} />
                  Payer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-500">
          Découvrez toutes les fonctionnalités après connexion
        </p>
      </div>
    </motion.div>
  );
};

export default DashboardDemo;