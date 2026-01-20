import { Trash2, Minus, Plus, Percent, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/sales";

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateDiscount: (itemId: string, discount: number) => void;
  onUpdatePrice: (itemId: string, price: number) => void;
  onRemoveItem: (itemId: string) => void;
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export function ShoppingCart({
  items,
  onUpdateQuantity,
  onUpdateDiscount,
  onUpdatePrice,
  onRemoveItem,
  subtotal,
  discountTotal,
  taxRate,
  taxAmount,
  total,
}: ShoppingCartProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Cart items */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">Panier vide</p>
              <p className="text-xs mt-1">Ajoutez des produits pour commencer</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-5 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">{item.productReference}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[auto_auto_auto_1fr] lg:items-center">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-9 w-20 text-center text-base px-1"
                        min={1}
                      />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={item.discount}
                      onChange={(e) => onUpdateDiscount(item.id, Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="h-9 w-24 text-center text-base px-1"
                      min={0}
                      max={100}
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => onUpdatePrice(item.id, Math.max(0, parseFloat(e.target.value) || 0))}
                      className="h-9 w-32 text-center text-base px-1"
                      min={0}
                      step={0.01}
                    />
                  </div>

                  {/* Total */}
                  <div className="text-right min-w-[140px] lg:ml-auto">
                    <p className="font-semibold text-lg">
                      {item.total.toLocaleString('fr-MA')} DH
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Totals */}
      {items.length > 0 && (
        <div className="p-4 border-t bg-muted/30">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{subtotal.toLocaleString('fr-MA')} DH</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Remises</span>
                <span>-{discountTotal.toLocaleString('fr-MA')} DH</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA ({taxRate}%)</span>
                <span>{taxAmount.toLocaleString('fr-MA')} DH</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{total.toLocaleString('fr-MA')} DH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
