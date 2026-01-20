import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart as CartIcon, 
  User, 
  FileText, 
  CreditCard,
  Trash2,
  Plus,
  AlertCircle,
  Percent,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductSelector } from "@/components/sales/ProductSelector";
import { ShoppingCart } from "@/components/sales/ShoppingCart";
import { ClientSelector } from "@/components/sales/ClientSelector";
import { PaymentDialog } from "@/components/sales/PaymentDialog";
import { InvoicePreview } from "@/components/sales/InvoicePreview";
import { CustomLensForm, CustomLensData } from "@/components/sales/CustomLensForm";
import { Product, Category } from "@/types/stock";
import { Client, Prescription } from "@/types/client";
import { 
  CartItem, 
  Invoice, 
  PaymentMethod,
  generateInvoiceNumber, 
  calculateCartTotals 
} from "@/types/sales";
import { 
  generateWorkshopOrderNumber,
  lensTypeLabels,
  treatmentLabels,
} from "@/types/workshop";
import { generateReference } from "@/types/supplier";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

const Ventes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedStoreId } = useStore();
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Cart states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [applyTax, setApplyTax] = useState(false);
  const [notes, setNotes] = useState("");
  
  // Dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isCustomLensFormOpen, setIsCustomLensFormOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  
  // Prescription and workshop data
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pendingLensOrder, setPendingLensOrder] = useState<CustomLensData | null>(null);

  useEffect(() => {
    if (!selectedStoreId) return;

    const loadSalesData = async () => {
      try {
        const [categoriesData, productsData, clientsData, prescriptionsData] = await Promise.all([
          apiFetch<{
            id: number | string;
            name: string;
            label: string;
            is_default: boolean;
          }[]>("/api/stock/categories"),
          apiFetch<{
            id: number | string;
            reference: string;
            name: string;
            category_id: number | string;
            brand: string;
            description?: string | null;
            purchase_price: string | number;
            selling_price: string | number;
            current_stock: number;
            minimum_stock: number;
            store_id: number | string;
            lens_type?: string | null;
            sphere?: string | null;
            cylinder?: string | null;
            axis?: string | null;
            addition?: string | null;
            base_curve?: string | null;
            diameter?: string | null;
            created_at: string;
            updated_at: string;
          }[]>("/api/stock/products"),
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
            client_id: number | string;
            date: string;
            prescriber?: string | null;
            expiry_date?: string | null;
            od_sphere?: number | null;
            od_cylinder?: number | null;
            od_axis?: number | null;
            od_addition?: number | null;
            od_pd?: number | null;
            og_sphere?: number | null;
            og_cylinder?: number | null;
            og_axis?: number | null;
            og_addition?: number | null;
            og_pd?: number | null;
            notes?: string | null;
            created_at: string;
            updated_at: string;
          }[]>("/api/prescriptions"),
        ]);

        const mappedCategories = categoriesData.map((category) => ({
          id: String(category.id),
          name: category.name,
          label: category.label,
          isDefault: category.is_default,
        }));
        setCategories(mappedCategories);

        const categoryNameById = new Map(
          mappedCategories.map((category) => [category.id, category.name])
        );

        setProducts(
          productsData.map((product) => ({
            id: String(product.id),
            reference: product.reference,
            name: product.name,
            category: categoryNameById.get(String(product.category_id)) || "divers",
            brand: product.brand,
            description: product.description ?? undefined,
            purchasePrice: Number(product.purchase_price),
            sellingPrice: Number(product.selling_price),
            currentStock: product.current_stock,
            minimumStock: product.minimum_stock,
            storeId: String(product.store_id),
            lensType: (product.lens_type as Product["lensType"]) || undefined,
            sphere: product.sphere ?? undefined,
            cylinder: product.cylinder ?? undefined,
            axis: product.axis ?? undefined,
            addition: product.addition ?? undefined,
            baseCurve: product.base_curve ?? undefined,
            diameter: product.diameter ?? undefined,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
          }))
        );

        setClients(
          clientsData.map((client) => ({
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
          }))
        );

        setPrescriptions(
          prescriptionsData.map((prescription) => ({
            id: String(prescription.id),
            clientId: String(prescription.client_id),
            date: prescription.date,
            prescriber: prescription.prescriber ?? undefined,
            expiryDate: prescription.expiry_date ?? undefined,
            odSphere: prescription.od_sphere ?? undefined,
            odCylinder: prescription.od_cylinder ?? undefined,
            odAxis: prescription.od_axis ?? undefined,
            odAddition: prescription.od_addition ?? undefined,
            odPd: prescription.od_pd ?? undefined,
            ogSphere: prescription.og_sphere ?? undefined,
            ogCylinder: prescription.og_cylinder ?? undefined,
            ogAxis: prescription.og_axis ?? undefined,
            ogAddition: prescription.og_addition ?? undefined,
            ogPd: prescription.og_pd ?? undefined,
            notes: prescription.notes ?? undefined,
            createdAt: prescription.created_at,
            updatedAt: prescription.updated_at,
          }))
        );
      } catch (error) {
        console.error("Sales load error:", error);
        setProducts([]);
        setCategories([]);
        setClients([]);
        setPrescriptions([]);
      }
    };

    loadSalesData();
  }, [selectedStoreId]);

  // Calculate totals
  const taxRate = applyTax ? 20 : 0;
  const { subtotal, discountTotal, taxAmount, total } = useMemo(() => 
    calculateCartTotals(cartItems, taxRate), 
    [cartItems, taxRate]
  );

  // Add product to cart
  const handleAddToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        // Check stock
        if (existing.quantity >= product.currentStock) {
          toast.error("Stock insuffisant");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice * (1 - item.discount / 100),
              }
            : item
        );
      }
      // Add new item
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          productReference: product.reference,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discount: 0,
          total: product.sellingPrice,
        },
      ];
    });
    toast.success(`${product.name} ajouté au panier`);
  }, []);

  // Update cart item quantity
  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      
      const product = products.find((p) => p.id === item.productId);
      if (product && quantity > product.currentStock) {
        toast.error("Stock insuffisant");
        return prev;
      }
      
      return prev.map((i) =>
        i.id === itemId
          ? { ...i, quantity, total: quantity * i.unitPrice * (1 - i.discount / 100) }
          : i
      );
    });
  }, [products]);

  // Update cart item discount
  const handleUpdateDiscount = useCallback((itemId: string, discount: number) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, discount, total: i.quantity * i.unitPrice * (1 - discount / 100) }
          : i
      )
    );
  }, []);

  // Update cart item price
  const handleUpdatePrice = useCallback((itemId: string, price: number) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, unitPrice: price, total: i.quantity * price * (1 - i.discount / 100) }
          : i
      )
    );
  }, []);

  // Remove item from cart
  const handleRemoveItem = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // Clear cart
  const handleClearCart = () => {
    setCartItems([]);
    setSelectedClient(null);
    setApplyTax(false);
    setNotes("");
    setPendingLensOrder(null);
    toast.info("Panier vidé");
  };

  // Add custom lens to cart
  const handleAddCustomLens = (lensData: CustomLensData) => {
    const treatmentsList = lensData.treatments.map(t => treatmentLabels[t]).join(', ');
    const lensName = `Verres ${lensTypeLabels[lensData.lensType]}${treatmentsList ? ` (${treatmentsList})` : ''}`;
    
    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      productId: `custom-lens-${crypto.randomUUID()}`,
      productName: lensName,
      productReference: `VRR-${lensData.supplierName.substring(0, 3).toUpperCase()}`,
      quantity: 1,
      unitPrice: lensData.sellingPrice,
      discount: 0,
      total: lensData.sellingPrice,
    };
    
    setCartItems(prev => [...prev, cartItem]);
    setPendingLensOrder(lensData);
    toast.success("Verres sur mesure ajoutés au panier");
  };

  // Create invoice (draft)
  const createInvoice = (): Invoice => {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      clientId: selectedClient?.id || '',
      clientName: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Client anonyme',
      storeId: selectedStoreId || '',
      items: cartItems,
      subtotal,
      discountTotal,
      taxRate,
      taxAmount,
      total,
      amountPaid: 0,
      amountDue: total,
      status: 'draft',
      payments: [],
      notes: notes || undefined,
      createdBy: user?.id || '',
      createdAt: now,
      updatedAt: now,
    };
  };

  const mapInvoiceResponse = (invoice: {
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
  }): Invoice => {
    const client = clients.find((c) => String(c.id) === String(invoice.client_id));
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

  // Handle payment
  const handlePayment = () => {
    if (cartItems.length === 0) {
      toast.error("Le panier est vide");
      return;
    }
    
    // Create invoice if not exists
    if (!currentInvoice) {
      const invoice = createInvoice();
      setCurrentInvoice(invoice);
    }
    
    setIsPaymentDialogOpen(true);
  };

  // Confirm payment
  const handleConfirmPayment = (payment: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => {
    if (!selectedStoreId) {
      toast.error("Veuillez sélectionner un magasin.");
      return;
    }

    const payload = {
      client_id: selectedClient?.id ? Number(selectedClient.id) : null,
      items: cartItems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          product_id: product ? Number(product.id) : null,
          product_name: item.productName,
          product_reference: item.productReference || null,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
        };
      }),
      tax_rate: taxRate,
      notes: notes || null,
      payment: {
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference || null,
        notes: payment.notes || null,
      },
      validate_only: true,
    };

    apiFetch<any>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((invoice) => {
        const mapped = mapInvoiceResponse(invoice);
        setCurrentInvoice(mapped);
        setIsPaymentDialogOpen(false);

        if (pendingLensOrder) {
          const purchaseOrderRef = generateReference('BC-VRR');
          const purchasePayload = {
            reference: purchaseOrderRef,
            supplier_name: pendingLensOrder.supplierName,
            supplier_id: pendingLensOrder.supplierId || null,
            status: 'sent',
            type: 'lens',
            total_amount: pendingLensOrder.purchasePrice,
            invoice_id: Number(mapped.id),
            invoice_number: mapped.invoiceNumber,
            client_name: mapped.clientName,
            lens_type: pendingLensOrder.lensType,
            lens_treatments: pendingLensOrder.treatments,
            lens_parameters: pendingLensOrder.parameters,
            items: [],
            notes: pendingLensOrder.notes || null,
          };

          apiFetch<any>("/api/purchase-orders", {
            method: "POST",
            body: JSON.stringify(purchasePayload),
          })
            .then((purchaseOrder) => {
              const workshopPayload = {
                order_number: generateWorkshopOrderNumber(),
                invoice_id: Number(mapped.id),
                invoice_number: mapped.invoiceNumber,
                client_id: selectedClient?.id ? Number(selectedClient.id) : null,
                client_name: mapped.clientName,
                purchase_order_id: Number(purchaseOrder.id),
                purchase_order_ref: purchaseOrderRef,
                status: 'en_attente_verres',
                priority: 'normal',
                lens_type: pendingLensOrder.lensType,
                lens_treatments: pendingLensOrder.treatments,
                lens_parameters: pendingLensOrder.parameters,
                lens_supplier: pendingLensOrder.supplierName,
                lens_supplier_id: pendingLensOrder.supplierId || null,
                lens_supplier_order_ref: pendingLensOrder.supplierOrderRef || null,
                lens_purchase_price: pendingLensOrder.purchasePrice,
                lens_selling_price: pendingLensOrder.sellingPrice,
                notes: pendingLensOrder.notes || null,
              };

              return apiFetch<any>("/api/workshop-orders", {
                method: "POST",
                body: JSON.stringify(workshopPayload),
              });
            })
            .then(() => {
              setPendingLensOrder(null);
              toast.success("Ordre atelier et bon de commande créés automatiquement");
            })
            .catch(() => {
              toast.error("Impossible de créer l'ordre atelier.");
            });
        }

        setCartItems([]);
        setSelectedClient(null);
        setApplyTax(false);
        setNotes("");
        setPendingLensOrder(null);

        if (mapped.status === 'paid') {
          toast.success("Paiement effectué - Facture soldée");
          setIsInvoicePreviewOpen(true);
        } else {
          toast.success(`Acompte de ${payment.amount.toLocaleString('fr-MA')} DH enregistré`);
          setCurrentInvoice(null);
        }

        apiFetch("/api/stock/products")
          .then((productsData: any[]) => {
            const categoryNameById = new Map(
              categories.map((category) => [category.id, category.name])
            );
            setProducts(
              productsData.map((product) => ({
                id: String(product.id),
                reference: product.reference,
                name: product.name,
                category: categoryNameById.get(String(product.category_id)) || "divers",
                brand: product.brand,
                description: product.description ?? undefined,
                purchasePrice: Number(product.purchase_price),
                sellingPrice: Number(product.selling_price),
                currentStock: product.current_stock,
                minimumStock: product.minimum_stock,
                storeId: String(product.store_id),
                lensType: (product.lens_type as Product["lensType"]) || undefined,
                sphere: product.sphere ?? undefined,
                cylinder: product.cylinder ?? undefined,
                axis: product.axis ?? undefined,
                addition: product.addition ?? undefined,
                baseCurve: product.base_curve ?? undefined,
                diameter: product.diameter ?? undefined,
                createdAt: product.created_at,
                updatedAt: product.updated_at,
              }))
            );
          })
          .catch(() => undefined);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible d'enregistrer la vente.";
        toast.error(message);
      });
  };

  // View invoice
  const handleViewInvoice = () => {
    if (!currentInvoice && cartItems.length > 0) {
      const invoice = createInvoice();
      setCurrentInvoice(invoice);
    }
    setIsInvoicePreviewOpen(true);
  };

  // Validate invoice
  const handleValidateInvoice = () => {
    if (!selectedStoreId) {
      toast.error("Veuillez sélectionner un magasin.");
      return;
    }

    const draft = currentInvoice ?? createInvoice();

    apiFetch<any>("/api/invoices", {
      method: "POST",
      body: JSON.stringify({
        client_id: draft.clientId ? Number(draft.clientId) : null,
        items: draft.items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            product_id: product ? Number(product.id) : null,
            product_name: item.productName,
            product_reference: item.productReference || null,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: item.discount,
          };
        }),
        tax_rate: draft.taxRate,
        notes: draft.notes || null,
        validate_only: true,
      }),
    })
      .then((invoice) => {
        const mapped = mapInvoiceResponse(invoice);
        setCurrentInvoice(mapped);
        toast.success("Facture validée");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de valider la facture.";
        toast.error(message);
      });
  };

  // Start new sale
  const handleNewSale = () => {
    setCartItems([]);
    setSelectedClient(null);
    setApplyTax(false);
    setNotes("");
    setCurrentInvoice(null);
    setIsInvoicePreviewOpen(false);
  };

  return (
    <ProtectedRoute module="ventes" action="view">
      <DashboardLayout>
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h1 className="text-2xl font-bold">Nouvelle Vente</h1>
              <p className="text-sm text-muted-foreground">
                Sélectionnez des produits et un client pour créer une vente
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsCustomLensFormOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Verres sur mesure
              </Button>
              <Button variant="outline" onClick={() => navigate('/factures')}>
                <FileText className="h-4 w-4 mr-2" />
                Voir les factures
              </Button>
              {cartItems.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleClearCart}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider
                </Button>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            {/* Product selector (left) */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CartIcon className="h-5 w-5" />
                  Produits
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ProductSelector
                  products={products}
                  categories={categories}
                  onAddToCart={handleAddToCart}
                />
              </CardContent>
            </Card>

            {/* Cart and checkout (right) */}
            <div className="w-[500px] flex flex-col gap-4 min-h-0 pr-2">
              {/* Client selector */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ClientSelector
                    clients={clients}
                    selectedClient={selectedClient}
                    onSelectClient={setSelectedClient}
                    onCreateClient={() => navigate('/clients')}
                  />
                </CardContent>
              </Card>

              {/* Shopping cart */}
              <Card className="flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CartIcon className="h-5 w-5" />
                    Panier
                    {cartItems.length > 0 && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        {cartItems.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ShoppingCart
                    items={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onUpdateDiscount={handleUpdateDiscount}
                    onUpdatePrice={handleUpdatePrice}
                    onRemoveItem={handleRemoveItem}
                    subtotal={subtotal}
                    discountTotal={discountTotal}
                    taxRate={taxRate}
                    taxAmount={taxAmount}
                    total={total}
                  />
                </CardContent>
              </Card>

              {/* Options and actions */}
              {cartItems.length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Tax toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="tax">Appliquer TVA (20%)</Label>
                      </div>
                      <Switch
                        id="tax"
                        checked={applyTax}
                        onCheckedChange={setApplyTax}
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes sur la vente..."
                        rows={2}
                      />
                    </div>

                    <Separator />

                    {/* Warning if no client */}
                    {!selectedClient && (
                      <Alert variant="default" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Aucun client sélectionné. La vente sera enregistrée comme anonyme.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleViewInvoice}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Aperçu
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handlePayment}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Encaisser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Payment dialog */}
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          total={currentInvoice?.total || total}
          amountDue={currentInvoice?.amountDue || total}
          onConfirmPayment={handleConfirmPayment}
        />

        {/* Invoice preview */}
        <InvoicePreview
          invoice={currentInvoice}
          client={selectedClient}
          isOpen={isInvoicePreviewOpen}
          onClose={() => {
            setIsInvoicePreviewOpen(false);
            if (currentInvoice?.status === 'paid') {
              handleNewSale();
            }
          }}
          onValidate={currentInvoice?.status === 'draft' ? handleValidateInvoice : undefined}
        />

        {/* Custom lens form */}
        <CustomLensForm
          isOpen={isCustomLensFormOpen}
          onClose={() => setIsCustomLensFormOpen(false)}
          clientId={selectedClient?.id}
          clientName={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : undefined}
          prescriptions={prescriptions}
          onSubmit={handleAddCustomLens}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Ventes;
