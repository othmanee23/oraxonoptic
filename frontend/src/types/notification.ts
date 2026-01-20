export type NotificationType = 
  | 'payment_request'      // Super admin: nouvelle demande de paiement
  | 'subscription_expiring' // Opticien: abonnement expire bientôt
  | 'subscription_expired'  // Opticien: abonnement expiré
  | 'workshop_ready'        // Commande atelier prête
  | 'low_stock'             // Stock faible
  | 'new_client'            // Nouveau client
  | 'invoice_created'       // Nouvelle facture
  | 'payment_approved'      // Paiement approuvé
  | 'payment_rejected';     // Paiement rejeté

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId: string; // Target user
  link?: string;  // Optional navigation link
  data?: Record<string, any>; // Additional data
}

// Notification type config
export const notificationConfig: Record<NotificationType, { icon: string; color: string }> = {
  payment_request: { icon: 'CreditCard', color: 'text-blue-500' },
  subscription_expiring: { icon: 'AlertTriangle', color: 'text-amber-500' },
  subscription_expired: { icon: 'XCircle', color: 'text-destructive' },
  workshop_ready: { icon: 'Wrench', color: 'text-green-500' },
  low_stock: { icon: 'Package', color: 'text-amber-500' },
  new_client: { icon: 'UserPlus', color: 'text-blue-500' },
  invoice_created: { icon: 'FileText', color: 'text-indigo-500' },
  payment_approved: { icon: 'CheckCircle', color: 'text-green-500' },
  payment_rejected: { icon: 'XCircle', color: 'text-destructive' },
};
