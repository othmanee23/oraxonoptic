// Store/Company settings types

export interface StoreSettings {
  name: string;
  subtitle?: string;
  logo?: string; // Base64 or URL
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  ice?: string; // Identifiant Commun de l'Entreprise (Morocco)
  rc?: string; // Registre de Commerce
  patente?: string;
  cnss?: string;
  rib?: string; // Bank account
  footerText?: string;
  primaryColor?: string; // Hex color for invoices
  currency?: string; // Currency symbol/code
  notifyLowStockInApp: boolean;
  notifyLowStockEmail: boolean;
  notifyWorkshopReadyInApp: boolean;
  notifyWorkshopReadyEmail: boolean;
  notifyNewClientInApp: boolean;
  notifyNewClientEmail: boolean;
  notifyInvoiceCreatedInApp: boolean;
  notifyInvoiceCreatedEmail: boolean;
}

export const availableCurrencies = [
  { code: 'DH', name: 'Dirham marocain', symbol: 'DH' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar américain', symbol: '$' },
  { code: 'GBP', name: 'Livre sterling', symbol: '£' },
  { code: 'CHF', name: 'Franc suisse', symbol: 'CHF' },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'CAD' },
  { code: 'XOF', name: 'Franc CFA', symbol: 'XOF' },
  { code: 'TND', name: 'Dinar tunisien', symbol: 'TND' },
  { code: 'DZD', name: 'Dinar algérien', symbol: 'DZD' },
  { code: 'EGP', name: 'Livre égyptienne', symbol: 'EGP' },
  { code: 'SAR', name: 'Riyal saoudien', symbol: 'SAR' },
  { code: 'AED', name: 'Dirham émirati', symbol: 'AED' },
];

export const invoiceColors = [
  { name: 'Bleu', value: '#2563eb' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Rose', value: '#db2777' },
  { name: 'Rouge', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Ambre', value: '#d97706' },
  { name: 'Vert', value: '#16a34a' },
  { name: 'Émeraude', value: '#059669' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Gris', value: '#475569' },
  { name: 'Noir', value: '#18181b' },
];

export const defaultStoreSettings: StoreSettings = {
  name: 'OpticAxon',
  subtitle: 'OPTIC',
  address: '',
  city: '',
  phone: '',
  email: '',
  website: '',
  ice: '',
  rc: '',
  patente: '',
  cnss: '',
  rib: '',
  footerText: 'Merci pour votre confiance !',
  primaryColor: '#2563eb',
  currency: 'DH',
  notifyLowStockInApp: true,
  notifyLowStockEmail: true,
  notifyWorkshopReadyInApp: true,
  notifyWorkshopReadyEmail: true,
  notifyNewClientInApp: true,
  notifyNewClientEmail: true,
  notifyInvoiceCreatedInApp: true,
  notifyInvoiceCreatedEmail: true,
};

let settingsCache: StoreSettings | null = null;

// Convert hex to RGB
export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [37, 99, 235]; // Default blue
};

export const getStoreSettings = (): StoreSettings => {
  if (settingsCache) {
    return settingsCache;
  }
  return defaultStoreSettings;
};

export const setStoreSettingsCache = (settings: StoreSettings): void => {
  settingsCache = settings;
};
