import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Home,
  DollarSign,
  Wrench,
  Users,
  Activity,
  Shield,
  User,
  Edit,
  Trash2,
  Power,
  RefreshCw,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
  Bell,
  Lock,
  Globe,
} from 'lucide-react'

import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

import { useAppContext } from '../context/AppContext'
import { administratorService } from '@/services/administrator'

import {
  AdminUser,
  AdminUserDetailsResponse,
  AdminUserType,
} from '@/pages/Admin/types'

interface UserDetailProps {
  userId: number
  onBack: () => void
}

/**
 * ============================
 * USER DETAIL — ADMIN
 * ============================
 */
export const UserDetail: React.FC<UserDetailProps> = ({ userId, onBack }) => {
  const { t, showToast } = useAppContext()

  const [userDetails, setUserDetails] = useState<AdminUserDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'reactivate' | 'delete' | 'impersonate' | null
    user: AdminUser | null
  }>({ type: null, user: null })

  /* ============================
   * FETCH USER DETAILS
   * ============================ */
  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const { data } = await administratorService.getUser(userId)
      setUserDetails(data)
    } catch {
      showToast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  /* ============================
   * ACTIONS
   * ============================ */
  const handleSuspendUser = async () => {
    if (!actionModal.user) return
    try {
      await administratorService.suspendUser(actionModal.user.id)
      showToast(t('users.suspended'), 'success')
      setActionModal({ type: null, user: null })
      fetchUserDetails()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleReactivateUser = async () => {
    if (!actionModal.user) return
    try {
      await administratorService.reactivateUser(actionModal.user.id)
      showToast(t('users.reactivated'), 'success')
      setActionModal({ type: null, user: null })
      fetchUserDetails()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleDeleteUser = async () => {
    if (!actionModal.user) return
    try {
      await administratorService.deleteUser(actionModal.user.id)
      showToast(t('users.userDeleted'), 'success')
      setActionModal({ type: null, user: null })
      onBack()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleImpersonateUser = async (user: AdminUser) => {
    try {
      await administratorService.impersonateUser(user.id)
      showToast(t('users.impersonating'), 'info')
      window.location.href = '/dashboard'
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  /* ============================
   * HELPERS
   * ============================ */
  const getUserDisplayName = (user: AdminUser): string => {
    if (user.tenant) {
      return `${user.tenant.first_name} ${user.tenant.last_name}`.trim()
    }

    if (user.landlord) {
      if (user.landlord.company_name) {
        return user.landlord.company_name
      }
      return `${user.landlord.first_name ?? ''} ${user.landlord.last_name ?? ''}`.trim()
    }

    if (user.agency) {
      return user.agency.company_name || user.email
    }

    return user.email
  }

  const getRoleLabel = (type: AdminUserType): string => {
    switch (type) {
      case 'admin':
        return 'Administrateur'
      case 'tenant':
        return 'Locataire'
      case 'landlord':
        return 'Propriétaire'
      case 'co_owner':
        return 'Co-propriétaire'
      case 'agency':
        return 'Agence'
      case 'co_owner_agency':
        return 'Agence copro'
      default:
        return '—'
    }
  }

  const getRoleBadgeColor = (type: AdminUserType) => {
    switch (type) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
      case 'tenant':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
      case 'landlord':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
      case 'co_owner':
        return 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
      case 'agency':
        return 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
      case 'co_owner_agency':
        return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white'
    }
  }

  const getStatusIcon = (status: AdminUser['status']) => {
    return status === 'active' ? (
      <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
    ) : (
      <div className="w-3 h-3 rounded-full bg-white"></div>
    )
  }

  const renderStatCard = (icon: React.ReactNode, label: string, value: string | number, gradient: string, delay?: number) => (
    <div 
      className={`${gradient} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: `${delay || 0}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {icon}
        </div>
        <TrendingUp size={20} className="opacity-80" />
      </div>
      <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  )

  const renderDetailItem = (icon: React.ReactNode, label: string, value: string | number | null, gradient?: string) => (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-xl ${gradient || 'bg-gradient-to-br from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">
          {value || '—'}
        </p>
      </div>
    </div>
  )

  const renderActivityItem = (activity: any, index: number) => (
    <div 
      key={activity.id || index} 
      className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all duration-300 group animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
        <Activity size={18} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-900 dark:text-white">{activity.label}</p>
        {activity.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{activity.description}</p>
        )}
        {activity.date && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-medium">
            {new Date(activity.date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
      {activity.status === 'success' && (
        <CheckCircle className="text-emerald-500" size={20} />
      )}
      {activity.status === 'error' && (
        <XCircle className="text-rose-500" size={20} />
      )}
      {activity.status === 'pending' && (
        <AlertCircle className="text-amber-500" size={20} />
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-2xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6">
          <User size={48} className="text-slate-400" />
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('users.userNotFound')}</p>
        <p className="text-slate-600 dark:text-slate-400 mb-8">L'utilisateur demandé n'existe pas ou a été supprimé</p>
        <Button 
          onClick={onBack}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold shadow-lg"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </Button>
      </div>
    )
  }

  const { user, summary, activity } = userDetails

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl text-white font-black text-2xl">
                {getUserDisplayName(user).charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-400 dark:to-indigo-400">
                  {getUserDisplayName(user)}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-xl ${getRoleBadgeColor(user.user_type)}`}>
            {getRoleLabel(user.user_type)}
          </span>
          {user.status === 'active' ? (
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-xl">
              {getStatusIcon(user.status)}
              Actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-bold shadow-xl">
              {getStatusIcon(user.status)}
              Suspendu
            </span>
          )}
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TENANT STATS */}
        {summary.role === 'tenant' && (
          <>
            {renderStatCard(
              <Home size={24} />,
              'Baux Actifs',
              summary.active_leases || 0,
              'bg-gradient-to-br from-blue-500 to-indigo-600',
              0
            )}
            {renderStatCard(
              <CreditCard size={24} />,
              'Total Payé',
              `${summary.total_paid || 0}€`,
              'bg-gradient-to-br from-emerald-500 to-green-600',
              100
            )}
            {renderStatCard(
              <Wrench size={24} />,
              'Demandes Maintenance',
              summary.maintenance_requests || 0,
              'bg-gradient-to-br from-amber-500 to-orange-600',
              200
            )}
            {renderStatCard(
              <FileText size={24} />,
              'Documents',
              summary.documents || 0,
              'bg-gradient-to-br from-purple-500 to-pink-600',
              300
            )}
          </>
        )}

        {/* LANDLORD STATS */}
        {(summary.role === 'landlord' || summary.role === 'co_owner') && (
          <>
            {renderStatCard(
              <Building size={24} />,
              'Propriétés',
              summary.properties || 0,
              'bg-gradient-to-br from-blue-500 to-indigo-600',
              0
            )}
            {renderStatCard(
              <Home size={24} />,
              'Baux Actifs',
              summary.active_leases || 0,
              'bg-gradient-to-br from-emerald-500 to-green-600',
              100
            )}
            {renderStatCard(
              <DollarSign size={24} />,
              'Revenus Totaux',
              `${summary.total_revenue || 0}€`,
              'bg-gradient-to-br from-amber-500 to-orange-600',
              200
            )}
            {renderStatCard(
              <Wrench size={24} />,
              'Demandes Maintenance',
              summary.maintenance_requests || 0,
              'bg-gradient-to-br from-purple-500 to-pink-600',
              300
            )}
          </>
        )}

        {/* AGENCY STATS */}
        {summary.role === 'agency' && (
          <>
            {renderStatCard(
              <Building size={24} />,
              'Propriétés Gérées',
              summary.managed_properties || 0,
              'bg-gradient-to-br from-blue-500 to-indigo-600',
              0
            )}
            {renderStatCard(
              <Users size={24} />,
              'Délégations',
              summary.delegations || 0,
              'bg-gradient-to-br from-emerald-500 to-green-600',
              100
            )}
            {renderStatCard(
              <DollarSign size={24} />,
              'Chiffre d\'Affaires',
              `${summary.revenue || 0}€`,
              'bg-gradient-to-br from-amber-500 to-orange-600',
              200
            )}
            {renderStatCard(
              <Shield size={24} />,
              'Contrats Actifs',
              summary.active_contracts || 0,
              'bg-gradient-to-br from-purple-500 to-pink-600',
              300
            )}
          </>
        )}

        {/* ADMIN STATS */}
        {summary.role === 'admin' && (
          <>
            {renderStatCard(
              <Shield size={24} />,
              'Permissions',
              'Complètes',
              'bg-gradient-to-br from-purple-500 to-indigo-600',
              0
            )}
            {renderStatCard(
              <Users size={24} />,
              'Utilisateurs Gérés',
              summary.managed_users || 0,
              'bg-gradient-to-br from-blue-500 to-cyan-600',
              100
            )}
            {renderStatCard(
              <Activity size={24} />,
              'Actions Journalisées',
              summary.logged_actions || 0,
              'bg-gradient-to-br from-emerald-500 to-green-600',
              200
            )}
            {renderStatCard(
              <Globe size={24} />,
              'Accès Système',
              'Total',
              'bg-gradient-to-br from-amber-500 to-orange-600',
              300
            )}
          </>
        )}
      </div>

      {/* USER DETAILS */}
      <Card className="p-6 shadow-xl border-2 border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-400 dark:to-indigo-400 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <User className="text-white" size={24} />
          </div>
          Informations Utilisateur
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderDetailItem(
            <Mail size={20} />,
            'Email',
            user.email,
            'bg-gradient-to-br from-blue-500 to-indigo-600'
          )}

          {user.phone && renderDetailItem(
            <Phone size={20} />,
            'Téléphone',
            user.phone,
            'bg-gradient-to-br from-emerald-500 to-green-600'
          )}

          {renderDetailItem(
            <Calendar size={20} />,
            'Créé le',
            new Date(user.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }),
            'bg-gradient-to-br from-purple-500 to-pink-600'
          )}

          {user.last_activity_at && renderDetailItem(
            <Activity size={20} />,
            'Dernière activité',
            new Date(user.last_activity_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            'bg-gradient-to-br from-amber-500 to-orange-600'
          )}

          {user.email_verified_at && renderDetailItem(
            <CheckCircle size={20} />,
            'Email vérifié',
            new Date(user.email_verified_at).toLocaleDateString('fr-FR'),
            'bg-gradient-to-br from-green-500 to-emerald-600'
          )}

          {user.last_login_at && renderDetailItem(
            <Lock size={20} />,
            'Dernière connexion',
            new Date(user.last_login_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            'bg-gradient-to-br from-red-500 to-rose-600'
          )}
        </div>
      </Card>

      {/* RECENT ACTIVITY */}
      <Card className="p-6 shadow-xl border-2 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
            Activité Récente (30 jours)
          </h2>
          <Badge variant="info" className="px-4 py-2">
            {activity.length} activité(s)
          </Badge>
        </div>

        <div className="space-y-3">
          {activity.length > 0 ? (
            activity.slice(0, 10).map((act, index) => renderActivityItem(act, index))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-6">
                <Bell size={32} className="text-slate-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucune activité récente</p>
              <p className="text-slate-600 dark:text-slate-400">Cet utilisateur n'a effectué aucune action ces 30 derniers jours</p>
            </div>
          )}
        </div>

        {activity.length > 10 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button className="w-full py-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all duration-300">
              Voir toute l'activité ({activity.length})
            </button>
          </div>
        )}
      </Card>

      {/* ACTIONS */}
      <Card className="p-6 shadow-xl border-2 border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-400 dark:to-indigo-400 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Edit className="text-white" size={24} />
          </div>
          Actions Administrateur
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleImpersonateUser(user)}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RefreshCw size={28} />
            </div>
            <span className="text-lg font-bold">Impersonner</span>
            <span className="text-sm opacity-90 mt-1">Prendre le contrôle</span>
          </button>

          {user.status === 'active' ? (
            <button
              onClick={() => setActionModal({ type: 'suspend', user })}
              className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center group"
            >
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Power size={28} />
              </div>
              <span className="text-lg font-bold">Suspendre</span>
              <span className="text-sm opacity-90 mt-1">Bloquer l'accès</span>
            </button>
          ) : (
            <button
              onClick={() => setActionModal({ type: 'reactivate', user })}
              className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center group"
            >
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw size={28} />
              </div>
              <span className="text-lg font-bold">Réactiver</span>
              <span className="text-sm opacity-90 mt-1">Rétablir l'accès</span>
            </button>
          )}

          <button
            onClick={() => setActionModal({ type: 'delete', user })}
            className="p-6 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Trash2 size={28} />
            </div>
            <span className="text-lg font-bold">Supprimer</span>
            <span className="text-sm opacity-90 mt-1">Action irréversible</span>
          </button>

          <button
            onClick={() => {
              /* Action pour envoyer un email */
              showToast('Fonctionnalité à implémenter', 'info')
            }}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={28} />
            </div>
            <span className="text-lg font-bold">Contacter</span>
            <span className="text-sm opacity-90 mt-1">Envoyer un email</span>
          </button>
        </div>
      </Card>

      {/* ACTION MODAL */}
      <Modal
        isOpen={!!actionModal.type}
        onClose={() => setActionModal({ type: null, user: null })}
        title={
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${
              actionModal.type === 'suspend' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
              actionModal.type === 'reactivate' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
              actionModal.type === 'delete' ? 'bg-gradient-to-br from-red-600 to-rose-700' :
              'bg-gradient-to-br from-blue-500 to-indigo-600'
            } flex items-center justify-center`}>
              {actionModal.type === 'suspend' && <Power size={24} className="text-white" />}
              {actionModal.type === 'reactivate' && <RefreshCw size={24} className="text-white" />}
              {actionModal.type === 'delete' && <Trash2 size={24} className="text-white" />}
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {actionModal.type === 'suspend' && 'Suspendre l\'utilisateur'}
              {actionModal.type === 'reactivate' && 'Réactiver l\'utilisateur'}
              {actionModal.type === 'delete' && 'Supprimer l\'utilisateur'}
            </span>
          </div>
        }
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setActionModal({ type: null, user: null })}
              className="px-6 py-3 rounded-xl font-bold"
            >
              Annuler
            </Button>
            <Button
              variant={actionModal.type === 'delete' ? 'danger' : 'primary'}
              onClick={() => {
                if (actionModal.type === 'suspend') handleSuspendUser()
                else if (actionModal.type === 'reactivate') handleReactivateUser()
                else if (actionModal.type === 'delete') handleDeleteUser()
              }}
              className="px-8 py-3 rounded-xl font-bold shadow-lg"
            >
              {actionModal.type === 'suspend' && 'Suspendre'}
              {actionModal.type === 'reactivate' && 'Réactiver'}
              {actionModal.type === 'delete' && 'Supprimer définitivement'}
            </Button>
          </div>
        }
      >
        {actionModal.user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                {getUserDisplayName(actionModal.user).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">{getUserDisplayName(actionModal.user)}</p>
                <p className="text-slate-600 dark:text-slate-400">{actionModal.user.email}</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 dark:text-amber-400 mt-1" size={20} />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">
                    {actionModal.type === 'suspend' && 'Attention ! Cette action va suspendre l\'accès de cet utilisateur.'}
                    {actionModal.type === 'reactivate' && 'Vous allez rétablir l\'accès de cet utilisateur.'}
                    {actionModal.type === 'delete' && 'Attention ! Cette action est définitive.'}
                  </p>
                  <p className="text-amber-800 dark:text-amber-400 text-sm">
                    {actionModal.type === 'suspend' && 'L\'utilisateur ne pourra plus se connecter jusqu\'à réactivation.'}
                    {actionModal.type === 'reactivate' && 'L\'utilisateur retrouvera immédiatement l\'accès à son compte.'}
                    {actionModal.type === 'delete' && 'Toutes les données de cet utilisateur seront supprimées et ne pourront pas être récupérées.'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-center font-medium">
              Confirmez-vous cette action ?
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}