export type Tab = 'home' | 'payments' | 'messages' | 'interventions' | 'documents' | 'lease' | 'property' | 'profile' | 'dashboard' | 'bureau' | 'properties' | 'biens' | 'lots' | 'immeubles' | 'properties-lots' | 'properties-buildings' | 'tenants' | 'locataires' | 'rentals' | 'locations' | 'inventory' | 'inventaires' | 'inspection' | 'etat-des-lieux' | 'etats-lieux' | 'finances' | 'finances-overview' | 'finances-loans' | 'finances-summary' | 'finances-tax' | 'my-documents' | 'e-signature' | 'letter-templates' | 'documents' | 'carnet' | 'notebook' | 'messages' | 'candidates' | 'candidats' | 'tools' | 'rent-review' | 'charge-regularization' | 'mail-sending' | 'ai-assistant' | 'trash' | 'corbeille' | 'plus' | 'settings' | 'onboarding' | 'gestion-locative' | 'ajouter-bien' | 'mes-biens' | 'coproprietaires' | 'inviter-coproprietaire' | 'nouvelle-location' | 'liste-locations' | 'incidents' | 'quittances' | 'preavis' | 'avis-echeance' | 'paiements' | 'etats-des-lieux' | 'baux' | 'documents/baux' | 'émettre-facture' | 'factures' | 'comptabilite' | 'parametres' | 'profil' | 'archives';

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

export interface Invoice {
  id: string;
  lease_id: string;
  invoice_number: string;
  type: 'rent' | 'deposit' | 'charge' | 'repair';
  due_date: string;
  period_start?: string;
  period_end?: string;
  amount_total: number;
  amount_paid: number;
  balance_due: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  pdf_path?: string;
  sent_at?: string;
  lease?: {
    id: string;
    rent_amount: number;
    charges_amount: number;
    tenant?: {
      id: string;
      full_name: string;
      email?: string;
      phone?: string;
    };
    property?: {
      id: string;
      address: string;
      city: string;
      zip_code: string;
      surface: number;
      room_count: number;
    };
  };
  transactions?: Transaction[];
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  charges_amount: number;
  deposit?: number;
  guarantee_amount?: number;
  status: string;
  property?: {
    id: string;
    address: string;
    city: string;
    zip_code: string;
    surface: number;
    room_count: number;
    landlord?: {
      id: string;
      full_name?: string;
      email?: string;
      phone?: string;
    };
  };
  tenant?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  };
  invoices?: Invoice[];
  created_at: string;
  updated_at: string;
}
