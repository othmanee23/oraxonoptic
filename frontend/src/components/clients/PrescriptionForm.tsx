import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Prescription } from "@/types/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";

interface PrescriptionFormProps {
  prescription?: Prescription;
  clientId: string;
  onSubmit: (prescription: Prescription) => void;
  onCancel: () => void;
}

const prescriptionSchema = z.object({
  date: z.string().min(1, "Date requise"),
  prescriber: z.string().max(100).optional(),
  expiryDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export function PrescriptionForm({ prescription, clientId, onSubmit, onCancel }: PrescriptionFormProps) {
  const isEditing = !!prescription;
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    date: prescription?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    prescriber: prescription?.prescriber || "",
    expiryDate: prescription?.expiryDate?.split('T')[0] || "",
    // OD (Right Eye)
    odSphere: prescription?.odSphere?.toString() || "",
    odCylinder: prescription?.odCylinder?.toString() || "",
    odAxis: prescription?.odAxis?.toString() || "",
    odAddition: prescription?.odAddition?.toString() || "",
    odPd: prescription?.odPd?.toString() || "",
    // OG (Left Eye)
    ogSphere: prescription?.ogSphere?.toString() || "",
    ogCylinder: prescription?.ogCylinder?.toString() || "",
    ogAxis: prescription?.ogAxis?.toString() || "",
    ogAddition: prescription?.ogAddition?.toString() || "",
    ogPd: prescription?.ogPd?.toString() || "",
    notes: prescription?.notes || "",
  });

  const parseNumber = (value: string): number | undefined => {
    if (!value || value.trim() === "") return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = prescriptionSchema.safeParse(formData);
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

    const prescriptionData: Prescription = {
      id: prescription?.id || `prescription-${Date.now()}`,
      clientId,
      date: formData.date,
      prescriber: formData.prescriber || undefined,
      expiryDate: formData.expiryDate || undefined,
      odSphere: parseNumber(formData.odSphere),
      odCylinder: parseNumber(formData.odCylinder),
      odAxis: parseNumber(formData.odAxis),
      odAddition: parseNumber(formData.odAddition),
      odPd: parseNumber(formData.odPd),
      ogSphere: parseNumber(formData.ogSphere),
      ogCylinder: parseNumber(formData.ogCylinder),
      ogAxis: parseNumber(formData.ogAxis),
      ogAddition: parseNumber(formData.ogAddition),
      ogPd: parseNumber(formData.ogPd),
      notes: formData.notes || undefined,
    };

    onSubmit(prescriptionData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date de prescription *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={isLoading}
            className={errors.date ? "border-destructive" : ""}
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="prescriber">Prescripteur</Label>
          <Input
            id="prescriber"
            value={formData.prescriber}
            onChange={(e) => setFormData({ ...formData, prescriber: e.target.value })}
            placeholder="Dr. Nom"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Date d'expiration</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Eye Measurements */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Mesures optiques</h4>
        
        {/* Header Row */}
        <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground">
          <div></div>
          <div className="text-center">Sphère</div>
          <div className="text-center">Cylindre</div>
          <div className="text-center">Axe</div>
          <div className="text-center">Addition</div>
          <div className="text-center">EP (PD)</div>
        </div>

        {/* OD Row */}
        <div className="grid grid-cols-6 gap-2 items-center">
          <div className="font-medium text-sm">OD (Droit)</div>
          <Input
            type="number"
            step="0.25"
            value={formData.odSphere}
            onChange={(e) => setFormData({ ...formData, odSphere: e.target.value })}
            placeholder="0.00"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="0.25"
            value={formData.odCylinder}
            onChange={(e) => setFormData({ ...formData, odCylinder: e.target.value })}
            placeholder="0.00"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="1"
            min="0"
            max="180"
            value={formData.odAxis}
            onChange={(e) => setFormData({ ...formData, odAxis: e.target.value })}
            placeholder="0°"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="0.25"
            value={formData.odAddition}
            onChange={(e) => setFormData({ ...formData, odAddition: e.target.value })}
            placeholder="0.00"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="0.5"
            value={formData.odPd}
            onChange={(e) => setFormData({ ...formData, odPd: e.target.value })}
            placeholder="32"
            className="text-center"
            disabled={isLoading}
          />
        </div>

        {/* OG Row */}
        <div className="grid grid-cols-6 gap-2 items-center">
          <div className="font-medium text-sm">OG (Gauche)</div>
          <Input
            type="number"
            step="0.25"
            value={formData.ogSphere}
            onChange={(e) => setFormData({ ...formData, ogSphere: e.target.value })}
            placeholder="0.00"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="0.25"
            value={formData.ogCylinder}
            onChange={(e) => setFormData({ ...formData, ogCylinder: e.target.value })}
            placeholder="0.00"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="1"
            min="0"
            max="180"
            value={formData.ogAxis}
            onChange={(e) => setFormData({ ...formData, ogAxis: e.target.value })}
            placeholder="0°"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="0.25"
            value={formData.ogAddition}
            onChange={(e) => setFormData({ ...formData, ogAddition: e.target.value })}
            placeholder="0.00"
            className="text-center"
            disabled={isLoading}
          />
          <Input
            type="number"
            step="0.5"
            value={formData.ogPd}
            onChange={(e) => setFormData({ ...formData, ogPd: e.target.value })}
            placeholder="32"
            className="text-center"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Remarques</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notes pour l'atelier, adaptations spécifiques..."
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
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
            "Ajouter la prescription"
          )}
        </Button>
      </div>
    </form>
  );
}
