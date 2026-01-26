import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { 
  CreditCard, 
  Upload, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  History,
  Eye,
  Copy,
  Building2
} from "lucide-react";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Subscription, PaymentRequest, BankInfo, PricingConfig, defaultPricingConfig } from "@/types/subscription";
import { Store } from "@/types/store";

type ApiSubscription = {
  id: number | string;
  user_id: number | string;
  start_date: string;
  expiry_date: string;
  status: string;
};

type ApiSubscriptionResponse = {
  subscription: ApiSubscription | null;
  is_active: boolean;
};

type ApiPaymentRequest = {
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
};

export default function Abonnement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isSuperAdmin = user?.role === 'super_admin';

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [allPaymentRequests, setAllPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activeStoreCount, setActiveStoreCount] = useState(1);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(defaultPricingConfig);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '',
    accountName: '',
    iban: '',
    swift: '',
    rib: '',
  });
  
  // Form state
  const [selectedDuration, setSelectedDuration] = useState<string>('1');
  const [screenshot, setScreenshot] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin dialog state
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const mapPaymentRequest = (request: ApiPaymentRequest): PaymentRequest => ({
    id: String(request.id),
    userId: String(request.user_id),
    userEmail: request.user_email,
    userName: request.user_name,
    amount: request.amount,
    monthsRequested: request.months_requested,
    planKey: request.plan_key ?? undefined,
    storesCount: request.stores_count ?? undefined,
    screenshot: request.screenshot,
    submittedAt: request.submitted_at,
    status: request.status,
    processedAt: request.processed_at ?? undefined,
    processedBy: request.processed_by ? String(request.processed_by) : undefined,
    rejectionReason: request.rejection_reason ?? undefined,
  });

  const mapSubscription = (sub: ApiSubscription): Subscription => ({
    id: String(sub.id),
    userId: String(sub.user_id),
    startDate: sub.start_date,
    expiryDate: sub.expiry_date,
    status: sub.status as Subscription['status'],
  });

  const loadData = async () => {
    if (!user) return;

    try {
      const subscriptionResponse = await apiFetch<ApiSubscriptionResponse>('/api/subscription/me');
      setSubscription(subscriptionResponse.subscription ? mapSubscription(subscriptionResponse.subscription) : null);
    } catch {
      setSubscription(null);
    }

    try {
      const requests = await apiFetch<ApiPaymentRequest[]>('/api/payment-requests');
      const mappedRequests = requests.map(mapPaymentRequest);
      if (isSuperAdmin) {
        setAllPaymentRequests(mappedRequests);
        setPaymentRequests(mappedRequests.filter(r => r.userId === user.id));
      } else {
        setPaymentRequests(mappedRequests);
        setAllPaymentRequests(mappedRequests);
      }
    } catch {
      setPaymentRequests([]);
      setAllPaymentRequests([]);
    }

    // Load bank info
    apiFetch<{
      bank_name: string;
      account_name: string;
      iban: string;
      swift: string;
      rib?: string | null;
    }>('/api/bank-info')
      .then((info) => {
        setBankInfo({
          bankName: info.bank_name,
          accountName: info.account_name,
          iban: info.iban,
          swift: info.swift,
          rib: info.rib ?? '',
        });
      })
      .catch(() => {
        // Keep defaults if request fails.
      });

    apiFetch<{
      monthly_price: number;
      price_per_store: number;
      currency: string;
    }>('/api/pricing-config')
      .then((config) => {
        setPricingConfig({
          monthlyPrice: Number(config.monthly_price),
          pricePerStore: Number(config.price_per_store),
          currency: config.currency || 'DH',
        });
      })
      .catch(() => {
        setPricingConfig(defaultPricingConfig);
      });

    // Load user's stores and calculate active count
    apiFetch<{
      id: number | string;
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
    }[]>('/api/stores')
      .then((stores) => {
        const mappedStores: Store[] = stores.map((store) => ({
          id: String(store.id),
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
        }));
        const activeCount = Math.max(1, mappedStores.filter((store) => store.isActive).length);
        setActiveStoreCount(activeCount);
      })
      .catch(() => {
        setActiveStoreCount(1);
      });
  };

  const getMonthsRemaining = (): number => {
    if (!subscription) return 0;
    const today = new Date();
    const expiry = new Date(subscription.expiryDate);
    const months = differenceInMonths(expiry, today);
    return Math.max(0, months);
  };

  const getDaysRemaining = (): number => {
    if (!subscription) return 0;
    const today = new Date();
    const expiry = new Date(subscription.expiryDate);
    const days = differenceInDays(expiry, today);
    return Math.max(0, days);
  };

  const getSubscriptionStatus = () => {
    const days = getDaysRemaining();
    if (days === 0) return { status: 'expired', color: 'destructive', label: 'Expiré' };
    if (days <= 7) return { status: 'critical', color: 'destructive', label: 'Expire bientôt' };
    if (days <= 30) return { status: 'warning', color: 'warning', label: 'À renouveler' };
    return { status: 'active', color: 'success', label: 'Actif' };
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if needed
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5 Mo",
        variant: "destructive",
      });
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Seuls les formats PNG et JPG sont acceptés",
        variant: "destructive",
      });
      return;
    }

    try {
      const compressedImage = await compressImage(file, 800, 0.5);
      setScreenshot(compressedImage);
      setScreenshotName(file.name);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    }
  };

  const durationOptions = [
    { months: 1, label: '1 mois' },
    { months: 6, label: '6 mois' },
    { months: 12, label: '12 mois' },
  ];

  const selectedDurationValue = durationOptions.find(
    (option) => option.months.toString() === selectedDuration
  );
  const extraStoreCount = Math.max(0, activeStoreCount - 1);
  const monthlyTotal =
    (pricingConfig?.monthlyPrice ?? defaultPricingConfig.monthlyPrice) +
    ((pricingConfig?.pricePerStore ?? defaultPricingConfig.pricePerStore) * extraStoreCount);
  const selectedAmount = Math.round(
    monthlyTotal * (selectedDurationValue?.months ?? 0)
  );

  const handleSubmitPayment = async () => {
    if (!user || !screenshot || !selectedDurationValue) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs et joindre une capture d'écran",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch('/api/payment-requests', {
        method: 'POST',
        body: JSON.stringify({
          months_requested: selectedDurationValue.months,
          amount: selectedAmount,
          stores_count: activeStoreCount,
          screenshot,
        }),
      });

      toast({
        title: "Demande envoyée",
        description: "Votre preuve de paiement a été soumise. Nous vous contacterons bientôt.",
      });

      // Reset form
      setSelectedDuration('1');
      setScreenshot('');
      setScreenshotName('');
      loadData();
    } catch (error) {
      console.error('Request error:', error);
      toast({
        title: "Erreur de stockage",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest || !user) return;

    await apiFetch(`/api/payment-requests/${selectedRequest.id}/approve`, {
      method: 'PATCH',
    });

    toast({
      title: "Paiement validé",
      description: `${selectedRequest.monthsRequested} mois ajoutés à l'abonnement de ${selectedRequest.userName}`,
    });

    setShowReviewDialog(false);
    setSelectedRequest(null);
    loadData();
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !user || !rejectionReason) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif du rejet",
        variant: "destructive",
      });
      return;
    }

    await apiFetch(`/api/payment-requests/${selectedRequest.id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });

    toast({
      title: "Demande rejetée",
      description: "Le demandeur sera notifié du rejet",
    });

    setShowReviewDialog(false);
    setSelectedRequest(null);
    setRejectionReason('');
    loadData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le texte a été copié dans le presse-papiers",
    });
  };

  const pendingRequests = allPaymentRequests.filter(r => r.status === 'pending');
  const processedRequests = allPaymentRequests
    .filter(r => r.status !== 'pending')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const subscriptionStatus = getSubscriptionStatus();
  const monthsRemaining = getMonthsRemaining();
  const daysRemaining = getDaysRemaining();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Abonnement</h1>
          <p className="text-muted-foreground">
            Gérez votre abonnement et soumettez vos preuves de paiement
          </p>
        </div>

        <Tabs defaultValue={isSuperAdmin ? "admin" : "subscription"} className="space-y-6">
          <TabsList>
            {!isSuperAdmin && (
              <>
                <TabsTrigger value="subscription">Mon Abonnement</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="admin" className="relative">
                Validation des paiements
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* My Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {/* Pricing Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Votre tarif mensuel</p>
                    <p className="text-2xl font-bold text-primary">
                      {monthlyTotal.toLocaleString()} {pricingConfig.currency}/mois
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Inclut 1 magasin
                      {extraStoreCount > 0 && (
                        <> + {extraStoreCount} magasin(s) x {pricingConfig.pricePerStore.toLocaleString()} {pricingConfig.currency}/mois</>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {activeStoreCount} magasin(s) actif(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Subscription Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    État de l'abonnement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Statut</span>
                        <Badge 
                          variant={subscriptionStatus.color === 'success' ? 'default' : 'destructive'}
                          className={subscriptionStatus.color === 'warning' ? 'bg-amber-500' : ''}
                        >
                          {subscriptionStatus.label}
                        </Badge>
                      </div>
                      <div className="text-center py-6">
                        <div className={`text-6xl font-bold ${
                          daysRemaining <= 7 ? 'text-destructive' : 
                          daysRemaining <= 30 ? 'text-amber-500' : 
                          'text-primary'
                        }`}>
                          {monthsRemaining}
                        </div>
                        <p className="text-muted-foreground mt-2">mois restants</p>
                        <p className="text-sm text-muted-foreground">({daysRemaining} jours)</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date d'expiration</span>
                        <span className="font-medium">
                          {format(new Date(subscription.expiryDate), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Magasins actifs</span>
                        <span className="font-medium">{activeStoreCount}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <p className="text-lg font-medium">Aucun abonnement actif</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Soumettez une preuve de paiement pour activer votre abonnement
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bank Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations bancaires
                  </CardTitle>
                  <CardDescription>
                    Effectuez votre virement à ces coordonnées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Banque</p>
                      <p className="font-medium">{bankInfo.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Titulaire</p>
                      <p className="font-medium">{bankInfo.accountName}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(bankInfo.accountName)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {bankInfo.rib && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">RIB</p>
                        <p className="font-mono text-sm">{bankInfo.rib}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(bankInfo.rib || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">IBAN</p>
                      <p className="font-mono text-sm">{bankInfo.iban}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(bankInfo.iban)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">SWIFT/BIC</p>
                      <p className="font-mono">{bankInfo.swift}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(bankInfo.swift)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Payment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Soumettre une preuve de paiement
                </CardTitle>
                <CardDescription>
                  Après avoir effectué votre virement, uploadez la capture d'écran de confirmation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Magasins actifs</Label>
                    <Input readOnly value={`${activeStoreCount} magasin(s)`} />
                  </div>
                  <div className="space-y-2">
                    <Label>Durée</Label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.months} value={option.months.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Montant à payer</Label>
                    <Input
                      type="text"
                      value={
                        `${selectedAmount.toLocaleString()} ${pricingConfig.currency}`
                      }
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Capture d'écran du virement</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {screenshot ? (
                      <div className="space-y-4">
                        <img 
                          src={screenshot} 
                          alt="Preuve de paiement" 
                          className="max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-muted-foreground">{screenshotName}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setScreenshot('');
                            setScreenshotName('');
                          }}
                        >
                          Changer l'image
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm font-medium">Cliquez pour uploader</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG (max 2 Mo)</p>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmitPayment}
                  disabled={isSubmitting || !screenshot}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer la preuve de paiement"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historique des demandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune demande de paiement
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Formule</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Traité le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {format(new Date(request.submittedAt), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>{request.monthsRequested} mois</TableCell>
                          <TableCell>{request.amount.toLocaleString()} DH</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {request.status === 'approved' ? 'Approuvé' :
                               request.status === 'rejected' ? 'Rejeté' : 'En attente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.processedAt 
                              ? format(new Date(request.processedAt), 'dd/MM/yyyy')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {isSuperAdmin && (
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Demandes en attente de validation
                  </CardTitle>
                  <CardDescription>
                    Vérifiez les preuves de paiement et validez les abonnements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune demande en attente
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Formule</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.userName}</TableCell>
                            <TableCell>{request.userEmail}</TableCell>
                            <TableCell>{request.monthsRequested} mois</TableCell>
                            <TableCell>{request.amount.toLocaleString()} DH</TableCell>
                            <TableCell>
                              {format(new Date(request.submittedAt), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowReviewDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Examiner
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historique des demandes traitées
                  </CardTitle>
                  <CardDescription>
                    Paiements approuvés et rejetés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {processedRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun paiement traité pour l'instant
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Formule</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Traité le</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.userName}</TableCell>
                            <TableCell>{request.userEmail}</TableCell>
                            <TableCell>{request.monthsRequested} mois</TableCell>
                            <TableCell>{request.amount.toLocaleString()} DH</TableCell>
                            <TableCell>
                              <Badge 
                                variant={request.status === 'approved' ? 'default' : 'destructive'}
                              >
                                {request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {request.processedAt
                                ? format(new Date(request.processedAt), 'dd/MM/yyyy HH:mm')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowReviewDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Examen de la demande de paiement</DialogTitle>
              <DialogDescription>
                Vérifiez la preuve de paiement et validez ou rejetez la demande
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedRequest.userName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedRequest.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Formule demandée</p>
                    <p className="font-medium">{selectedRequest.monthsRequested} mois</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Montant</p>
                    <p className="font-medium">{selectedRequest.amount.toLocaleString()} DH</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Preuve de paiement</p>
                  <img 
                    src={selectedRequest.screenshot} 
                    alt="Preuve de paiement"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Motif de rejet (optionnel)</Label>
                  <Textarea
                    placeholder="Indiquez le motif si vous rejetez la demande..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewDialog(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectRequest}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button onClick={handleApproveRequest}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
