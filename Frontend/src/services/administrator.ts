// src/services/administrator.ts
import api from './api'
import {
  AdminUserFilters,
  AdminUserListResponse,
  AdminUserDetailsResponse,
  DashboardStatsResponse,
} from '@/pages/Admin/types'

export const administratorService = {
  listUsers(params?: AdminUserFilters) {
    return api.get<AdminUserListResponse>('/admin/users', { params })
  },

  getUser(id: number) {
    return api.get<AdminUserDetailsResponse>(`/admin/users/${id}`)
  },

  suspendUser(id: number) {
    return api.post(`/admin/users/${id}/suspend`)
  },

  reactivateUser(id: number) {
    return api.post(`/admin/users/${id}/reactivate`)
  },

  deactivateUser(id: number) {
    return api.post(`/admin/users/${id}/deactivate`)
  },

  impersonateUser(id: number) {
    return api.post(`/admin/users/${id}/impersonate`)
  },

  deleteUser(id: number) {
    return api.delete(`/admin/users/${id}`)
  },

  /**
   * DASHBOARD
   */
  getDashboardStats() {
    return api.get<DashboardStatsResponse>('/admin/dashboard/stats')
  },
}
