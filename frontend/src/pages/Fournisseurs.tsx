import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Truck,
  FileText,
  Package,
  FileSpreadsheet,
  Upload,
  ClipboardList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePermission } from "@/hooks/usePermission";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { PurchaseOrderForm } from "@/components/suppliers/PurchaseOrderForm";
import { DeliveryReceptionForm } from "@/components/suppliers/DeliveryReceptionForm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Supplier,
  PurchaseOrder,
  DeliveryNote,
} from "@/types/supplier";
import { 
  lensTypeLabels,
  treatmentLabels,
} from "@/types/workshop";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

const statusLabels: Record<PurchaseOrder['status'], string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  confirmed: 'Confirmé',
  partial: 'Partiel',
  received: 'Reçu',
  cancelled: 'Annulé',
};

const statusColors: Record<PurchaseOrder['status'], string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  partial: 'bg-amber-100 text-amber-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Fournisseurs() {
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermission();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedStoreId } = useStore();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>("all");

  // Dialog states
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [receptionDialogOpen, setReceptionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Selected items
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | undefined>();
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  useEffect(() => {
    if (!selectedStoreId) {
      setSuppliers([]);
      setPurchaseOrders([]);
      setDeliveryNotes([]);
      return;
    }

    const loadData = async () => {
      try {
        const [suppliersData, ordersData, notesData] = await Promise.all([
          apiFetch<{
            id: number | string;
            name: string;
            contact_name?: string | null;
            email?: string | null;
            phone?: string | null;
            address?: string | null;
            city?: string | null;
            tax_id?: string | null;
            notes?: string | null;
            is_active: boolean;
            created_at: string;
            updated_at: string;
          }[]>("/api/suppliers"),
          apiFetch<{
            id: number | string;
            reference: string;
            supplier_id?: string | null;
            supplier_name?: string | null;
            status: string;
            type: string;
            total_amount: string | number;
            notes?: string | null;
            created_at: string;
            expected_date?: string | null;
            received_at?: string | null;
            items?: Array<{
              id?: number | string;
              product_id: string | number;
              product_name: string;
              product_reference: string;
              quantity: number;
              unit_price: string | number;
              received_quantity?: number;
            }>;
            invoice_id?: string | null;
            invoice_number?: string | null;
            client_name?: string | null;
            lens_type?: string | null;
            lens_treatments?: string[] | null;
            lens_parameters?: Record<string, number> | null;
          }[]>("/api/purchase-orders"),
          apiFetch<{
            id: number | string;
            reference: string;
            purchase_order_id?: number | string | null;
            purchase_order_ref?: string | null;
            supplier_id?: string | null;
            supplier_name?: string | null;
            items?: Array<{
              id?: number | string;
              product_id: string;
              product_name: string;
              product_reference?: string | null;
              ordered_quantity?: number;
              received_quantity: number;
            }>;
            status: string;
            notes?: string | null;
            created_at: string;
            validated_at?: string | null;
          }[]>("/api/delivery-notes"),
        ]);

        setSuppliers(
          suppliersData.map((supplier) => ({
            id: String(supplier.id),
            name: supplier.name,
            contactName: supplier.contact_name ?? undefined,
            email: supplier.email ?? undefined,
            phone: supplier.phone ?? undefined,
            address: supplier.address ?? undefined,
            city: supplier.city ?? undefined,
            taxId: supplier.tax_id ?? undefined,
            notes: supplier.notes ?? undefined,
            isActive: supplier.is_active,
            createdAt: supplier.created_at,
            updatedAt: supplier.updated_at,
          }))
        );

        setPurchaseOrders(
          ordersData.map((order) => ({
            id: String(order.id),
            reference: order.reference,
            supplierId: order.supplier_id ? String(order.supplier_id) : "",
            supplierName: order.supplier_name || "",
            status: order.status as PurchaseOrder["status"],
            items: (order.items || []).map((item) => ({
              id: item.id ? String(item.id) : crypto.randomUUID(),
              productId: String(item.product_id),
              productName: item.product_name,
              productReference: item.product_reference,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
              receivedQuantity: Number(item.received_quantity ?? 0),
            })),
            totalAmount: Number(order.total_amount),
            notes: order.notes ?? undefined,
            createdAt: order.created_at,
            expectedDate: order.expected_date ?? undefined,
            receivedAt: order.received_at ?? undefined,
            type: order.type as PurchaseOrder["type"],
            invoiceId: order.invoice_id ?? undefined,
            invoiceNumber: order.invoice_number ?? undefined,
            clientName: order.client_name ?? undefined,
            lensType: order.lens_type ?? undefined,
            lensTreatments: order.lens_treatments ?? undefined,
            lensParameters: order.lens_parameters ?? undefined,
          }))
        );

        setDeliveryNotes(
          notesData.map((note) => ({
            id: String(note.id),
            reference: note.reference,
            purchaseOrderId: note.purchase_order_id ? String(note.purchase_order_id) : "",
            purchaseOrderRef: note.purchase_order_ref || "",
            supplierId: note.supplier_id ? String(note.supplier_id) : "",
            supplierName: note.supplier_name || "",
            items: (note.items || []).map((item) => ({
              id: item.id ? String(item.id) : crypto.randomUUID(),
              productId: String(item.product_id),
              productName: item.product_name,
              productReference: item.product_reference || "",
              orderedQuantity: Number(item.ordered_quantity ?? 0),
              receivedQuantity: Number(item.received_quantity ?? 0),
            })),
            status: note.status as DeliveryNote["status"],
            notes: note.notes ?? undefined,
            createdAt: note.created_at,
            validatedAt: note.validated_at ?? undefined,
          }))
        );
      } catch (error) {
        console.error("Suppliers load error:", error);
        toast({ title: "Impossible de charger les fournisseurs" });
        setSuppliers([]);
        setPurchaseOrders([]);
        setDeliveryNotes([]);
      }
    };

    loadData();
  }, [selectedStoreId, toast]);

  // Supplier handlers
  const handleCreateSupplier = async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await apiFetch<{
        id: number | string;
        name: string;
        contact_name?: string | null;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        tax_id?: string | null;
        notes?: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>("/api/suppliers", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          contact_name: data.contactName ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          address: data.address ?? null,
          city: data.city ?? null,
          tax_id: data.taxId ?? null,
          notes: data.notes ?? null,
          is_active: data.isActive,
        }),
      });

      const mapped: Supplier = {
        id: String(created.id),
        name: created.name,
        contactName: created.contact_name ?? undefined,
        email: created.email ?? undefined,
        phone: created.phone ?? undefined,
        address: created.address ?? undefined,
        city: created.city ?? undefined,
        taxId: created.tax_id ?? undefined,
        notes: created.notes ?? undefined,
        isActive: created.is_active,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      };

      setSuppliers((prev) => [mapped, ...prev]);
      setSupplierDialogOpen(false);
      toast({ title: "Fournisseur créé avec succès" });
    } catch (error) {
      console.error("Create supplier error:", error);
      toast({ title: "Impossible de créer le fournisseur" });
    }
  };

  const handleUpdateSupplier = async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedSupplier) return;
    try {
      const updated = await apiFetch<{
        id: number | string;
        name: string;
        contact_name?: string | null;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        tax_id?: string | null;
        notes?: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>(`/api/suppliers/${selectedSupplier.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          contact_name: data.contactName ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          address: data.address ?? null,
          city: data.city ?? null,
          tax_id: data.taxId ?? null,
          notes: data.notes ?? null,
          is_active: data.isActive,
        }),
      });

      const mapped: Supplier = {
        id: String(updated.id),
        name: updated.name,
        contactName: updated.contact_name ?? undefined,
        email: updated.email ?? undefined,
        phone: updated.phone ?? undefined,
        address: updated.address ?? undefined,
        city: updated.city ?? undefined,
        taxId: updated.tax_id ?? undefined,
        notes: updated.notes ?? undefined,
        isActive: updated.is_active,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };

      setSuppliers((prev) => prev.map((s) => (s.id === mapped.id ? mapped : s)));
      setSupplierDialogOpen(false);
      setSelectedSupplier(undefined);
      toast({ title: "Fournisseur modifié avec succès" });
    } catch (error) {
      console.error("Update supplier error:", error);
      toast({ title: "Impossible de modifier le fournisseur" });
    }
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    try {
      await apiFetch(`/api/suppliers/${supplierToDelete.id}`, { method: "DELETE" });
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete.id));
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
      toast({ title: "Fournisseur supprimé" });
    } catch (error) {
      console.error("Delete supplier error:", error);
      toast({ title: "Impossible de supprimer le fournisseur" });
    }
  };

  // Purchase Order handlers
  const handleCreateOrder = async (data: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    try {
      const created = await apiFetch<{
        id: number | string;
        reference: string;
        supplier_id?: string | null;
        supplier_name?: string | null;
        status: string;
        type: string;
        total_amount: string | number;
        notes?: string | null;
        created_at: string;
        expected_date?: string | null;
        received_at?: string | null;
        items?: Array<{
          product_id: string;
          product_name: string;
          product_reference: string;
          quantity: number;
          unit_price: string | number;
          received_quantity?: number;
        }>;
            invoice_id?: string | null;
            invoice_number?: string | null;
        client_name?: string | null;
        lens_type?: string | null;
        lens_treatments?: string[] | null;
        lens_parameters?: Record<string, number> | null;
      }>("/api/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          reference: data.reference,
          supplier_id: data.supplierId || null,
          supplier_name: data.supplierName || null,
          status: data.status,
          type: data.type,
          total_amount: data.totalAmount,
          notes: data.notes ?? null,
          expected_date: data.expectedDate || null,
          received_at: data.receivedAt || null,
          items: data.items.map((item) => ({
            product_id: item.productId,
            product_name: item.productName,
            product_reference: item.productReference,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            received_quantity: item.receivedQuantity,
          })),
          invoice_id: data.invoiceId ?? null,
          invoice_number: data.invoiceNumber ?? null,
          client_name: data.clientName ?? null,
          lens_type: data.lensType ?? null,
          lens_treatments: data.lensTreatments ?? null,
          lens_parameters: data.lensParameters ?? null,
        }),
      });

      const mapped: PurchaseOrder = {
        id: String(created.id),
        reference: created.reference,
        supplierId: created.supplier_id ? String(created.supplier_id) : "",
        supplierName: created.supplier_name || "",
        status: created.status as PurchaseOrder["status"],
        items: (created.items || []).map((item) => ({
          id: crypto.randomUUID(),
          productId: String(item.product_id),
          productName: item.product_name,
          productReference: item.product_reference,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          receivedQuantity: Number(item.received_quantity ?? 0),
        })),
        totalAmount: Number(created.total_amount),
        notes: created.notes ?? undefined,
        createdAt: created.created_at,
        expectedDate: created.expected_date ?? undefined,
        receivedAt: created.received_at ?? undefined,
        type: created.type as PurchaseOrder["type"],
        invoiceId: created.invoice_id ?? undefined,
        invoiceNumber: created.invoice_number ?? undefined,
        clientName: created.client_name ?? undefined,
        lensType: created.lens_type ?? undefined,
        lensTreatments: created.lens_treatments ?? undefined,
        lensParameters: created.lens_parameters ?? undefined,
      };

      setPurchaseOrders((prev) => [mapped, ...prev]);
      setOrderDialogOpen(false);
      toast({ title: "Bon de commande créé avec succès" });
    } catch (error) {
      console.error("Create order error:", error);
      toast({ title: "Impossible de créer le bon de commande" });
    }
  };

  const handleUpdateOrder = async (data: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    if (!selectedOrder) return;
    try {
      const updated = await apiFetch<{
        id: number | string;
        reference: string;
        supplier_id?: string | null;
        supplier_name?: string | null;
        status: string;
        type: string;
        total_amount: string | number;
        notes?: string | null;
        created_at: string;
        expected_date?: string | null;
        received_at?: string | null;
        items?: Array<{
          product_id: string;
          product_name: string;
          product_reference: string;
          quantity: number;
          unit_price: string | number;
          received_quantity?: number;
        }>;
            invoice_id?: string | null;
            invoice_number?: string | null;
        client_name?: string | null;
        lens_type?: string | null;
        lens_treatments?: string[] | null;
        lens_parameters?: Record<string, number> | null;
      }>(`/api/purchase-orders/${selectedOrder.id}`, {
        method: "PUT",
        body: JSON.stringify({
          reference: data.reference,
          supplier_id: data.supplierId || null,
          supplier_name: data.supplierName || null,
          status: data.status,
          type: data.type,
          total_amount: data.totalAmount,
          notes: data.notes ?? null,
          expected_date: data.expectedDate || null,
          received_at: data.receivedAt || null,
          items: data.items.map((item) => ({
            product_id: item.productId,
            product_name: item.productName,
            product_reference: item.productReference,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            received_quantity: item.receivedQuantity,
          })),
          invoice_id: data.invoiceId ?? null,
          invoice_number: data.invoiceNumber ?? null,
          client_name: data.clientName ?? null,
          lens_type: data.lensType ?? null,
          lens_treatments: data.lensTreatments ?? null,
          lens_parameters: data.lensParameters ?? null,
        }),
      });

      const mapped: PurchaseOrder = {
        id: String(updated.id),
        reference: updated.reference,
        supplierId: updated.supplier_id ? String(updated.supplier_id) : "",
        supplierName: updated.supplier_name || "",
        status: updated.status as PurchaseOrder["status"],
        items: (updated.items || []).map((item) => ({
          id: crypto.randomUUID(),
          productId: String(item.product_id),
          productName: item.product_name,
          productReference: item.product_reference,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          receivedQuantity: Number(item.received_quantity ?? 0),
        })),
        totalAmount: Number(updated.total_amount),
        notes: updated.notes ?? undefined,
        createdAt: updated.created_at,
        expectedDate: updated.expected_date ?? undefined,
        receivedAt: updated.received_at ?? undefined,
        type: updated.type as PurchaseOrder["type"],
        invoiceId: updated.invoice_id ?? undefined,
        invoiceNumber: updated.invoice_number ?? undefined,
        clientName: updated.client_name ?? undefined,
        lensType: updated.lens_type ?? undefined,
        lensTreatments: updated.lens_treatments ?? undefined,
        lensParameters: updated.lens_parameters ?? undefined,
      };

      setPurchaseOrders((prev) => prev.map((o) => (o.id === mapped.id ? mapped : o)));
      setOrderDialogOpen(false);
      setSelectedOrder(undefined);
      toast({ title: "Bon de commande modifié" });
    } catch (error) {
      console.error("Update order error:", error);
      toast({ title: "Impossible de modifier le bon de commande" });
    }
  };

  // Delivery reception handler
  const handleReceiveDelivery = async (data: Omit<DeliveryNote, 'id' | 'createdAt'>) => {
    try {
      const created = await apiFetch<{
        id: number | string;
        reference: string;
        purchase_order_id?: number | string | null;
        purchase_order_ref?: string | null;
        supplier_id?: string | null;
        supplier_name?: string | null;
        items?: Array<{
          product_id: string;
          product_name: string;
          product_reference?: string | null;
          ordered_quantity?: number;
          received_quantity: number;
        }>;
        status: string;
        notes?: string | null;
        created_at: string;
        validated_at?: string | null;
      }>("/api/delivery-notes", {
        method: "POST",
        body: JSON.stringify({
          reference: data.reference,
          purchase_order_id: data.purchaseOrderId || null,
          purchase_order_ref: data.purchaseOrderRef || null,
          supplier_id: data.supplierId || null,
          supplier_name: data.supplierName || null,
          status: data.status,
          notes: data.notes ?? null,
          validated_at: data.validatedAt || null,
          items: data.items.map((item) => ({
            product_id: item.productId,
            product_name: item.productName,
            product_reference: item.productReference,
            ordered_quantity: item.orderedQuantity,
            received_quantity: item.receivedQuantity,
          })),
        }),
      });

      const mapped: DeliveryNote = {
        id: String(created.id),
        reference: created.reference,
        purchaseOrderId: created.purchase_order_id ? String(created.purchase_order_id) : "",
        purchaseOrderRef: created.purchase_order_ref || "",
        supplierId: created.supplier_id ? String(created.supplier_id) : "",
        supplierName: created.supplier_name || "",
        items: (created.items || []).map((item) => ({
          id: crypto.randomUUID(),
          productId: String(item.product_id),
          productName: item.product_name,
          productReference: item.product_reference || "",
          orderedQuantity: Number(item.ordered_quantity ?? 0),
          receivedQuantity: Number(item.received_quantity ?? 0),
        })),
        status: created.status as DeliveryNote["status"],
        notes: created.notes ?? undefined,
        createdAt: created.created_at,
        validatedAt: created.validated_at ?? undefined,
      };

      setDeliveryNotes((prev) => [mapped, ...prev]);

      if (selectedOrder) {
        const refreshed = await apiFetch<{
          id: number | string;
          reference: string;
          supplier_id?: string | null;
          supplier_name?: string | null;
          status: string;
          type: string;
          total_amount: string | number;
          notes?: string | null;
          created_at: string;
          expected_date?: string | null;
          received_at?: string | null;
          items?: Array<{
            product_id: string;
            product_name: string;
            product_reference: string;
            quantity: number;
            unit_price: string | number;
            received_quantity?: number;
          }>;
          invoice_id?: string | null;
          invoice_number?: string | null;
          client_name?: string | null;
          lens_type?: string | null;
          lens_treatments?: string[] | null;
          lens_parameters?: Record<string, number> | null;
        }[]>(`/api/purchase-orders`);

        const mappedOrders = refreshed.map((order) => ({
          id: String(order.id),
          reference: order.reference,
          supplierId: order.supplier_id ? String(order.supplier_id) : "",
          supplierName: order.supplier_name || "",
          status: order.status as PurchaseOrder["status"],
          items: (order.items || []).map((item) => ({
            id: crypto.randomUUID(),
            productId: String(item.product_id),
            productName: item.product_name,
            productReference: item.product_reference,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            receivedQuantity: Number(item.received_quantity ?? 0),
          })),
          totalAmount: Number(order.total_amount),
          notes: order.notes ?? undefined,
          createdAt: order.created_at,
          expectedDate: order.expected_date ?? undefined,
          receivedAt: order.received_at ?? undefined,
          type: order.type as PurchaseOrder["type"],
          invoiceId: order.invoice_id ?? undefined,
          invoiceNumber: order.invoice_number ?? undefined,
          clientName: order.client_name ?? undefined,
          lensType: order.lens_type ?? undefined,
          lensTreatments: order.lens_treatments ?? undefined,
          lensParameters: order.lens_parameters ?? undefined,
        }));

        setPurchaseOrders(mappedOrders);
      }

      setReceptionDialogOpen(false);
      setSelectedOrder(undefined);
      toast({ title: "Réception validée avec succès" });
    } catch (error) {
      console.error("Receive delivery error:", error);
      toast({ title: "Impossible de valider la réception" });
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Nom', 'Contact', 'Téléphone', 'Email', 'Adresse', 'Ville', 'ICE', 'Actif', 'Notes'];
    const rows = suppliers.map(s => [
      s.name,
      s.contactName || '',
      s.phone || '',
      s.email || '',
      s.address || '',
      s.city || '',
      s.taxId || '',
      s.isActive ? 'Oui' : 'Non',
      s.notes || '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fournisseurs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast({ title: "Export CSV terminé" });
  };

  // CSV Import
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1);
      
      let imported = 0;
      let skipped = 0;

      const toImport: Array<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>> = [];

      lines.forEach(line => {
        if (!line.trim()) return;
        
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ';' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const [name, contactName, phone, email, address, city, taxId, isActiveStr, notes] = values;
        
        if (!name) {
          skipped++;
          return;
        }

        const exists = suppliers.some(s => s.name.toLowerCase() === name.toLowerCase());
        if (exists) {
          skipped++;
          return;
        }

        const newSupplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> = {
          name,
          contactName: contactName || undefined,
          phone: phone || undefined,
          email: email || undefined,
          address: address || undefined,
          city: city || undefined,
          taxId: taxId || undefined,
          notes: notes || undefined,
          isActive: isActiveStr?.toLowerCase() !== 'non',
        };

        toImport.push(newSupplier);
        imported++;
      });

      if (imported > 0) {
        apiFetch<{
          id: number | string;
          name: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }[]>("/api/suppliers/import", {
          method: "POST",
          body: JSON.stringify({
            suppliers: toImport.map((supplier) => ({
              name: supplier.name,
              contact_name: supplier.contactName ?? null,
              email: supplier.email ?? null,
              phone: supplier.phone ?? null,
              address: supplier.address ?? null,
              city: supplier.city ?? null,
              tax_id: supplier.taxId ?? null,
              notes: supplier.notes ?? null,
              is_active: supplier.isActive,
            })),
          }),
        })
          .then((createdSuppliers) => {
            setSuppliers((prev) => [
              ...createdSuppliers.map((supplier) => ({
                id: String(supplier.id),
                name: supplier.name,
                contactName: supplier.contact_name ?? undefined,
                email: supplier.email ?? undefined,
                phone: supplier.phone ?? undefined,
                address: supplier.address ?? undefined,
                city: supplier.city ?? undefined,
                taxId: supplier.tax_id ?? undefined,
                notes: supplier.notes ?? undefined,
                isActive: supplier.is_active,
                createdAt: supplier.created_at,
                updatedAt: supplier.updated_at,
              })),
              ...prev,
            ]);
          })
          .catch((error) => {
            console.error("Import suppliers error:", error);
            toast({ title: "Impossible d'importer les fournisseurs" });
          });
      }

      toast({
        title: `Import terminé`,
        description: `${imported} fournisseur(s) importé(s), ${skipped} ignoré(s)`,
      });
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = purchaseOrders.filter(o => {
    const matchesSearch = o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const matchesType = orderTypeFilter === "all" || o.type === orderTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredNotes = deliveryNotes.filter(n => {
    const matchesSearch = n.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = deliveryStatusFilter === "all" || n.status === deliveryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const pendingOrders = purchaseOrders.filter(o => ['sent', 'confirmed', 'partial'].includes(o.status)).length;
  const totalOrdersValue = purchaseOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Fournisseurs</h1>
            <p className="text-muted-foreground">Gérez vos fournisseurs et bons de commande</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fournisseurs actifs</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSuppliers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrdersValue.toFixed(2)} DH</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="suppliers">
          <TabsList>
            <TabsTrigger value="suppliers">
              <Truck className="h-4 w-4 mr-2" />
              Fournisseurs ({suppliers.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ClipboardList className="h-4 w-4 mr-2" />
              Bons de commande ({purchaseOrders.length})
            </TabsTrigger>
            <TabsTrigger value="deliveries">
              <Package className="h-4 w-4 mr-2" />
              Bons de livraison ({deliveryNotes.length})
            </TabsTrigger>
          </TabsList>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex justify-end">
              {canCreate('fournisseurs') && (
                <Button onClick={() => { setSelectedSupplier(undefined); setSupplierDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau fournisseur
                </Button>
              )}
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactName || '-'}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell>{supplier.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                          {supplier.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEdit('fournisseurs') && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedSupplier(supplier);
                                setSupplierDialogOpen(true);
                              }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            )}
                            {canDelete('fournisseurs') && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSupplierToDelete(supplier);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Aucun fournisseur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="sent">Envoyé</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="partial">Partiel</SelectItem>
                    <SelectItem value="received">Reçu</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="product">Produits</SelectItem>
                    <SelectItem value="lens">Verres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {canCreate('bons_commande') && (
                <Button onClick={() => { setSelectedOrder(undefined); setOrderDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau bon de commande
                </Button>
              )}
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Client / Détails</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.reference}</TableCell>
                      <TableCell>
                        {order.type === 'lens' ? (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            <Eye className="h-3 w-3 mr-1" />
                            Verres
                          </Badge>
                        ) : (
                          <Badge variant="outline">Produits</Badge>
                        )}
                      </TableCell>
                      <TableCell>{order.supplierName}</TableCell>
                      <TableCell>
                        {order.type === 'lens' ? (
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{order.clientName || '-'}</p>
                            {order.lensType && (
                              <p className="text-xs text-muted-foreground">
                                {lensTypeLabels[order.lensType as keyof typeof lensTypeLabels] || order.lensType}
                                {order.lensTreatments && order.lensTreatments.length > 0 && (
                                  <> • {order.lensTreatments.map(t => treatmentLabels[t as keyof typeof treatmentLabels] || t).join(', ')}</>
                                )}
                              </p>
                            )}
                            {order.invoiceNumber && (
                              <p className="text-xs text-muted-foreground">Facture: {order.invoiceNumber}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {order.items.length} produit(s)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell className="text-right font-medium">
                        {order.totalAmount.toFixed(2)} DH
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.type === 'lens' && order.lensParameters && (
                              <DropdownMenuItem onClick={() => {
                                toast({
                                  title: "Paramètres optiques",
                                  description: `OD: SPH ${order.lensParameters?.odSphere ?? '-'} CYL ${order.lensParameters?.odCylinder ?? '-'} | OG: SPH ${order.lensParameters?.ogSphere ?? '-'} CYL ${order.lensParameters?.ogCylinder ?? '-'}`,
                                });
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir paramètres
                              </DropdownMenuItem>
                            )}
                            {canEdit('bons_commande') && order.status !== 'received' && order.status !== 'cancelled' && order.type !== 'lens' && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedOrder(order);
                                setOrderDialogOpen(true);
                              }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            )}
                            {canCreate('bons_livraison') && ['sent', 'confirmed', 'partial'].includes(order.status) && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedOrder(order);
                                setReceptionDialogOpen(true);
                              }}>
                                <Package className="h-4 w-4 mr-2" />
                                Réceptionner
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Aucun bon de commande trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Delivery Notes Tab */}
          <TabsContent value="deliveries" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Select value={deliveryStatusFilter} onValueChange={setDeliveryStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="validated">Validé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence BL</TableHead>
                    <TableHead>Référence BC</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date réception</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map(note => (
                    <TableRow key={note.id}>
                      <TableCell className="font-mono">{note.reference}</TableCell>
                      <TableCell className="font-mono">{note.purchaseOrderRef}</TableCell>
                      <TableCell>{note.supplierName}</TableCell>
                      <TableCell>
                        {format(new Date(note.createdAt), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {note.items.reduce((sum, i) => sum + i.receivedQuantity, 0)} article(s)
                      </TableCell>
                      <TableCell>
                        <Badge variant={note.status === 'validated' ? 'default' : 'secondary'}>
                          {note.status === 'validated' ? 'Validé' : 'En attente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredNotes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Aucun bon de livraison trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Supplier Dialog */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            supplier={selectedSupplier}
            onSubmit={selectedSupplier ? handleUpdateSupplier : handleCreateSupplier}
            onCancel={() => setSupplierDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Purchase Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? 'Modifier le bon de commande' : 'Nouveau bon de commande'}
            </DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            order={selectedOrder}
            suppliers={suppliers}
            onSubmit={selectedOrder ? handleUpdateOrder : handleCreateOrder}
            onCancel={() => setOrderDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delivery Reception Dialog */}
      <Dialog open={receptionDialogOpen} onOpenChange={setReceptionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Réception de marchandise</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <DeliveryReceptionForm
              order={selectedOrder}
              existingDeliveries={deliveryNotes}
              onSubmit={handleReceiveDelivery}
              onCancel={() => setReceptionDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le fournisseur "{supplierToDelete?.name}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
