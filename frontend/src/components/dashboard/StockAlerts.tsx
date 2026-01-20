import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface StockAlert {
  product: string;
  category: string;
  current: number;
  minimum: number;
}

interface StockAlertsProps {
  alerts: StockAlert[];
}

export function StockAlerts({ alerts }: StockAlertsProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <h3 className="font-semibold text-card-foreground">Alertes stock</h3>
            <p className="text-sm text-muted-foreground">{alerts.length} produits en rupture</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/stock">
            Commander
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {alerts.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Aucun produit en rupture.
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Package className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{alert.product}</p>
                  <p className="text-sm text-muted-foreground">{alert.category}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="border-destructive text-destructive">
                  {alert.current} / {alert.minimum}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
