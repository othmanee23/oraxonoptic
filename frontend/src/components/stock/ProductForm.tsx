import { useEffect } from "react";
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
import { Product, LensType, Category } from "@/types/stock";

const productSchema = z.object({
  reference: z.string().min(1, "La référence est requise"),
  name: z.string().min(1, "Le nom est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  brand: z.string().min(1, "La marque est requise"),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, "Le prix doit être positif"),
  sellingPrice: z.coerce.number().min(0, "Le prix doit être positif"),
  currentStock: z.coerce.number().min(0, "Le stock doit être positif"),
  minimumStock: z.coerce.number().min(0, "Le seuil doit être positif"),
  storeId: z.string().min(1, "Le magasin est requis"),
  lensType: z.enum(['journalieres', 'bimensuelles', 'mensuelles', 'trimestrielles', 'annuelles']).optional(),
  sphere: z.string().optional(),
  cylinder: z.string().optional(),
  axis: z.string().optional(),
  addition: z.string().optional(),
  baseCurve: z.string().optional(),
  diameter: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  stores: { id: string; name: string }[];
  categories: Category[];
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  fixedStoreId?: string;
  showStoreSelect?: boolean;
}

const lensTypes: { value: LensType; label: string }[] = [
  { value: 'journalieres', label: 'Journalières' },
  { value: 'bimensuelles', label: 'Bimensuelles' },
  { value: 'mensuelles', label: 'Mensuelles' },
  { value: 'trimestrielles', label: 'Trimestrielles' },
  { value: 'annuelles', label: 'Annuelles' },
];

export function ProductForm({
  product,
  stores,
  categories,
  onSubmit,
  onCancel,
  fixedStoreId,
  showStoreSelect = true,
}: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      reference: product?.reference || "",
      name: product?.name || "",
      category: product?.category || "montures",
      brand: product?.brand || "",
      description: product?.description || "",
      purchasePrice: product?.purchasePrice || 0,
      sellingPrice: product?.sellingPrice || 0,
      currentStock: product?.currentStock || 0,
      minimumStock: product?.minimumStock || 5,
      storeId: product?.storeId || fixedStoreId || stores[0]?.id || "",
      lensType: product?.lensType,
      sphere: product?.sphere || "",
      cylinder: product?.cylinder || "",
      axis: product?.axis || "",
      addition: product?.addition || "",
      baseCurve: product?.baseCurve || "",
      diameter: product?.diameter || "",
    },
  });

  const selectedCategory = form.watch("category");

  useEffect(() => {
    if (!showStoreSelect && fixedStoreId) {
      form.setValue("storeId", fixedStoreId);
    }
  }, [form, fixedStoreId, showStoreSelect]);

  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence *</FormLabel>
                <FormControl>
                  <Input placeholder="REF-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du produit *</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du produit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marque *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Acuvue, Ray-Ban..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showStoreSelect && (
          <FormField
            control={form.control}
            name="storeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Magasin *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un magasin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stores.map((store) => (
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

        {selectedCategory === 'lentilles' && (
          <>
            <FormField
              control={form.control}
              name="lensType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de lentille</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lensTypes.map((type) => (
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sphere"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sphère</FormLabel>
                    <FormControl>
                      <Input placeholder="-3.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cylinder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cylindre</FormLabel>
                    <FormControl>
                      <Input placeholder="-1.25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="axis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Axe</FormLabel>
                    <FormControl>
                      <Input placeholder="180" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="baseCurve"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rayon de courbure</FormLabel>
                    <FormControl>
                      <Input placeholder="8.6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diamètre</FormLabel>
                    <FormControl>
                      <Input placeholder="14.2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Addition</FormLabel>
                    <FormControl>
                      <Input placeholder="+2.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix d'achat (MAD) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix de vente (MAD) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock actuel *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seuil d'alerte *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description du produit..." {...field} />
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
            {product ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
