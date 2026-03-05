/**
 * ============================
 * TYPES MÉTIER ADMIN
 * ============================
 */

export type ViewType = 'dashboard' | 'users' | 'tickets' | 'activity' | 'settings';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export type AdminUserType =
  | 'admin'
  | 'tenant'
  | 'landlord'
  | 'co_owner'
  | 'agency'
  | 'co_owner_agency'
  | 'unknown'

export interface AdminLandlordProfile {
  id: number
  owner_type: 'landlord' | 'co_owner'
  first_name?: string
  last_name?: string
  company_name?: string
  vat_number?: string
}

export interface AdminTenantProfile {
  id: number
  first_name: string
  last_name: string
  status: string
  solvency_score?: number
}

export interface AdminAgencyProfile {
  id: number
  agency_type: 'agency' | 'co_owner_agency'
  company_name: string
  email?: string
  phone?: string
}

export interface AdminUser {
  id: number
  email: string
  phone?: string
  status: 'active' | 'suspended' | 'pending' | 'inactive'
  roles: string[]
  user_type: AdminUserType

  landlord?: AdminLandlordProfile
  tenant?: AdminTenantProfile
  agency?: AdminAgencyProfile

  last_activity_at?: string
  created_at: string
}

/**
 * ============================
 * RÉPONSES API
 * ============================
 */

export interface AdminUserListResponse {
  data: AdminUser[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface AdminUserSummary {
  role: AdminUserType
  properties?: number
  active_leases?: number
  total_revenue?: number
  total_paid?: number
  maintenance_requests?: number
  managed_properties?: number
  delegations?: number
}

export interface AdminUserActivityItem {
  type: string
  count?: number
  date?: string
  label: string
}

export interface AdminUserDetailsResponse {
  user: AdminUser
  summary: AdminUserSummary
  activity: AdminUserActivityItem[]
}

/**
 * ============================
 * FILTRES LISTING
 * ============================
 */
export interface AdminUserFilters {
  type?: AdminUserType
  search?: string
  sort_by?: 'created_at' | 'email'
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

/**
 * ============================
 * TYPES LÉGACY (COMPATIBILITÉ)
 * ============================
 */

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BANNED = 'banned',
  WARNING = 'warning'
}

export enum TicketStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
  lastActive: string
  avatarUrl?: string
}

export interface Ticket {
  id: string
  subject: string
  requester: string
  status: TicketStatus
  priority: TicketPriority
  created: string
  tags: string[]
}

export interface ActivityLog {
  id: string
  action: string
  user: string
  timestamp: string
  type: 'success' | 'error' | 'info' | 'warning' | 'user_registered' | 'payment_failed' | 'ticket_updated' | 'system_warning'
}

export interface RevenueData {
  month: string
  revenue: number
  expenses: number
}
/**
 * ============================
 * DASHBOARD — API RESPONSE
 * ============================
 */

export interface DashboardStatsResponse {
  kpi: {
    total_users: number
    online_users: number
    offline_users: number
    online_percentage: number
    total_landlords: number
    total_tenants: number
    suspended_users: number
    deactivated_users: number
    user_growth_rate: number
    new_users_this_month: number
  }

  properties: {
    total_properties: number
    new_properties_this_month: number
    global_occupancy_rate: number
    properties_with_leases: number
    vacant_properties: number
  }

  leases: {
    total_leases: number
    active_leases: number
    new_leases_this_month: number
    lease_activation_rate: number
  }

  financial: {
    monthly_expected_rent: number
    monthly_collected_rent: number
    collection_rate: number
    revenue_growth_rate: number
    last_month_expected_rent: number
    last_month_collected_rent: number
  }

  payments: {
    total_payments: number
    fedapay_payments: number
    successful_payments: number
    fedapay_conversion_rate: number
  }

  documents: {
    rent_receipts_count: number
    property_condition_reports_count: number
    contracts_count: number
    total_documents: number
  }

  maintenance: {
    total_requests: number
    open_requests: number
    in_progress_requests: number
    resolved_requests: number
  }

  charts: {
    revenue_trend: Array<{
      month: string
      month_label: string
      expected_rent: number
      collected_rent: number
      collection_rate: number
    }>
    online_by_role: Record<string, number>
  }

  recent_activity: Array<{
    type: string
    description: string
    property?: string
    tenant?: string
    landlord?: string
    created_at: string
  }>

  updated_at: string
}
