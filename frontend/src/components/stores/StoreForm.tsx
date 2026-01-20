import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store } from "@/types/store";
import { z } from "zod";
import { Loader2 } from "lucide-react";

interface StoreFormProps {
  store?: Store;
  onSubmit: (store: Store) => void;
  onCancel: () => void;
}

const storeSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  address: z.string().max(200).optional(),
  city: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
  taxId: z.string().max(50).optional(),
  invoicePrefix: z.string().max(10).optional(),
});

export function StoreForm({ store, onSubmit, onCancel }: StoreFormProps) {
  const isEditing = !!store;
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: store?.name || "",
    address: store?.address || "",
    city: store?.city || "",
    phone: store?.phone || "",
    email: store?.email || "",
    taxId: store?.taxId || "",
    invoicePrefix: store?.invoicePrefix || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = storeSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storeData: Store = {
      id: store?.id || `store-${Date.now()}`,
      name: formData.name,
      address: formData.address || undefined,
      city: formData.city || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      taxId: formData.taxId || undefined,
      invoicePrefix: formData.invoicePrefix || undefined,
      isActive: store?.isActive ?? true,
      createdAt: store?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(storeData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du magasin *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="OpticAxon Casablanca"
          disabled={isLoading}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Casablanca"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoicePrefix">Préfixe factures</Label>
          <Input
            id="invoicePrefix"
            value={formData.invoicePrefix}
            onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })}
            placeholder="CAS"
            maxLength={10}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Boulevard Mohammed V"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+212 5 22 00 00 00"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="magasin@optigest.ma"
            disabled={isLoading}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxId">ICE / Identifiant fiscal</Label>
        <Input
          id="taxId"
          value={formData.taxId}
          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          placeholder="001234567000001"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Modification..." : "Création..."}
            </>
          ) : isEditing ? (
            "Modifier"
          ) : (
            "Créer le magasin"
          )}
        </Button>
      </div>
    </form>
  );
}
