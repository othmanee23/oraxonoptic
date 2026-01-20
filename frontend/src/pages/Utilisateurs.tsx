import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Search, MoreHorizontal, Shield, UserX, UserCheck, Pencil, Store as StoreIcon } from "lucide-react";
import { User, UserRole, defaultPermissions } from "@/types/auth";
import { UserForm } from "@/components/users/UserForm";
import { PermissionsEditor } from "@/components/users/PermissionsEditor";
import { StoreAssignment } from "@/components/users/StoreAssignment";
import { Store } from "@/types/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur",
  manager: "Manager",
  vendeur: "Vendeur",
  technicien: "Technicien",
};

const roleBadgeVariants: Record<UserRole, "default" | "secondary" | "outline" | "success"> = {
  super_admin: "success",
  admin: "default",
  manager: "secondary",
  vendeur: "outline",
  technicien: "outline",
};

export default function Utilisateurs() {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<(User & { password?: string })[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [storesUser, setStoresUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Super admin should not access this page - redirect to AdminSaas
  if (currentUser?.role === 'super_admin') {
    return <Navigate to="/admin-saas" replace />;
  }

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        const [usersData, storesData] = await Promise.all([
          apiFetch<{
            id: number | string;
            email: string;
            first_name: string;
            last_name: string;
            phone?: string | null;
            role: UserRole | string;
            permissions?: User["permissions"] | null;
            is_active: boolean;
            created_at?: string;
            last_login_at?: string | null;
            owner_id?: number | string | null;
            store_ids?: string[];
          }[]>("/api/users"),
          apiFetch<{
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
          }[]>("/api/stores"),
        ]);

        setStores(
          storesData.map((store) => ({
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

        setAllUsers(
          usersData.map((user) => ({
            id: String(user.id),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone ?? undefined,
            role: (user.role || "user") as UserRole,
            storeIds: user.store_ids ?? [],
            permissions: user.permissions ?? defaultPermissions[(user.role || "user") as UserRole],
            isActive: user.is_active,
            createdAt: user.created_at ?? new Date().toISOString(),
            lastLogin: user.last_login_at ?? undefined,
            ownerId: user.owner_id ? String(user.owner_id) : undefined,
          }))
        );
      } catch (error) {
        console.error("Users load error:", error);
        setAllUsers([]);
      }
    };

    loadData();
  }, [currentUser]);

  const users = allUsers;

  const handleCreateUser = async (newUser: User & { password: string }) => {
    try {
      const storeIds = stores.filter((store) => store.isActive).map((store) => store.id);
      const created = await apiFetch<{
        id: number | string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | null;
        role: UserRole | string;
        permissions?: User["permissions"] | null;
        is_active: boolean;
        created_at?: string;
        last_login_at?: string | null;
        owner_id?: number | string | null;
        store_ids?: string[];
      }>("/api/users", {
        method: "POST",
        body: JSON.stringify({
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone ?? null,
          role: newUser.role,
          password: newUser.password,
          permissions: newUser.permissions,
          store_ids: storeIds,
        }),
      });

      const mapped: User = {
        id: String(created.id),
        email: created.email,
        firstName: created.first_name,
        lastName: created.last_name,
        phone: created.phone ?? undefined,
        role: (created.role || "user") as UserRole,
        storeIds: created.store_ids ?? [],
        permissions: created.permissions ?? defaultPermissions[(created.role || "user") as UserRole],
        isActive: created.is_active,
        createdAt: created.created_at ?? new Date().toISOString(),
        lastLogin: created.last_login_at ?? undefined,
        ownerId: created.owner_id ? String(created.owner_id) : undefined,
      };

      setAllUsers((prev) => [mapped, ...prev]);
      setIsCreateOpen(false);
      toast({
        title: "Utilisateur créé",
        description: `${newUser.firstName} ${newUser.lastName} a été ajouté avec succès.`,
      });
    } catch (error) {
      console.error("Create user error:", error);
      toast({
        title: "Création impossible",
        description: "Veuillez vérifier les informations.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const saved = await apiFetch<{
        id: number | string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | null;
        role: UserRole | string;
        permissions?: User["permissions"] | null;
        is_active: boolean;
        created_at?: string;
        last_login_at?: string | null;
        owner_id?: number | string | null;
        store_ids?: string[];
      }>(`/api/users/${updatedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone ?? null,
          role: updatedUser.role,
        }),
      });

      const mapped: User = {
        id: String(saved.id),
        email: saved.email,
        firstName: saved.first_name,
        lastName: saved.last_name,
        phone: saved.phone ?? undefined,
        role: (saved.role || "user") as UserRole,
        storeIds: saved.store_ids ?? [],
        permissions: saved.permissions ?? defaultPermissions[(saved.role || "user") as UserRole],
        isActive: saved.is_active,
        createdAt: saved.created_at ?? new Date().toISOString(),
        lastLogin: saved.last_login_at ?? undefined,
        ownerId: saved.owner_id ? String(saved.owner_id) : undefined,
      };

      setAllUsers((prev) => prev.map((u) => (u.id === mapped.id ? mapped : u)));
      setEditingUser(null);
      toast({
        title: "Utilisateur modifié",
        description: `Les informations de ${updatedUser.firstName} ${updatedUser.lastName} ont été mises à jour.`,
      });
    } catch (error) {
      console.error("Update user error:", error);
      toast({
        title: "Mise à jour impossible",
        description: "Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: User["permissions"]) => {
    try {
      const updated = await apiFetch<{
        id: number | string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | null;
        role: UserRole | string;
        permissions?: User["permissions"] | null;
        is_active: boolean;
        created_at?: string;
        last_login_at?: string | null;
        owner_id?: number | string | null;
        store_ids?: string[];
      }>(`/api/users/${userId}/permissions`, {
        method: "PATCH",
        body: JSON.stringify({ permissions }),
      });

      const mapped: User = {
        id: String(updated.id),
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
        phone: updated.phone ?? undefined,
        role: (updated.role || "user") as UserRole,
        storeIds: updated.store_ids ?? [],
        permissions: updated.permissions ?? defaultPermissions[(updated.role || "user") as UserRole],
        isActive: updated.is_active,
        createdAt: updated.created_at ?? new Date().toISOString(),
        lastLogin: updated.last_login_at ?? undefined,
        ownerId: updated.owner_id ? String(updated.owner_id) : undefined,
      };

      setAllUsers((prev) => prev.map((u) => (u.id === mapped.id ? mapped : u)));
      setPermissionsUser(null);
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Update permissions error:", error);
      toast({
        title: "Mise à jour impossible",
        description: "Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStores = async (userId: string, storeIds: string[]) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    try {
      const updated = await apiFetch<{
        id: number | string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | null;
        role: UserRole | string;
        permissions?: User["permissions"] | null;
        is_active: boolean;
        created_at?: string;
        last_login_at?: string | null;
        owner_id?: number | string | null;
        store_ids?: string[];
      }>(`/api/users/${userId}/stores`, {
        method: "PATCH",
        body: JSON.stringify({ store_ids: storeIds }),
      });

      const mapped: User = {
        id: String(updated.id),
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
        phone: updated.phone ?? undefined,
        role: (updated.role || "user") as UserRole,
        storeIds: updated.store_ids ?? [],
        permissions: updated.permissions ?? defaultPermissions[(updated.role || "user") as UserRole],
        isActive: updated.is_active,
        createdAt: updated.created_at ?? new Date().toISOString(),
        lastLogin: updated.last_login_at ?? undefined,
        ownerId: updated.owner_id ? String(updated.owner_id) : undefined,
      };

      setAllUsers((prev) => prev.map((u) => (u.id === mapped.id ? mapped : u)));
      setStoresUser(null);
      toast({
        title: "Magasins mis à jour",
        description: `Les magasins de ${user.firstName} ${user.lastName} ont été enregistrés.`,
      });
    } catch (error) {
      console.error("Update stores error:", error);
      toast({
        title: "Mise à jour impossible",
        description: "Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const getUserStoreNames = (storeIds: string[]) => {
    return storeIds
      .map((id) => stores.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const handleToggleActive = async (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    try {
      const updated = await apiFetch<{
        id: number | string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | null;
        role: UserRole | string;
        permissions?: User["permissions"] | null;
        is_active: boolean;
        created_at?: string;
        last_login_at?: string | null;
        owner_id?: number | string | null;
        store_ids?: string[];
      }>(`/api/users/${userId}/toggle`, { method: "PATCH" });

      const mapped: User = {
        id: String(updated.id),
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
        phone: updated.phone ?? undefined,
        role: (updated.role || "user") as UserRole,
        storeIds: updated.store_ids ?? [],
        permissions: updated.permissions ?? defaultPermissions[(updated.role || "user") as UserRole],
        isActive: updated.is_active,
        createdAt: updated.created_at ?? new Date().toISOString(),
        lastLogin: updated.last_login_at ?? undefined,
        ownerId: updated.owner_id ? String(updated.owner_id) : undefined,
      };

      setAllUsers((prev) => prev.map((u) => (u.id === mapped.id ? mapped : u)));
      toast({
        title: mapped.isActive ? "Utilisateur activé" : "Utilisateur désactivé",
        description: `${mapped.firstName} ${mapped.lastName} a été ${mapped.isActive ? "activé" : "désactivé"}.`,
      });
    } catch (error) {
      console.error("Toggle user error:", error);
      toast({
        title: "Action impossible",
        description: "Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute module="utilisateurs" action="view">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mon Équipe</h1>
              <p className="text-muted-foreground">
                Gérez les employés de votre entreprise
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouvel utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer un utilisateur</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour créer un nouveau compte utilisateur.
                  </DialogDescription>
                </DialogHeader>
                <UserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Users Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Magasins</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            {user.phone && (
                              <p className="text-sm text-muted-foreground">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariants[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          {user.storeIds && user.storeIds.length > 0 ? (
                            <p className="text-sm text-muted-foreground truncate" title={getUserStoreNames(user.storeIds)}>
                              {user.storeIds.length} magasin{user.storeIds.length > 1 ? "s" : ""}
                            </p>
                          ) : (
                            <span className="text-sm text-muted-foreground">Aucun</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "secondary"}>
                          {user.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Jamais"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPermissionsUser(user)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStoresUser(user)}>
                              <StoreIcon className="mr-2 h-4 w-4" />
                              Magasins
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(user.id)}
                              className={user.isActive ? "text-destructive" : "text-green-600"}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <UserForm
                user={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => setEditingUser(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={!!permissionsUser} onOpenChange={() => setPermissionsUser(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Permissions de {permissionsUser?.firstName} {permissionsUser?.lastName}
              </DialogTitle>
              <DialogDescription>
                Configurez les droits d'accès pour chaque module.
              </DialogDescription>
            </DialogHeader>
            {permissionsUser && (
              <PermissionsEditor
                user={permissionsUser}
                onSave={(permissions) => handleUpdatePermissions(permissionsUser.id, permissions)}
                onCancel={() => setPermissionsUser(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Store Assignment Dialog */}
        <Dialog open={!!storesUser} onOpenChange={() => setStoresUser(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Magasins de {storesUser?.firstName} {storesUser?.lastName}
              </DialogTitle>
              <DialogDescription>
                Sélectionnez les magasins auxquels cet utilisateur a accès.
              </DialogDescription>
            </DialogHeader>
            {storesUser && (
              <StoreAssignment
                user={storesUser}
                onSave={(storeIds) => handleUpdateStores(storesUser.id, storeIds)}
                onCancel={() => setStoresUser(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
