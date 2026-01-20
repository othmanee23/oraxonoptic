import { 
  UserPlus, 
  FileText, 
  ShoppingCart, 
  Package, 
  FileSearch,
  Glasses
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "info";
  href: string;
}

const actions: QuickAction[] = [
  {
    title: "Nouveau client",
    description: "Créer une fiche client",
    icon: UserPlus,
    color: "primary",
    href: "/clients",
  },
  {
    title: "Nouvelle vente",
    description: "Enregistrer une vente",
    icon: ShoppingCart,
    color: "success",
    href: "/ventes",
  },
  {
    title: "Prescription",
    description: "Ajouter une ordonnance",
    icon: Glasses,
    color: "info",
    href: "/prescriptions",
  },
  {
    title: "Facture",
    description: "Créer une facture",
    icon: FileText,
    color: "warning",
    href: "/factures",
  },
  {
    title: "Stock",
    description: "Gérer l'inventaire",
    icon: Package,
    color: "primary",
    href: "/stock",
  },
  {
    title: "Rechercher",
    description: "Trouver un document",
    icon: FileSearch,
    color: "info",
    href: "/clients",
  },
];

const colorClasses = {
  primary: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
  success: "bg-success/10 text-success hover:bg-success/20 border-success/20",
  warning: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
  info: "bg-info/10 text-info hover:bg-info/20 border-info/20",
};

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-semibold text-card-foreground mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200",
              colorClasses[action.color]
            )}
          >
            <action.icon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{action.title}</p>
              <p className="text-xs opacity-70">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
