import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Supplier, PurchaseOrder, PurchaseOrderItem, generateReference } from "@/types/supplier";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

interface Product {
  id: string;
  reference: string;
  name: string;
  purchasePrice: number;
}

interface PurchaseOrderFormProps {
  order?: PurchaseOrder;
  suppliers: Supplier[];
  onSubmit: (data: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function PurchaseOrderForm({ order, suppliers, onSubmit, onCancel }: PurchaseOrderFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const { selectedStoreId } = useStore();
  const [formData, setFormData] = useState({
    reference: order?.reference || generateReference('BC'),
    supplierId: order?.supplierId || "",
    supplierName: order?.supplierName || "",
    status: order?.status || 'draft' as const,
    expectedDate: order?.expectedDate || "",
    notes: order?.notes || "",
  });
  const [items, setItems] = useState<PurchaseOrderItem[]>(order?.items || []);
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    if (!selectedStoreId) {
      setProducts([]);
      return;
    }

    const loadProducts = async () => {
      try {
        const productsData = await apiFetch<{
          id: number | string;
          reference: string;
          name: string;
          purchase_price: string | number;
        }[]>("/api/stock/products");

        setProducts(
          productsData.map((product) => ({
            id: String(product.id),
            reference: product.reference,
            name: product.name,
            purchasePrice: Number(product.purchase_price),
          }))
        );
      } catch (error) {
        console.error("Products load error:", error);
        setProducts([]);
      }
    };

    loadProducts();
  }, [selectedStoreId]);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setFormData({
      ...formData,
      supplierId,
      supplierName: supplier?.name || "",
    });
  };

  const handleAddItem = () => {
    if (!newItem.productId || newItem.quantity <= 0) return;
    
    const product = products.find(p => p.id === newItem.productId);
    if (!product) return;

    const existingIndex = items.findIndex(i => i.productId === newItem.productId);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += newItem.quantity;
      setItems(updatedItems);
    } else {
      setItems([...items, {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        productReference: product.reference,
        quantity: newItem.quantity,
        unitPrice: newItem.unitPrice || product.purchasePrice || 0,
        receivedQuantity: 0,
      }]);
    }
    
    setNewItem({ productId: "", quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setNewItem({
      ...newItem,
      productId,
      unitPrice: product?.purchasePrice || 0,
    });
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    onSubmit({
      ...formData,
      items,
      totalAmount,
      type: 'product',
    });
  };

  const activeSuppliers = suppliers.filter(s => s.isActive);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reference">Référence</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="supplier">Fournisseur *</Label>
          <Select value={formData.supplierId} onValueChange={handleSupplierChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un fournisseur" />
            </SelectTrigger>
            <SelectContent>
              {activeSuppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="expectedDate">Date de livraison prévue</Label>
          <Input
            id="expectedDate"
            type="date"
            value={formData.expectedDate}
            onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="status">Statut</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: PurchaseOrder['status']) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="sent">Envoyé</SelectItem>
              <SelectItem value="confirmed">Confirmé</SelectItem>
              <SelectItem value="partial">Réception partielle</SelectItem>
              <SelectItem value="received">Reçu</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add items */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">Ajouter des produits</h4>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>Produit</Label>
            <Select value={newItem.productId} onValueChange={handleProductSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.reference} - {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-24">
            <Label>Quantité</Label>
            <Input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="w-32">
            <Label>Prix unitaire</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <Button type="button" onClick={handleAddItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">Prix unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.productReference}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unitPrice.toFixed(2)} DH</TableCell>
                  <TableCell className="text-right font-medium">
                    {(item.quantity * item.unitPrice).toFixed(2)} DH
                  </TableCell>
                  <TableCell>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{totalAmount.toFixed(2)} DH</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={items.length === 0 || !formData.supplierId}>
          {order ? "Modifier" : "Créer le bon de commande"}
        </Button>
      </div>
    </form>
  );
}
