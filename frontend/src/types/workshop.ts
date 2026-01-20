// Workshop and Lens Order types for optical store workflow

export type LensType = 'unifocal' | 'progressif' | 'bifocal' | 'degressif';
export type LensTreatment = 'antireflet' | 'photochromique' | 'bluelight' | 'polarise' | 'teinte';
export type WorkshopOrderStatus = 'en_attente_verres' | 'verres_recus' | 'montage_en_cours' | 'pret' | 'livre';

export interface LensParameters {
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
}

export interface LensOrder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  
  // Lens specifications
  lensType: LensType;
  treatments: LensTreatment[];
  parameters: LensParameters;
  
  // Supplier info (manual entry)
  supplierName: string;
  supplierOrderRef?: string;
  
  // Pricing
  purchasePrice: number; // Prix d'achat fournisseur
  sellingPrice: number;  // Prix de vente client
  
  // Status tracking
  status: 'ordered' | 'received' | 'cancelled';
  orderedAt: string;
  receivedAt?: string;
  
  notes?: string;
}

export interface WorkshopOrder {
  id: string;
  orderNumber: string;
  
  // Links
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  lensOrderId?: string;
  purchaseOrderId?: string;
  purchaseOrderRef?: string;
  
  // Frame info
  frameProductId?: string;
  frameName?: string;
  frameReference?: string;
  
  // Lens info
  lensType?: LensType;
  lensTreatments?: LensTreatment[];
  lensParameters?: LensParameters;
  lensSupplier?: string;
  lensSupplierOrderRef?: string;
  lensSupplierId?: string;
  lensPurchasePrice?: number;
  lensSellingPrice?: number;
  
  // Status
  status: WorkshopOrderStatus;
  priority: 'normal' | 'urgent';
  
  // Dates
  createdAt: string;
  updatedAt: string;
  lensReceivedAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  expectedDate?: string;
  
  notes?: string;
}

export const generateWorkshopOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AT-${year}${month}-${random}`;
};

// Lens type labels
export const lensTypeLabels: Record<LensType, string> = {
  unifocal: 'Unifocaux',
  progressif: 'Progressifs',
  bifocal: 'Bifocaux',
  degressif: 'Dégressifs',
};

// Treatment labels
export const treatmentLabels: Record<LensTreatment, string> = {
  antireflet: 'Anti-reflets',
  photochromique: 'Photochromique',
  bluelight: 'Anti-lumière bleue',
  polarise: 'Polarisé',
  teinte: 'Teinté',
};

// Status labels
export const workshopStatusLabels: Record<WorkshopOrderStatus, string> = {
  en_attente_verres: 'En attente verres',
  verres_recus: 'Verres reçus',
  montage_en_cours: 'Montage en cours',
  pret: 'Prêt',
  livre: 'Livré',
};

export const workshopStatusColors: Record<WorkshopOrderStatus, string> = {
  en_attente_verres: 'bg-yellow-100 text-yellow-800',
  verres_recus: 'bg-blue-100 text-blue-800',
  montage_en_cours: 'bg-purple-100 text-purple-800',
  pret: 'bg-green-100 text-green-800',
  livre: 'bg-gray-100 text-gray-800',
};
