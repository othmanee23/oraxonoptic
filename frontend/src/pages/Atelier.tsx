import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Wrench,
  Search,
  Eye,
  Package,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  WorkshopOrder,
  WorkshopOrderStatus,
  workshopStatusLabels,
  workshopStatusColors,
  lensTypeLabels,
  treatmentLabels,
} from "@/types/workshop";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

const statusIcons: Record<WorkshopOrderStatus, React.ElementType> = {
  en_attente_verres: Clock,
  verres_recus: Package,
  montage_en_cours: Wrench,
  pret: CheckCircle,
  livre: Truck,
};

const Atelier = () => {
  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<WorkshopOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const { selectedStoreId } = useStore();

  const mapWorkshopOrder = (order: {
    id: number | string;
    order_number: string;
    invoice_id?: number | string | null;
    invoice_number?: string | null;
    client_id?: number | string | null;
    client_name?: string | null;
    purchase_order_id?: number | string | null;
    purchase_order_ref?: string | null;
    status: string;
    priority: string;
    lens_type?: string | null;
    lens_treatments?: string[] | null;
    lens_parameters?: Record<string, number> | null;
    lens_supplier?: string | null;
    lens_supplier_order_ref?: string | null;
    lens_supplier_id?: string | null;
    lens_purchase_price?: string | number | null;
    lens_selling_price?: string | number | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    lens_received_at?: string | null;
    completed_at?: string | null;
    delivered_at?: string | null;
    expected_date?: string | null;
  }): WorkshopOrder => ({
    id: String(order.id),
    orderNumber: order.order_number,
    invoiceId: order.invoice_id ? String(order.invoice_id) : "",
    invoiceNumber: order.invoice_number || "",
    clientId: order.client_id ? String(order.client_id) : "",
    clientName: order.client_name || "",
    purchaseOrderId: order.purchase_order_id ? String(order.purchase_order_id) : undefined,
    purchaseOrderRef: order.purchase_order_ref ?? undefined,
    lensType: order.lens_type ? (order.lens_type as WorkshopOrder["lensType"]) : undefined,
    lensTreatments: order.lens_treatments ?? undefined,
    lensParameters: order.lens_parameters ?? undefined,
    lensSupplier: order.lens_supplier ?? undefined,
    lensSupplierOrderRef: order.lens_supplier_order_ref ?? undefined,
    lensSupplierId: order.lens_supplier_id ?? undefined,
    lensPurchasePrice: order.lens_purchase_price ? Number(order.lens_purchase_price) : undefined,
    lensSellingPrice: order.lens_selling_price ? Number(order.lens_selling_price) : undefined,
    status: order.status as WorkshopOrderStatus,
    priority: order.priority as WorkshopOrder["priority"],
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    lensReceivedAt: order.lens_received_at ?? undefined,
    completedAt: order.completed_at ?? undefined,
    deliveredAt: order.delivered_at ?? undefined,
    expectedDate: order.expected_date ?? undefined,
    notes: order.notes ?? undefined,
  });

  // Load data
  useEffect(() => {
    if (!selectedStoreId) {
      setOrders([]);
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await apiFetch<{
          id: number | string;
          order_number: string;
          invoice_id?: number | string | null;
          invoice_number?: string | null;
          client_id?: number | string | null;
          client_name?: string | null;
          purchase_order_id?: number | string | null;
          purchase_order_ref?: string | null;
          status: string;
          priority: string;
          lens_type?: string | null;
          lens_treatments?: string[] | null;
          lens_parameters?: Record<string, number> | null;
          lens_supplier?: string | null;
          lens_supplier_order_ref?: string | null;
          lens_supplier_id?: string | null;
          lens_purchase_price?: string | number | null;
          lens_selling_price?: string | number | null;
          notes?: string | null;
          created_at: string;
          updated_at: string;
          lens_received_at?: string | null;
          completed_at?: string | null;
          delivered_at?: string | null;
          expected_date?: string | null;
        }[]>("/api/workshop-orders");

        setOrders(data.map(mapWorkshopOrder));
      } catch (error) {
        console.error("Workshop orders load error:", error);
        toast.error("Impossible de charger l'atelier");
        setOrders([]);
      }
    };

    loadOrders();
  }, [selectedStoreId]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.frameName && order.frameName.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Priority: urgent first
        if (a.priority !== b.priority) {
          return a.priority === 'urgent' ? -1 : 1;
        }
        // Then by status order
        const statusOrder: WorkshopOrderStatus[] = ['en_attente_verres', 'verres_recus', 'montage_en_cours', 'pret', 'livre'];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });
  }, [orders, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === 'en_attente_verres').length;
    const inProgress = orders.filter(o => ['verres_recus', 'montage_en_cours'].includes(o.status)).length;
    const ready = orders.filter(o => o.status === 'pret').length;
    const urgent = orders.filter(o => o.priority === 'urgent' && o.status !== 'livre').length;
    return { pending, inProgress, ready, urgent };
  }, [orders]);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: WorkshopOrderStatus) => {
    try {
      const updated = await apiFetch<{
        id: number | string;
        order_number: string;
        invoice_id?: number | string | null;
        invoice_number?: string | null;
        client_id?: number | string | null;
        client_name?: string | null;
        purchase_order_id?: number | string | null;
        purchase_order_ref?: string | null;
        status: string;
        priority: string;
        lens_type?: string | null;
        lens_treatments?: string[] | null;
        lens_parameters?: Record<string, number> | null;
        lens_supplier?: string | null;
        lens_supplier_order_ref?: string | null;
        lens_supplier_id?: string | null;
        lens_purchase_price?: string | number | null;
        lens_selling_price?: string | number | null;
        notes?: string | null;
        created_at: string;
        updated_at: string;
        lens_received_at?: string | null;
        completed_at?: string | null;
        delivered_at?: string | null;
        expected_date?: string | null;
      }>(`/api/workshop-orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      const mapped = mapWorkshopOrder(updated);
      setOrders(prev => prev.map(order => (order.id === mapped.id ? mapped : order)));
      if (selectedOrder?.id === mapped.id) {
        setSelectedOrder(mapped);
      }
      toast.success(`Statut mis à jour: ${workshopStatusLabels[newStatus]}`);
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Impossible de mettre à jour le statut");
    }
  };

  // Toggle priority
  const handleTogglePriority = async (orderId: string) => {
    const current = orders.find((order) => order.id === orderId);
    if (!current) return;
    const nextPriority = current.priority === 'urgent' ? 'normal' : 'urgent';

    try {
      const updated = await apiFetch<{
        id: number | string;
        order_number: string;
        invoice_id?: number | string | null;
        invoice_number?: string | null;
        client_id?: number | string | null;
        client_name?: string | null;
        purchase_order_id?: number | string | null;
        purchase_order_ref?: string | null;
        status: string;
        priority: string;
        lens_type?: string | null;
        lens_treatments?: string[] | null;
        lens_parameters?: Record<string, number> | null;
        lens_supplier?: string | null;
        lens_supplier_order_ref?: string | null;
        lens_supplier_id?: string | null;
        lens_purchase_price?: string | number | null;
        lens_selling_price?: string | number | null;
        notes?: string | null;
        created_at: string;
        updated_at: string;
        lens_received_at?: string | null;
        completed_at?: string | null;
        delivered_at?: string | null;
        expected_date?: string | null;
      }>(`/api/workshop-orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ priority: nextPriority }),
      });

      const mapped = mapWorkshopOrder(updated);
      setOrders(prev => prev.map(order => (order.id === mapped.id ? mapped : order)));
      if (selectedOrder?.id === mapped.id) {
        setSelectedOrder(mapped);
      }
      toast.success("Priorité mise à jour");
    } catch (error) {
      console.error("Update priority error:", error);
      toast.error("Impossible de mettre à jour la priorité");
    }
  };

  // View details
  const handleViewDetails = (order: WorkshopOrder) => {
    setSelectedOrder(order);
    setNotes(order.notes || "");
    setIsDetailsOpen(true);
  };

  // Update notes
  const handleUpdateNotes = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await apiFetch<{
        id: number | string;
        order_number: string;
        invoice_id?: number | string | null;
        invoice_number?: string | null;
        client_id?: number | string | null;
        client_name?: string | null;
        purchase_order_id?: number | string | null;
        purchase_order_ref?: string | null;
        status: string;
        priority: string;
        lens_type?: string | null;
        lens_treatments?: string[] | null;
        lens_parameters?: Record<string, number> | null;
        lens_supplier?: string | null;
        lens_supplier_order_ref?: string | null;
        lens_supplier_id?: string | null;
        lens_purchase_price?: string | number | null;
        lens_selling_price?: string | number | null;
        notes?: string | null;
        created_at: string;
        updated_at: string;
        lens_received_at?: string | null;
        completed_at?: string | null;
        delivered_at?: string | null;
        expected_date?: string | null;
      }>(`/api/workshop-orders/${selectedOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      });

      const mapped = mapWorkshopOrder(updated);
      setOrders(prev => prev.map(order => (order.id === mapped.id ? mapped : order)));
      setSelectedOrder(mapped);
      toast.success("Notes mises à jour");
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Update notes error:", error);
      toast.error("Impossible de mettre à jour les notes");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'N° Ordre', 'Client', 'N° Facture', 'Monture', 'Type verres', 
      'Fournisseur verres', 'Statut', 'Priorité', 'Date création', 'Notes'
    ];
    
    const rows = filteredOrders.map(order => [
      order.orderNumber,
      order.clientName,
      order.invoiceNumber,
      order.frameName || '',
      order.lensType ? lensTypeLabels[order.lensType] : '',
      order.lensSupplier || '',
      workshopStatusLabels[order.status],
      order.priority === 'urgent' ? 'Urgent' : 'Normal',
      format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: fr }),
      order.notes || '',
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV terminé");
  };

  return (
    <ProtectedRoute module="atelier" action="view">
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Atelier</h1>
              <p className="text-muted-foreground">
                Suivi des commandes et montages
              </p>
            </div>
            <Button variant="outline" onClick={handleExportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">En attente verres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Wrench className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                    <p className="text-sm text-muted-foreground">En cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.ready}</p>
                    <p className="text-sm text-muted-foreground">Prêts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.urgent}</p>
                    <p className="text-sm text-muted-foreground">Urgents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par n° ordre, client, facture, monture..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(workshopStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Ordre</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Facture</TableHead>
                    <TableHead>Monture</TableHead>
                    <TableHead>Verres</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>BC Fournisseur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Aucun ordre de travail trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const StatusIcon = statusIcons[order.status];
                      return (
                        <TableRow key={order.id} className={order.priority === 'urgent' ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {order.orderNumber}
                              {order.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">Urgent</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell className="text-muted-foreground">{order.invoiceNumber}</TableCell>
                          <TableCell>{order.frameName || '-'}</TableCell>
                          <TableCell>
                            {order.lensType ? lensTypeLabels[order.lensType] : '-'}
                          </TableCell>
                          <TableCell>{order.lensSupplier || '-'}</TableCell>
                          <TableCell>
                            {order.purchaseOrderRef ? (
                              <Badge variant="outline" className="font-mono text-xs">
                                {order.purchaseOrderRef}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={workshopStatusColors[order.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {workshopStatusLabels[order.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTogglePriority(order.id)}>
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  {order.priority === 'urgent' ? 'Retirer urgent' : 'Marquer urgent'}
                                </DropdownMenuItem>
                                {order.status === 'en_attente_verres' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'verres_recus')}>
                                    <Package className="h-4 w-4 mr-2" />
                                    Verres reçus
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'verres_recus' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'montage_en_cours')}>
                                    <Wrench className="h-4 w-4 mr-2" />
                                    Démarrer montage
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'montage_en_cours' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'pret')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Marquer prêt
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'pret' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'livre')}>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Marquer livré
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

        {/* Details dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Détails de l'ordre {selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Client & Invoice */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedOrder.clientName}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Facture</p>
                    <p className="font-medium">{selectedOrder.invoiceNumber}</p>
                  </div>
                </div>

                {/* Frame */}
                {selectedOrder.frameName && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Monture</p>
                    <p className="font-medium">{selectedOrder.frameName}</p>
                    {selectedOrder.frameReference && (
                      <p className="text-sm text-muted-foreground">Réf: {selectedOrder.frameReference}</p>
                    )}
                  </div>
                )}

                {/* Lens details */}
                {selectedOrder.lensType && (
                  <div className="p-4 border rounded-lg space-y-3">
                    <p className="font-medium">Verres</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{' '}
                        {lensTypeLabels[selectedOrder.lensType]}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fournisseur:</span>{' '}
                        {selectedOrder.lensSupplier || '-'}
                      </div>
                      {selectedOrder.lensSupplierOrderRef && (
                        <div>
                          <span className="text-muted-foreground">Réf. commande:</span>{' '}
                          {selectedOrder.lensSupplierOrderRef}
                        </div>
                      )}
                      {selectedOrder.lensTreatments && selectedOrder.lensTreatments.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Traitements:</span>{' '}
                          {selectedOrder.lensTreatments.map(t => treatmentLabels[t]).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Parameters */}
                    {selectedOrder.lensParameters && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">Paramètres optiques</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="p-2 bg-muted rounded">
                            <p className="font-medium mb-1">OD</p>
                            <p>SPH: {selectedOrder.lensParameters.odSphere ?? '-'}</p>
                            <p>CYL: {selectedOrder.lensParameters.odCylinder ?? '-'}</p>
                            <p>AXE: {selectedOrder.lensParameters.odAxis ?? '-'}</p>
                            <p>ADD: {selectedOrder.lensParameters.odAddition ?? '-'}</p>
                            <p>EP: {selectedOrder.lensParameters.odPd ?? '-'}</p>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <p className="font-medium mb-1">OG</p>
                            <p>SPH: {selectedOrder.lensParameters.ogSphere ?? '-'}</p>
                            <p>CYL: {selectedOrder.lensParameters.ogCylinder ?? '-'}</p>
                            <p>AXE: {selectedOrder.lensParameters.ogAxis ?? '-'}</p>
                            <p>ADD: {selectedOrder.lensParameters.ogAddition ?? '-'}</p>
                            <p>EP: {selectedOrder.lensParameters.ogPd ?? '-'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {(selectedOrder.lensPurchasePrice || selectedOrder.lensSellingPrice) && (
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Prix achat:</span>{' '}
                          {selectedOrder.lensPurchasePrice?.toLocaleString('fr-MA')} DH
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prix vente:</span>{' '}
                          {selectedOrder.lensSellingPrice?.toLocaleString('fr-MA')} DH
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Créé le:</span>{' '}
                    {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                  {selectedOrder.lensReceivedAt && (
                    <div>
                      <span className="text-muted-foreground">Verres reçus:</span>{' '}
                      {format(new Date(selectedOrder.lensReceivedAt), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  )}
                  {selectedOrder.completedAt && (
                    <div>
                      <span className="text-muted-foreground">Terminé le:</span>{' '}
                      {format(new Date(selectedOrder.completedAt), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  )}
                  {selectedOrder.deliveredAt && (
                    <div>
                      <span className="text-muted-foreground">Livré le:</span>{' '}
                      {format(new Date(selectedOrder.deliveredAt), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter des notes..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Fermer
              </Button>
              <Button onClick={handleUpdateNotes}>
                Enregistrer notes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Atelier;
