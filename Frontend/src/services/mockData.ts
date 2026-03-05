// Données mockées pour le frontend standalone
// Ces données sont utilisées pour afficher une interface vivante même sans backend

export const mockUserData = {
  id: 1,
  email: 'locataire.demo@gestiloc.bj',
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '+229 90 00 00 01',
  roles: ['tenant'],
  default_role: 'tenant',
  email_verified_at: '2026-01-01T10:00:00Z',
  created_at: '2026-01-01T10:00:00Z',
  last_login_at: new Date().toISOString()
};

export const mockLandlord = {
  id: 101,
  name: 'Amos Batté',
  email: 'contact@gestiloc.bj',
  phone: '+229 97 00 00 00',
  address: 'Cotonou, Bénin'
};

export const mockProperty = {
  id: 1,
  name: 'Appartement F3 - Fidjrossè',
  address: 'Rue 1234, Fidjrossè',
  city: 'Cotonou',
  postal_code: '00229',
  surface: 75,
  room_count: 3,
  bathroom_count: 1,
  photos: ['/Ressource_gestiloc/creer_un_bien.png'],
  landlord: mockLandlord
};

export const mockLease = {
  id: 1,
  uuid: 'lease-uuid-001',
  property_id: 1,
  property: mockProperty,
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  rent_amount: 150000,
  charges_amount: 15000,
  deposit: 300000,
  status: 'active',
  type: 'meuble',
  lease_number: 'L-2026-001',
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
  invoices: []
};

export const mockReceipts: any[] = [
  {
    id: 1,
    paid_month: '2026-02',
    issued_date: '2026-02-05',
    amount: 165000,
    amount_paid: 165000,
    status: 'paid',
    pdf_url: '#',
    property: mockProperty
  },
  {
    id: 2,
    paid_month: '2026-01',
    issued_date: '2026-01-05',
    amount: 165000,
    amount_paid: 165000,
    status: 'paid',
    pdf_url: '#',
    property: mockProperty
  }
];

export const mockInvoices: any[] = [
  {
    id: 1,
    invoice_number: 'INV-2026-003',
    amount_total: 165000,
    status: 'pending',
    due_date: '2026-03-05',
    period_start: '2026-03-01',
    period_end: '2026-03-31',
    lease: mockLease
  }
];

export const mockIncidents: any[] = [
  {
    id: 1,
    property_id: 1,
    title: 'Problème de plomberie',
    category: 'plumbing',
    description: 'Fuite d\'eau sous l\'évier de la cuisine.',
    status: 'open',
    priority: 'high',
    created_at: '2026-02-28T14:30:00Z',
    updated_at: '2026-02-28T14:30:00Z',
    property: mockProperty
  }
];

export const mockNotices: any[] = [];

export const mockMessages: any[] = [
  {
    id: 1,
    subject: 'Bienvenue sur GestiLoc',
    content: 'Bonjour Jean, bienvenue dans votre espace locataire. Vous pouvez ici payer votre loyer et signaler tout incident.',
    is_read: true,
    created_at: '2026-01-01T10:00:00Z',
    sender: { id: 0, name: 'Système GestiLoc', type: 'system' }
  }
];

export const mockDocuments: any[] = [
  {
    id: 1,
    name: 'Contrat de Bail - Signé',
    type: 'contract',
    file_url: '#',
    created_at: '2026-01-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Règlement Intérieur',
    type: 'other',
    file_url: '#',
    created_at: '2026-01-01T10:00:00Z'
  }
];
