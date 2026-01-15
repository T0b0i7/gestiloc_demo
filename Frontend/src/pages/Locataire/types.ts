export type Tab = 'home' | 'payments' | 'messages' | 'interventions' | 'documents' | 'lease' | 'property' | 'profile'  | "factures" | "paiement";

export enum PaymentStatus {
  PAID = 'Payé',
  PENDING = 'En attente',
  LATE = 'En retard',
  UNPAID = 'Impayé'
}

export interface Payment {
  id: string;
  month: string;
  amount: number;
  status: PaymentStatus;
  datePaid?: string;
  dueDate: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'owner' | 'agency';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  unreadCount: number;
  avatar?: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Intervention {
  id: string;
  title: string;
  type: 'Plomberie' | 'Électricité' | 'Chauffage' | 'Autre';
  status: 'En cours' | 'Terminé' | 'Planifié';
  date: string;
  provider?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'diagnostic' | 'charge' | 'inventory';
  date: string;
  downloadUrl: string;
}

export interface Notification {
  id: string;
  type: 'critical' | 'important' | 'info';
  message: string;
  subtext?: string;
  isRead: boolean;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Payment Integration Types
export interface PaymentSession {
  id: string;
  invoice_id: number;
  amount: number;
  currency: string;
  reference: string;
  fedapay_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  expires_at?: string;
}

export interface PaymentInitializePayload {
  invoice_id: number;
  amount: number;
  currency?: string;
  description?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface PaymentConfirmation {
  id: number;
  invoice_id: number;
  transaction_id: string;
  amount_paid: number;
  payment_method: string;
  paid_at: string;
  receipt_url?: string;
  status: 'success' | 'failed' | 'pending';
}
