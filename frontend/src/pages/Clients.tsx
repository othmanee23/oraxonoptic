import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
import { UserPlus, Search, MoreHorizontal, Pencil, History, Eye, Trash2, Phone, Mail, FileSpreadsheet, Upload } from "lucide-react";
import { Client, Purchase, Prescription } from "@/types/client";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { useToast } from "@/hooks/use-toast";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/contexts/StoreContext";
import { apiFetch } from "@/lib/api";


export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [purchasesByClient, setPurchasesByClient] = useState<Record<string, Purchase[]>>({});
  const [prescriptionsByClient, setPrescriptionsByClient] = useState<Record<string, Prescription[]>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermission();
  const { storeSettings } = useStore();
  const currency = storeSettings.currency || "DH";

  const resolvePurchaseStatus = (amountPaid: number, amountDue: number) => {
    if (amountDue <= 0) return "paid";
    if (amountPaid > 0) return "partial";
    return "pending";
  };

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await apiFetch<{
          id: number | string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone: string;
          address?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          invoices_count?: number;
          invoices_sum_total?: string | number | null;
          latest_invoice?: {
            id: number | string;
            total: string | number;
            amount_paid: string | number;
            amount_due: string | number;
            status?: string | null;
            created_at: string;
            paid_at?: string | null;
            validated_at?: string | null;
          } | null;
          created_at: string;
          updated_at: string;
        }[]>("/api/clients");
        const mapped = data.map((client) => ({
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
          purchasesCount: client.invoices_count ?? 0,
          totalSpent: Number(client.invoices_sum_total ?? 0),
          latestInvoice: client.latest_invoice
            ? {
                id: String(client.latest_invoice.id),
                total: Number(client.latest_invoice.total),
                amountPaid: Number(client.latest_invoice.amount_paid),
                amountDue: Number(client.latest_invoice.amount_due),
                status: client.latest_invoice.status ?? undefined,
                createdAt: client.latest_invoice.created_at,
                paidAt: client.latest_invoice.paid_at ?? undefined,
                validatedAt: client.latest_invoice.validated_at ?? undefined,
              }
            : undefined,
        }));
        setClients(mapped);
      } catch (error) {
        console.error("Clients load error:", error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

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

  const mapPurchase = (invoice: {
    id: number | string;
    client_id: number | string;
    invoice_number: string;
    total: string | number;
    amount_paid: string | number;
    amount_due: string | number;
    status: string;
    created_at: string;
    paid_at?: string | null;
    validated_at?: string | null;
    items: Array<{
      id: number | string;
      product_name: string;
      quantity: number;
      unit_price: string | number;
      total: string | number;
    }>;
  }): Purchase => {
    const total = Number(invoice.total);
    const amountPaid = Number(invoice.amount_paid);
    const amountDue = Number(invoice.amount_due);
    const status =
      amountDue <= 0 ? "paid" : amountPaid > 0 ? "partial" : "pending";

    return {
      id: String(invoice.id),
      clientId: String(invoice.client_id),
      date: invoice.paid_at || invoice.validated_at || invoice.created_at,
      products: invoice.items.map((item) => ({
        id: String(item.id),
        name: item.product_name,
        type: "autre",
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        total: Number(item.total),
      })),
      total,
      status,
      invoiceNumber: invoice.invoice_number,
    };
  };

  const loadClientDetails = useCallback(async (clientId: string) => {
    setDetailsLoading(true);
    try {
      const [prescriptionsData, purchasesData] = await Promise.all([
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
        }[]>(`/api/clients/${clientId}/prescriptions`),
        apiFetch<{
          id: number | string;
          client_id: number | string;
          invoice_number: string;
          total: string | number;
          amount_paid: string | number;
          amount_due: string | number;
          status: string;
          created_at: string;
          paid_at?: string | null;
          validated_at?: string | null;
          items: Array<{
            id: number | string;
            product_name: string;
            quantity: number;
            unit_price: string | number;
            total: string | number;
          }>;
        }[]>(`/api/clients/${clientId}/purchases`),
      ]);

      setPrescriptionsByClient((prev) => ({
        ...prev,
        [clientId]: prescriptionsData.map(mapPrescription),
      }));
      setPurchasesByClient((prev) => ({
        ...prev,
        [clientId]: purchasesData.map(mapPurchase),
      }));
    } catch (error) {
      console.error("Client details load error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du client.",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!viewingClient) return;
    const clientId = viewingClient.id;
    if (prescriptionsByClient[clientId] || purchasesByClient[clientId]) return;
    loadClientDetails(clientId);
  }, [viewingClient, prescriptionsByClient, purchasesByClient, loadClientDetails]);

  const getClientPrescriptions = (clientId: string) => {
    return prescriptionsByClient[clientId] || [];
  };

  const handleAddPrescription = (prescription: Prescription) => {
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
        setPrescriptionsByClient((prev) => ({
          ...prev,
          [mapped.clientId]: [mapped, ...(prev[mapped.clientId] || [])],
        }));
        toast({
          title: "Prescription ajoutée",
          description: "La prescription a été enregistrée avec succès.",
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible d'ajouter la prescription.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleUpdatePrescription = (updatedPrescription: Prescription) => {
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
    }>(`/api/prescriptions/${updatedPrescription.id}`, {
      method: "PUT",
      body: JSON.stringify({
        date: updatedPrescription.date,
        prescriber: updatedPrescription.prescriber || null,
        expiry_date: updatedPrescription.expiryDate || null,
        od_sphere: updatedPrescription.odSphere ?? null,
        od_cylinder: updatedPrescription.odCylinder ?? null,
        od_axis: updatedPrescription.odAxis ?? null,
        od_addition: updatedPrescription.odAddition ?? null,
        od_pd: updatedPrescription.odPd ?? null,
        og_sphere: updatedPrescription.ogSphere ?? null,
        og_cylinder: updatedPrescription.ogCylinder ?? null,
        og_axis: updatedPrescription.ogAxis ?? null,
        og_addition: updatedPrescription.ogAddition ?? null,
        og_pd: updatedPrescription.ogPd ?? null,
        notes: updatedPrescription.notes || null,
      }),
    })
      .then((updated) => {
        const mapped = mapPrescription(updated);
        setPrescriptionsByClient((prev) => ({
          ...prev,
          [mapped.clientId]: (prev[mapped.clientId] || []).map((p) =>
            p.id === mapped.id ? mapped : p
          ),
        }));
        toast({
          title: "Prescription modifiée",
          description: "La prescription a été mise à jour.",
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier la prescription.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    if (!viewingClient) return;

    apiFetch(`/api/prescriptions/${prescriptionId}`, { method: "DELETE" })
      .then(() => {
        setPrescriptionsByClient((prev) => ({
          ...prev,
          [viewingClient.id]: (prev[viewingClient.id] || []).filter(
            (p) => p.id !== prescriptionId
          ),
        }));
        toast({
          title: "Prescription supprimée",
          description: "La prescription a été supprimée.",
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de supprimer la prescription.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleCreateClient = (newClient: Client) => {
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
    }>("/api/clients", {
      method: "POST",
      body: JSON.stringify({
        first_name: newClient.firstName,
        last_name: newClient.lastName,
        email: newClient.email || null,
        phone: newClient.phone,
        address: newClient.address || null,
        date_of_birth: newClient.dateOfBirth || null,
        notes: newClient.notes || null,
      }),
    })
      .then((client) => {
        const mapped: Client = {
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
        };
        setClients((prev) => [mapped, ...prev]);
        setIsCreateOpen(false);
        toast({
          title: "Client créé",
          description: `${mapped.firstName} ${mapped.lastName} a été ajouté avec succès.`,
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de créer le client.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleUpdateClient = (updatedClient: Client) => {
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
    }>(`/api/clients/${updatedClient.id}`, {
      method: "PUT",
      body: JSON.stringify({
        first_name: updatedClient.firstName,
        last_name: updatedClient.lastName,
        email: updatedClient.email || null,
        phone: updatedClient.phone,
        address: updatedClient.address || null,
        date_of_birth: updatedClient.dateOfBirth || null,
        notes: updatedClient.notes || null,
      }),
    })
      .then((client) => {
        const mapped: Client = {
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
        };
        setClients((prev) => prev.map((c) => (c.id === mapped.id ? mapped : c)));
        setEditingClient(null);
        toast({
          title: "Client modifié",
          description: `Les informations de ${mapped.firstName} ${mapped.lastName} ont été mises à jour.`,
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier le client.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    apiFetch(`/api/clients/${clientId}`, { method: "DELETE" })
      .then(() => {
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        setPrescriptionsByClient((prev) => {
          const next = { ...prev };
          delete next[clientId];
          return next;
        });
        setPurchasesByClient((prev) => {
          const next = { ...prev };
          delete next[clientId];
          return next;
        });
        toast({
          title: "Client supprimé",
          description: `${client.firstName} ${client.lastName} a été supprimé.`,
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de supprimer le client.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const getClientPurchases = (clientId: string) => {
    return purchasesByClient[clientId] || [];
  };

  const getClientTotalSpent = (clientId: string) => {
    return (purchasesByClient[clientId] || []).reduce((sum, p) => sum + p.total, 0);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export clients to CSV
  const handleExportCSV = () => {
    if (clients.length === 0) {
      toast({
        title: "Aucun client",
        description: "Il n'y a aucun client à exporter.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Prénom",
      "Nom",
      "Téléphone",
      "Email",
      "Adresse",
      "Date de naissance",
      "Notes",
      "Date de création"
    ];

    const rows = clients.map((client) => {
      return [
        client.firstName,
        client.lastName,
        client.phone,
        client.email || "",
        client.address || "",
        client.dateOfBirth || "",
        client.notes || "",
        format(new Date(client.createdAt), "dd/MM/yyyy", { locale: fr })
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clients_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${clients.length} client(s) exporté(s) en CSV.`,
    });
  };

  // Import clients from CSV
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

        const headerLine = lines[0] || "";
        const headerLower = headerLine.toLowerCase();
        const hasStoreColumn = headerLower.includes("magasin");
        const hasCreatedAt =
          headerLower.includes("date de création") || headerLower.includes("date de creation");
        const notesIndex = hasStoreColumn ? 7 : 6;

        // Skip header line
        const dataLines = lines.slice(1);
        const now = new Date().toISOString();
        
        const importedClients: Client[] = [];
        let skipped = 0;

        const normalizeDate = (value: string): string => {
          const trimmed = value.trim();
          if (!trimmed) return "";
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
          }
          const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (match) {
            return `${match[3]}-${match[2]}-${match[1]}`;
          }
          return trimmed;
        };

        dataLines.forEach((line) => {
          // Parse CSV line (handle quoted values with semicolons)
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

          const normalizedValues = values.map(
            v => v.replace(/^"|"$/g, "").replace(/""/g, '"').trim()
          );
          const [firstName, lastName, phone, email, address, rawDateOfBirth] = normalizedValues;
          const dateOfBirth = normalizeDate(rawDateOfBirth || "");
          let notes = "";
          if (normalizedValues.length > notesIndex) {
            notes = normalizedValues[notesIndex] || "";
          } else if (!hasCreatedAt && normalizedValues.length >= 7) {
            notes = normalizedValues[6] || "";
          }

          // Validate required fields
          if (!firstName || !lastName || !phone) {
            skipped++;
            return;
          }

          // Check for duplicates (by phone)
          const exists = clients.some(c => c.phone === phone) || importedClients.some(c => c.phone === phone);
          if (exists) {
            skipped++;
            return;
          }

          // Find store by name or use default
          importedClients.push({
            id: crypto.randomUUID(),
            firstName,
            lastName,
            phone,
            email: email || undefined,
            address: address || undefined,
            dateOfBirth: dateOfBirth || undefined,
            notes: notes || undefined,
            createdAt: now,
            updatedAt: now,
          });
        });

        if (importedClients.length === 0) {
          toast({
            title: "Aucun client importé",
            description: skipped > 0 
              ? `${skipped} ligne(s) ignorée(s) (données manquantes ou doublons).`
              : "Le fichier ne contient aucune donnée valide.",
            variant: "destructive",
          });
          return;
        }

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
        }[]>("/api/clients/import", {
          method: "POST",
          body: JSON.stringify({
            clients: importedClients.map((client) => ({
              first_name: client.firstName,
              last_name: client.lastName,
              email: client.email || null,
              phone: client.phone,
              address: client.address || null,
              date_of_birth: client.dateOfBirth || null,
              notes: client.notes || null,
            })),
          }),
        })
          .then((createdClients) => {
            const mapped = createdClients.map((client) => ({
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
            }));
            setClients((prev) => [...mapped, ...prev]);
            toast({
              title: "Import réussi",
              description: `${mapped.length} client(s) importé(s).${skipped > 0 ? ` ${skipped} ligne(s) ignorée(s).` : ""}`,
            });
          })
          .catch((error) => {
            const message = error instanceof Error ? error.message : "Impossible d'importer les clients.";
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
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ProtectedRoute module="clients" action="view">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clients</h1>
              <p className="text-muted-foreground">
                {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""} affiché{filteredClients.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
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
              {canCreate("clients") && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Nouveau client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Nouveau client</DialogTitle>
                      <DialogDescription>
                        Remplissez les informations pour créer un nouveau dossier client.
                      </DialogDescription>
                    </DialogHeader>
                    <ClientForm onSubmit={handleCreateClient} onCancel={() => setIsCreateOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, téléphone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Clients Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Total achats</TableHead>
                  <TableHead>Dernier achat</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Chargement des clients...
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const clientPurchases = getClientPurchases(client.id);
                    const totalSpent = client.totalSpent ?? getClientTotalSpent(client.id);
                    const purchasesCount = client.purchasesCount ?? clientPurchases.length;
                    const lastInvoice = client.latestInvoice;
                    const lastPurchase = lastInvoice
                      ? {
                          date: lastInvoice.paidAt || lastInvoice.validatedAt || lastInvoice.createdAt,
                          status: resolvePurchaseStatus(lastInvoice.amountPaid, lastInvoice.amountDue),
                        }
                      : clientPurchases.sort(
                          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                        )[0];

                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {client.firstName.charAt(0)}
                              {client.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {client.firstName} {client.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Client depuis {new Date(client.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {client.phone}
                            </div>
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{totalSpent.toLocaleString("fr-FR")} {currency}</span>
                          <p className="text-sm text-muted-foreground">
                            {purchasesCount} achat{purchasesCount > 1 ? "s" : ""}
                          </p>
                        </TableCell>
                        <TableCell>
                          {lastPurchase ? (
                            <div>
                              <p className="text-sm">
                                {new Date(lastPurchase.date).toLocaleDateString("fr-FR")}
                              </p>
                              <Badge
                                variant={
                                  lastPurchase.status === "paid"
                                    ? "success"
                                    : lastPurchase.status === "partial"
                                    ? "warning"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {lastPurchase.status === "paid"
                                  ? "Payé"
                                  : lastPurchase.status === "partial"
                                  ? "Partiel"
                                  : "En attente"}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingClient(client)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le dossier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setViewingClient(client)}>
                                <History className="mr-2 h-4 w-4" />
                                Historique achats
                              </DropdownMenuItem>
                              {canEdit("clients") && (
                                <DropdownMenuItem onClick={() => setEditingClient(client)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                              )}
                              {canDelete("clients") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit Client Dialog */}
        <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations du client.
              </DialogDescription>
            </DialogHeader>
            {editingClient && (
              <ClientForm
                client={editingClient}
                onSubmit={handleUpdateClient}
                onCancel={() => setEditingClient(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Client Details Dialog */}
        <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Dossier de {viewingClient?.firstName} {viewingClient?.lastName}
              </DialogTitle>
              <DialogDescription>
                Dossier médical et historique des achats
              </DialogDescription>
            </DialogHeader>
            {viewingClient && (
              <>
                {detailsLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Chargement des données...
                  </div>
                ) : (
                  <ClientDetails
                    client={viewingClient}
                    purchases={getClientPurchases(viewingClient.id)}
                    prescriptions={getClientPrescriptions(viewingClient.id)}
                    onAddPrescription={handleAddPrescription}
                    onUpdatePrescription={handleUpdatePrescription}
                    onDeletePrescription={handleDeletePrescription}
                  />
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
