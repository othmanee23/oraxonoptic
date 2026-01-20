import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, Plus } from "lucide-react";
import { Prescription } from "@/types/client";
import { useToast } from "@/hooks/use-toast";
import {
  LensType,
  LensTreatment,
  LensParameters,
  lensTypeLabels,
  treatmentLabels,
} from "@/types/workshop";
import { Supplier } from "@/types/supplier";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

interface CustomLensFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
  prescriptions: Prescription[];
  onSubmit: (data: CustomLensData) => void;
}

export interface CustomLensData {
  lensType: LensType;
  treatments: LensTreatment[];
  parameters: LensParameters;
  supplierName: string;
  supplierId?: string;
  supplierOrderRef?: string;
  purchasePrice: number;
  sellingPrice: number;
  notes?: string;
  prescriptionId?: string;
}

const allTreatments: LensTreatment[] = ['antireflet', 'photochromique', 'bluelight', 'polarise', 'teinte'];

export function CustomLensForm({
  isOpen,
  onClose,
  clientId,
  clientName,
  prescriptions,
  onSubmit,
}: CustomLensFormProps) {
  const { toast } = useToast();
  const { selectedStoreId } = useStore();
  const [selectedPrescription, setSelectedPrescription] = useState<string>("");
  const [lensType, setLensType] = useState<LensType>("unifocal");
  const [treatments, setTreatments] = useState<LensTreatment[]>([]);
  
  // Supplier state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  
  const [supplierOrderRef, setSupplierOrderRef] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [notes, setNotes] = useState("");
  
  // Lens parameters
  const [odSphere, setOdSphere] = useState<string>("");
  const [odCylinder, setOdCylinder] = useState<string>("");
  const [odAxis, setOdAxis] = useState<string>("");
  const [odAddition, setOdAddition] = useState<string>("");
  const [odPd, setOdPd] = useState<string>("");
  const [ogSphere, setOgSphere] = useState<string>("");
  const [ogCylinder, setOgCylinder] = useState<string>("");
  const [ogAxis, setOgAxis] = useState<string>("");
  const [ogAddition, setOgAddition] = useState<string>("");
  const [ogPd, setOgPd] = useState<string>("");

  // Load suppliers
  useEffect(() => {
    if (!isOpen || !selectedStoreId) {
      setSuppliers([]);
      return;
    }

    const loadSuppliers = async () => {
      try {
        const data = await apiFetch<{
          id: number | string;
          name: string;
          is_active: boolean;
        }[]>("/api/suppliers");

        setSuppliers(
          data.map((supplier) => ({
            id: String(supplier.id),
            name: supplier.name,
            isActive: supplier.is_active,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
      } catch (error) {
        console.error("Suppliers load error:", error);
        setSuppliers([]);
      }
    };

    loadSuppliers();
  }, [isOpen, selectedStoreId]);

  // Load prescription data when selected
  useEffect(() => {
    if (selectedPrescription && selectedPrescription !== "manual") {
      const prescription = prescriptions.find(p => p.id === selectedPrescription);
      if (prescription) {
        setOdSphere(prescription.odSphere?.toString() || "");
        setOdCylinder(prescription.odCylinder?.toString() || "");
        setOdAxis(prescription.odAxis?.toString() || "");
        setOdAddition(prescription.odAddition?.toString() || "");
        setOdPd(prescription.odPd?.toString() || "");
        setOgSphere(prescription.ogSphere?.toString() || "");
        setOgCylinder(prescription.ogCylinder?.toString() || "");
        setOgAxis(prescription.ogAxis?.toString() || "");
        setOgAddition(prescription.ogAddition?.toString() || "");
        setOgPd(prescription.ogPd?.toString() || "");
      }
    }
  }, [selectedPrescription, prescriptions]);

  const handleTreatmentToggle = (treatment: LensTreatment) => {
    setTreatments(prev => 
      prev.includes(treatment)
        ? prev.filter(t => t !== treatment)
        : [...prev, treatment]
    );
  };

  const handleSupplierChange = (value: string) => {
    if (value === "new") {
      setIsNewSupplier(true);
      setSelectedSupplierId("");
    } else {
      setIsNewSupplier(false);
      setSelectedSupplierId(value);
      setNewSupplierName("");
    }
  };

  const getSupplierName = (): string => {
    if (isNewSupplier) {
      return newSupplierName;
    }
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    return supplier?.name || "";
  };

  const handleSubmit = async () => {
    const supplierName = getSupplierName();
    if (!supplierName || purchasePrice <= 0 || sellingPrice <= 0) {
      return;
    }

    let supplierId = selectedSupplierId;

    // Create new supplier if needed
    if (isNewSupplier && newSupplierName.trim()) {
      // Check if supplier already exists
      const existingSupplier = suppliers.find(
        s => s.name.toLowerCase() === newSupplierName.trim().toLowerCase()
      );
      
      if (existingSupplier) {
        supplierId = existingSupplier.id;
      } else {
        // Create new supplier
        try {
          const created = await apiFetch<{
            id: number | string;
            name: string;
            is_active: boolean;
          }>("/api/suppliers", {
            method: "POST",
            body: JSON.stringify({
              name: newSupplierName.trim(),
              is_active: true,
            }),
          });
          const newSupplier: Supplier = {
            id: String(created.id),
            name: created.name,
            isActive: created.is_active,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setSuppliers((prev) => [...prev, newSupplier]);
          supplierId = newSupplier.id;
        } catch (error) {
          console.error("Create supplier error:", error);
          toast({ title: "Impossible de créer le fournisseur" });
          return;
        }
      }
    }

    const parameters: LensParameters = {
      odSphere: odSphere ? parseFloat(odSphere) : undefined,
      odCylinder: odCylinder ? parseFloat(odCylinder) : undefined,
      odAxis: odAxis ? parseFloat(odAxis) : undefined,
      odAddition: odAddition ? parseFloat(odAddition) : undefined,
      odPd: odPd ? parseFloat(odPd) : undefined,
      ogSphere: ogSphere ? parseFloat(ogSphere) : undefined,
      ogCylinder: ogCylinder ? parseFloat(ogCylinder) : undefined,
      ogAxis: ogAxis ? parseFloat(ogAxis) : undefined,
      ogAddition: ogAddition ? parseFloat(ogAddition) : undefined,
      ogPd: ogPd ? parseFloat(ogPd) : undefined,
    };

    onSubmit({
      lensType,
      treatments,
      parameters,
      supplierName,
      supplierId,
      supplierOrderRef: supplierOrderRef || undefined,
      purchasePrice,
      sellingPrice,
      notes: notes || undefined,
      prescriptionId: selectedPrescription || undefined,
    });

    // Reset form
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedPrescription("");
    setLensType("unifocal");
    setTreatments([]);
    setSelectedSupplierId("");
    setIsNewSupplier(false);
    setNewSupplierName("");
    setSupplierOrderRef("");
    setPurchasePrice(0);
    setSellingPrice(0);
    setNotes("");
    setOdSphere("");
    setOdCylinder("");
    setOdAxis("");
    setOdAddition("");
    setOdPd("");
    setOgSphere("");
    setOgCylinder("");
    setOgAxis("");
    setOgAddition("");
    setOgPd("");
  };

  const clientPrescriptions = prescriptions.filter(p => p.clientId === clientId);
  const activeSuppliers = suppliers.filter(s => s.isActive);
  const supplierName = getSupplierName();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Commander des verres sur mesure
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client info */}
          {clientName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{clientName}</p>
            </div>
          )}

          {/* Prescription selection */}
          {clientPrescriptions.length > 0 && (
            <div className="space-y-2">
              <Label>Utiliser une ordonnance existante</Label>
              <Select value={selectedPrescription} onValueChange={setSelectedPrescription}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une ordonnance (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Saisie manuelle</SelectItem>
                  {clientPrescriptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {new Date(p.date).toLocaleDateString('fr-FR')} - {p.prescriber || 'Sans prescripteur'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Lens type */}
          <div className="space-y-2">
            <Label>Type de verres *</Label>
            <Select value={lensType} onValueChange={(v) => setLensType(v as LensType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(lensTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Treatments */}
          <div className="space-y-2">
            <Label>Traitements</Label>
            <div className="flex flex-wrap gap-4">
              {allTreatments.map((treatment) => (
                <div key={treatment} className="flex items-center space-x-2">
                  <Checkbox
                    id={treatment}
                    checked={treatments.includes(treatment)}
                    onCheckedChange={() => handleTreatmentToggle(treatment)}
                  />
                  <label htmlFor={treatment} className="text-sm cursor-pointer">
                    {treatmentLabels[treatment]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Optical parameters */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Paramètres optiques</Label>
            
            {/* OD (Right eye) */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Œil Droit (OD)</Label>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <Label className="text-xs">Sphère</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={odSphere}
                    onChange={(e) => setOdSphere(e.target.value)}
                    placeholder="-3.00"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cylindre</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={odCylinder}
                    onChange={(e) => setOdCylinder(e.target.value)}
                    placeholder="-0.50"
                  />
                </div>
                <div>
                  <Label className="text-xs">Axe</Label>
                  <Input
                    type="number"
                    step="1"
                    value={odAxis}
                    onChange={(e) => setOdAxis(e.target.value)}
                    placeholder="90"
                  />
                </div>
                <div>
                  <Label className="text-xs">Addition</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={odAddition}
                    onChange={(e) => setOdAddition(e.target.value)}
                    placeholder="2.00"
                  />
                </div>
                <div>
                  <Label className="text-xs">EP</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={odPd}
                    onChange={(e) => setOdPd(e.target.value)}
                    placeholder="32"
                  />
                </div>
              </div>
            </div>

            {/* OG (Left eye) */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Œil Gauche (OG)</Label>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <Label className="text-xs">Sphère</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={ogSphere}
                    onChange={(e) => setOgSphere(e.target.value)}
                    placeholder="-2.75"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cylindre</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={ogCylinder}
                    onChange={(e) => setOgCylinder(e.target.value)}
                    placeholder="-0.75"
                  />
                </div>
                <div>
                  <Label className="text-xs">Axe</Label>
                  <Input
                    type="number"
                    step="1"
                    value={ogAxis}
                    onChange={(e) => setOgAxis(e.target.value)}
                    placeholder="180"
                  />
                </div>
                <div>
                  <Label className="text-xs">Addition</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={ogAddition}
                    onChange={(e) => setOgAddition(e.target.value)}
                    placeholder="2.00"
                  />
                </div>
                <div>
                  <Label className="text-xs">EP</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={ogPd}
                    onChange={(e) => setOgPd(e.target.value)}
                    placeholder="31"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Supplier info */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Informations fournisseur</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fournisseur *</Label>
                <Select 
                  value={isNewSupplier ? "new" : selectedSupplierId} 
                  onValueChange={handleSupplierChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nouveau fournisseur
                      </span>
                    </SelectItem>
                    {activeSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {isNewSupplier && (
                  <Input
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="Nom du nouveau fournisseur"
                    className="mt-2"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Référence commande fournisseur</Label>
                <Input
                  value={supplierOrderRef}
                  onChange={(e) => setSupplierOrderRef(e.target.value)}
                  placeholder="Numéro de commande"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Prix</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix d'achat (DH) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchasePrice || ""}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Prix de vente (DH) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPrice || ""}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
            {purchasePrice > 0 && sellingPrice > 0 && (
              <p className="text-sm text-muted-foreground">
                Marge: {((sellingPrice - purchasePrice) / purchasePrice * 100).toFixed(1)}% 
                ({(sellingPrice - purchasePrice).toLocaleString('fr-MA')} DH)
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spéciales, remarques..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!supplierName || purchasePrice <= 0 || sellingPrice <= 0}
          >
            Ajouter au panier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
