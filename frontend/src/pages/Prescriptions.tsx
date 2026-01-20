import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Calendar, AlertTriangle, CheckCircle, FileSpreadsheet, Upload } from "lucide-react";
import { Prescription, Client } from "@/types/client";
import { format, isPast, isFuture, addMonths, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { PrescriptionForm } from "@/components/clients/PrescriptionForm";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const mapPrescription = (prescription: {
    id: number | string;
    client_id: number | string;
    date: string;
    prescriber?: string | null;
    expiry_date?: string | null;
    od_sphere?: number | null;
    od_cylinder?: number | null;
    od_axis?: number | null;
    od_addition?: number | null;
    od_pd?: number | null;
    og_sphere?: number | null;
    og_cylinder?: number | null;
    og_axis?: number | null;
    og_addition?: number | null;
    og_pd?: number | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
  }): Prescription => ({
    id: String(prescription.id),
    clientId: String(prescription.client_id),
    date: prescription.date,
    prescriber: prescription.prescriber ?? undefined,
    expiryDate: prescription.expiry_date ?? undefined,
    odSphere: prescription.od_sphere ?? undefined,
    odCylinder: prescription.od_cylinder ?? undefined,
    odAxis: prescription.od_axis ?? undefined,
    odAddition: prescription.od_addition ?? undefined,
    odPd: prescription.od_pd ?? undefined,
    ogSphere: prescription.og_sphere ?? undefined,
    ogCylinder: prescription.og_cylinder ?? undefined,
    ogAxis: prescription.og_axis ?? undefined,
    ogAddition: prescription.og_addition ?? undefined,
    ogPd: prescription.og_pd ?? undefined,
    notes: prescription.notes ?? undefined,
    createdAt: prescription.created_at,
    updatedAt: prescription.updated_at,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, prescriptionsData] = await Promise.all([
          apiFetch<{
            id: number | string;
            first_name: string;
            last_name: string;
            email?: string | null;
            phone: string;
            address?: string | null;
            date_of_birth?: string | null;
            notes?: string | null;
            created_at: string;
            updated_at: string;
          }[]>("/api/clients"),
          apiFetch<{
            id: number | string;
            client_id: number | string;
            date: string;
            prescriber?: string | null;
            expiry_date?: string | null;
            od_sphere?: number | null;
            od_cylinder?: number | null;
            od_axis?: number | null;
            od_addition?: number | null;
            od_pd?: number | null;
            og_sphere?: number | null;
            og_cylinder?: number | null;
            og_axis?: number | null;
            og_addition?: number | null;
            og_pd?: number | null;
            notes?: string | null;
            created_at: string;
            updated_at: string;
          }[]>("/api/prescriptions"),
        ]);

        setClients(
          clientsData.map((client) => ({
            id: String(client.id),
            firstName: client.first_name,
            lastName: client.last_name,
            email: client.email ?? undefined,
            phone: client.phone,
            address: client.address ?? undefined,
            dateOfBirth: client.date_of_birth ?? undefined,
            notes: client.notes ?? undefined,
            createdAt: client.created_at,
            updatedAt: client.updated_at,
          }))
        );

        setPrescriptions(prescriptionsData.map(mapPrescription));
      } catch (error) {
        console.error("Prescriptions load error:", error);
        setPrescriptions([]);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Client inconnu";
  };

  const getClientPhone = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.phone || "-";
  };

  const parseDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : null;
  };

  const formatDateValue = (
    value: string | undefined,
    pattern: string,
    withLocale: boolean = false,
    emptyFallback: string = "-"
  ) => {
    const parsed = parseDate(value);
    if (!parsed) return emptyFallback;
    return withLocale ? format(parsed, pattern, { locale: fr }) : format(parsed, pattern);
  };

  const getPrescriptionStatus = (prescription: Prescription) => {
    const expiry = parseDate(prescription.expiryDate);
    if (!expiry) return "valid";
    if (isPast(expiry)) return "expired";
    if (isFuture(addMonths(new Date(), -1)) && expiry <= addMonths(new Date(), 1)) return "expiring";
    return "valid";
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const clientName = getClientName(prescription.clientId).toLowerCase();
    const matchesSearch = clientName.includes(searchTerm.toLowerCase()) ||
      prescription.prescriber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && getPrescriptionStatus(prescription) === statusFilter;
  });

  // Sort by date, most recent first
  const sortedPrescriptions = [...filteredPrescriptions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatOpticalValue = (value?: number) => {
    if (value === undefined || value === null) return "-";
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) return "-";
    return numeric > 0 ? `+${numeric.toFixed(2)}` : numeric.toFixed(2);
  };

  const stats = {
    total: prescriptions.length,
    valid: prescriptions.filter(p => getPrescriptionStatus(p) === "valid").length,
    expiring: prescriptions.filter(p => getPrescriptionStatus(p) === "expiring").length,
    expired: prescriptions.filter(p => getPrescriptionStatus(p) === "expired").length,
  };

  const handleCreatePrescription = (prescription: Prescription) => {
    apiFetch<{
      id: number | string;
      client_id: number | string;
      date: string;
      prescriber?: string | null;
      expiry_date?: string | null;
      od_sphere?: number | null;
      od_cylinder?: number | null;
      od_axis?: number | null;
      od_addition?: number | null;
      od_pd?: number | null;
      og_sphere?: number | null;
      og_cylinder?: number | null;
      og_axis?: number | null;
      og_addition?: number | null;
      og_pd?: number | null;
      notes?: string | null;
      created_at: string;
      updated_at: string;
    }>(`/api/clients/${prescription.clientId}/prescriptions`, {
      method: "POST",
      body: JSON.stringify({
        date: prescription.date,
        prescriber: prescription.prescriber || null,
        expiry_date: prescription.expiryDate || null,
        od_sphere: prescription.odSphere ?? null,
        od_cylinder: prescription.odCylinder ?? null,
        od_axis: prescription.odAxis ?? null,
        od_addition: prescription.odAddition ?? null,
        od_pd: prescription.odPd ?? null,
        og_sphere: prescription.ogSphere ?? null,
        og_cylinder: prescription.ogCylinder ?? null,
        og_axis: prescription.ogAxis ?? null,
        og_addition: prescription.ogAddition ?? null,
        og_pd: prescription.ogPd ?? null,
        notes: prescription.notes || null,
      }),
    })
      .then((created) => {
        const mapped = mapPrescription(created);
        setPrescriptions((prev) => [mapped, ...prev]);
        setIsCreateOpen(false);
        setSelectedClientId("");
        toast({
          title: "Prescription créée",
          description: "La prescription a été ajoutée avec succès.",
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de créer la prescription.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  // Export prescriptions to CSV
  const handleExportCSV = () => {
    if (prescriptions.length === 0) {
      toast({
        title: "Aucune prescription",
        description: "Il n'y a aucune prescription à exporter.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Client",
      "Téléphone",
      "Date",
      "Prescripteur",
      "Date d'expiration",
      "OD Sphère",
      "OD Cylindre",
      "OD Axe",
      "OD Addition",
      "OD EP",
      "OG Sphère",
      "OG Cylindre",
      "OG Axe",
      "OG Addition",
      "OG EP",
      "Notes"
    ];

    const rows = prescriptions.map((p) => {
      const clientName = getClientName(p.clientId);
      const clientPhone = getClientPhone(p.clientId);
      return [
        clientName,
        clientPhone,
        formatDateValue(p.date, "dd/MM/yyyy", false, ""),
        p.prescriber || "",
        formatDateValue(p.expiryDate, "dd/MM/yyyy", false, ""),
        p.odSphere?.toString() || "",
        p.odCylinder?.toString() || "",
        p.odAxis?.toString() || "",
        p.odAddition?.toString() || "",
        p.odPd?.toString() || "",
        p.ogSphere?.toString() || "",
        p.ogCylinder?.toString() || "",
        p.ogAxis?.toString() || "",
        p.ogAddition?.toString() || "",
        p.ogPd?.toString() || "",
        p.notes || ""
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prescriptions_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${prescriptions.length} prescription(s) exportée(s) en CSV.`,
    });
  };

  // Import prescriptions from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Fichier invalide",
            description: "Le fichier CSV doit contenir au moins un en-tête et une ligne de données.",
            variant: "destructive",
          });
          return;
        }

        const dataLines = lines.slice(1);
        const importedPrescriptions: Prescription[] = [];
        let skipped = 0;

        dataLines.forEach((line) => {
          // Parse CSV line
          const values: string[] = [];
          let current = "";
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ";" && !inQuotes) {
              values.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const [
            clientName, clientPhone, dateStr, prescriber, expiryDateStr,
            odSphere, odCylinder, odAxis, odAddition, odPd,
            ogSphere, ogCylinder, ogAxis, ogAddition, ogPd,
            notes
          ] = values.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"').trim());

          // Find client by phone or name
          const client = clients.find(c => 
            c.phone === clientPhone || 
            `${c.firstName} ${c.lastName}`.toLowerCase() === clientName?.toLowerCase()
          );

          if (!client) {
            skipped++;
            return;
          }

          const normalizeDate = (value: string): Date | null => {
            const trimmed = value.trim();
            if (!trimmed) return null;
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
              const parsed = new Date(trimmed);
              return isNaN(parsed.getTime()) ? null : parsed;
            }
            const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (match) {
              const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
              return isNaN(parsed.getTime()) ? null : parsed;
            }
            return null;
          };

          const parsedDate = normalizeDate(dateStr);
          if (!parsedDate) {
            skipped++;
            return;
          }

          const parsedExpiryDate = expiryDateStr ? normalizeDate(expiryDateStr) : null;

          importedPrescriptions.push({
            id: crypto.randomUUID(),
            clientId: client.id,
            date: parsedDate.toISOString().split('T')[0],
            prescriber: prescriber || undefined,
            expiryDate: parsedExpiryDate?.toISOString().split('T')[0],
            odSphere: odSphere ? parseFloat(odSphere) : undefined,
            odCylinder: odCylinder ? parseFloat(odCylinder) : undefined,
            odAxis: odAxis ? parseInt(odAxis) : undefined,
            odAddition: odAddition ? parseFloat(odAddition) : undefined,
            odPd: odPd ? parseFloat(odPd) : undefined,
            ogSphere: ogSphere ? parseFloat(ogSphere) : undefined,
            ogCylinder: ogCylinder ? parseFloat(ogCylinder) : undefined,
            ogAxis: ogAxis ? parseInt(ogAxis) : undefined,
            ogAddition: ogAddition ? parseFloat(ogAddition) : undefined,
            ogPd: ogPd ? parseFloat(ogPd) : undefined,
            notes: notes || undefined,
          });
        });

        if (importedPrescriptions.length === 0) {
          toast({
            title: "Aucune prescription importée",
            description: skipped > 0 
              ? `${skipped} ligne(s) ignorée(s) (client introuvable ou données invalides).`
              : "Le fichier ne contient aucune donnée valide.",
            variant: "destructive",
          });
          return;
        }

        apiFetch<{
          id: number | string;
          client_id: number | string;
          date: string;
          prescriber?: string | null;
          expiry_date?: string | null;
          od_sphere?: number | null;
          od_cylinder?: number | null;
          od_axis?: number | null;
          od_addition?: number | null;
          od_pd?: number | null;
          og_sphere?: number | null;
          og_cylinder?: number | null;
          og_axis?: number | null;
          og_addition?: number | null;
          og_pd?: number | null;
          notes?: string | null;
          created_at: string;
          updated_at: string;
        }[]>("/api/prescriptions/import", {
          method: "POST",
          body: JSON.stringify({
            prescriptions: importedPrescriptions.map((prescription) => ({
              client_id: prescription.clientId,
              date: prescription.date,
              prescriber: prescription.prescriber || null,
              expiry_date: prescription.expiryDate || null,
              od_sphere: prescription.odSphere ?? null,
              od_cylinder: prescription.odCylinder ?? null,
              od_axis: prescription.odAxis ?? null,
              od_addition: prescription.odAddition ?? null,
              od_pd: prescription.odPd ?? null,
              og_sphere: prescription.ogSphere ?? null,
              og_cylinder: prescription.ogCylinder ?? null,
              og_axis: prescription.ogAxis ?? null,
              og_addition: prescription.ogAddition ?? null,
              og_pd: prescription.ogPd ?? null,
              notes: prescription.notes || null,
            })),
          }),
        })
          .then((created) => {
            const mapped = created.map(mapPrescription);
            setPrescriptions((prev) => [...mapped, ...prev]);
            toast({
              title: "Import réussi",
              description: `${mapped.length} prescription(s) importée(s).${skipped > 0 ? ` ${skipped} ligne(s) ignorée(s).` : ""}`,
            });
          })
          .catch((error) => {
            const message = error instanceof Error ? error.message : "Impossible d'importer les prescriptions.";
            toast({
              title: "Erreur d'import",
              description: message,
              variant: "destructive",
            });
          });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Erreur d'import",
          description: "Le format du fichier CSV est invalide.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
            <p className="text-muted-foreground mt-1">
              Toutes les ordonnances optiques de vos clients
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) {
                  setSelectedClientId("");
                }
              }}
            >
              <Button
                onClick={() => setIsCreateOpen(true)}
                disabled={clients.length === 0}
              >
                Nouvelle prescription
              </Button>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvelle prescription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Client</p>
                    <Select
                      value={selectedClientId}
                      onValueChange={setSelectedClientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedClientId && (
                    <PrescriptionForm
                      clientId={selectedClientId}
                      onSubmit={handleCreatePrescription}
                      onCancel={() => setIsCreateOpen(false)}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExportCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Importer CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">prescriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valides</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
              <p className="text-xs text-muted-foreground">en cours de validité</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bientôt expirées</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.expiring}</div>
              <p className="text-xs text-muted-foreground">dans moins d'1 mois</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirées</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">à renouveler</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par client ou prescripteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="valid">Valides</SelectItem>
              <SelectItem value="expiring">Bientôt expirées</SelectItem>
              <SelectItem value="expired">Expirées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Prescripteur</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Chargement des prescriptions...
                  </TableCell>
                </TableRow>
              ) : sortedPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Aucune prescription trouvée
                  </TableCell>
                </TableRow>
              ) : (
                sortedPrescriptions.map((prescription) => {
                  const status = getPrescriptionStatus(prescription);
                  return (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        {getClientName(prescription.clientId)}
                      </TableCell>
                      <TableCell>{getClientPhone(prescription.clientId)}</TableCell>
                      <TableCell>
                        {formatDateValue(prescription.date, "dd MMM yyyy", true)}
                      </TableCell>
                      <TableCell>{prescription.prescriber || "-"}</TableCell>
                      <TableCell>
                        {formatDateValue(prescription.expiryDate, "dd MMM yyyy", true)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "valid"
                              ? "default"
                              : status === "expiring"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            status === "valid"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : status === "expiring"
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : ""
                          }
                        >
                          {status === "valid" && "Valide"}
                          {status === "expiring" && "Bientôt expirée"}
                          {status === "expired" && "Expirée"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPrescription(prescription)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Prescription Details Dialog */}
        <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Détails de la prescription
              </DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-6">
                {/* Client Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{getClientName(selectedPrescription.clientId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{getClientPhone(selectedPrescription.clientId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de prescription</p>
                    <p className="font-medium">
                      {formatDateValue(selectedPrescription.date, "dd MMMM yyyy", true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prescripteur</p>
                    <p className="font-medium">{selectedPrescription.prescriber || "-"}</p>
                  </div>
                </div>

                {/* Optical Data */}
                <div>
                  <h4 className="font-semibold mb-3">Données optiques</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4">Œil</th>
                          <th className="text-center py-2 px-2">Sphère</th>
                          <th className="text-center py-2 px-2">Cylindre</th>
                          <th className="text-center py-2 px-2">Axe</th>
                          <th className="text-center py-2 px-2">Addition</th>
                          <th className="text-center py-2 px-2">EP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4 font-medium">OD (Droit)</td>
                          <td className="text-center py-2 px-2">{formatOpticalValue(selectedPrescription.odSphere)}</td>
                          <td className="text-center py-2 px-2">{formatOpticalValue(selectedPrescription.odCylinder)}</td>
                          <td className="text-center py-2 px-2">{selectedPrescription.odAxis ?? "-"}°</td>
                          <td className="text-center py-2 px-2">{formatOpticalValue(selectedPrescription.odAddition)}</td>
                          <td className="text-center py-2 px-2">{selectedPrescription.odPd ?? "-"}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium">OG (Gauche)</td>
                          <td className="text-center py-2 px-2">{formatOpticalValue(selectedPrescription.ogSphere)}</td>
                          <td className="text-center py-2 px-2">{formatOpticalValue(selectedPrescription.ogCylinder)}</td>
                          <td className="text-center py-2 px-2">{selectedPrescription.ogAxis ?? "-"}°</td>
                          <td className="text-center py-2 px-2">{formatOpticalValue(selectedPrescription.ogAddition)}</td>
                          <td className="text-center py-2 px-2">{selectedPrescription.ogPd ?? "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedPrescription.notes}
                    </p>
                  </div>
                )}

                {/* Expiry Warning */}
                {selectedPrescription.expiryDate && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    getPrescriptionStatus(selectedPrescription) === "expired"
                      ? "bg-red-50 text-red-700"
                      : getPrescriptionStatus(selectedPrescription) === "expiring"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-green-50 text-green-700"
                  }`}>
                    {getPrescriptionStatus(selectedPrescription) === "expired" ? (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Cette prescription a expiré le {formatDateValue(selectedPrescription.expiryDate, "dd MMMM yyyy", true)}
                        </span>
                      </>
                    ) : getPrescriptionStatus(selectedPrescription) === "expiring" ? (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Cette prescription expire bientôt ({formatDateValue(selectedPrescription.expiryDate, "dd MMMM yyyy", true)})
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Valide jusqu'au {formatDateValue(selectedPrescription.expiryDate, "dd MMMM yyyy", true)}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Prescriptions;
