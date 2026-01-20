import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Client } from "@/types/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";

interface ClientFormProps {
  client?: Client;
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

const clientSchema = z.object({
  firstName: z.string().min(2, "Prénom trop court").max(50),
  lastName: z.string().min(2, "Nom trop court").max(50),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
  phone: z.string().min(10, "Numéro de téléphone invalide").max(20),
  address: z.string().max(200).optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const isEditing = !!client;
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: client?.firstName || "",
    lastName: client?.lastName || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    dateOfBirth: client?.dateOfBirth || "",
    notes: client?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = clientSchema.safeParse(formData);
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

    const clientData: Client = {
      id: client?.id || `client-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone,
      address: formData.address || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      notes: formData.notes || undefined,
      createdAt: client?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(clientData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Ahmed"
            disabled={isLoading}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Bennani"
            disabled={isLoading}
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+212 6 00 00 00 00"
          disabled={isLoading}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="client@email.com"
          disabled={isLoading}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date de naissance</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            disabled={isLoading}
          />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Rue Mohammed V"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes internes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Remarques particulières sur ce client..."
          rows={3}
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
            "Créer le client"
          )}
        </Button>
      </div>
    </form>
  );
}
