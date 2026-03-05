import React, { useState, useEffect, useRef } from 'react'
import { Shield, Database, Lock, Download, TrendingUp, FileText, Bell, AlertCircle, Sparkles, Info } from 'lucide-react'
import { Card } from './ui/Card'
import { useAppContext } from '../context/AppContext'
import { administratorService } from '../../../services/administrator'
import { DashboardStatsResponse } from '@/pages/Admin/types'

export default function Dashboard() {
  const { t, showToast } = useAppContext()
  const [dashboardData, setDashboardData] = useState<DashboardStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const response = await administratorService.getDashboardStats()
        setDashboardData(response.data.data)
      } catch (error) {
        console.error('Error fetching dashboard:', error)
        showToast(t('dashboard.fetchError'), 'error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [t, showToast])

  if (!dashboardData?.kpi || !dashboardData?.financial) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  const advisoryCards = [
    {
      icon: Database,
      title: "Confidentialité des données",
      description: "Les données de la plateforme GesticLoc sont strictement confidentielles. Assurez-vous de respecter le RGPD et de protéger toutes les informations sensibles de vos utilisateurs, propriétaires et locataires. Limitez l'accès aux données personnelles uniquement aux personnes autorisées.",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-600",
      delay: 0
    },
    {
      icon: Lock,
      title: "Sécurité renforcée",
      description: "Utilisez des mots de passe forts et uniques pour votre compte administrateur. Activez l'authentification à deux facteurs (2FA) pour une protection maximale. Changez régulièrement vos identifiants et surveillez les connexions suspectes sur la plateforme.",
      gradient: "from-red-500 to-orange-600",
      bgGradient: "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      iconBg: "bg-red-600",
      delay: 100
    },
    {
      icon: Download,
      title: "Sauvegarde et export",
      description: "Exportez régulièrement les données de la plateforme pour des sauvegardes externes sécurisées. Programmez des exports automatiques hebdomadaires ou mensuels. Conservez plusieurs copies de sauvegarde dans des emplacements différents pour éviter toute perte de données.",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-600",
      delay: 200
    },
    {
      icon: TrendingUp,
      title: "Suivi des performances",
      description: "Surveillez régulièrement les indicateurs financiers clés de votre plateforme : taux de collecte des loyers, taux d'occupation des propriétés, et performance globale. Analysez les tendances mensuelles pour identifier les opportunités d'amélioration et anticiper les problèmes.",
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-600",
      delay: 300
    },
    {
      icon: FileText,
      title: "Organisation documentaire",
      description: "Maintenez une organisation rigoureuse de tous vos documents légaux : contrats de location, états des lieux, quittances de loyer. Assurez-vous que tous les documents sont à jour, correctement archivés et facilement accessibles en cas de besoin. Respectez les délais de conservation légaux.",
      gradient: "from-amber-500 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-600",
      delay: 400
    },
    {
      icon: Bell,
      title: "Gestion des notifications",
      description: "Configurez un système de notifications efficace pour rester informé des événements importants : nouveaux paiements. Une communication proactive améliore la satisfaction des utilisateurs et prévient les problèmes.",
      gradient: "from-cyan-500 to-teal-600",
      bgGradient: "from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20",
      borderColor: "border-cyan-200 dark:border-cyan-800",
      iconBg: "bg-cyan-600",
      delay: 500
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 pb-20">
      {/* Hero Section avec animations */}
      <div className="max-w-7xl mx-auto">
        {/* Header animé */}
     

        {/* Section Conseils */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl shadow-lg">
              <Shield className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                Conseils et Bonnes Pratiques
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Optimisez la gestion de votre plateforme</p>
            </div>
          </div>

          {/* Grille de conseils avec animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisoryCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl border ${card.borderColor} shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 animate-slide-up`}
                  style={{ animationDelay: `${card.delay}ms` }}
                >
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative p-6">
                    {/* Icône avec animation */}
                    <div className={`inline-flex p-3 ${card.iconBg} rounded-xl shadow-lg mb-4 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="text-white" size={24} />
                    </div>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Badge décoratif */}
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-700/50 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
                      <Info size={14} />
                      <span>Recommandation</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerte maintenance si nécessaire */}
        {dashboardData.maintenance && dashboardData.maintenance.open_requests > 5 && (
          <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-r-2xl p-6 shadow-lg animate-bounce-subtle">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600 rounded-xl">
                <AlertCircle className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
                  ⚠️ Attention : Demandes de maintenance en attente
                </h3>
                <p className="text-red-700 dark:text-red-400 leading-relaxed">
                  Plusieurs demandes de maintenance sont actuellement ouvertes. 
                  Pensez à traiter ces tickets rapidement pour assurer la satisfaction des locataires et maintenir 
                  la qualité de service de la plateforme.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles CSS personnalisés */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}