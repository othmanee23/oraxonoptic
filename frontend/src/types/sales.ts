// Sales and Invoice types

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';
export type PaymentStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'cancelled';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Percentage
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  storeId: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number; // TVA percentage (0 or 20 typically)
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: PaymentStatus;
  payments: Payment[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
  paidAt?: string;
}

export interface Sale {
  id: string;
  invoiceId: string;
  clientId: string;
  items: CartItem[];
  total: number;
  storeId: string;
  createdBy: string;
  createdAt: string;
}

// Helper to generate invoice number
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FAC-${year}${month}-${random}`;
};

// Helper to calculate cart totals
export const calculateCartTotals = (items: CartItem[], taxRate: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.discount / 100), 0);
  const taxableAmount = subtotal - discountTotal;
  const taxAmount = taxableAmount * taxRate / 100;
  const total = taxableAmount + taxAmount;
  
  return {
    subtotal,
    discountTotal,
    taxAmount,
    total,
  };
};
