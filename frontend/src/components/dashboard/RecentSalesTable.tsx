import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Sale {
  id: string;
  client: string;
  product: string;
  amount: string;
  status: "paid" | "pending" | "partial";
  date: string;
}

const statusConfig = {
  paid: { label: "Payée", variant: "default" as const, className: "bg-success text-success-foreground" },
  pending: { label: "En attente", variant: "secondary" as const, className: "bg-warning/10 text-warning" },
  partial: { label: "Partielle", variant: "outline" as const, className: "border-info text-info" },
};

interface RecentSalesTableProps {
  sales: Sale[];
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="font-semibold text-card-foreground">Ventes récentes</h3>
          <p className="text-sm text-muted-foreground">Dernières transactions du magasin</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/factures">Voir tout</Link>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {sales.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Aucune vente recente.
          </div>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {sale.client.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{sale.client}</p>
                  <p className="text-sm text-muted-foreground">{sale.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-card-foreground">{sale.amount}</p>
                  <p className="text-xs text-muted-foreground">{sale.date}</p>
                </div>
                <Badge className={statusConfig[sale.status].className}>
                  {statusConfig[sale.status].label}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
