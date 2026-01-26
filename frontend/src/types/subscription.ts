export interface Subscription {
  id: string;
  userId: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  monthsRequested: number;
  planKey?: string;
  storesCount?: number; // Number of stores included in this payment
  screenshot: string; // Base64 encoded image
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface SubscriptionPlan {
  months: number;
  price: number;
  label: string;
}

export interface SubscriptionOffer {
  key: string;
  label: string;
  storeLimit?: number | null;
  monthlyPrice?: number | null;
  isCustom: boolean;
  typeLabel: string;
  currency: string;
  sortOrder: number;
}

export const defaultSubscriptionOffers: SubscriptionOffer[] = [
  {
    key: 'one_store',
    label: '1 magasin',
    storeLimit: 1,
    monthlyPrice: 500,
    isCustom: false,
    typeLabel: 'Standard',
    currency: 'DH',
    sortOrder: 1,
  },
  {
    key: 'two_stores',
    label: '2 magasins',
    storeLimit: 2,
    monthlyPrice: 900,
    isCustom: false,
    typeLabel: 'Standard',
    currency: 'DH',
    sortOrder: 2,
  },
  {
    key: 'custom',
    label: 'Sur devis',
    storeLimit: null,
    monthlyPrice: null,
    isCustom: true,
    typeLabel: 'Sur devis',
    currency: 'DH',
    sortOrder: 3,
  },
];

// Pricing configuration
export interface PricingConfig {
  monthlyPrice: number; // Base price for 1 month
  semiannualPrice: number; // Base price for 6 months
  annualPrice: number; // Base price for 12 months
  pricePerStore: number; // Additional price per store per month
  currency: string;
}

export const defaultPricingConfig: PricingConfig = {
  monthlyPrice: 200, // 200 DH/month base
  semiannualPrice: 960, // 960 DH/6 months base
  annualPrice: 1680, // 1680 DH/12 months base
  pricePerStore: 70, // 70 DH/store/month
  currency: 'DH',
};

// Calculate subscription plans dynamically based on pricing config
export const getSubscriptionPlans = (storeCount: number = 1): SubscriptionPlan[] => {
  const monthlyTotal = defaultPricingConfig.monthlyPrice + (defaultPricingConfig.pricePerStore * storeCount);

  return [
    { months: 1, price: monthlyTotal, label: '1 mois' },
    { months: 6, price: Math.round(defaultPricingConfig.semiannualPrice + (defaultPricingConfig.pricePerStore * storeCount * 6)), label: '6 mois' },
    { months: 12, price: Math.round(defaultPricingConfig.annualPrice + (defaultPricingConfig.pricePerStore * storeCount * 12)), label: '12 mois' },
  ];
};

// Legacy plans (fallback)
export const subscriptionPlans: SubscriptionPlan[] = [
  { months: 1, price: 200, label: '1 mois' },
  { months: 6, price: 960, label: '6 mois' },
  { months: 12, price: 1680, label: '12 mois' },
];

export interface BankInfo {
  bankName: string;
  accountName: string;
  iban: string;
  swift: string;
  rib?: string;
}

export const defaultBankInfo: BankInfo = {
  bankName: 'Banque Nationale',
  accountName: 'OpticAxon OPTIC SARL',
  iban: 'MA00 0000 0000 0000 0000 0000 000',
  swift: 'BNMAMAMC',
  rib: '',
};

// Legacy constant for backwards compatibility
export const BANK_INFO = defaultBankInfo;
