import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Category } from "@/types/stock";

const categorySchema = z.object({
  name: z.string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-z0-9_]+$/, "Utiliser uniquement des lettres minuscules, chiffres et underscore"),
  label: z.string()
    .min(1, "Le libellé est requis")
    .max(50, "Le libellé ne peut pas dépasser 50 caractères"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  existingCategories: Category[];
  editingCategory?: Category | null;
  onSubmit: (data: Omit<Category, 'id' | 'isDefault'>) => void;
  onCancel: () => void;
}

export function CategoryForm({ existingCategories, editingCategory, onSubmit, onCancel }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: editingCategory?.name || "",
      label: editingCategory?.label || "",
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    // Check if name already exists (exclude current category if editing)
    const isDuplicate = existingCategories.some(cat => 
      cat.name === data.name && cat.id !== editingCategory?.id
    );
    if (isDuplicate) {
      form.setError("name", { message: "Cette catégorie existe déjà" });
      return;
    }
    onSubmit({ name: data.name, label: data.label });
  };

  // Auto-generate name from label (only when creating new)
  const handleLabelChange = (label: string) => {
    if (!editingCategory) {
      const name = label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      form.setValue("name", name);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Libellé de la catégorie *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Produits d'entretien" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleLabelChange(e.target.value);
                  }}
                />
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
              <FormLabel>Identifiant technique</FormLabel>
              <FormControl>
                <Input 
                  placeholder="produits_entretien" 
                  {...field}
                  className="font-mono text-sm"
                  disabled={editingCategory?.isDefault}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {editingCategory?.isDefault 
                  ? "L'identifiant des catégories par défaut ne peut pas être modifié"
                  : "Généré automatiquement, modifiable si nécessaire"
                }
              </p>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {editingCategory ? "Modifier" : "Créer la catégorie"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
