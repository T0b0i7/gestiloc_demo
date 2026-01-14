
export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  BANNED = 'Banned',
  WARNING = 'Warning'
}

export enum TicketStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Tenant';
  status: UserStatus;
  lastActive: string;
  avatarUrl: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester: string;
  status: TicketStatus;
  priority: TicketPriority;
  created: string;
  tags: string[];
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export type ViewType = 'dashboard' | 'users' | 'tickets' | 'activity' | 'payments' | 'documents' | 'settings';
