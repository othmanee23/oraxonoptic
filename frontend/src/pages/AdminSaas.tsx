import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, defaultPermissions } from "@/types/auth";
import { Subscription, PaymentRequest, PricingConfig, defaultPricingConfig, BankInfo } from "@/types/subscription";
import { Store } from "@/types/store";
import { addMonths } from "date-fns";
import { apiFetch } from "@/lib/api";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Ban,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  UserPlus,
  Shield,
  Store as StoreIcon,
  Settings,
  Lock,
  Unlock,
  Image,
  Clock,
  History,
  Search,
  ZoomIn
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Navigate } from "react-router-dom";


interface OpticiensStats {
  total: number;
  active: number;
  expired: number;
  blocked: number;
  totalRevenue: number;
}

interface ApiOpticien {
  id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  is_pending_approval: boolean;
  created_at?: string;
  max_stores?: number | null;
  store_count: number;
  subscription?: {
    id: number | string;
    start_date?: string | null;
    expiry_date?: string | null;
    status: string;
  } | null;
}

interface ApiPaymentRequest {
  id: number | string;
  user_id: number | string;
  user_email: string;
  user_name: string;
  amount: number;
  months_requested: number;
  plan_key?: string | null;
  stores_count?: number | null;
  screenshot: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  processed_at?: string | null;
  processed_by?: number | string | null;
  rejection_reason?: string | null;
}

interface ApiDashboardStats {
  total: number;
  active: number;
  expired: number;
  blocked: number;
  total_revenue: number;
}

interface StoreWithOwner extends Store {
  ownerId?: string;
}

const mapApiOpticien = (opticien: ApiOpticien): User & { storeCount?: number; subscription?: Subscription } => ({
  id: String(opticien.id),
  email: opticien.email,
  firstName: opticien.first_name,
  lastName: opticien.last_name,
  phone: opticien.phone ?? undefined,
  role: 'admin',
  storeIds: [],
  permissions: defaultPermissions.admin,
  isActive: opticien.is_active,
  isPendingApproval: opticien.is_pending_approval,
  createdAt: opticien.created_at || new Date().toISOString(),
  maxStores: opticien.max_stores ?? undefined,
  storeCount: opticien.store_count,
  subscription: opticien.subscription
    ? {
        id: String(opticien.subscription.id),
        userId: String(opticien.id),
        startDate: opticien.subscription.start_date || new Date().toISOString(),
        expiryDate: opticien.subscription.expiry_date || new Date().toISOString(),
        status: opticien.subscription.status as Subscription['status'],
      }
    : undefined,
});

const mapApiPayment = (payment: ApiPaymentRequest): PaymentRequest => ({
  id: String(payment.id),
  userId: String(payment.user_id),
  userEmail: payment.user_email,
  userName: payment.user_name,
  amount: payment.amount,
  monthsRequested: payment.months_requested,
  planKey: payment.plan_key ?? undefined,
  storesCount: payment.stores_count ?? undefined,
  screenshot: payment.screenshot,
  submittedAt: payment.submitted_at,
  status: payment.status,
  processedAt: payment.processed_at ?? undefined,
  processedBy: payment.processed_by ? String(payment.processed_by) : undefined,
  rejectionReason: payment.rejection_reason ?? undefined,
});

export default function AdminSaas() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if not super_admin
  if (user?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  const [opticiens, setOpticiens] = useState<(User & { storeCount?: number; subscription?: Subscription })[]>([]);
  const [allStores, setAllStores] = useState<StoreWithOwner[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(defaultPricingConfig);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [pendingUsers, setPendingUsers] = useState<(User & { storeCount?: number; subscription?: Subscription })[]>([]);
  const [stats, setStats] = useState<OpticiensStats>({
    total: 0,
    active: 0,
    expired: 0,
    blocked: 0,
    totalRevenue: 0,
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOpticien, setSelectedOpticien] = useState<(User & { storeCount?: number; subscription?: Subscription }) | null>(null);

  // Form states
  const [newOpticien, setNewOpticien] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    storeName: '',
    maxStores: '3',
  });
  const [editSubscription, setEditSubscription] = useState({
    days: '30',
    action: 'add' as 'add' | 'set',
  });
  const [editMaxStores, setEditMaxStores] = useState('3');
  const [showMaxStoresDialog, setShowMaxStoresDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [showStoresDialog, setShowStoresDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [tempPricingConfig, setTempPricingConfig] = useState<PricingConfig>(defaultPricingConfig);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedOpticienHistory, setSelectedOpticienHistory] = useState<(User & { storeCount?: number; subscription?: Subscription }) | null>(null);
  const [showAllPaymentsHistory, setShowAllPaymentsHistory] = useState(false);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomedImage, setZoomedImage] = useState('');
  const [showBankInfoDialog, setShowBankInfoDialog] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '',
    accountName: '',
    iban: '',
    swift: '',
    rib: '',
  });
  const [tempBankInfo, setTempBankInfo] = useState<BankInfo>({
    bankName: '',
    accountName: '',
    iban: '',
    swift: '',
    rib: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load opticiens (admin role only, without ownerId = top-level admins)
    let mappedOpticiens: (User & { storeCount?: number; subscription?: Subscription })[] = [];
    try {
      const apiOpticiens = await apiFetch<ApiOpticien[]>('/api/admin/opticiens');
      mappedOpticiens = apiOpticiens.map(mapApiOpticien);
      const approvedAdmins = mappedOpticiens.filter(o => !o.isPendingApproval);
      const pendingAdmins = mappedOpticiens.filter(o => o.isPendingApproval);
      setOpticiens(approvedAdmins);
      setPendingUsers(pendingAdmins);
    } catch {
      setOpticiens([]);
      setPendingUsers([]);
    }

    // Load stores (super admin)
    apiFetch<{
      id: number | string;
      owner_id?: number | string | null;
      name: string;
      address?: string | null;
      city?: string | null;
      phone?: string | null;
      email?: string | null;
      tax_id?: string | null;
      invoice_prefix?: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }[]>('/api/admin/stores')
      .then((stores) => {
        setAllStores(
          stores.map((store) => ({
            id: String(store.id),
            ownerId: store.owner_id ? String(store.owner_id) : undefined,
            name: store.name,
            address: store.address ?? undefined,
            city: store.city ?? undefined,
            phone: store.phone ?? undefined,
            email: store.email ?? undefined,
            taxId: store.tax_id ?? undefined,
            invoicePrefix: store.invoice_prefix ?? undefined,
            isActive: store.is_active,
            createdAt: store.created_at,
            updatedAt: store.updated_at,
          }))
        );
      })
      .catch(() => {
        setAllStores([]);
      });
    
    try {
      const config = await apiFetch<{
        monthly_price: number;
        semiannual_price: number;
        annual_price: number;
        price_per_store: number;
        currency: string;
      }>('/api/pricing-config');
      const mappedConfig: PricingConfig = {
        monthlyPrice: Number(config.monthly_price),
        semiannualPrice: Number(config.semiannual_price),
        annualPrice: Number(config.annual_price),
        pricePerStore: Number(config.price_per_store),
        currency: config.currency || 'DH',
      };
      setPricingConfig(mappedConfig);
      setTempPricingConfig(mappedConfig);
    } catch {
      setPricingConfig(defaultPricingConfig);
      setTempPricingConfig(defaultPricingConfig);
    }

    try {
      const info = await apiFetch<{
        bank_name: string;
        account_name: string;
        iban: string;
        swift: string;
        rib?: string | null;
      }>('/api/bank-info');
      const mappedInfo: BankInfo = {
        bankName: info.bank_name,
        accountName: info.account_name,
        iban: info.iban,
        swift: info.swift,
        rib: info.rib ?? '',
      };
      setBankInfo(mappedInfo);
      setTempBankInfo(mappedInfo);
    } catch {
      // Keep defaults if request fails.
    }

    // Load payment requests
    let mappedPayments: PaymentRequest[] = [];
    try {
      const payments = await apiFetch<ApiPaymentRequest[]>('/api/payment-requests');
      mappedPayments = payments.map(mapApiPayment);
      setPaymentRequests(mappedPayments);
    } catch {
      setPaymentRequests([]);
    }

    try {
      const dashboard = await apiFetch<ApiDashboardStats>('/api/admin/dashboard');
      setStats({
        total: dashboard.total,
        active: dashboard.active,
        expired: dashboard.expired,
        blocked: dashboard.blocked,
        totalRevenue: dashboard.total_revenue,
      });
    } catch {
      setStats({
        total: 0,
        active: 0,
        expired: 0,
        blocked: 0,
        totalRevenue: 0,
      });
    }
  };

  const getOpticienStores = (opticienId: string): Store[] => {
    const opticien = opticiens.find(o => o.id === opticienId);
    if (!opticien) return [];
    return allStores.filter(s => s.ownerId === opticien.id);
  };

  const isStoreBlockedForOpticien = (opticienId: string, storeId: string): boolean => {
    const store = allStores.find(s => s.id === storeId && s.ownerId === opticienId);
    return store ? !store.isActive : false;
  };

  const handleToggleStoreBlock = (opticienId: string, storeId: string, storeName: string) => {
    apiFetch<{
      id: number | string;
      owner_id?: number | string | null;
      name: string;
      address?: string | null;
      city?: string | null;
      phone?: string | null;
      email?: string | null;
      tax_id?: string | null;
      invoice_prefix?: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>(`/api/admin/stores/${storeId}/toggle`, { method: 'PATCH' })
      .then((updated) => {
        setAllStores((prev) =>
          prev.map((store) =>
            store.id === String(updated.id)
              ? {
                  id: String(updated.id),
                  ownerId: updated.owner_id ? String(updated.owner_id) : undefined,
                  name: updated.name,
                  address: updated.address ?? undefined,
                  city: updated.city ?? undefined,
                  phone: updated.phone ?? undefined,
                  email: updated.email ?? undefined,
                  taxId: updated.tax_id ?? undefined,
                  invoicePrefix: updated.invoice_prefix ?? undefined,
                  isActive: updated.is_active,
                  createdAt: updated.created_at,
                  updatedAt: updated.updated_at,
                }
              : store
          )
        );

        toast({
          title: updated.is_active ? "Magasin débloqué" : "Magasin bloqué",
          description: updated.is_active
            ? `${storeName} est maintenant accessible`
            : `${storeName} est maintenant bloqué`,
        });
      })
      .catch(() => {
        toast({
          title: "Action impossible",
          description: "Veuillez réessayer.",
          variant: "destructive",
        });
      });
  };

  const handleSavePricing = () => {
    apiFetch('/api/pricing-config', {
      method: 'PUT',
      body: JSON.stringify({
        monthly_price: tempPricingConfig.monthlyPrice,
        semiannual_price: tempPricingConfig.semiannualPrice,
        annual_price: tempPricingConfig.annualPrice,
        price_per_store: tempPricingConfig.pricePerStore,
        currency: tempPricingConfig.currency,
      }),
    })
      .then((config) => {
        const mappedConfig: PricingConfig = {
          monthlyPrice: Number((config as any).monthly_price),
          semiannualPrice: Number((config as any).semiannual_price),
          annualPrice: Number((config as any).annual_price),
          pricePerStore: Number((config as any).price_per_store),
          currency: (config as any).currency || 'DH',
        };
        setPricingConfig(mappedConfig);
        setTempPricingConfig(mappedConfig);
        setShowPricingDialog(false);
        toast({
          title: "Tarification mise à jour",
          description: "Les nouveaux prix ont été enregistrés",
        });
      })
      .catch(() => {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer la tarification",
          variant: "destructive",
        });
      });
  };

  const handleSaveBankInfo = () => {
    apiFetch('/api/bank-info', {
      method: 'PUT',
      body: JSON.stringify({
        bank_name: tempBankInfo.bankName,
        account_name: tempBankInfo.accountName,
        iban: tempBankInfo.iban,
        swift: tempBankInfo.swift,
        rib: tempBankInfo.rib || null,
      }),
    })
      .then(() => {
        setBankInfo(tempBankInfo);
        setShowBankInfoDialog(false);
        toast({
          title: "Informations bancaires mises à jour",
          description: "Les opticiens verront les nouvelles coordonnées bancaires",
        });
      })
      .catch(() => {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer les informations bancaires",
          variant: "destructive",
        });
      });
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment || !user) return;

    await apiFetch(`/api/payment-requests/${selectedPayment.id}/approve`, {
      method: 'PATCH',
    });

    toast({
      title: "Paiement validé",
      description: `${selectedPayment.monthsRequested} mois ajoutés à l'abonnement de ${selectedPayment.userName}`,
    });

    setShowPaymentDialog(false);
    setSelectedPayment(null);
    loadData();
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment || !user || !rejectionReason) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif du rejet",
        variant: "destructive",
      });
      return;
    }

    await apiFetch(`/api/payment-requests/${selectedPayment.id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });

    toast({
      title: "Demande rejetée",
      description: "L'opticien sera notifié du rejet",
    });

    setShowPaymentDialog(false);
    setSelectedPayment(null);
    setRejectionReason('');
    loadData();
  };

  const pendingPayments = paymentRequests.filter(p => p.status === 'pending');
  const processedPayments = paymentRequests.filter(p => p.status !== 'pending');
  
  const getOpticienPaymentHistory = (opticienId: string): PaymentRequest[] => {
    return paymentRequests.filter(p => p.userId === opticienId);
  };

  const filteredPaymentsHistory = paymentSearchQuery 
    ? processedPayments.filter(p => 
        p.userName.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(paymentSearchQuery.toLowerCase())
      )
    : processedPayments;

  const getOpticienSubscription = (opticienId: string): Subscription | undefined => {
    return opticiens.find(o => o.id === opticienId)?.subscription;
  };

  const getSubscriptionStatus = (opticien: User) => {
    if (!opticien.isActive) {
      return { status: 'blocked', color: 'destructive', label: 'Bloqué' };
    }
    const sub = getOpticienSubscription(opticien.id);
    if (!sub) {
      return { status: 'none', color: 'secondary', label: 'Aucun' };
    }
    const days = differenceInDays(new Date(sub.expiryDate), new Date());
    if (days <= 0) return { status: 'expired', color: 'destructive', label: 'Expiré' };
    if (days <= 7) return { status: 'critical', color: 'destructive', label: `${days}j restants` };
    if (days <= 30) return { status: 'warning', color: 'warning', label: `${days}j restants` };
    return { status: 'active', color: 'success', label: `${days}j restants` };
  };

  const handleCreateOpticien = () => {
    if (!newOpticien.email || !newOpticien.firstName || !newOpticien.lastName || !newOpticien.password) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    apiFetch('/api/admin/opticiens', {
      method: 'POST',
      body: JSON.stringify({
        email: newOpticien.email,
        first_name: newOpticien.firstName,
        last_name: newOpticien.lastName,
        phone: newOpticien.phone || null,
        password: newOpticien.password,
        max_stores: parseInt(newOpticien.maxStores) || 3,
      }),
    })
      .then(() => {
        toast({
          title: "Opticien créé",
          description: `Le compte de ${newOpticien.firstName} ${newOpticien.lastName} a été créé`,
        });
        setShowCreateDialog(false);
        setNewOpticien({ email: '', firstName: '', lastName: '', phone: '', password: '', storeName: '', maxStores: '3' });
        loadData();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de créer l'opticien";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleUpdateMaxStores = () => {
    if (!selectedOpticien) return;

    apiFetch(`/api/admin/opticiens/${selectedOpticien.id}/max-stores`, {
      method: 'PATCH',
      body: JSON.stringify({
        max_stores: parseInt(editMaxStores) || 3,
      }),
    })
      .then(() => {
        toast({
          title: "Limite de magasins modifiée",
          description: `${selectedOpticien.firstName} ${selectedOpticien.lastName} peut maintenant créer jusqu'à ${editMaxStores} magasins`,
        });
        setShowMaxStoresDialog(false);
        setSelectedOpticien(null);
        loadData();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de mettre à jour la limite de magasins";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleToggleBlock = (opticien: User) => {
    apiFetch(`/api/admin/opticiens/${opticien.id}/toggle-block`, {
      method: 'PATCH',
    })
      .then(() => {
        toast({
          title: opticien.isActive ? "Compte bloqué" : "Compte débloqué",
          description: `Le compte de ${opticien.firstName} ${opticien.lastName} a été ${opticien.isActive ? 'bloqué' : 'débloqué'}`,
        });
        loadData();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier le statut";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleDeleteOpticien = () => {
    if (!selectedOpticien) return;

    apiFetch(`/api/admin/opticiens/${selectedOpticien.id}`, {
      method: 'DELETE',
    })
      .then(() => {
        toast({
          title: "Compte supprimé",
          description: `Le compte de ${selectedOpticien.firstName} ${selectedOpticien.lastName} a été supprimé`,
        });
        setShowDeleteDialog(false);
        setSelectedOpticien(null);
        loadData();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de supprimer l'opticien";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleApproveUser = (userId: string) => {
    apiFetch(`/api/admin/opticiens/${userId}/approve`, {
      method: 'PATCH',
    })
      .then(() => {
        toast({
          title: "Utilisateur approuvé",
          description: "L'opticien peut maintenant se connecter",
        });
        loadData();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible d'approuver l'opticien";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleRejectUser = (userId: string) => {
    apiFetch(`/api/admin/opticiens/${userId}/reject`, {
      method: 'DELETE',
    })
      .then(() => {
        toast({
          title: "Demande rejetée",
          description: "La demande a été supprimée",
        });
        loadData();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de rejeter la demande";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleEditSubscription = () => {
    if (!selectedOpticien) return;

    apiFetch(`/api/admin/opticiens/${selectedOpticien.id}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: editSubscription.action,
        days: parseInt(editSubscription.days) || 0,
      }),
    })
      .then(() => {
        toast({
          title: "Abonnement modifié",
          description: `${editSubscription.days} jour(s) ${editSubscription.action === 'add' ? 'ajoutés à' : 'définis pour'} ${selectedOpticien.firstName} ${selectedOpticien.lastName}`,
        });
        setShowEditDialog(false);
        setSelectedOpticien(null);
        setEditSubscription({ days: '30', action: 'add' });
        loadData();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier l'abonnement";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Administration SaaS
            </h1>
            <p className="text-muted-foreground">
              Gérez tous les opticiens et leurs abonnements
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => {
              setTempBankInfo(bankInfo);
              setShowBankInfoDialog(true);
            }}>
              <CreditCard className="h-4 w-4 mr-2" />
              Infos bancaires
            </Button>
            <Button variant="outline" onClick={() => {
              setTempPricingConfig(pricingConfig);
              setShowPricingDialog(true);
            }}>
              <Settings className="h-4 w-4 mr-2" />
              Tarification
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel opticien
            </Button>
          </div>
        </div>

        {/* Pricing Info */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Base mensuelle (1 magasin)</p>
                <p className="text-xl font-bold">
                  {pricingConfig.monthlyPrice.toLocaleString()} {pricingConfig.currency}/mois
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplément par magasin</p>
                <p className="text-xl font-bold">
                  {pricingConfig.pricePerStore.toLocaleString()} {pricingConfig.currency}/mois
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Opticiens</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expirés</CardTitle>
              <XCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.expired}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bloqués</CardTitle>
              <Ban className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.blocked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CA Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} DH</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments Card */}
        {pendingPayments.length > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Clock className="h-5 w-5" />
                Demandes de paiement en attente ({pendingPayments.length})
              </CardTitle>
              <CardDescription>
                Vérifiez les preuves de paiement et validez les abonnements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowPaymentDialog(true);
                    }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                      <Image className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{payment.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.monthsRequested} mois - {payment.amount?.toLocaleString()} DH
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.submittedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <Badge variant="secondary">En attente</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Users Card */}
        {pendingUsers.length > 0 && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <UserPlus className="h-5 w-5" />
                Nouvelles inscriptions en attente ({pendingUsers.length})
              </CardTitle>
              <CardDescription>
                Approuvez ou rejetez les demandes d'inscription des nouveaux opticiens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="flex flex-col gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 font-semibold">
                        {pendingUser.firstName.charAt(0)}{pendingUser.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{pendingUser.firstName} {pendingUser.lastName}</p>
                        <p className="text-sm text-muted-foreground truncate">{pendingUser.email}</p>
                        {pendingUser.phone && (
                          <p className="text-xs text-muted-foreground">{pendingUser.phone}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {format(new Date(pendingUser.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleApproveUser(pendingUser.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleRejectUser(pendingUser.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des paiements
              </CardTitle>
              <CardDescription>
                Tous les paiements traités (approuvés et rejetés)
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowAllPaymentsHistory(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir tout ({processedPayments.length})
            </Button>
          </CardHeader>
          <CardContent>
            {processedPayments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucun paiement traité pour l'instant
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {processedPayments.slice(0, 8).map((payment) => (
                  <div
                    key={payment.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      payment.status === 'approved' ? 'bg-green-500/5 border-green-500/30' : 'bg-destructive/5 border-destructive/30'
                    }`}
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowPaymentDialog(true);
                    }}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      payment.status === 'approved' ? 'bg-green-500/20' : 'bg-destructive/20'
                    }`}>
                      {payment.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{payment.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.monthsRequested} mois - {payment.amount?.toLocaleString()} DH
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.processedAt || payment.submittedAt), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                    <Badge variant={payment.status === 'approved' ? 'default' : 'destructive'} className="text-xs">
                      {payment.status === 'approved' ? 'Validé' : 'Rejeté'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opticiens Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Opticiens</CardTitle>
            <CardDescription>
              Tous les comptes opticiens et leurs abonnements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opticien</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Magasins</TableHead>
                  <TableHead>Paiements</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opticiens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun opticien enregistré
                    </TableCell>
                  </TableRow>
                ) : (
                  opticiens.map((opticien) => {
                    const sub = getOpticienSubscription(opticien.id);
                    const status = getSubscriptionStatus(opticien);
                    const opticienPayments = getOpticienPaymentHistory(opticien.id);
                    return (
                      <TableRow key={opticien.id} className={!opticien.isActive ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="font-medium">{opticien.firstName} {opticien.lastName}</div>
                        </TableCell>
                        <TableCell>{opticien.email}</TableCell>
                        <TableCell>{opticien.phone || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-0 text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedOpticien(opticien);
                              setEditMaxStores(String(opticien.maxStores || 3));
                              setShowMaxStoresDialog(true);
                            }}
                            title="Modifier la limite de magasins"
                          >
                            {opticien.storeCount ?? 0} / {opticien.maxStores || '∞'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOpticienHistory(opticien);
                              setShowHistoryDialog(true);
                            }}
                          >
                            <History className="h-3 w-3 mr-1" />
                            {opticienPayments.length} paiement(s)
                          </Button>
                        </TableCell>
                        <TableCell>
                          {format(new Date(opticien.createdAt), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={status.color === 'success' ? 'default' : status.color === 'warning' ? 'secondary' : 'destructive'}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span 
                            className="text-muted-foreground"
                          >
                            {sub ? format(new Date(sub.expiryDate), 'dd/MM/yyyy', { locale: fr }) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedOpticien(opticien);
                                setEditMaxStores(String(opticien.maxStores || 3));
                                setShowMaxStoresDialog(true);
                              }}
                              title="Limite de magasins"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedOpticien(opticien);
                                setShowEditDialog(true);
                              }}
                              title="Modifier abonnement"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleBlock(opticien)}
                              title={opticien.isActive ? 'Bloquer' : 'Débloquer'}
                            >
                              <Ban className={`h-4 w-4 ${!opticien.isActive ? 'text-green-500' : 'text-destructive'}`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedOpticien(opticien);
                                setShowDeleteDialog(true);
                              }}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Opticien Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un compte opticien</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte pour un opticien
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom *</Label>
                  <Input
                    value={newOpticien.firstName}
                    onChange={(e) => setNewOpticien({ ...newOpticien, firstName: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    value={newOpticien.lastName}
                    onChange={(e) => setNewOpticien({ ...newOpticien, lastName: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newOpticien.email}
                  onChange={(e) => setNewOpticien({ ...newOpticien, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={newOpticien.phone}
                  onChange={(e) => setNewOpticien({ ...newOpticien, phone: e.target.value })}
                  placeholder="+212 6 00 00 00 00"
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe *</Label>
                <Input
                  type="password"
                  value={newOpticien.password}
                  onChange={(e) => setNewOpticien({ ...newOpticien, password: e.target.value })}
                  placeholder="Mot de passe"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre maximum de magasins</Label>
                <Select 
                  value={newOpticien.maxStores} 
                  onValueChange={(value) => setNewOpticien({ ...newOpticien, maxStores: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 magasin</SelectItem>
                    <SelectItem value="2">2 magasins</SelectItem>
                    <SelectItem value="3">3 magasins</SelectItem>
                    <SelectItem value="5">5 magasins</SelectItem>
                    <SelectItem value="10">10 magasins</SelectItem>
                    <SelectItem value="999">Illimité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateOpticien}>
                Créer le compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Subscription Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'abonnement</DialogTitle>
              <DialogDescription>
                {selectedOpticien && `Modifier l'abonnement de ${selectedOpticien.firstName} ${selectedOpticien.lastName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select 
                  value={editSubscription.action} 
                  onValueChange={(value: 'add' | 'set') => setEditSubscription({ ...editSubscription, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Ajouter des jours</SelectItem>
                    <SelectItem value="set">Définir la durée (remet à zéro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nombre de jours</Label>
                <Input
                  type="number"
                  value={editSubscription.days}
                  onChange={(e) => setEditSubscription({ ...editSubscription, days: e.target.value })}
                  placeholder="30"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Astuce: 30 jours ≈ 1 mois, 90 jours ≈ 3 mois, 365 jours ≈ 1 an
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditSubscription}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                {selectedOpticien && (
                  <>
                    Êtes-vous sûr de vouloir supprimer le compte de <strong>{selectedOpticien.firstName} {selectedOpticien.lastName}</strong> ?
                    <br />
                    Cette action est irréversible.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteOpticien}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Max Stores Dialog */}
        <Dialog open={showMaxStoresDialog} onOpenChange={setShowMaxStoresDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Limite de magasins</DialogTitle>
              <DialogDescription>
                {selectedOpticien && `Définir le nombre maximum de magasins que ${selectedOpticien.firstName} ${selectedOpticien.lastName} peut créer`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre maximum de magasins</Label>
                <Select 
                  value={editMaxStores} 
                  onValueChange={setEditMaxStores}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 magasin</SelectItem>
                    <SelectItem value="2">2 magasins</SelectItem>
                    <SelectItem value="3">3 magasins</SelectItem>
                    <SelectItem value="5">5 magasins</SelectItem>
                    <SelectItem value="10">10 magasins</SelectItem>
                    <SelectItem value="999">Illimité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedOpticien && (
                <p className="text-sm text-muted-foreground">
                  Actuellement : {selectedOpticien.storeIds?.length || 0} magasin(s) créé(s)
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMaxStoresDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateMaxStores}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pricing Configuration Dialog */}
        <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configuration des tarifs</DialogTitle>
              <DialogDescription>
                Définissez le tarif mensuel de base et le supplément par magasin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Devise</Label>
                <Select
                  value={tempPricingConfig.currency}
                  onValueChange={(value) =>
                    setTempPricingConfig((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DH">DH - Dirham marocain</SelectItem>
                    <SelectItem value="€">€ - Euro</SelectItem>
                    <SelectItem value="$">$ - Dollar américain</SelectItem>
                    <SelectItem value="£">£ - Livre sterling</SelectItem>
                    <SelectItem value="CHF">CHF - Franc suisse</SelectItem>
                    <SelectItem value="CAD">CAD - Dollar canadien</SelectItem>
                    <SelectItem value="XOF">XOF - Franc CFA</SelectItem>
                    <SelectItem value="TND">TND - Dinar tunisien</SelectItem>
                    <SelectItem value="DZD">DZD - Dinar algérien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 rounded-lg border border-border p-4">
                <div className="space-y-2">
                  <Label>Prix mensuel de base (1 magasin inclus)</Label>
                  <Input
                    type="number"
                    value={tempPricingConfig.monthlyPrice}
                    onChange={(e) =>
                      setTempPricingConfig((prev) => ({
                        ...prev,
                        monthlyPrice: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Prix semestriel (6 mois)</Label>
                  <Input
                    type="number"
                    value={tempPricingConfig.semiannualPrice}
                    onChange={(e) =>
                      setTempPricingConfig((prev) => ({
                        ...prev,
                        semiannualPrice: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Prix annuel (12 mois)</Label>
                  <Input
                    type="number"
                    value={tempPricingConfig.annualPrice}
                    onChange={(e) =>
                      setTempPricingConfig((prev) => ({
                        ...prev,
                        annualPrice: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Supplément par magasin et par mois</Label>
                  <Input
                    type="number"
                    value={tempPricingConfig.pricePerStore}
                    onChange={(e) =>
                      setTempPricingConfig((prev) => ({
                        ...prev,
                        pricePerStore: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setTempPricingConfig(pricingConfig);
                  setShowPricingDialog(false);
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleSavePricing}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bank Info Configuration Dialog */}
        <Dialog open={showBankInfoDialog} onOpenChange={setShowBankInfoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Informations bancaires</DialogTitle>
              <DialogDescription>
                Ces informations seront affichées aux opticiens pour effectuer leurs paiements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la banque</Label>
                <Input
                  value={tempBankInfo.bankName}
                  onChange={(e) => setTempBankInfo({ ...tempBankInfo, bankName: e.target.value })}
                  placeholder="Ex: Banque Populaire"
                />
              </div>
              <div className="space-y-2">
                <Label>Titulaire du compte</Label>
                <Input
                  value={tempBankInfo.accountName}
                  onChange={(e) => setTempBankInfo({ ...tempBankInfo, accountName: e.target.value })}
                  placeholder="Ex: MA SOCIETE SARL"
                />
              </div>
              <div className="space-y-2">
                <Label>RIB (optionnel)</Label>
                <Input
                  value={tempBankInfo.rib || ''}
                  onChange={(e) => setTempBankInfo({ ...tempBankInfo, rib: e.target.value })}
                  placeholder="Ex: 000 000 0000000000000000 00"
                />
              </div>
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input
                  value={tempBankInfo.iban}
                  onChange={(e) => setTempBankInfo({ ...tempBankInfo, iban: e.target.value })}
                  placeholder="Ex: MA00 0000 0000 0000 0000 0000 000"
                />
              </div>
              <div className="space-y-2">
                <Label>SWIFT / BIC</Label>
                <Input
                  value={tempBankInfo.swift}
                  onChange={(e) => setTempBankInfo({ ...tempBankInfo, swift: e.target.value })}
                  placeholder="Ex: BNMAMAMC"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setTempBankInfo(bankInfo);
                setShowBankInfoDialog(false);
              }}>
                Annuler
              </Button>
              <Button onClick={handleSaveBankInfo}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stores Management Dialog */}
        <Dialog open={showStoresDialog} onOpenChange={setShowStoresDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Magasins de {selectedOpticien?.firstName} {selectedOpticien?.lastName}</DialogTitle>
              <DialogDescription>
                Gérez les magasins de cet opticien. Vous pouvez bloquer ou débloquer l'accès à chaque magasin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedOpticien && getOpticienStores(selectedOpticien.id).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Aucun magasin créé
                </p>
              ) : (
                selectedOpticien && getOpticienStores(selectedOpticien.id).map((store) => {
                  const isBlocked = isStoreBlockedForOpticien(selectedOpticien.id, store.id);
                  return (
                    <div
                      key={store.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${isBlocked ? 'bg-destructive/10 border-destructive/30' : 'bg-card'}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isBlocked ? 'bg-destructive/20' : 'bg-primary/10'}`}>
                        <StoreIcon className={`h-5 w-5 ${isBlocked ? 'text-destructive' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{store.name}</p>
                        {store.city && (
                          <p className="text-sm text-muted-foreground">{store.city}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isBlocked ? "destructive" : "success"}>
                          {isBlocked ? "Bloqué" : "Actif"}
                        </Badge>
                        <Button
                          variant={isBlocked ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => handleToggleStoreBlock(selectedOpticien.id, store.id, store.name)}
                        >
                          {isBlocked ? (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Débloquer
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Bloquer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowStoresDialog(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Review Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPayment?.status === 'pending' ? 'Vérification du paiement' : 'Détails du paiement'}
              </DialogTitle>
              <DialogDescription>
                {selectedPayment && `Demande de ${selectedPayment.userName} - ${selectedPayment.monthsRequested} mois`}
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                {/* Status badge for processed payments */}
                {selectedPayment.status !== 'pending' && (
                  <div className={`p-3 rounded-lg ${selectedPayment.status === 'approved' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                    <div className="flex items-center gap-2">
                      {selectedPayment.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-medium">
                        {selectedPayment.status === 'approved' ? 'Paiement approuvé' : 'Paiement rejeté'}
                      </span>
                    </div>
                    {selectedPayment.processedAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Traité le {format(new Date(selectedPayment.processedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        {selectedPayment.processedBy && ` par ${selectedPayment.processedBy}`}
                      </p>
                    )}
                    {selectedPayment.rejectionReason && (
                      <p className="text-sm text-destructive mt-2">
                        <strong>Motif :</strong> {selectedPayment.rejectionReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Opticien</p>
                    <p className="font-medium">{selectedPayment.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant déclaré</p>
                    <p className="text-xl font-bold text-primary">{selectedPayment.amount?.toLocaleString()} DH</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durée demandée</p>
                    <p className="font-medium">{selectedPayment.monthsRequested} mois</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de soumission</p>
                    <p className="font-medium">
                      {format(new Date(selectedPayment.submittedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  {selectedPayment.storesCount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Magasins inclus</p>
                      <p className="font-medium">{selectedPayment.storesCount} magasin(s)</p>
                    </div>
                  )}
                </div>

                {/* Screenshot */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Capture d'écran du virement</p>
                  <div className="border rounded-lg p-2 bg-muted/30 relative group">
                    {selectedPayment.screenshot ? (
                      <>
                        <img 
                          src={selectedPayment.screenshot} 
                          alt="Preuve de paiement" 
                          className="max-h-[400px] mx-auto rounded-lg shadow-md cursor-pointer"
                          onClick={() => {
                            setZoomedImage(selectedPayment.screenshot);
                            setShowImageZoom(true);
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setZoomedImage(selectedPayment.screenshot);
                            setShowImageZoom(true);
                          }}
                        >
                          <ZoomIn className="h-4 w-4 mr-1" />
                          Agrandir
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune image disponible</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection reason (only shown if pending) */}
                {selectedPayment.status === 'pending' && (
                  <div className="space-y-2">
                    <Label>Motif de rejet (requis pour rejeter)</Label>
                    <Input
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ex: Montant insuffisant, capture illisible..."
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                setShowPaymentDialog(false);
                setSelectedPayment(null);
                setRejectionReason('');
              }}>
                Fermer
              </Button>
              {selectedPayment?.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={handleRejectPayment}
                    disabled={!rejectionReason}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button onClick={handleApprovePayment}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Optician Payment History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des paiements de {selectedOpticienHistory?.firstName} {selectedOpticienHistory?.lastName}
              </DialogTitle>
              <DialogDescription>
                Tous les paiements effectués par cet opticien
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {selectedOpticienHistory && getOpticienPaymentHistory(selectedOpticienHistory.id).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun paiement enregistré pour cet opticien</p>
                </div>
              ) : (
                selectedOpticienHistory && getOpticienPaymentHistory(selectedOpticienHistory.id)
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        payment.status === 'approved' 
                          ? 'bg-green-500/5 border-green-500/30' 
                          : payment.status === 'rejected'
                          ? 'bg-destructive/5 border-destructive/30'
                          : 'bg-amber-500/5 border-amber-500/30'
                      }`}
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPaymentDialog(true);
                      }}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        payment.status === 'approved' 
                          ? 'bg-green-500/20' 
                          : payment.status === 'rejected'
                          ? 'bg-destructive/20'
                          : 'bg-amber-500/20'
                      }`}>
                        {payment.status === 'approved' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : payment.status === 'rejected' ? (
                          <XCircle className="h-6 w-6 text-destructive" />
                        ) : (
                          <Clock className="h-6 w-6 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{payment.monthsRequested} mois</p>
                          <Badge variant={
                            payment.status === 'approved' 
                              ? 'default' 
                              : payment.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }>
                            {payment.status === 'approved' 
                              ? 'Approuvé' 
                              : payment.status === 'rejected'
                              ? 'Rejeté'
                              : 'En attente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Soumis le {format(new Date(payment.submittedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                        {payment.rejectionReason && (
                          <p className="text-sm text-destructive mt-1">Motif: {payment.rejectionReason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{payment.amount?.toLocaleString()} DH</p>
                        {payment.storesCount && (
                          <p className="text-xs text-muted-foreground">{payment.storesCount} magasin(s)</p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setShowHistoryDialog(false);
                setSelectedOpticienHistory(null);
              }}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* All Payments History Dialog */}
        <Dialog open={showAllPaymentsHistory} onOpenChange={setShowAllPaymentsHistory}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique complet des paiements
              </DialogTitle>
              <CardDescription>
                {processedPayments.length} paiement(s) traité(s) au total
              </CardDescription>
            </DialogHeader>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={paymentSearchQuery}
                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredPaymentsHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun paiement trouvé</p>
                </div>
              ) : (
                filteredPaymentsHistory
                  .sort((a, b) => new Date(b.processedAt || b.submittedAt).getTime() - new Date(a.processedAt || a.submittedAt).getTime())
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        payment.status === 'approved' 
                          ? 'bg-green-500/5 border-green-500/30' 
                          : 'bg-destructive/5 border-destructive/30'
                      }`}
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPaymentDialog(true);
                      }}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        payment.status === 'approved' ? 'bg-green-500/20' : 'bg-destructive/20'
                      }`}>
                        {payment.status === 'approved' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{payment.userName}</p>
                          <Badge variant={payment.status === 'approved' ? 'default' : 'destructive'}>
                            {payment.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{payment.userEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.processedAt || payment.submittedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{payment.amount?.toLocaleString()} DH</p>
                        <p className="text-sm text-muted-foreground">{payment.monthsRequested} mois</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setShowAllPaymentsHistory(false);
                setPaymentSearchQuery('');
              }}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Zoom Dialog */}
        <Dialog open={showImageZoom} onOpenChange={setShowImageZoom}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
            <DialogHeader className="sr-only">
              <DialogTitle>Capture d'écran agrandie</DialogTitle>
            </DialogHeader>
            {zoomedImage && (
              <img 
                src={zoomedImage} 
                alt="Preuve de paiement agrandie" 
                className="max-h-[90vh] mx-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
