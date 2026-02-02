export type Tab = 
  | "dashboard"
  | "biens"
  | "locataires"
  | "baux"
  | "quittances"
  | "notifications"
  | "finances"
  | "documents"
  | "profile"
  | "delegations"
  | "audit"
  | "inviter-proprietaire"
  | "parametres"
  | "emettre-paiement"
  | "retrait-methode";

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface CoOwner {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  phone?: string;
  is_professional: boolean;
  license_number?: string;
  status: 'active' | 'inactive' | 'suspended';
  joined_at?: string;
  meta?: any;
}

export interface CoOwnerInvitation {
  id: number;
  email: string;
  name: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  invited_by_type: 'landlord' | 'co_owner';
  target_type: 'co_owner' | 'landlord';
  meta?: any;
}

export interface PropertyDelegation {
  id: number;
  property_id: number;
  co_owner_id: number;
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at?: string;
  property?: {
    id: number;
    title: string;
    address: string;
    type: string;
    rent_amount?: number;
  };
  co_owner?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface DelegationAudit {
  id: number;
  delegation_id: number;
  action: 'created' | 'updated' | 'revoked';
  performed_by: {
    id: number;
    name: string;
    email: string;
  };
  old_values?: any;
  new_values?: any;
  created_at: string;
}

export interface CoOwnerStats {
  total_delegations: number;
  active_delegations: number;
  total_properties: number;
  recent_activities: {
    id: number;
    type: string;
    description: string;
    created_at: string;
  }[];
}
