import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserRole, defaultPermissions } from "@/types/auth";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface UserFormProps {
  user?: User;
  onSubmit: (user: User & { password?: string }) => void;
  onCancel: () => void;
}

// Note: "admin" role is not available here - only super_admin can create admins via AdminSaas
const userSchema = z.object({
  firstName: z.string().min(2, "Prénom trop court").max(50),
  lastName: z.string().min(2, "Nom trop court").max(50),
  email: z.string().email("Email invalide").max(255),
  phone: z.string().optional(),
  role: z.enum(["manager", "vendeur", "technicien"]),
  password: z.string().min(6, "Mot de passe trop court (min. 6 caractères)").optional(),
});

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const isEditing = !!user;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    // Default to vendeur, and exclude admin role for non-super_admin users
    role: (user?.role && user.role !== 'admin' && user.role !== 'super_admin' ? user.role : "vendeur") as UserRole,
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const schema = isEditing
      ? userSchema.omit({ password: true })
      : userSchema.extend({ password: z.string().min(6, "Mot de passe requis (min. 6 caractères)") });

    const result = schema.safeParse(formData);
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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userData: User & { password?: string } = {
      id: user?.id || `user-${Date.now()}`,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      role: formData.role,
      storeIds: user?.storeIds || ["store-001"],
      permissions: user?.permissions || defaultPermissions[formData.role],
      isActive: user?.isActive ?? true,
      createdAt: user?.createdAt || new Date().toISOString(),
      lastLogin: user?.lastLogin,
    };

    if (!isEditing) {
      userData.password = formData.password;
    }

    onSubmit(userData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Mohamed"
            disabled={isLoading}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Alami"
            disabled={isLoading}
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="utilisateur@optigest.ma"
          disabled={isLoading}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone (optionnel)</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+212 6 00 00 00 00"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.role ? "border-destructive" : ""}>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            {/* Admin role is only created by super_admin via AdminSaas */}
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="vendeur">Vendeur</SelectItem>
            <SelectItem value="technicien">Technicien</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              disabled={isLoading}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
      )}

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
            "Créer"
          )}
        </Button>
      </div>
    </form>
  );
}
