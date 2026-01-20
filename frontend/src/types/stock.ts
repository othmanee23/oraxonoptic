// Default categories - custom categories are stored as strings
export const DEFAULT_CATEGORIES = ['montures', 'lentilles', 'accessoires', 'solaires', 'divers'] as const;
export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];
export type ProductCategory = string; // Allow custom categories

export interface Category {
  id: string;
  name: string;
  label: string;
  isDefault: boolean;
}

export type LensType = 'journalieres' | 'bimensuelles' | 'mensuelles' | 'trimestrielles' | 'annuelles';

export interface Product {
  id: string;
  reference: string;
  name: string;
  category: ProductCategory;
  brand: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  storeId: string;
  // Specific to lenses
  lensType?: LensType;
  sphere?: string;
  cylinder?: string;
  axis?: string;
  addition?: string;
  baseCurve?: string;
  diameter?: string;
  // Dates
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'entree' | 'sortie' | 'transfert' | 'ajustement';

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  fromStoreId?: string;
  toStoreId?: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockAlert {
  productId: string;
  product: Product;
  currentStock: number;
  minimumStock: number;
  deficit: number;
}
