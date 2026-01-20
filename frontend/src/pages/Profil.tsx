import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Eye, EyeOff, Phone, Mail, Shield, Store, Calendar, Loader2, Save } from "lucide-react";
import { Store as StoreType } from "@/types/store";
import { apiFetch } from "@/lib/api";

const roleLabels: Record<string, string> = {
  super_admin: "Super Administrateur",
  admin: "Administrateur / Opticien",
  manager: "Manager",
  vendeur: "Vendeur",
  technicien: "Technicien",
};

export default function Profil() {
  const { user, updateUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [stores, setStores] = useState<StoreType[]>([]);

  useEffect(() => {
    if (!user) return;

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
    }[]>('/api/stores')
      .then((data) => {
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
      })
      .catch(() => {
        setStores([]);
      });
  }, [user]);

  const userStores = stores;

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const updated = await apiFetch<{
        first_name: string;
        last_name: string;
        phone?: string | null;
      }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          current_password: formData.currentPassword || null,
          new_password: formData.newPassword || null,
        }),
      });

      if (user) {
        updateUser({
          ...user,
          firstName: updated.first_name,
          lastName: updated.last_name,
          phone: updated.phone || undefined,
        });
      }

      await refreshUser();

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });

      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de mettre à jour le profil.";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground">
            Consultez et modifiez vos informations personnelles
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {roleLabels[user.role] || user.role}
                  </Badge>
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 6 00 00 00 00"
                    disabled={isLoading}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Changer le mot de passe (optionnel)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Rôle:</span>
                  <span className="font-medium">{roleLabels[user.role] || user.role}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Membre depuis:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {user.lastLogin && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Dernière connexion:</span>
                    <span className="font-medium">
                      {new Date(user.lastLogin).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stores Card */}
        {userStores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5" />
                Mes Magasins
              </CardTitle>
              <CardDescription>
                Magasins auxquels vous avez accès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {userStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{store.name}</p>
                      {store.city && (
                        <p className="text-sm text-muted-foreground">{store.city}</p>
                      )}
                    </div>
                    <Badge variant={store.isActive ? "success" : "secondary"}>
                      {store.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
