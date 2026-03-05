import React, { useEffect, useState } from 'react'
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Trash2,
  Eye,
  X,
  UserCheck,
  UserX,
  LogIn,
  Users,
  TrendingUp,
  Activity,
} from 'lucide-react'

import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { Input, Select } from './ui/Input'

import { useAppContext } from '../context/AppContext'
import { administratorService } from '@/services/administrator'

import { UserDetail } from './UserDetail'

import {
  AdminUser,
  AdminUserFilters,
  AdminUserType,
} from '@/pages/Admin/types'

/**
 * ============================
 * ADMIN — USER MANAGEMENT
 * ============================
 */
export const UserManagement: React.FC = () => {
  const { t, showToast } = useAppContext()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    per_page: 15,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<AdminUserType | 'All'>('All')

  const [loading, setLoading] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)

  /* ============================
   * FETCH USERS
   * ============================ */
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await administratorService.listUsers({
        ...filters,
        search: searchTerm || undefined,
        type: filterRole !== 'All' ? filterRole : undefined,
      })
      setUsers(data.data)
    } catch {
      showToast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters, searchTerm, filterRole])

  /* ============================
   * HELPERS UI
   * ============================ */
  const getUserName = (user: AdminUser) => {
    if (user.tenant)
      return `${user.tenant.first_name} ${user.tenant.last_name}`

    if (user.landlord)
      return (
        user.landlord.company_name ??
        `${user.landlord.first_name ?? ''} ${user.landlord.last_name ?? ''}`
      )

    if (user.agency) return user.agency.company_name

    return user.email
  }

  const getRoleLabel = (type: AdminUserType) => {
    switch (type) {
      case 'admin':
        return 'Admin'
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
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusVariant = (status: AdminUser['status']) =>
    status === 'active' ? 'success' : 'danger'

  /* ============================
   * STATS CALCULATION
   * ============================ */
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const suspendedUsers = users.filter(u => u.status === 'suspended').length

  /* ============================
   * ACTIONS
   * ============================ */
  const handleSuspendUser = async (user: AdminUser) => {
    try {
      await administratorService.suspendUser(user.id)
      showToast(t('users.suspended'), 'success')
      fetchUsers()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleReactivateUser = async (user: AdminUser) => {
    try {
      await administratorService.reactivateUser(user.id)
      showToast(t('users.reactivated'), 'success')
      fetchUsers()
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    showToast(t('users.userDeleted'), 'info')
    setUserToDelete(null)
  }

  /* ============================
   * RENDER
   * ============================ */
  return (
    <div className="p-6 space-y-6 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* HEADER */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Users className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-400 dark:to-indigo-400">
              {t('users.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
              {t('users.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Users size={24} />
            </div>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide mb-1">Total Utilisateurs</p>
       <p className="text-4xl font-black text-white">
  {totalUsers}
</p>

        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <Activity size={20} className="opacity-80" />
          </div>
          <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wide mb-1">Utilisateurs Actifs</p>
          <p className="text-4xl font-black text-white">{activeUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <UserX size={24} />
            </div>
          </div>
          <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide mb-1">Utilisateurs Suspendus</p>
          <p className="text-4xl font-black text-white">{suspendedUsers}</p>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="p-6 shadow-xl border-2 border-slate-200 dark:border-slate-700" delay={100}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Search className="text-white" size={20} />
              </div>
            </div>
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              className="w-full pl-16 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border-2 border-slate-300 dark:border-slate-600">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Filter size={20} className="text-white" />
            </div>
            <select
              className="bg-transparent border-none text-slate-900 dark:text-white font-bold text-base cursor-pointer focus:outline-none pr-8"
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value as AdminUserType | 'All')
              }
            >
              <option value="All">{t('users.allRoles')}</option>
              <option value="admin">🔐 Admin</option>
              <option value="tenant">🏠 Locataire</option>
              <option value="landlord">👤 Propriétaire</option>
              <option value="co_owner">🤝 Co-propriétaire</option>
              <option value="agency">🏢 Agence</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border-2 border-slate-200 dark:border-slate-700">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('users.table.user')}
                </th>
                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('users.table.role')}
                </th>
                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('users.table.status')}
                </th>
                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('users.table.lastActive')}
                </th>
                <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('users.table.actions')}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {getUserName(user).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {getUserName(user)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${getRoleBadgeColor(user.user_type)}`}>
                      {getRoleLabel(user.user_type)}
                    </span>
                  </td>

                  <td className="py-5 px-6">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-bold shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        Suspendu
                      </span>
                    )}
                  </td>

                  <td className="py-5 px-6 text-sm text-slate-600 dark:text-slate-400 font-semibold">
                    {user.last_activity_at
                      ? new Date(user.last_activity_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '—'}
                  </td>

                  <td className="py-5 px-6">
                    <div className="flex justify-end gap-2">
                      {/* Action: Voir détails */}
                      <button 
                        onClick={() => {
                          setSelectedUserId(user.id)
                          setShowUserDetailsModal(true)
                        }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                        title="Voir les détails"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Action: Impersonner */}
                      <button 
                        onClick={() => handleImpersonateUser(user)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                        title="Impersonner"
                      >
                        <LogIn size={18} />
                      </button>

                      {/* Action: Suspendre/Réactiver */}
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => handleSuspendUser(user)}
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                          title="Suspendre"
                        >
                          <UserX size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReactivateUser(user)}
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                          title="Réactiver"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}

                      {/* Action: Supprimer */}
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                        <Users size={40} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-semibold">{t('users.noUsers')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DELETE MODAL */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title={t('common.confirm')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
          {t('users.deleteConfirm')}
        </p>
      </Modal>

      {/* USER DETAILS MODAL */}
      <Modal
        isOpen={showUserDetailsModal && selectedUserId !== null}
        onClose={() => {
          setShowUserDetailsModal(false)
          setSelectedUserId(null)
        }}
        title={t('users.userDetails')}
        size="lg"
        footer={null}
      >
        {selectedUserId && (
          <UserDetail
            userId={selectedUserId}
            onBack={() => {
              setShowUserDetailsModal(false)
              setSelectedUserId(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}