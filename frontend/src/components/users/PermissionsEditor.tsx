import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  PermissionTable,
  Module,
  PermissionAction,
  moduleLabels,
  actionLabels,
  defaultPermissions,
} from "@/types/auth";
import { Loader2, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PermissionsEditorProps {
  user: User;
  onSave: (permissions: PermissionTable) => void;
  onCancel: () => void;
}

const modules: Module[] = [
  "clients",
  "prescriptions",
  "ventes",
  "factures",
  "paiements",
  "stock",
  "fournisseurs",
  "bons_commande",
  "bons_livraison",
  "atelier",
  "rapports",
  "parametres",
  "utilisateurs",
];

const actions: PermissionAction[] = ["view", "create", "edit", "delete", "validate", "export"];

export function PermissionsEditor({ user, onSave, onCancel }: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<PermissionTable>(user.permissions);
  const [isLoading, setIsLoading] = useState(false);

  const handlePermissionChange = (module: Module, action: PermissionAction, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: checked,
      },
    }));
  };

  const handleSelectAll = (module: Module, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        view: checked,
        create: checked,
        edit: checked,
        delete: checked,
        validate: checked,
        export: checked,
      },
    }));
  };

  const handleApplyTemplate = (role: string) => {
    if (role in defaultPermissions) {
      setPermissions(defaultPermissions[role as keyof typeof defaultPermissions]);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(permissions);
    setIsLoading(false);
  };

  const isAllSelected = (module: Module) => {
    return actions.every((action) => permissions[module][action]);
  };

  const isSomeSelected = (module: Module) => {
    return actions.some((action) => permissions[module][action]) && !isAllSelected(module);
  };

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
        <div className="flex-1">
          <p className="text-sm font-medium">Appliquer un modèle de permissions</p>
          <p className="text-xs text-muted-foreground">
            Sélectionnez un rôle pour charger ses permissions par défaut
          </p>
        </div>
        <Select onValueChange={handleApplyTemplate}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Choisir un modèle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="vendeur">Vendeur</SelectItem>
            <SelectItem value="technicien">Technicien</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPermissions(user.permissions)}
          title="Réinitialiser"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Permissions Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-48">Module</TableHead>
              <TableHead className="text-center w-20">Tout</TableHead>
              {actions.map((action) => (
                <TableHead key={action} className="text-center w-24">
                  {actionLabels[action]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module) => (
              <TableRow key={module}>
                <TableCell className="font-medium">{moduleLabels[module]}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={isAllSelected(module)}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement).dataset.state = isSomeSelected(module)
                          ? "indeterminate"
                          : isAllSelected(module)
                          ? "checked"
                          : "unchecked";
                      }
                    }}
                    onCheckedChange={(checked) => handleSelectAll(module, !!checked)}
                    className="data-[state=indeterminate]:bg-primary/50"
                  />
                </TableCell>
                {actions.map((action) => (
                  <TableCell key={action} className="text-center">
                    <Checkbox
                      checked={permissions[module][action]}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(module, action, !!checked)
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les permissions"
          )}
        </Button>
      </div>
    </div>
  );
}
