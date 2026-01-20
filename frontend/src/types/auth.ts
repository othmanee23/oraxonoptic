// Permission actions available for each module
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'validate' | 'export';

// Modules in the system
export type Module = 
  | 'clients'
  | 'prescriptions'
  | 'ventes'
  | 'factures'
  | 'paiements'
  | 'stock'
  | 'fournisseurs'
  | 'bons_commande'
  | 'bons_livraison'
  | 'atelier'
  | 'rapports'
  | 'parametres'
  | 'utilisateurs'
  | 'abonnement';

// Permission table structure
export type PermissionTable = {
  [key in Module]: {
    [action in PermissionAction]: boolean;
  };
};

// User role for quick reference
// super_admin = Créateur du SaaS (valide les paiements de tous les opticiens)
// admin = Opticien propriétaire de son commerce
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'vendeur' | 'technicien' | 'user';

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  storeIds: string[]; // Stores the user has access to
  permissions: PermissionTable;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  // Multi-tenant fields
  ownerId?: string; // ID of the admin who owns this employee (undefined for admins and super_admin)
  maxStores?: number; // Maximum number of stores this admin can create (only for admin role)
  lastStoreId?: string;
  // Approval system
  isPendingApproval?: boolean; // True if the user is waiting for super_admin approval
}

// Auth state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Store interface
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

// Default permissions for different roles
export const defaultPermissions: Record<UserRole, PermissionTable> = {
  super_admin: {
    clients: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    prescriptions: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    ventes: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    factures: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    paiements: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    stock: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    fournisseurs: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    bons_commande: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    bons_livraison: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    atelier: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    rapports: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    parametres: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    utilisateurs: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    abonnement: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
  },
  admin: {
    clients: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    prescriptions: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    ventes: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    factures: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    paiements: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    stock: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    fournisseurs: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    bons_commande: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    bons_livraison: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    atelier: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    rapports: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    parametres: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    utilisateurs: { view: true, create: true, edit: true, delete: true, validate: true, export: true },
    abonnement: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
  },
  manager: {
    clients: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    prescriptions: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    ventes: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    factures: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    paiements: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    stock: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    fournisseurs: { view: true, create: true, edit: true, delete: false, validate: false, export: true },
    bons_commande: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    bons_livraison: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    atelier: { view: true, create: true, edit: true, delete: false, validate: true, export: true },
    rapports: { view: true, create: false, edit: false, delete: false, validate: false, export: true },
    parametres: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    utilisateurs: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    abonnement: { view: true, create: true, edit: false, delete: false, validate: false, export: false },
  },
  vendeur: {
    clients: { view: true, create: true, edit: true, delete: false, validate: false, export: false },
    prescriptions: { view: true, create: true, edit: true, delete: false, validate: false, export: false },
    ventes: { view: true, create: true, edit: true, delete: false, validate: false, export: false },
    factures: { view: true, create: true, edit: false, delete: false, validate: false, export: false },
    paiements: { view: true, create: true, edit: false, delete: false, validate: false, export: false },
    stock: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    fournisseurs: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    bons_commande: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    bons_livraison: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    atelier: { view: true, create: true, edit: false, delete: false, validate: false, export: false },
    rapports: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    parametres: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    utilisateurs: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    abonnement: { view: true, create: true, edit: false, delete: false, validate: false, export: false },
  },
  technicien: {
    clients: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    prescriptions: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    ventes: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    factures: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    paiements: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    stock: { view: true, create: false, edit: true, delete: false, validate: false, export: false },
    fournisseurs: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    bons_commande: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    bons_livraison: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    atelier: { view: true, create: true, edit: true, delete: false, validate: true, export: false },
    rapports: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    parametres: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    utilisateurs: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    abonnement: { view: true, create: true, edit: false, delete: false, validate: false, export: false },
  },
  user: {
    clients: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    prescriptions: { view: true, create: false, edit: false, delete: false, validate: false, export: false },
    ventes: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    factures: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    paiements: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    stock: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    fournisseurs: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    bons_commande: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    bons_livraison: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    atelier: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    rapports: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    parametres: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    utilisateurs: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
    abonnement: { view: false, create: false, edit: false, delete: false, validate: false, export: false },
  },
};

// Module labels for display
export const moduleLabels: Record<Module, string> = {
  clients: 'Clients',
  prescriptions: 'Prescriptions',
  ventes: 'Ventes',
  factures: 'Factures',
  paiements: 'Paiements',
  stock: 'Stock',
  fournisseurs: 'Fournisseurs',
  bons_commande: 'Bons de commande',
  bons_livraison: 'Bons de livraison',
  atelier: 'Atelier',
  rapports: 'Rapports',
  parametres: 'Paramètres',
  utilisateurs: 'Utilisateurs',
  abonnement: 'Abonnement',
};

// Action labels for display
export const actionLabels: Record<PermissionAction, string> = {
  view: 'Consulter',
  create: 'Créer',
  edit: 'Modifier',
  delete: 'Supprimer',
  validate: 'Valider',
  export: 'Exporter',
};
