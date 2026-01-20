import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Package,
  Truck,
  Wrench,
  BarChart3,
  Settings,
  Store,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Scan,
  LogOut,
  CreditCard,
  Eye,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { usePermission } from "@/hooks/usePermission";
import { Module } from "@/types/auth";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  module?: Module;
}

const mainNavItems: NavItem[] = [
  { title: "Tableau de bord", href: "/app", icon: LayoutDashboard },
  { title: "Clients", href: "/clients", icon: Users, module: "clients" },
  { title: "Prescriptions", href: "/prescriptions", icon: Eye, module: "prescriptions" },
  { title: "Ventes", href: "/ventes", icon: ShoppingCart, module: "ventes" },
  { title: "Factures", href: "/factures", icon: FileText, module: "factures" },
];

const stockNavItems: NavItem[] = [
  { title: "Stock", href: "/stock", icon: Package, module: "stock" },
  { title: "Fournisseurs", href: "/fournisseurs", icon: Truck, module: "fournisseurs" },
  { title: "Atelier", href: "/atelier", icon: Wrench, module: "atelier" },
];

// Admin items visible to optician owners only (NOT super_admin)
const adminNavItems: NavItem[] = [
  { title: "Rapports", href: "/rapports", icon: BarChart3, module: "rapports" },
  { title: "Utilisateurs", href: "/utilisateurs", icon: UserCog, module: "utilisateurs" },
  { title: "Magasins", href: "/magasins", icon: Store, module: "parametres" },
  { title: "Paramètres", href: "/parametres", icon: Settings, module: "parametres" },
];

// Items visible only to optician owner (admin role) - not their employees
const opticienOnlyItems: NavItem[] = [
  { title: "Abonnement", href: "/abonnement", icon: CreditCard, module: "abonnement" },
];

// Super Admin only items
const superAdminNavItems: NavItem[] = [
  { title: "Administration SaaS", href: "/admin-saas", icon: UserCog, module: "abonnement" },
  { title: "Abonnement", href: "/abonnement", icon: CreditCard, module: "abonnement" },
  { title: "Messages Contact", href: "/messages-contact", icon: MessageSquare },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, subscriptionActive, subscriptionLoading } = useAuth();
  const { storeCount } = useStore();
  const { canView } = usePermission();
  const isAdminLocked = user?.role === 'admin' && (!subscriptionActive || subscriptionLoading);
  const isOverStoreLimit = user?.role === 'admin'
    && typeof user.maxStores === 'number'
    && storeCount > user.maxStores;

  const storeLimitAllowed = new Set(["/magasins", "/parametres", "/abonnement"]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const NavSection = ({ items, title }: { items: NavItem[]; title?: string }) => {
    // Filter items based on permissions
    const visibleItems = items.filter(item => {
      if (isOverStoreLimit && !storeLimitAllowed.has(item.href)) {
        return false;
      }
      return !item.module || canView(item.module);
    });

    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-1">
        {title && !collapsed && (
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            {title}
          </p>
        )}
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <NavLink 
        to="/" 
        className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 hover:bg-sidebar-accent/50 transition-colors"
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Scan className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">OpticAxon</h1>
              <p className="text-xs text-sidebar-foreground/60">optic</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Scan className="h-5 w-5 text-white" />
          </div>
        )}
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {user?.role === 'super_admin' ? (
          <>
            <NavSection items={superAdminNavItems} title="Super Admin" />
          </>
        ) : isAdminLocked ? (
          <>
            <NavSection items={opticienOnlyItems} />
          </>
        ) : (
          <>
            <NavSection items={mainNavItems} />
            <Separator className="bg-sidebar-border" />
            <NavSection items={stockNavItems} title="Gestion Stock" />
            <Separator className="bg-sidebar-border" />
            <NavSection items={adminNavItems} title="Administration" />
            {/* Abonnement only visible to optician owner (admin role without ownerId) */}
            {user?.role === 'admin' && !user?.ownerId && (
              <NavSection items={opticienOnlyItems} />
            )}
          </>
        )}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && user && (
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
            <NavLink 
              to="/profil"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary/20 text-sm font-semibold text-sidebar-primary hover:bg-sidebar-primary/30 transition-colors"
              title="Mon profil"
            >
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </NavLink>
            <NavLink to="/profil" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{user.role}</p>
            </NavLink>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        {collapsed && user && (
          <NavLink 
            to="/profil"
            className="flex h-9 w-9 mx-auto items-center justify-center rounded-full bg-sidebar-primary/20 text-sm font-semibold text-sidebar-primary hover:bg-sidebar-primary/30 transition-colors"
            title="Mon profil"
          >
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </NavLink>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
