import { useState } from "react";
import { Client, Purchase, Prescription } from "@/types/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  ShoppingBag, 
  Eye, 
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle
} from "lucide-react";
import { PrescriptionForm } from "./PrescriptionForm";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/contexts/StoreContext";

interface ClientDetailsProps {
  client: Client;
  purchases: Purchase[];
  prescriptions: Prescription[];
  onAddPrescription: (prescription: Prescription) => void;
  onUpdatePrescription: (prescription: Prescription) => void;
  onDeletePrescription: (prescriptionId: string) => void;
}

const productTypeLabels: Record<string, string> = {
  monture: "Monture",
  verres: "Verres",
  lentilles: "Lentilles",
  accessoire: "Accessoire",
  autre: "Autre",
};

const formatValue = (value: number | undefined, suffix: string = ""): string => {
  if (value === undefined || value === null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}${suffix}`;
};

export function ClientDetails({ 
  client, 
  purchases, 
  prescriptions,
  onAddPrescription,
  onUpdatePrescription,
  onDeletePrescription
}: ClientDetailsProps) {
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState<string | null>(null);
  const { canCreate, canEdit, canDelete } = usePermission();
  const { storeSettings } = useStore();
  const currency = storeSettings.currency || "DH";

  const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddPrescription = (prescription: Prescription) => {
    onAddPrescription(prescription);
    setIsAddPrescriptionOpen(false);
  };

  const handleUpdatePrescription = (prescription: Prescription) => {
    onUpdatePrescription(prescription);
    setEditingPrescription(null);
  };

  const handleDeletePrescription = () => {
    if (deletingPrescriptionId) {
      onDeletePrescription(deletingPrescriptionId);
      setDeletingPrescriptionId(null);
    }
  };

  const isPrescriptionExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Client Info Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Informations personnelles</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {client.firstName.charAt(0)}
                {client.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-lg">
                  {client.firstName} {client.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Client depuis{" "}
                  {new Date(client.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address}</span>
                </div>
              )}
              {client.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Né(e) le {new Date(client.dateOfBirth).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>

            {client.notes && (
              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="text-sm mt-1 p-3 rounded-lg bg-muted/50">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Résumé</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Prescriptions</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{prescriptions.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm font-medium">Total achats</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {totalSpent.toLocaleString("fr-FR")} <span className="text-sm font-normal">{currency}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs for Prescriptions and Purchases */}
      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Prescriptions ({prescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Historique achats ({purchases.length})
          </TabsTrigger>
        </TabsList>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Dossier médical</h3>
            {canCreate("prescriptions") && (
              <Button size="sm" onClick={() => setIsAddPrescriptionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle prescription
              </Button>
            )}
          </div>

          {sortedPrescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune prescription enregistrée</p>
              {canCreate("prescriptions") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsAddPrescriptionOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une prescription
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPrescriptions.map((prescription) => {
                const isExpired = isPrescriptionExpired(prescription.expiryDate);
                return (
                  <div 
                    key={prescription.id} 
                    className={`rounded-lg border p-4 ${isExpired ? 'border-destructive/50 bg-destructive/5' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {new Date(prescription.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Expirée
                            </Badge>
                          )}
                        </div>
                        {prescription.prescriber && (
                          <p className="text-sm text-muted-foreground">
                            Par {prescription.prescriber}
                          </p>
                        )}
                        {prescription.expiryDate && !isExpired && (
                          <p className="text-sm text-muted-foreground">
                            Expire le {new Date(prescription.expiryDate).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit("prescriptions") && (
                            <DropdownMenuItem onClick={() => setEditingPrescription(prescription)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                          )}
                          {canDelete("prescriptions") && (
                            <DropdownMenuItem 
                              onClick={() => setDeletingPrescriptionId(prescription.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Prescription Values Table */}
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-20">Œil</TableHead>
                            <TableHead className="text-center">Sphère</TableHead>
                            <TableHead className="text-center">Cylindre</TableHead>
                            <TableHead className="text-center">Axe</TableHead>
                            <TableHead className="text-center">Addition</TableHead>
                            <TableHead className="text-center">EP</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">OD</TableCell>
                            <TableCell className="text-center">{formatValue(prescription.odSphere)}</TableCell>
                            <TableCell className="text-center">{formatValue(prescription.odCylinder)}</TableCell>
                            <TableCell className="text-center">{prescription.odAxis !== undefined ? `${prescription.odAxis}°` : "-"}</TableCell>
                            <TableCell className="text-center">{formatValue(prescription.odAddition)}</TableCell>
                            <TableCell className="text-center">{prescription.odPd !== undefined ? prescription.odPd : "-"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">OG</TableCell>
                            <TableCell className="text-center">{formatValue(prescription.ogSphere)}</TableCell>
                            <TableCell className="text-center">{formatValue(prescription.ogCylinder)}</TableCell>
                            <TableCell className="text-center">{prescription.ogAxis !== undefined ? `${prescription.ogAxis}°` : "-"}</TableCell>
                            <TableCell className="text-center">{formatValue(prescription.ogAddition)}</TableCell>
                            <TableCell className="text-center">{prescription.ogPd !== undefined ? prescription.ogPd : "-"}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {prescription.notes && (
                      <p className="mt-3 text-sm text-muted-foreground p-2 rounded bg-muted/50">
                        <strong>Notes:</strong> {prescription.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-4">
          <h3 className="font-semibold text-foreground">Historique des achats</h3>
          
          {sortedPurchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun achat enregistré</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPurchases.map((purchase) => (
                <div key={purchase.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {new Date(purchase.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {purchase.invoiceNumber && (
                          <p className="text-sm text-muted-foreground">
                            {purchase.invoiceNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {purchase.total.toLocaleString("fr-FR")} {currency}
                      </p>
                      <Badge
                        variant={
                          purchase.status === "paid"
                            ? "success"
                            : purchase.status === "partial"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {purchase.status === "paid"
                          ? "Payé"
                          : purchase.status === "partial"
                          ? "Partiel"
                          : "En attente"}
                      </Badge>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Qté</TableHead>
                        <TableHead className="text-right">Prix unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchase.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {productTypeLabels[product.type] || product.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{product.quantity}</TableCell>
                          <TableCell className="text-right">
                            {product.unitPrice.toLocaleString("fr-FR")} {currency}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {product.total.toLocaleString("fr-FR")} {currency}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Prescription Dialog */}
      <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle prescription</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle prescription pour {client.firstName} {client.lastName}
            </DialogDescription>
          </DialogHeader>
          <PrescriptionForm
            clientId={client.id}
            onSubmit={handleAddPrescription}
            onCancel={() => setIsAddPrescriptionOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Prescription Dialog */}
      <Dialog open={!!editingPrescription} onOpenChange={() => setEditingPrescription(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la prescription</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la prescription
            </DialogDescription>
          </DialogHeader>
          {editingPrescription && (
            <PrescriptionForm
              prescription={editingPrescription}
              clientId={client.id}
              onSubmit={handleUpdatePrescription}
              onCancel={() => setEditingPrescription(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPrescriptionId} onOpenChange={() => setDeletingPrescriptionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la prescription ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La prescription sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrescription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
