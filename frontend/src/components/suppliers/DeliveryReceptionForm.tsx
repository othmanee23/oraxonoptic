import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseOrder, DeliveryNote, DeliveryNoteItem, generateReference } from "@/types/supplier";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface DeliveryReceptionFormProps {
  order: PurchaseOrder;
  existingDeliveries: DeliveryNote[];
  onSubmit: (data: Omit<DeliveryNote, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function DeliveryReceptionForm({ order, existingDeliveries, onSubmit, onCancel }: DeliveryReceptionFormProps) {
  // Check if this is a lens order (no items, just the lens itself)
  const isLensOrder = order.type === 'lens';
  
  // Calculate already received quantities
  const getReceivedQuantity = (productId: string) => {
    return existingDeliveries
      .filter(d => d.purchaseOrderId === order.id)
      .reduce((sum, d) => {
        const item = d.items.find(i => i.productId === productId);
        return sum + (item?.receivedQuantity || 0);
      }, 0);
  };

  // Check if lens order already received
  const isLensAlreadyReceived = () => {
    return existingDeliveries.some(d => d.purchaseOrderId === order.id);
  };

  // For lens orders, create a virtual item representing the lens pair
  const initialItems: DeliveryNoteItem[] = isLensOrder
    ? [{
        id: crypto.randomUUID(),
        productId: order.id, // Use order id as product id for lens
        productName: `Verres ${order.lensType || ''} - ${order.clientName || 'Client'}`,
        productReference: order.reference,
        orderedQuantity: 1,
        receivedQuantity: 0,
      }]
    : order.items.map(item => ({
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.productName,
        productReference: item.productReference,
        orderedQuantity: item.quantity,
        receivedQuantity: 0,
      }));

  const [items, setItems] = useState<DeliveryNoteItem[]>(initialItems);
  const [notes, setNotes] = useState("");

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const alreadyReceived = isLensOrder ? (isLensAlreadyReceived() ? 1 : 0) : getReceivedQuantity(item.productId);
        const remaining = item.orderedQuantity - alreadyReceived;
        const validQuantity = Math.min(Math.max(0, quantity), remaining);
        return { ...item, receivedQuantity: validQuantity };
      }
      return item;
    }));
  };

  const handleReceiveAll = () => {
    setItems(items.map(item => {
      const alreadyReceived = isLensOrder ? (isLensAlreadyReceived() ? 1 : 0) : getReceivedQuantity(item.productId);
      const remaining = item.orderedQuantity - alreadyReceived;
      return { ...item, receivedQuantity: remaining };
    }));
  };

  const hasItemsToReceive = items.some(item => item.receivedQuantity > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasItemsToReceive) return;

    const receivedItems = items.filter(item => item.receivedQuantity > 0);

    onSubmit({
      reference: generateReference('BL'),
      purchaseOrderId: order.id,
      purchaseOrderRef: order.reference,
      supplierId: order.supplierId,
      supplierName: order.supplierName,
      items: receivedItems,
      status: 'validated',
      notes,
      validatedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Bon de commande</p>
            <p className="font-medium">{order.reference}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fournisseur</p>
            <p className="font-medium">{order.supplierName}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleReceiveAll}>
            Tout recevoir
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead className="text-center">Commandé</TableHead>
            <TableHead className="text-center">Déjà reçu</TableHead>
            <TableHead className="text-center">Restant</TableHead>
            <TableHead className="text-center">Quantité reçue</TableHead>
            <TableHead className="text-center">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const alreadyReceived = isLensOrder ? (isLensAlreadyReceived() ? 1 : 0) : getReceivedQuantity(item.productId);
            const remaining = item.orderedQuantity - alreadyReceived;
            const isComplete = remaining === 0;
            
            return (
              <TableRow key={item.id} className={isComplete ? "opacity-50" : ""}>
                <TableCell className="font-mono text-sm">{item.productReference}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-center">{item.orderedQuantity}</TableCell>
                <TableCell className="text-center">{alreadyReceived}</TableCell>
                <TableCell className="text-center font-medium">{remaining}</TableCell>
                <TableCell className="text-center">
                  {!isComplete ? (
                    <Input
                      type="number"
                      min="0"
                      max={remaining}
                      value={item.receivedQuantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-20 mx-auto text-center"
                    />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : remaining < item.orderedQuantity ? (
                    <AlertCircle className="h-5 w-5 text-amber-500 mx-auto" />
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div>
        <Label htmlFor="notes">Notes de réception</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Observations, état des produits, etc."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!hasItemsToReceive}>
          Valider la réception
        </Button>
      </div>
    </form>
  );
}
