import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Store as StoreIcon, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Store } from "@/types/store";
import { StoreForm } from "@/components/stores/StoreForm";
import { useToast } from "@/hooks/use-toast";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

export default function Magasins() {
  const { user: currentUser } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermission();
  const { refreshStores } = useStore();

  // Super admin should not access this page - redirect
  if (currentUser?.role === 'super_admin') {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Page non disponible</h2>
            <p className="mt-2 text-muted-foreground">
              Cette page est réservée aux opticiens. Utilisez l'administration SaaS pour gérer les comptes.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user can create more stores (respecting maxStores limit)
  const maxStores = currentUser?.maxStores ?? 999;
  const currentStoreCount = stores.length;
  const canCreateMoreStores = currentStoreCount < maxStores;
  const isOverStoreLimit = currentStoreCount > maxStores;

  useEffect(() => {
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
        }[]>('/api/stores');
        const mapped = data.map((store) => ({
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
        }));
        setStores(mapped);
      } catch {
        setStores([]);
      }
    };

    loadStores();
  }, []);

  const handleCreateStore = (newStore: Store) => {
    if (!canCreateMoreStores) {
      if (isOverStoreLimit) {
        toast({
          title: "Limite atteinte",
          description: `Vous avez atteint la limite de ${maxStores} magasin(s). Contactez l'administrateur pour augmenter cette limite.`,
          variant: "destructive",
        });
      }
      return;
    }

    apiFetch('/api/stores', {
      method: 'POST',
      body: JSON.stringify({
        name: newStore.name,
        address: newStore.address || null,
        city: newStore.city || null,
        phone: newStore.phone || null,
        email: newStore.email || null,
        tax_id: newStore.taxId || null,
        invoice_prefix: newStore.invoicePrefix || null,
      }),
    })
      .then((store: any) => {
        setStores((prev) => [
          {
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
          },
          ...prev,
        ]);
        setIsCreateOpen(false);
        toast({
          title: "Magasin créé",
          description: `${newStore.name} a été ajouté avec succès.`,
        });
        refreshStores();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de créer le magasin";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleUpdateStore = (updatedStore: Store) => {
    apiFetch(`/api/stores/${updatedStore.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: updatedStore.name,
        address: updatedStore.address || null,
        city: updatedStore.city || null,
        phone: updatedStore.phone || null,
        email: updatedStore.email || null,
        tax_id: updatedStore.taxId || null,
        invoice_prefix: updatedStore.invoicePrefix || null,
        is_active: updatedStore.isActive,
      }),
    })
      .then((store: any) => {
        setStores((prev) =>
          prev.map((s) =>
            s.id === updatedStore.id
              ? {
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
                }
              : s
          )
        );
        setEditingStore(null);
        toast({
          title: "Magasin modifié",
          description: `${updatedStore.name} a été mis à jour.`,
        });
        refreshStores();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier le magasin";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleToggleActive = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return;

    apiFetch(`/api/stores/${storeId}/toggle`, {
      method: 'PATCH',
    })
      .then((updated: any) => {
        setStores((prev) =>
          prev.map((s) =>
            s.id === storeId
              ? {
                  id: String(updated.id),
                  name: updated.name,
                  address: updated.address ?? undefined,
                  city: updated.city ?? undefined,
                  phone: updated.phone ?? undefined,
                  email: updated.email ?? undefined,
                  taxId: updated.tax_id ?? undefined,
                  invoicePrefix: updated.invoice_prefix ?? undefined,
                  isActive: updated.is_active,
                  createdAt: updated.created_at,
                  updatedAt: updated.updated_at,
                }
              : s
          )
        );
        toast({
          title: store.isActive ? "Magasin désactivé" : "Magasin activé",
          description: `${store.name} a été ${store.isActive ? "désactivé" : "activé"}.`,
        });
        refreshStores();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier le magasin";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleDeleteStore = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return;

    apiFetch(`/api/stores/${storeId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setStores((prev) => prev.filter((s) => s.id !== storeId));
        toast({
          title: "Magasin supprimé",
          description: `${store.name} a été supprimé définitivement.`,
        });
        refreshStores();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de supprimer le magasin";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStores = stores.filter((s) => s.isActive).length;

  return (
    <ProtectedRoute module="parametres" action="view">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Store limit warning */}
          {isOverStoreLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint la limite de {maxStores} magasin(s). Contactez l'administrateur pour augmenter cette limite.
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Magasins</h1>
              <p className="text-muted-foreground">
                {activeStores} magasin{activeStores > 1 ? "s" : ""} actif{activeStores > 1 ? "s" : ""} sur {stores.length}
                {` (limite: ${maxStores === 999 ? 'illimité' : maxStores})`}
              </p>
            </div>
            {canCreate("parametres") && canCreateMoreStores && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau magasin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Nouveau magasin</DialogTitle>
                    <DialogDescription>
                      Configurez les informations du nouveau point de vente.
                    </DialogDescription>
                  </DialogHeader>
                  <StoreForm onSubmit={handleCreateStore} onCancel={() => setIsCreateOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un magasin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stores Grid */}
          {filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <StoreIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucun magasin trouvé</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map((store) => (
                <Card key={store.id} className={!store.isActive ? "opacity-60" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <StoreIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{store.name}</CardTitle>
                          {store.city && (
                            <CardDescription>{store.city}</CardDescription>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit("parametres") && (
                            <DropdownMenuItem onClick={() => setEditingStore(store)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(store.id)}
                            className={store.isActive ? "text-orange-600" : "text-green-600"}
                          >
                            {store.isActive ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          {canDelete("parametres") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteStore(store.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="pt-2">
                      <Badge variant={store.isActive ? "success" : "secondary"}>
                        {store.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {store.address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{store.address}</span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>{store.email}</span>
                      </div>
                    )}
                    {store.invoicePrefix && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span>Préfixe factures: <code className="bg-muted px-1 rounded">{store.invoicePrefix}</code></span>
                      </div>
                    )}
                    {store.taxId && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          ICE: {store.taxId}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Store Dialog */}
        <Dialog open={!!editingStore} onOpenChange={() => setEditingStore(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifier le magasin</DialogTitle>
              <DialogDescription>
                Modifiez les informations du point de vente.
              </DialogDescription>
            </DialogHeader>
            {editingStore && (
              <StoreForm
                store={editingStore}
                onSubmit={handleUpdateStore}
                onCancel={() => setEditingStore(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
