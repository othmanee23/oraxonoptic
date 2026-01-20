import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSalesTable, Sale } from "@/components/dashboard/RecentSalesTable";
import { WorkshopOrders, WorkshopOrder } from "@/components/dashboard/WorkshopOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StockAlerts, StockAlert } from "@/components/dashboard/StockAlerts";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Wallet,
  Calendar
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";

type ApiInvoiceItem = {
  product_name: string;
};

type ApiInvoice = {
  id: number | string;
  invoice_number: string | null;
  client_id: number | string | null;
  total: number | string;
  amount_due: number | string;
  status: "paid" | "pending" | "partial" | "cancelled";
  created_at: string;
  items?: ApiInvoiceItem[];
};

type ApiClient = {
  id: number | string;
  first_name: string;
  last_name: string;
  created_at: string;
};

type ApiWorkshopOrder = {
  id: number | string;
  order_number: string;
  client_name?: string | null;
  lens_type?: string | null;
  lens_supplier?: string | null;
  status: string;
  expected_date?: string | null;
  created_at: string;
};

type ApiProduct = {
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
};

const formatCurrency = (value: number) => `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value)} DH`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);

const formatRelativeDate = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  if (isSameDay(date, today)) return "Aujourd'hui";
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Hier";
  return formatShortDate(date);
};

const statusMeta: Record<string, { label: string; className: string; progress: number }> = {
  en_attente_verres: { label: "En attente verres", className: "bg-muted text-muted-foreground", progress: 15 },
  verres_recus: { label: "Verres recus", className: "bg-info/10 text-info", progress: 45 },
  montage_en_cours: { label: "Montage en cours", className: "bg-info/10 text-info", progress: 70 },
  pret: { label: "Pret", className: "bg-success/10 text-success", progress: 90 },
  livre: { label: "Livre", className: "bg-primary/10 text-primary", progress: 100 },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedStoreId, isLoading: storeLoading } = useStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    dailySales: 0,
    newClients: 0,
    pendingPayments: 0,
  });

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date()),
    []
  );

  useEffect(() => {
    if (!selectedStoreId) {
      setSales([]);
      setWorkshopOrders([]);
      setStockAlerts([]);
      setStats({
        revenue: 0,
        dailySales: 0,
        newClients: 0,
        pendingPayments: 0,
      });
      return;
    }

    const loadDashboard = async () => {
      try {
        const [invoices, clients, orders, products] = await Promise.all([
          apiFetch<ApiInvoice[]>("/api/invoices"),
          apiFetch<ApiClient[]>("/api/clients"),
          apiFetch<ApiWorkshopOrder[]>("/api/workshop-orders"),
          apiFetch<ApiProduct[]>("/api/stock/products"),
        ]);

        const clientsById = new Map<string, string>();
        clients.forEach((client) => {
          clientsById.set(String(client.id), `${client.first_name} ${client.last_name}`.trim());
        });

        const salesRows = invoices.slice(0, 5).map((invoice) => {
          const clientName = invoice.client_id ? (clientsById.get(String(invoice.client_id)) || "Client") : "Client";
          const items = invoice.items || [];
          const mainProduct = items[0]?.product_name || "Vente";
          const productLabel = items.length > 1 ? `${mainProduct} + ${items.length - 1} article(s)` : mainProduct;
          return {
            id: invoice.invoice_number || `FAC-${invoice.id}`,
            client: clientName,
            product: productLabel,
            amount: formatCurrency(Number(invoice.total || 0)),
            status: invoice.status === "cancelled" ? "pending" : invoice.status,
            date: formatRelativeDate(invoice.created_at),
          } satisfies Sale;
        });

        const ordersRows = orders.slice(0, 5).map((order) => {
          const meta = statusMeta[order.status] || { label: "En cours", className: "bg-info/10 text-info", progress: 50 };
          return {
            id: order.order_number || `AT-${order.id}`,
            client: order.client_name || "Client",
            type: order.lens_type ? `Verres ${order.lens_type}` : (order.lens_supplier ? `Commande ${order.lens_supplier}` : "Commande atelier"),
            statusLabel: meta.label,
            statusClass: meta.className,
            progress: meta.progress,
            dueDate: order.expected_date ? formatShortDate(new Date(order.expected_date)) : formatRelativeDate(order.created_at),
          } satisfies WorkshopOrder;
        });

        const alerts = products
          .filter((product) => product.current_stock <= product.minimum_stock)
          .slice(0, 5)
          .map((product) => ({
            product: product.name,
            category: product.category,
            current: product.current_stock,
            minimum: product.minimum_stock,
          }));

        const now = new Date();
        const monthRevenue = invoices
          .filter((invoice) => invoice.status !== "cancelled")
          .filter((invoice) => {
            const created = new Date(invoice.created_at);
            return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
          })
          .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

        const todaySales = invoices
          .filter((invoice) => {
            const created = new Date(invoice.created_at);
            return isSameDay(created, now);
          })
          .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

        const pendingPayments = invoices
          .filter((invoice) => invoice.status === "pending" || invoice.status === "partial")
          .reduce((sum, invoice) => sum + Number(invoice.amount_due || 0), 0);

        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const newClients = clients.filter((client) => new Date(client.created_at) >= weekAgo).length;

        setSales(salesRows);
        setWorkshopOrders(ordersRows);
        setStockAlerts(alerts);
        setStats({
          revenue: monthRevenue,
          dailySales: todaySales,
          newClients,
          pendingPayments,
        });
      } catch {
        setSales([]);
        setWorkshopOrders([]);
        setStockAlerts([]);
        setStats({
          revenue: 0,
          dailySales: 0,
          newClients: 0,
          pendingPayments: 0,
        });
      }
    };

    loadDashboard();
  }, [selectedStoreId]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue, {user?.firstName || "Utilisateur"}. Voici l'aperçu de votre magasin.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{monthLabel}</span>
          </div>
        </div>

        {!selectedStoreId && !storeLoading ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Aucun magasin selectionne. Veuillez choisir un magasin pour afficher les donnees.
          </div>
        ) : (
          <>
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Chiffre d'affaires"
            value={formatCurrency(stats.revenue)}
            change={{ value: "Ce mois", trend: "neutral" }}
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Ventes du jour"
            value={formatCurrency(stats.dailySales)}
            change={{ value: "Aujourd'hui", trend: "neutral" }}
            icon={ShoppingCart}
            iconColor="primary"
          />
          <StatCard
            title="Nouveaux clients"
            value={stats.newClients.toString()}
            change={{ value: "7 derniers jours", trend: "neutral" }}
            icon={Users}
            iconColor="info"
          />
          <StatCard
            title="Paiements en attente"
            value={formatCurrency(stats.pendingPayments)}
            change={{ value: "A encaisser", trend: "neutral" }}
            icon={Wallet}
            iconColor="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Sales - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentSalesTable sales={sales} />
          </div>

          {/* Sidebar - Quick Actions & Alerts */}
          <div className="space-y-6">
            <QuickActions />
            <StockAlerts alerts={stockAlerts} />
          </div>
        </div>

        {/* Workshop Orders */}
        <div className="grid gap-6 lg:grid-cols-2">
          <WorkshopOrders orders={workshopOrders} />
          
          {/* Placeholder for charts or additional content */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-4">Performance mensuelle</h3>
            <div className="flex h-48 items-center justify-center rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Graphique des ventes à venir</p>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
