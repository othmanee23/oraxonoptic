export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
}

// Lens parameters for lens orders
export interface LensOrderParameters {
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  odAddition?: number;
  odPd?: number;
  ogSphere?: number;
  ogCylinder?: number;
  ogAxis?: number;
  ogAddition?: number;
  ogPd?: number;
}

export interface PurchaseOrder {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  expectedDate?: string;
  receivedAt?: string;
  // Lens order specific fields
  type: 'product' | 'lens';
  workshopOrderId?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  clientName?: string;
  lensType?: string;
  lensTreatments?: string[];
  lensParameters?: LensOrderParameters;
}

export interface DeliveryNoteItem {
  id: string;
  productId: string;
  productName: string;
  productReference: string;
  orderedQuantity: number;
  receivedQuantity: number;
}

export interface DeliveryNote {
  id: string;
  reference: string;
  purchaseOrderId: string;
  purchaseOrderRef: string;
  supplierId: string;
  supplierName: string;
  items: DeliveryNoteItem[];
  status: 'pending' | 'validated';
  notes?: string;
  createdAt: string;
  validatedAt?: string;
}

export const generateReference = (prefix: string): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
};
