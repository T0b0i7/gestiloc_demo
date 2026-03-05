import { Ticket, TicketStatus, TicketPriority, ActivityLog, AdminUser } from './types'

export const MOCK_USERS: AdminUser[] = [
  {
    id: 1,
    email: 'alice@example.com',
    phone: '+22990000001',
    status: 'active',
    roles: ['admin'],
    user_type: 'admin',
    created_at: '2025-01-01',
    last_activity_at: '2026-01-18',
  },
  {
    id: 2,
    email: 'marc@example.com',
    status: 'active',
    roles: ['tenant'],
    user_type: 'tenant',
    tenant: {
      id: 2,
      first_name: 'Marc',
      last_name: 'Leroy',
      status: 'in_lease',
      solvency_score: 78,
    },
    created_at: '2025-02-10',
    last_activity_at: '2026-01-15',
  },
  {
    id: 3,
    email: 'sophie@example.com',
    status: 'active',
    roles: ['landlord'],
    user_type: 'landlord',
    landlord: {
      id: 3,
      owner_type: 'landlord',
      first_name: 'Sophie',
      last_name: 'Martin',
    },
    created_at: '2024-11-03',
  },
  {
    id: 4,
    email: 'jean@example.com',
    status: 'suspended',
    roles: ['tenant'],
    user_type: 'tenant',
    tenant: {
      id: 4,
      first_name: 'Jean',
      last_name: 'Dupont',
      status: 'inactive',
    },
    created_at: '2024-10-21',
  },
  {
    id: 5,
    email: 'claire@example.com',
    status: 'active',
    roles: ['agency'],
    user_type: 'agency',
    agency: {
      id: 5,
      agency_type: 'agency',
      company_name: 'Agence Petit & Co',
      email: 'contact@petitco.com',
    },
    created_at: '2025-03-12',
  },
]

export const REVENUE_DATA = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Fév', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 2000, expenses: 9800 },
  { month: 'Avr', revenue: 2780, expenses: 3908 },
  { month: 'Mai', revenue: 1890, expenses: 4800 },
  { month: 'Jun', revenue: 2390, expenses: 3800 },
  { month: 'Jul', revenue: 3490, expenses: 4300 },
];

export const MOCK_TICKETS: Ticket[] = [
  { id: 'T-1024', subject: 'Problème de chauffage Apt 4B', requester: 'Marc Leroy', status: TicketStatus.NEW, priority: TicketPriority.URGENT, created: '10:30', tags: ['Maintenance', 'Plomberie'] },
  { id: 'T-1025', subject: 'Demande renouvellement bail', requester: 'Alice Dubois', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.MEDIUM, created: 'Hier', tags: ['Admin'] },
  { id: 'T-1026', subject: 'Plainte bruit voisin', requester: 'Jean Dupont', status: TicketStatus.RESOLVED, priority: TicketPriority.LOW, created: 'il y a 2 jours', tags: ['Plainte'] },
  { id: 'T-1027', subject: 'Badge accès défectueux', requester: 'Sarah Connor', status: TicketStatus.NEW, priority: TicketPriority.HIGH, created: 'il y a 1h', tags: ['Sécurité'] },
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  { id: '1', action: 'Nouveau locataire enregistré', user: 'Système', timestamp: '10:42', type: 'success' },
  { id: '2', action: 'Échec paiement Apt 4B', user: 'Marc Leroy', timestamp: '09:15', type: 'error' },
  { id: '3', action: 'Ticket maintenance mis à jour', user: 'Alice Dubois', timestamp: 'Hier', type: 'info' },
  { id: '4', action: 'Utilisation mémoire élevée', user: 'Serveur', timestamp: 'Hier', type: 'warning' },
];
