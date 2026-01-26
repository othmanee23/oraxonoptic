import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FileText,
  Search,
  Filter,
  Eye,
  CreditCard,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Printer,
  FileSpreadsheet,
} from "lucide-react";

import { generateInvoicePDF, generatePrintHTML } from "@/utils/pdfGenerator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoicePreview } from "@/components/sales/InvoicePreview";
import { PaymentDialog } from "@/components/sales/PaymentDialog";
import { Invoice, PaymentStatus, PaymentMethod } from "@/types/sales";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

const statusConfig: Record<PaymentStatus, { 
  label: string; 
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ComponentType<{ className?: string }>;
}> = {
  draft: { label: 'Brouillon', variant: 'secondary', icon: FileText },
  pending: { label: 'En attente', variant: 'outline', icon: Clock },
  partial: { label: 'Partiel', variant: 'default', icon: AlertCircle },
  paid: { label: 'Payée', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Annulée', variant: 'destructive', icon: XCircle },
};

const Factures = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { selectedStoreId, selectedStore, storeSettings } = useStore();

  const mapInvoiceResponse = (
    invoice: {
      id: number | string;
      invoice_number: string;
      client_id?: number | string | null;
      store_id: number | string;
      subtotal: string | number;
      discount_total: string | number;
      tax_rate: string | number;
      tax_amount: string | number;
      total: string | number;
      amount_paid: string | number;
      amount_due: string | number;
      status: string;
      notes?: string | null;
      created_by: number | string;
      created_at: string;
      updated_at: string;
      validated_at?: string | null;
      paid_at?: string | null;
      items: Array<{
        id: number | string;
        product_id?: number | string | null;
        product_name: string;
        product_reference?: string | null;
        quantity: number;
        unit_price: string | number;
        discount: string | number;
        total: string | number;
      }>;
      payments: Array<{
        id: number | string;
        invoice_id: number | string;
        amount: string | number;
        method: string;
        date: string;
        reference?: string | null;
        notes?: string | null;
      }>;
    },
    clientList: Client[]
  ): Invoice => {
    const client = clientList.find((c) => String(c.id) === String(invoice.client_id));
    return {
      id: String(invoice.id),
      invoiceNumber: invoice.invoice_number,
      clientId: invoice.client_id ? String(invoice.client_id) : '',
      clientName: client ? `${client.firstName} ${client.lastName}` : 'Client anonyme',
      storeId: String(invoice.store_id),
      items: invoice.items.map((item) => ({
        id: String(item.id),
        productId: item.product_id ? String(item.product_id) : `custom-${item.id}`,
        productName: item.product_name,
        productReference: item.product_reference || '',
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        discount: Number(item.discount),
        total: Number(item.total),
      })),
      subtotal: Number(invoice.subtotal),
      discountTotal: Number(invoice.discount_total),
      taxRate: Number(invoice.tax_rate),
      taxAmount: Number(invoice.tax_amount),
      total: Number(invoice.total),
      amountPaid: Number(invoice.amount_paid),
      amountDue: Number(invoice.amount_due),
      status: invoice.status as Invoice["status"],
      payments: invoice.payments.map((payment) => ({
        id: String(payment.id),
        invoiceId: String(payment.invoice_id),
        amount: Number(payment.amount),
        method: payment.method as PaymentMethod,
        date: payment.date,
        reference: payment.reference ?? undefined,
        notes: payment.notes ?? undefined,
      })),
      notes: invoice.notes ?? undefined,
      createdBy: String(invoice.created_by),
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      validatedAt: invoice.validated_at ?? undefined,
      paidAt: invoice.paid_at ?? undefined,
    };
  };

  // Load data
  useEffect(() => {
    if (!selectedStoreId) {
      setInvoices([]);
      return;
    }

    const loadInvoices = async () => {
      try {
        const [clientsData, invoicesData] = await Promise.all([
          apiFetch<{
            id: number | string;
            first_name: string;
            last_name: string;
            email?: string | null;
            phone: string;
            address?: string | null;
            date_of_birth?: string | null;
            notes?: string | null;
            created_at: string;
            updated_at: string;
          }[]>("/api/clients"),
          apiFetch<{
            id: number | string;
            invoice_number: string;
            client_id?: number | string | null;
            store_id: number | string;
            subtotal: string | number;
            discount_total: string | number;
            tax_rate: string | number;
            tax_amount: string | number;
            total: string | number;
            amount_paid: string | number;
            amount_due: string | number;
            status: string;
            notes?: string | null;
            created_by: number | string;
            created_at: string;
            updated_at: string;
            validated_at?: string | null;
            paid_at?: string | null;
            items: Array<{
              id: number | string;
              product_id?: number | string | null;
              product_name: string;
              product_reference?: string | null;
              quantity: number;
              unit_price: string | number;
              discount: string | number;
              total: string | number;
            }>;
            payments: Array<{
              id: number | string;
              invoice_id: number | string;
              amount: string | number;
              method: string;
              date: string;
              reference?: string | null;
              notes?: string | null;
            }>;
          }[]>("/api/invoices"),
        ]);

        const mappedClients = clientsData.map((client) => ({
          id: String(client.id),
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.email ?? undefined,
          phone: client.phone,
          address: client.address ?? undefined,
          dateOfBirth: client.date_of_birth ?? undefined,
          notes: client.notes ?? undefined,
          createdAt: client.created_at,
          updatedAt: client.updated_at,
        }));

        setClients(mappedClients);
        setInvoices(invoicesData.map((invoice) => mapInvoiceResponse(invoice, mappedClients)));
      } catch (error) {
        console.error("Invoices load error:", error);
        toast.error("Impossible de charger les factures");
        setInvoices([]);
      }
    };

    loadInvoices();
  }, [selectedStoreId]);

  const getClient = useCallback(
    (clientId: string) => clients.find((c) => String(c.id) === String(clientId)) || null,
    [clients]
  );

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, search, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pending = invoices.filter((inv) => ['pending', 'partial'].includes(inv.status)).reduce((sum, inv) => sum + inv.amountDue, 0);
    const count = invoices.length;
    
    return { total, paid, pending, count };
  }, [invoices]);

  // View invoice
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  // Add payment
  const handleAddPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  };

  // Confirm payment
  const handleConfirmPayment = async (payment: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => {
    if (!selectedInvoice) return;
    try {
      const updated = await apiFetch<{
        id: number | string;
        invoice_number: string;
        client_id?: number | string | null;
        store_id: number | string;
        subtotal: string | number;
        discount_total: string | number;
        tax_rate: string | number;
        tax_amount: string | number;
        total: string | number;
        amount_paid: string | number;
        amount_due: string | number;
        status: string;
        notes?: string | null;
        created_by: number | string;
        created_at: string;
        updated_at: string;
        validated_at?: string | null;
        paid_at?: string | null;
        items: Array<{
          id: number | string;
          product_id?: number | string | null;
          product_name: string;
          product_reference?: string | null;
          quantity: number;
          unit_price: string | number;
          discount: string | number;
          total: string | number;
        }>;
        payments: Array<{
          id: number | string;
          invoice_id: number | string;
          amount: string | number;
          method: string;
          date: string;
          reference?: string | null;
          notes?: string | null;
        }>;
      }>(`/api/invoices/${selectedInvoice.id}/payments`, {
        method: "POST",
        body: JSON.stringify(payment),
      });

      const mapped = mapInvoiceResponse(updated, clients);
      setInvoices((prev) => prev.map((inv) => (inv.id === mapped.id ? mapped : inv)));
      setSelectedInvoice(mapped);
      setIsPaymentDialogOpen(false);

      if (mapped.status === 'paid') {
        toast.success("Facture soldée");
      } else {
        toast.success(`Paiement de ${payment.amount.toLocaleString('fr-MA')} DH enregistré`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Impossible d'enregistrer le paiement");
    }
  };

  // Cancel invoice
  const handleCancelInvoice = async (invoice: Invoice) => {
    try {
      const updated = await apiFetch<{
        id: number | string;
        invoice_number: string;
        client_id?: number | string | null;
        store_id: number | string;
        subtotal: string | number;
        discount_total: string | number;
        tax_rate: string | number;
        tax_amount: string | number;
        total: string | number;
        amount_paid: string | number;
        amount_due: string | number;
        status: string;
        notes?: string | null;
        created_by: number | string;
        created_at: string;
        updated_at: string;
        validated_at?: string | null;
        paid_at?: string | null;
        items: Array<{
          id: number | string;
          product_id?: number | string | null;
          product_name: string;
          product_reference?: string | null;
          quantity: number;
          unit_price: string | number;
          discount: string | number;
          total: string | number;
        }>;
        payments: Array<{
          id: number | string;
          invoice_id: number | string;
          amount: string | number;
          method: string;
          date: string;
          reference?: string | null;
          notes?: string | null;
        }>;
      }>(`/api/invoices/${invoice.id}/cancel`, { method: "PATCH" });

      const mapped = mapInvoiceResponse(updated, clients);
      setInvoices((prev) => prev.map((inv) => (inv.id === mapped.id ? mapped : inv)));
      if (selectedInvoice?.id === mapped.id) {
        setSelectedInvoice(mapped);
      }
      toast.success("Facture annulée");
    } catch (error) {
      console.error("Cancel invoice error:", error);
      toast.error("Impossible d'annuler la facture");
    }
  };

  // Print invoice
  const handlePrintInvoice = (invoice: Invoice) => {
    const client = getClient(invoice.clientId);
    const htmlContent = generatePrintHTML(invoice, client);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Impossible de préparer l'impression");
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print error:', e);
        toast.error("Erreur lors de l'impression");
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
    
    toast.success("Préparation de l'impression...");
  };

  // Download invoice as PDF
  const handleDownloadInvoice = (invoice: Invoice) => {
    const client = getClient(invoice.clientId);
    generateInvoicePDF(invoice, client);
    toast.success("PDF téléchargé");
  };

  // Export invoices to CSV
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error("Aucune facture à exporter");
      return;
    }

    const headers = [
      "Numéro",
      "Date",
      "Client",
      "Articles",
      "Sous-total (DH)",
      "Remise (DH)",
      "TVA (DH)",
      "Total (DH)",
      "Payé (DH)",
      "Reste (DH)",
      "Statut",
      "Mode de paiement"
    ];

    const rows = filteredInvoices.map((invoice) => {
      const paymentMethods = invoice.payments.map(p => {
        const methods: Record<string, string> = {
          cash: "Espèces",
          card: "Carte",
          transfer: "Virement",
          mixed: "Mixte"
        };
        return methods[p.method] || p.method;
      }).join(", ");

      const statusLabels: Record<string, string> = {
        draft: "Brouillon",
        pending: "En attente",
        partial: "Partiel",
        paid: "Payée",
        cancelled: "Annulée"
      };

      return [
        invoice.invoiceNumber,
        format(new Date(invoice.createdAt), "dd/MM/yyyy", { locale: fr }),
        invoice.clientName,
        invoice.items.length.toString(),
        invoice.subtotal.toFixed(2),
        invoice.discountTotal.toFixed(2),
        invoice.taxAmount.toFixed(2),
        invoice.total.toFixed(2),
        invoice.amountPaid.toFixed(2),
        invoice.amountDue.toFixed(2),
        statusLabels[invoice.status] || invoice.status,
        paymentMethods || "-"
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `factures_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${filteredInvoices.length} facture(s) exportée(s) en CSV`);
  };

  return (
    <ProtectedRoute module="factures" action="view">
      <DashboardLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Factures</h1>
              <p className="text-sm text-muted-foreground">
                Gérez vos factures et suivez les paiements
              </p>
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total factures</p>
                    <p className="text-xl font-bold">{stats.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Encaissé</p>
                    <p className="text-xl font-bold">{stats.paid.toLocaleString('fr-MA')} DH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-xl font-bold">{stats.pending.toLocaleString('fr-MA')} DH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total CA</p>
                    <p className="text-xl font-bold">{stats.total.toLocaleString('fr-MA')} DH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro ou client..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="partial">Partiel</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoices table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Payé</TableHead>
                    <TableHead className="text-right">Reste</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucune facture trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const StatusIcon = statusConfig[invoice.status].icon;
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {format(new Date(invoice.createdAt), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell className="text-right font-medium">
                            {invoice.total.toLocaleString('fr-MA')} DH
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {invoice.amountPaid.toLocaleString('fr-MA')} DH
                          </TableCell>
                          <TableCell className="text-right">
                            {invoice.amountDue > 0 ? (
                              <span className="text-amber-600">{invoice.amountDue.toLocaleString('fr-MA')} DH</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[invoice.status].variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig[invoice.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                  <DropdownMenuItem onClick={() => handleAddPayment(invoice)}>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Ajouter paiement
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Imprimer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Télécharger
                                </DropdownMenuItem>
                                {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleCancelInvoice(invoice)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Annuler
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Invoice preview */}
          <InvoicePreview
            invoice={selectedInvoice}
            client={selectedInvoice ? getClient(selectedInvoice.clientId) : null}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            storeName={selectedStore?.name}
            storeSubtitle={selectedStore?.city || selectedStore?.address}
            storeCurrency={storeSettings.currency}
          />

        {/* Payment dialog */}
        {selectedInvoice && (
          <PaymentDialog
            isOpen={isPaymentDialogOpen}
            onClose={() => setIsPaymentDialogOpen(false)}
            total={selectedInvoice.total}
            amountDue={selectedInvoice.amountDue}
            onConfirmPayment={handleConfirmPayment}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Factures;
