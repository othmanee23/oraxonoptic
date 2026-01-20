// Client interface
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  storeId?: string;
  dateOfBirth?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Store helpers were removed with local storage cleanup.

// Purchase/Sale interface
export interface Purchase {
  id: string;
  clientId: string;
  date: string;
  products: PurchaseItem[];
  total: number;
  status: 'paid' | 'pending' | 'partial';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'mixed';
  invoiceNumber?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  type: 'monture' | 'verres' | 'lentilles' | 'accessoire' | 'autre';
  quantity: number;
  unitPrice: number;
  total: number;
}

// Prescription interface
export interface Prescription {
  id: string;
  clientId: string;
  date: string;
  prescriber?: string;
  expiryDate?: string;
  // Right eye (OD)
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  odAddition?: number;
  odPd?: number;
  // Left eye (OG)
  ogSphere?: number;
  ogCylinder?: number;
  ogAxis?: number;
  ogAddition?: number;
  ogPd?: number;
  notes?: string;
}
