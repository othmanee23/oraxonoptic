import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User } from "@/types/auth";
import { Store } from "@/types/store";
import { Loader2, Store as StoreIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

interface StoreAssignmentProps {
  user: User;
  onSave: (storeIds: string[]) => void;
  onCancel: () => void;
}

export function StoreAssignment({ user, onSave, onCancel }: StoreAssignmentProps) {
  const { selectedStoreId } = useStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(user.storeIds || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedStoreId) {
      setStores([]);
      return;
    }

    const loadStores = async () => {
      try {
        const data = await apiFetch<{
          id: number | string;
          name: string;
          address?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          tax_id?: string | null;
          invoice_prefix?: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }[]>("/api/stores");

        setStores(
          data.map((store) => ({
            id: String(store.id),
            name: store.name,
            address: store.address ?? undefined,
            city: store.city ?? undefined,
            phone: store.phone ?? undefined,
            email: store.email ?? undefined,
            taxId: store.tax_id ?? undefined,
            invoicePrefix: store.invoice_prefix ?? undefined,
            isActive: store.is_active,
            createdAt: store.created_at,
            updatedAt: store.updated_at,
          }))
        );
      } catch (error) {
        console.error("Stores load error:", error);
        setStores([]);
      }
    };

    loadStores();
  }, [selectedStoreId]);

  const handleToggleStore = (storeId: string, checked: boolean) => {
    if (checked) {
      setSelectedStoreIds([...selectedStoreIds, storeId]);
    } else {
      setSelectedStoreIds(selectedStoreIds.filter((id) => id !== storeId));
    }
  };

  const handleSelectAll = () => {
    const activeStoreIds = stores.filter((s) => s.isActive).map((s) => s.id);
    setSelectedStoreIds(activeStoreIds);
  };

  const handleDeselectAll = () => {
    setSelectedStoreIds([]);
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(selectedStoreIds);
    setIsLoading(false);
  };

  const activeStores = stores.filter((s) => s.isActive);
  const inactiveStores = stores.filter((s) => !s.isActive);

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
          Tout sélectionner
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
          Tout désélectionner
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">
          {selectedStoreIds.length} magasin{selectedStoreIds.length > 1 ? "s" : ""} sélectionné{selectedStoreIds.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Active stores */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Magasins actifs</h4>
        <div className="grid gap-2">
          {activeStores.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun magasin actif
            </p>
          ) : (
            activeStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`store-${store.id}`}
                  checked={selectedStoreIds.includes(store.id)}
                  onCheckedChange={(checked) => handleToggleStore(store.id, !!checked)}
                />
                <Label
                  htmlFor={`store-${store.id}`}
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <StoreIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{store.name}</p>
                    {store.city && (
                      <p className="text-sm text-muted-foreground">{store.city}</p>
                    )}
                  </div>
                </Label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inactive stores */}
      {inactiveStores.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Magasins inactifs</h4>
          <div className="grid gap-2 opacity-60">
            {inactiveStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <Checkbox
                  id={`store-${store.id}`}
                  checked={selectedStoreIds.includes(store.id)}
                  onCheckedChange={(checked) => handleToggleStore(store.id, !!checked)}
                />
                <Label
                  htmlFor={`store-${store.id}`}
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <StoreIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">{store.name}</p>
                    {store.city && (
                      <p className="text-sm text-muted-foreground">{store.city}</p>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </div>
  );
}
