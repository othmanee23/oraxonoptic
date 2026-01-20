// Store/Magasin interface
export interface Store {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  taxId?: string; // ICE / Identifiant fiscal
  invoicePrefix?: string; // Préfixe pour les factures (ex: "CAS" pour Casablanca)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
