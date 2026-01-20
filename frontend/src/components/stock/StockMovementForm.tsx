import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, MovementType } from "@/types/stock";

const movementSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  type: z.enum(['entree', 'sortie', 'transfert', 'ajustement']),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  reason: z.string().min(1, "Le motif est requis"),
  toStoreId: z.string().optional(),
  reference: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface StockMovementFormProps {
  products: Product[];
  stores: { id: string; name: string }[];
  currentStoreId?: string;
  onSubmit: (data: MovementFormData) => void;
  onCancel: () => void;
}

const movementTypes: { value: MovementType; label: string }[] = [
  { value: 'entree', label: 'Entrée (Réception)' },
  { value: 'sortie', label: 'Sortie (Vente/Perte)' },
  { value: 'transfert', label: 'Transfert entre magasins' },
  { value: 'ajustement', label: 'Ajustement d\'inventaire' },
];

export function StockMovementForm({ products, stores, currentStoreId, onSubmit, onCancel }: StockMovementFormProps) {
  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: "",
      type: "entree",
      quantity: 1,
      reason: "",
      toStoreId: "",
      reference: "",
    },
  });

  const selectedType = form.watch("type");
  const selectedProductId = form.watch("productId");
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (data: MovementFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produit *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.reference} - {product.name} (Stock: {product.currentStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProduct && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p><span className="font-medium">Stock actuel:</span> {selectedProduct.currentStock}</p>
            <p><span className="font-medium">Seuil d'alerte:</span> {selectedProduct.minimumStock}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de mouvement *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === 'transfert' && (
          <FormField
            control={form.control}
            name="toStoreId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Magasin de destination *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le magasin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stores
                      .filter(s => s.id !== currentStoreId)
                      .map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité *</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>N° de référence (BL, Facture...)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: BL-2024-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif *</FormLabel>
              <FormControl>
                <Textarea placeholder="Décrivez la raison du mouvement..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            Enregistrer le mouvement
          </Button>
        </div>
      </form>
    </Form>
  );
}
