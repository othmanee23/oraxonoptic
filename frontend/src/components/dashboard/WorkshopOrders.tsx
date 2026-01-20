import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface WorkshopOrder {
  id: string;
  client: string;
  type: string;
  statusLabel: string;
  statusClass: string;
  progress: number;
  dueDate: string;
}

interface WorkshopOrdersProps {
  orders: WorkshopOrder[];
}

export function WorkshopOrders({ orders }: WorkshopOrdersProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="font-semibold text-card-foreground">Atelier</h3>
          <p className="text-sm text-muted-foreground">Commandes en cours</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/atelier">
            Gérer l'atelier
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {orders.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Aucune commande atelier.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground">{order.id}</span>
                  <Badge className={order.statusClass}>
                    {order.statusLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {order.dueDate}
                </div>
              </div>
              <p className="font-medium text-card-foreground">{order.client}</p>
              <p className="text-sm text-muted-foreground mb-3">{order.type}</p>
              <div className="flex items-center gap-3">
                <Progress value={order.progress} className="h-2 flex-1" />
                <span className="text-xs font-medium text-muted-foreground w-10">{order.progress}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
