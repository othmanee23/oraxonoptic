import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  FileText,
  Download,
  Calendar,
  BarChart3,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

interface Sale {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  subtotal: number;
  tax: number;
  items: Array<{
    type: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function Rapports() {
  const [period, setPeriod] = useState("month");
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { selectedStoreId } = useStore();

  useEffect(() => {
    if (!selectedStoreId) {
      setSales([]);
      setProducts([]);
      setClients([]);
      return;
    }

    const loadReportsData = async () => {
      try {
        const [clientsData, productsData, invoicesData] = await Promise.all([
          apiFetch<{
            id: number | string;
            first_name: string;
            last_name: string;
            phone?: string | null;
            email?: string | null;
            created_at: string;
          }[]>("/api/clients"),
          apiFetch<{
            id: number | string;
            name: string;
            reference: string;
            category_id: number | string;
            current_stock: number;
            minimum_stock: number;
            purchase_price: string | number;
            selling_price: string | number;
          }[]>("/api/stock/products"),
          apiFetch<{
            id: number | string;
            invoice_number: string;
            client_id?: number | string | null;
            subtotal: string | number;
            tax_amount: string | number;
            total: string | number;
            status: string;
            created_at: string;
            items: Array<{
              product_name: string;
              quantity: number;
              unit_price: string | number;
            }>;
            payments: Array<{
              method: string;
            }>;
          }[]>("/api/invoices"),
        ]);

        const mappedClients = clientsData.map((client) => ({
          id: String(client.id),
          firstName: client.first_name,
          lastName: client.last_name,
          phone: client.phone ?? undefined,
          email: client.email ?? undefined,
          createdAt: client.created_at,
        }));

        const clientById = new Map(mappedClients.map((client) => [client.id, client]));

        setClients(mappedClients);
        setProducts(
          productsData.map((product) => ({
            id: String(product.id),
            name: product.name,
            reference: product.reference,
            category: String(product.category_id),
            quantity: product.current_stock,
            minStock: product.minimum_stock,
            purchasePrice: Number(product.purchase_price),
            sellingPrice: Number(product.selling_price),
          }))
        );

        setSales(
          invoicesData.map((invoice) => {
            const client = invoice.client_id ? clientById.get(String(invoice.client_id)) : undefined;
            const paymentMethods = invoice.payments.map((payment) => payment.method).filter(Boolean);
            const uniqueMethods = Array.from(new Set(paymentMethods));
            const paymentMethod =
              uniqueMethods.length > 1 ? "mixed" : uniqueMethods[0] || "";

            return {
              id: String(invoice.id),
              invoiceNumber: invoice.invoice_number,
              clientName: client ? `${client.firstName} ${client.lastName}` : "Client comptoir",
              total: Number(invoice.total),
              subtotal: Number(invoice.subtotal),
              tax: Number(invoice.tax_amount),
              items: invoice.items.map((item) => ({
                type: "product",
                name: item.product_name,
                quantity: item.quantity,
                price: Number(item.unit_price),
              })),
              paymentMethod,
              status: invoice.status,
              createdAt: invoice.created_at,
            };
          })
        );
      } catch (error) {
        console.error("Reports load error:", error);
        setSales([]);
        setProducts([]);
        setClients([]);
      }
    };

    loadReportsData();
  }, [selectedStoreId]);

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "week":
        return { start: subDays(now, 7), end: now };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "quarter":
        return { start: subMonths(now, 3), end: now };
      case "year":
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      try {
        const saleDate = parseISO(sale.createdAt);
        return isWithinInterval(saleDate, { start: dateRange.start, end: dateRange.end });
      } catch {
        return false;
      }
    });
  }, [sales, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalSales = filteredSales.length;
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const paidSales = filteredSales.filter(s => s.status === 'paid').length;
    const pendingSales = filteredSales.filter(s => s.status === 'pending').length;

    return {
      totalRevenue,
      totalSales,
      averageTicket,
      paidSales,
      pendingSales,
    };
  }, [filteredSales]);

  // Sales by day for chart
  const salesByDay = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const day = format(parseISO(sale.createdAt), 'dd/MM');
      grouped[day] = (grouped[day] || 0) + sale.total;
    });
    return Object.entries(grouped).map(([date, montant]) => ({ date, montant }));
  }, [filteredSales]);

  // Sales by payment method
  const salesByPayment = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const method = sale.paymentMethod || 'Non spécifié';
      grouped[method] = (grouped[method] || 0) + sale.total;
    });
    const labels: Record<string, string> = {
      cash: 'Espèces',
      card: 'Carte bancaire',
      check: 'Chèque',
      transfer: 'Virement',
      mixed: 'Mixte',
    };
    return Object.entries(grouped).map(([name, value]) => ({
      name: labels[name] || name,
      value,
    }));
  }, [filteredSales]);

  // Top products sold
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredSales.forEach(sale => {
      sale.items?.forEach(item => {
        const key = item.name;
        if (!productSales[key]) {
          productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => p.quantity <= p.minStock)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 10);
  }, [products]);

  // New clients this period
  const newClients = useMemo(() => {
    return clients.filter(client => {
      try {
        const createdDate = parseISO(client.createdAt);
        return isWithinInterval(createdDate, { start: dateRange.start, end: dateRange.end });
      } catch {
        return false;
      }
    });
  }, [clients, dateRange]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Facture', 'Client', 'Montant', 'Statut', 'Paiement'];
    const rows = filteredSales.map(sale => [
      format(parseISO(sale.createdAt), 'dd/MM/yyyy'),
      sale.invoiceNumber,
      sale.clientName || 'Client comptoir',
      sale.total.toFixed(2),
      sale.status === 'paid' ? 'Payée' : 'En attente',
      sale.paymentMethod || '-',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-ventes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Rapports</h1>
            <p className="text-muted-foreground">Analyse des ventes et de l'activité</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">3 derniers mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} DH</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ventes</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Panier moyen</p>
                  <p className="text-2xl font-bold">{stats.averageTicket.toFixed(2)} DH</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nouveaux clients</p>
                  <p className="text-2xl font-bold">{newClients.length}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{stats.pendingSales}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">Ventes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des ventes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {salesByDay.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesByDay}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} DH`, 'Montant']} />
                          <Line 
                            type="monotone" 
                            dataKey="montant" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Aucune donnée pour cette période
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par mode de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {salesByPayment.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesByPayment}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {salesByPayment.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} DH`]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Aucune donnée pour cette période
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales Table */}
            <Card>
              <CardHeader>
                <CardTitle>Dernières ventes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Facture</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Paiement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.slice(0, 10).map(sale => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(parseISO(sale.createdAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-mono">{sale.invoiceNumber}</TableCell>
                        <TableCell>{sale.clientName || 'Client comptoir'}</TableCell>
                        <TableCell className="text-right font-medium">{sale.total.toFixed(2)} DH</TableCell>
                        <TableCell>
                          <Badge variant={sale.status === 'paid' ? 'default' : 'secondary'}>
                            {sale.status === 'paid' ? 'Payée' : 'En attente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{sale.paymentMethod || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {filteredSales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Aucune vente pour cette période
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produits les plus vendus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip formatter={(value) => [`${value} DH`, 'Revenu']} />
                        <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Aucune donnée pour cette période
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détail des ventes par produit</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Quantité vendue</TableHead>
                      <TableHead className="text-right">Chiffre d'affaires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right font-medium">{product.revenue.toFixed(2)} DH</TableCell>
                      </TableRow>
                    ))}
                    {topProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          Aucune donnée pour cette période
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Tab */}
          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total produits</p>
                      <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Stock faible</p>
                      <p className="text-2xl font-bold text-amber-600">{lowStockProducts.length}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Valeur stock</p>
                      <p className="text-2xl font-bold">
                        {products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0).toFixed(2)} DH
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                  Produits en stock faible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Stock actuel</TableHead>
                      <TableHead className="text-right">Stock minimum</TableHead>
                      <TableHead>État</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono">{product.reference}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{product.minStock}</TableCell>
                        <TableCell>
                          <Badge variant={product.quantity === 0 ? 'destructive' : 'secondary'}>
                            {product.quantity === 0 ? 'Rupture' : 'Stock faible'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {lowStockProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Tous les produits ont un stock suffisant
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
