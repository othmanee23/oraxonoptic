import { useState, useEffect, useRef } from "react";
import { Save, Upload, X, Building2, Phone, Mail, Globe, FileText, CreditCard, Palette, Check, Coins, Bell } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StoreSettings, defaultStoreSettings, invoiceColors, availableCurrencies, setStoreSettingsCache } from "@/types/settings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/contexts/StoreContext";

const Parametres = () => {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [initialSettings, setInitialSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedStoreId } = useStore();

  useEffect(() => {
    if (!selectedStoreId) {
      setSettings(defaultStoreSettings);
      setInitialSettings(defaultStoreSettings);
      setHasChanges(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const data = await apiFetch<{
          name: string;
          subtitle?: string | null;
          logo?: string | null;
          address?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          ice?: string | null;
          rc?: string | null;
          patente?: string | null;
          cnss?: string | null;
          rib?: string | null;
          footer_text?: string | null;
          primary_color?: string | null;
          currency?: string | null;
          notify_low_stock_in_app?: boolean | null;
          notify_low_stock_email?: boolean | null;
          notify_workshop_ready_in_app?: boolean | null;
          notify_workshop_ready_email?: boolean | null;
          notify_new_client_in_app?: boolean | null;
          notify_new_client_email?: boolean | null;
          notify_invoice_created_in_app?: boolean | null;
          notify_invoice_created_email?: boolean | null;
        }>("/api/store-settings");

        const mapped: StoreSettings = {
          name: data.name,
          subtitle: data.subtitle ?? undefined,
          logo: data.logo ?? undefined,
          address: data.address ?? undefined,
          city: data.city ?? undefined,
          phone: data.phone ?? undefined,
          email: data.email ?? undefined,
          website: data.website ?? undefined,
          ice: data.ice ?? undefined,
          rc: data.rc ?? undefined,
          patente: data.patente ?? undefined,
          cnss: data.cnss ?? undefined,
          rib: data.rib ?? undefined,
          footerText: data.footer_text ?? undefined,
          primaryColor: data.primary_color ?? defaultStoreSettings.primaryColor,
          currency: data.currency ?? defaultStoreSettings.currency,
          notifyLowStockInApp: data.notify_low_stock_in_app ?? defaultStoreSettings.notifyLowStockInApp,
          notifyLowStockEmail: data.notify_low_stock_email ?? defaultStoreSettings.notifyLowStockEmail,
          notifyWorkshopReadyInApp: data.notify_workshop_ready_in_app ?? defaultStoreSettings.notifyWorkshopReadyInApp,
          notifyWorkshopReadyEmail: data.notify_workshop_ready_email ?? defaultStoreSettings.notifyWorkshopReadyEmail,
          notifyNewClientInApp: data.notify_new_client_in_app ?? defaultStoreSettings.notifyNewClientInApp,
          notifyNewClientEmail: data.notify_new_client_email ?? defaultStoreSettings.notifyNewClientEmail,
          notifyInvoiceCreatedInApp: data.notify_invoice_created_in_app ?? defaultStoreSettings.notifyInvoiceCreatedInApp,
          notifyInvoiceCreatedEmail: data.notify_invoice_created_email ?? defaultStoreSettings.notifyInvoiceCreatedEmail,
        };

        setSettings(mapped);
        setInitialSettings(mapped);
        setHasChanges(false);
        setStoreSettingsCache(mapped);
      } catch (error) {
        console.error("Store settings load error:", error);
        toast.error("Impossible de charger les paramètres");
      }
    };

    loadSettings();
  }, [selectedStoreId]);

  const handleChange = (field: keyof StoreSettings, value: StoreSettings[keyof StoreSettings]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("Le logo ne doit pas dépasser 500 Ko");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({ ...prev, logo: reader.result as string }));
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logo: undefined }));
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      const updated = await apiFetch<{
        name: string;
        subtitle?: string | null;
        logo?: string | null;
        address?: string | null;
        city?: string | null;
        phone?: string | null;
        email?: string | null;
        website?: string | null;
        ice?: string | null;
        rc?: string | null;
        patente?: string | null;
        cnss?: string | null;
        rib?: string | null;
        footer_text?: string | null;
        primary_color?: string | null;
        currency?: string | null;
        notify_low_stock_in_app?: boolean | null;
        notify_low_stock_email?: boolean | null;
        notify_workshop_ready_in_app?: boolean | null;
        notify_workshop_ready_email?: boolean | null;
        notify_new_client_in_app?: boolean | null;
        notify_new_client_email?: boolean | null;
        notify_invoice_created_in_app?: boolean | null;
        notify_invoice_created_email?: boolean | null;
      }>("/api/store-settings", {
        method: "PUT",
        body: JSON.stringify({
          name: settings.name,
          subtitle: settings.subtitle ?? null,
          logo: settings.logo ?? null,
          address: settings.address ?? null,
          city: settings.city ?? null,
          phone: settings.phone ?? null,
          email: settings.email ?? null,
          website: settings.website ?? null,
          ice: settings.ice ?? null,
          rc: settings.rc ?? null,
          patente: settings.patente ?? null,
          cnss: settings.cnss ?? null,
          rib: settings.rib ?? null,
          footer_text: settings.footerText ?? null,
          primary_color: settings.primaryColor ?? null,
          currency: settings.currency ?? null,
          notify_low_stock_in_app: settings.notifyLowStockInApp,
          notify_low_stock_email: settings.notifyLowStockEmail,
          notify_workshop_ready_in_app: settings.notifyWorkshopReadyInApp,
          notify_workshop_ready_email: settings.notifyWorkshopReadyEmail,
          notify_new_client_in_app: settings.notifyNewClientInApp,
          notify_new_client_email: settings.notifyNewClientEmail,
          notify_invoice_created_in_app: settings.notifyInvoiceCreatedInApp,
          notify_invoice_created_email: settings.notifyInvoiceCreatedEmail,
        }),
      });

      const mapped: StoreSettings = {
        name: updated.name,
        subtitle: updated.subtitle ?? undefined,
        logo: updated.logo ?? undefined,
        address: updated.address ?? undefined,
        city: updated.city ?? undefined,
        phone: updated.phone ?? undefined,
        email: updated.email ?? undefined,
        website: updated.website ?? undefined,
        ice: updated.ice ?? undefined,
        rc: updated.rc ?? undefined,
        patente: updated.patente ?? undefined,
        cnss: updated.cnss ?? undefined,
        rib: updated.rib ?? undefined,
        footerText: updated.footer_text ?? undefined,
        primaryColor: updated.primary_color ?? defaultStoreSettings.primaryColor,
        currency: updated.currency ?? defaultStoreSettings.currency,
        notifyLowStockInApp: updated.notify_low_stock_in_app ?? defaultStoreSettings.notifyLowStockInApp,
        notifyLowStockEmail: updated.notify_low_stock_email ?? defaultStoreSettings.notifyLowStockEmail,
        notifyWorkshopReadyInApp: updated.notify_workshop_ready_in_app ?? defaultStoreSettings.notifyWorkshopReadyInApp,
        notifyWorkshopReadyEmail: updated.notify_workshop_ready_email ?? defaultStoreSettings.notifyWorkshopReadyEmail,
        notifyNewClientInApp: updated.notify_new_client_in_app ?? defaultStoreSettings.notifyNewClientInApp,
        notifyNewClientEmail: updated.notify_new_client_email ?? defaultStoreSettings.notifyNewClientEmail,
        notifyInvoiceCreatedInApp: updated.notify_invoice_created_in_app ?? defaultStoreSettings.notifyInvoiceCreatedInApp,
        notifyInvoiceCreatedEmail: updated.notify_invoice_created_email ?? defaultStoreSettings.notifyInvoiceCreatedEmail,
      };

      setSettings(mapped);
      setInitialSettings(mapped);
      setHasChanges(false);
      setStoreSettingsCache(mapped);
      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      console.error("Store settings save error:", error);
      toast.error("Impossible d'enregistrer les paramètres");
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  return (
    <ProtectedRoute module="parametres" action="view">
      <DashboardLayout>
        <div className="space-y-6 p-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
              <p className="text-muted-foreground">
                Configurez les informations de votre magasin pour les factures
              </p>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button variant="outline" onClick={handleReset}>
                  Annuler
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </div>

          {/* Identity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Identité du magasin
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos factures et documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-3">
                <Label>Logo (optionnel)</Label>
                <div className="flex items-center gap-4">
                  {settings.logo ? (
                    <div className="relative">
                      <img
                        src={settings.logo}
                        alt="Logo"
                        className="h-20 w-20 rounded-lg object-contain border bg-white p-1"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {settings.logo ? "Changer le logo" : "Télécharger un logo"}
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG ou SVG. Max 500 Ko.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              <Separator />

              {/* Name & Subtitle */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du magasin *</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nom de votre magasin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Sous-titre / Slogan</Label>
                  <Input
                    id="subtitle"
                    value={settings.subtitle || ""}
                    onChange={(e) => handleChange("subtitle", e.target.value)}
                    placeholder="Ex: Opticien diplômé"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={settings.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Rue, numéro..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={settings.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Casablanca, Maroc"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Couleur des factures
              </CardTitle>
              <CardDescription>
                Choisissez la couleur principale pour vos documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-3 sm:grid-cols-12">
                {invoiceColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleChange("primaryColor", color.value)}
                    className={cn(
                      "relative h-10 w-10 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      settings.primaryColor === color.value && "ring-2 ring-offset-2 ring-current"
                    )}
                    style={{ 
                      backgroundColor: color.value,
                      // @ts-ignore - CSS custom property for ring color
                      '--tw-ring-color': color.value,
                    } as React.CSSProperties}
                    title={color.name}
                  >
                    {settings.primaryColor === color.value && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Couleur sélectionnée : <span className="font-medium" style={{ color: settings.primaryColor }}>{invoiceColors.find(c => c.value === settings.primaryColor)?.name || 'Bleu'}</span>
              </p>
            </CardContent>
          </Card>

          {/* Currency Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Devise
              </CardTitle>
              <CardDescription>
                Choisissez la devise pour vos prix et factures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise par défaut</Label>
                <Select 
                  value={settings.currency || 'DH'} 
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.symbol}>
                        {currency.symbol} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Cette devise sera utilisée pour l'affichage des prix dans les factures et documents.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={settings.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+212 5XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contact@magasin.ma"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Site web
                </Label>
                <Input
                  id="website"
                  value={settings.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="www.magasin.ma"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Activez les alertes importantes dans l'application et par email (adresse du magasin).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Stock faible</p>
                  <p className="text-sm text-muted-foreground">Alerte quand un produit passe sous le minimum.</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">App</Label>
                  <Switch
                    checked={settings.notifyLowStockInApp}
                    onCheckedChange={(value) => handleChange("notifyLowStockInApp", value)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">Email</Label>
                  <Switch
                    checked={settings.notifyLowStockEmail}
                    onCheckedChange={(value) => handleChange("notifyLowStockEmail", value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Atelier prêt</p>
                  <p className="text-sm text-muted-foreground">Commande atelier marquée prête.</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">App</Label>
                  <Switch
                    checked={settings.notifyWorkshopReadyInApp}
                    onCheckedChange={(value) => handleChange("notifyWorkshopReadyInApp", value)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">Email</Label>
                  <Switch
                    checked={settings.notifyWorkshopReadyEmail}
                    onCheckedChange={(value) => handleChange("notifyWorkshopReadyEmail", value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Nouveau client</p>
                  <p className="text-sm text-muted-foreground">Un client est ajoute dans votre base.</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">App</Label>
                  <Switch
                    checked={settings.notifyNewClientInApp}
                    onCheckedChange={(value) => handleChange("notifyNewClientInApp", value)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">Email</Label>
                  <Switch
                    checked={settings.notifyNewClientEmail}
                    onCheckedChange={(value) => handleChange("notifyNewClientEmail", value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Nouvelle facture</p>
                  <p className="text-sm text-muted-foreground">Une facture vient d'etre creee.</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">App</Label>
                  <Switch
                    checked={settings.notifyInvoiceCreatedInApp}
                    onCheckedChange={(value) => handleChange("notifyInvoiceCreatedInApp", value)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label className="text-sm">Email</Label>
                  <Switch
                    checked={settings.notifyInvoiceCreatedEmail}
                    onCheckedChange={(value) => handleChange("notifyInvoiceCreatedEmail", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations légales
              </CardTitle>
              <CardDescription>
                Informations fiscales et administratives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ice">ICE (Identifiant Commun Entreprise)</Label>
                  <Input
                    id="ice"
                    value={settings.ice || ""}
                    onChange={(e) => handleChange("ice", e.target.value)}
                    placeholder="000000000000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rc">Registre de Commerce (RC)</Label>
                  <Input
                    id="rc"
                    value={settings.rc || ""}
                    onChange={(e) => handleChange("rc", e.target.value)}
                    placeholder="N° RC"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="patente">Patente</Label>
                  <Input
                    id="patente"
                    value={settings.patente || ""}
                    onChange={(e) => handleChange("patente", e.target.value)}
                    placeholder="N° Patente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnss">CNSS</Label>
                  <Input
                    id="cnss"
                    value={settings.cnss || ""}
                    onChange={(e) => handleChange("cnss", e.target.value)}
                    placeholder="N° CNSS"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informations bancaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="rib">RIB (Relevé d'Identité Bancaire)</Label>
                <Input
                  id="rib"
                  value={settings.rib || ""}
                  onChange={(e) => handleChange("rib", e.target.value)}
                  placeholder="Numéro RIB"
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer Text Card */}
          <Card>
            <CardHeader>
              <CardTitle>Message de pied de page</CardTitle>
              <CardDescription>
                Ce message apparaîtra en bas de vos factures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.footerText || ""}
                onChange={(e) => handleChange("footerText", e.target.value)}
                placeholder="Merci pour votre confiance !"
                rows={2}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Parametres;
