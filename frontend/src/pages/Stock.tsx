import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Tags,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductForm } from "@/components/stock/ProductForm";
import { StockMovementForm } from "@/components/stock/StockMovementForm";
import { CategoryForm } from "@/components/stock/CategoryForm";
import { Product, StockMovement, StockAlert, Category } from "@/types/stock";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/contexts/StoreContext";
import { apiFetch } from "@/lib/api";

const lensTypeLabels: Record<string, string> = {
  journalieres: "Journalières",
  bimensuelles: "Bimensuelles",
  mensuelles: "Mensuelles",
  trimestrielles: "Trimestrielles",
  annuelles: "Annuelles",
};

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { stores, selectedStoreId } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  const activeStoreId = selectedStoreId || stores[0]?.id || "";
  const storeOptions = stores.map((store) => ({ id: store.id, name: store.name }));

  // Helper to get category label
  const getCategoryLabel = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.label || categoryName;
  };

  useEffect(() => {
    if (!activeStoreId) return;

    const loadStockData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, productsData, movementsData] = await Promise.all([
          apiFetch<{
            id: number | string;
            name: string;
            label: string;
            is_default: boolean;
          }[]>("/api/stock/categories"),
          apiFetch<{
            id: number | string;
            reference: string;
            name: string;
            category_id: number | string;
            brand: string;
            description?: string | null;
            purchase_price: string | number;
            selling_price: string | number;
            current_stock: number;
            minimum_stock: number;
            store_id: number | string;
            lens_type?: string | null;
            sphere?: string | null;
            cylinder?: string | null;
            axis?: string | null;
            addition?: string | null;
            base_curve?: string | null;
            diameter?: string | null;
            created_at: string;
            updated_at: string;
          }[]>("/api/stock/products"),
          apiFetch<{
            id: number | string;
            product_id: number | string;
            type: string;
            quantity: number;
            previous_stock: number;
            new_stock: number;
            reason: string;
            from_store_id?: number | string | null;
            to_store_id?: number | string | null;
            reference?: string | null;
            created_by: number | string;
            created_at: string;
          }[]>("/api/stock/movements"),
        ]);

        const mappedCategories = categoriesData.map((category) => ({
          id: String(category.id),
          name: category.name,
          label: category.label,
          isDefault: category.is_default,
        }));
        setCategories(mappedCategories);

        const categoryNameById = new Map(
          mappedCategories.map((category) => [category.id, category.name])
        );

        setProducts(
          productsData.map((product) => ({
            id: String(product.id),
            reference: product.reference,
            name: product.name,
            category: categoryNameById.get(String(product.category_id)) || "divers",
            brand: product.brand,
            description: product.description ?? undefined,
            purchasePrice: Number(product.purchase_price),
            sellingPrice: Number(product.selling_price),
            currentStock: product.current_stock,
            minimumStock: product.minimum_stock,
            storeId: String(product.store_id),
            lensType: (product.lens_type as Product["lensType"]) || undefined,
            sphere: product.sphere ?? undefined,
            cylinder: product.cylinder ?? undefined,
            axis: product.axis ?? undefined,
            addition: product.addition ?? undefined,
            baseCurve: product.base_curve ?? undefined,
            diameter: product.diameter ?? undefined,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
          }))
        );

        setMovements(
          movementsData.map((movement) => ({
            id: String(movement.id),
            productId: String(movement.product_id),
            type: movement.type as StockMovement["type"],
            quantity: movement.quantity,
            previousStock: movement.previous_stock,
            newStock: movement.new_stock,
            reason: movement.reason,
            fromStoreId: movement.from_store_id ? String(movement.from_store_id) : undefined,
            toStoreId: movement.to_store_id ? String(movement.to_store_id) : undefined,
            reference: movement.reference ?? undefined,
            createdBy: String(movement.created_by),
            createdAt: movement.created_at,
          }))
        );
      } catch (error) {
        console.error("Stock load error:", error);
        setCategories([]);
        setProducts([]);
        setMovements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStockData();
  }, [activeStoreId]);

  const handleAddProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!activeStoreId) {
      toast({
        title: "Aucun magasin sélectionné",
        description: "Sélectionnez un magasin pour ajouter un produit.",
        variant: "destructive",
      });
      return;
    }
    apiFetch<{
      id: number | string;
      reference: string;
      name: string;
      category_id: number | string;
      brand: string;
      description?: string | null;
      purchase_price: string | number;
      selling_price: string | number;
      current_stock: number;
      minimum_stock: number;
      store_id: number | string;
      lens_type?: string | null;
      sphere?: string | null;
      cylinder?: string | null;
      axis?: string | null;
      addition?: string | null;
      base_curve?: string | null;
      diameter?: string | null;
      created_at: string;
      updated_at: string;
    }>("/api/stock/products", {
      method: "POST",
      body: JSON.stringify({
        reference: data.reference,
        name: data.name,
        category: data.category,
        brand: data.brand,
        description: data.description || null,
        purchase_price: data.purchasePrice,
        selling_price: data.sellingPrice,
        current_stock: data.currentStock,
        minimum_stock: data.minimumStock,
        lens_type: data.lensType || null,
        sphere: data.sphere || null,
        cylinder: data.cylinder || null,
        axis: data.axis || null,
        addition: data.addition || null,
        base_curve: data.baseCurve || null,
        diameter: data.diameter || null,
      }),
    })
      .then((product) => {
        const category = categories.find((cat) => String(cat.id) === String(product.category_id));
        const mapped: Product = {
          id: String(product.id),
          reference: product.reference,
          name: product.name,
          category: category?.name || data.category,
          brand: product.brand,
          description: product.description ?? undefined,
          purchasePrice: Number(product.purchase_price),
          sellingPrice: Number(product.selling_price),
          currentStock: product.current_stock,
          minimumStock: product.minimum_stock,
          storeId: String(product.store_id),
          lensType: (product.lens_type as Product["lensType"]) || undefined,
          sphere: product.sphere ?? undefined,
          cylinder: product.cylinder ?? undefined,
          axis: product.axis ?? undefined,
          addition: product.addition ?? undefined,
          baseCurve: product.base_curve ?? undefined,
          diameter: product.diameter ?? undefined,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
        };
        setProducts((prev) => [mapped, ...prev]);
        setIsProductDialogOpen(false);
        toast({ title: "Produit ajouté", description: `${mapped.name} a été ajouté au catalogue.` });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible d'ajouter le produit.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleUpdateProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedProduct) return;
    if (!activeStoreId) {
      toast({
        title: "Aucun magasin sélectionné",
        description: "Sélectionnez un magasin pour modifier un produit.",
        variant: "destructive",
      });
      return;
    }
    apiFetch<{
      id: number | string;
      reference: string;
      name: string;
      category_id: number | string;
      brand: string;
      description?: string | null;
      purchase_price: string | number;
      selling_price: string | number;
      current_stock: number;
      minimum_stock: number;
      store_id: number | string;
      lens_type?: string | null;
      sphere?: string | null;
      cylinder?: string | null;
      axis?: string | null;
      addition?: string | null;
      base_curve?: string | null;
      diameter?: string | null;
      created_at: string;
      updated_at: string;
    }>(`/api/stock/products/${selectedProduct.id}`, {
      method: "PUT",
      body: JSON.stringify({
        reference: data.reference,
        name: data.name,
        category: data.category,
        brand: data.brand,
        description: data.description || null,
        purchase_price: data.purchasePrice,
        selling_price: data.sellingPrice,
        current_stock: data.currentStock,
        minimum_stock: data.minimumStock,
        lens_type: data.lensType || null,
        sphere: data.sphere || null,
        cylinder: data.cylinder || null,
        axis: data.axis || null,
        addition: data.addition || null,
        base_curve: data.baseCurve || null,
        diameter: data.diameter || null,
      }),
    })
      .then((product) => {
        const category = categories.find((cat) => String(cat.id) === String(product.category_id));
        const mapped: Product = {
          id: String(product.id),
          reference: product.reference,
          name: product.name,
          category: category?.name || data.category,
          brand: product.brand,
          description: product.description ?? undefined,
          purchasePrice: Number(product.purchase_price),
          sellingPrice: Number(product.selling_price),
          currentStock: product.current_stock,
          minimumStock: product.minimum_stock,
          storeId: String(product.store_id),
          lensType: (product.lens_type as Product["lensType"]) || undefined,
          sphere: product.sphere ?? undefined,
          cylinder: product.cylinder ?? undefined,
          axis: product.axis ?? undefined,
          addition: product.addition ?? undefined,
          baseCurve: product.base_curve ?? undefined,
          diameter: product.diameter ?? undefined,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
        };
        setProducts((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
        setIsProductDialogOpen(false);
        setSelectedProduct(null);
        toast({ title: "Produit modifié", description: `${mapped.name} a été mis à jour.` });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier le produit.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    apiFetch(`/api/stock/products/${productToDelete.id}`, { method: "DELETE" })
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
        toast({ title: "Produit supprimé", description: "Le produit a été supprimé du catalogue." });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de supprimer le produit.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleAddCategory = (data: Omit<Category, 'id' | 'isDefault'>) => {
    apiFetch<{
      id: number | string;
      name: string;
      label: string;
      is_default: boolean;
    }>("/api/stock/categories", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        label: data.label,
      }),
    })
      .then((category) => {
        const mapped: Category = {
          id: String(category.id),
          name: category.name,
          label: category.label,
          isDefault: category.is_default,
        };
        setCategories((prev) => [...prev, mapped]);
        setIsCategoryDialogOpen(false);
        toast({ title: "Catégorie créée", description: `La catégorie "${mapped.label}" a été créée.` });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de créer la catégorie.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleUpdateCategory = (data: Omit<Category, 'id' | 'isDefault'>) => {
    if (!editingCategory) return;
    
    // If name changed and products use old name, update them
    apiFetch<{
      id: number | string;
      name: string;
      label: string;
      is_default: boolean;
    }>(`/api/stock/categories/${editingCategory.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        label: data.label,
      }),
    })
      .then((category) => {
        const mapped: Category = {
          id: String(category.id),
          name: category.name,
          label: category.label,
          isDefault: category.is_default,
        };

        if (editingCategory.name !== mapped.name) {
          setProducts((prev) =>
            prev.map((p) =>
              p.category === editingCategory.name
                ? { ...p, category: mapped.name }
                : p
            )
          );
        }

        setCategories((prev) => prev.map((c) => (c.id === mapped.id ? mapped : c)));
        setEditingCategory(null);
        toast({ title: "Catégorie modifiée", description: `La catégorie "${mapped.label}" a été mise à jour.` });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de modifier la catégorie.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    // Check if any products use this category
    const productsUsingCategory = products.filter(p => p.category === categoryToDelete.name);
    if (productsUsingCategory.length > 0) {
      toast({ 
        title: "Impossible de supprimer", 
        description: `${productsUsingCategory.length} produit(s) utilisent cette catégorie.`,
        variant: "destructive"
      });
      setIsDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }
    apiFetch(`/api/stock/categories/${categoryToDelete.id}`, { method: "DELETE" })
      .then(() => {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setIsDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
        toast({ title: "Catégorie supprimée", description: "La catégorie a été supprimée." });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible de supprimer la catégorie.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleAddMovement = (data: any) => {
    if (!activeStoreId) {
      toast({
        title: "Aucun magasin sélectionné",
        description: "Sélectionnez un magasin pour enregistrer un mouvement.",
        variant: "destructive",
      });
      return;
    }
    apiFetch<{
      id: number | string;
      product_id: number | string;
      type: string;
      quantity: number;
      previous_stock: number;
      new_stock: number;
      reason: string;
      from_store_id?: number | string | null;
      to_store_id?: number | string | null;
      reference?: string | null;
      created_by: number | string;
      created_at: string;
    }>("/api/stock/movements", {
      method: "POST",
      body: JSON.stringify({
        product_id: data.productId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        reference: data.reference || null,
        to_store_id: data.toStoreId || null,
      }),
    })
      .then((movement) => {
        const mappedMovement: StockMovement = {
          id: String(movement.id),
          productId: String(movement.product_id),
          type: movement.type as StockMovement["type"],
          quantity: movement.quantity,
          previousStock: movement.previous_stock,
          newStock: movement.new_stock,
          reason: movement.reason,
          fromStoreId: movement.from_store_id ? String(movement.from_store_id) : undefined,
          toStoreId: movement.to_store_id ? String(movement.to_store_id) : undefined,
          reference: movement.reference ?? undefined,
          createdBy: String(movement.created_by),
          createdAt: movement.created_at,
        };

        setMovements((prev) => [mappedMovement, ...prev]);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === String(movement.product_id)
              ? { ...p, currentStock: movement.new_stock }
              : p
          )
        );
        setIsMovementDialogOpen(false);
        toast({ title: "Mouvement enregistré", description: "Le stock a été mis à jour." });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Impossible d'enregistrer le mouvement.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      });
  };

  const filteredProducts = products.filter(product => {
    if (activeStoreId && product.storeId !== activeStoreId) return false;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredMovements = movements.filter((movement) => {
    if (!activeStoreId) return true;
    const product = products.find((p) => p.id === movement.productId);
    if (product && product.storeId === activeStoreId) return true;
    return movement.fromStoreId === activeStoreId || movement.toStoreId === activeStoreId;
  });

  // Export products to CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast({
        title: "Aucun produit",
        description: "Il n'y a aucun produit à exporter.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Référence",
      "Nom",
      "Catégorie",
      "Marque",
      "Description",
      "Prix d'achat (DH)",
      "Prix de vente (DH)",
      "Stock actuel",
      "Stock minimum",
      "Type de lentille",
      "Sphère",
      "Cylindre",
      "Axe",
      "Addition",
      "Rayon de courbure",
      "Diamètre"
    ];

    const lensTypeLabelsExport: Record<string, string> = {
      journalieres: "Journalières",
      bimensuelles: "Bimensuelles",
      mensuelles: "Mensuelles",
      trimestrielles: "Trimestrielles",
      annuelles: "Annuelles",
    };

    const rows = filteredProducts.map((product) => {
      return [
        product.reference,
        product.name,
        getCategoryLabel(product.category),
        product.brand,
        product.description || "",
        product.purchasePrice.toFixed(2),
        product.sellingPrice.toFixed(2),
        product.currentStock.toString(),
        product.minimumStock.toString(),
        product.lensType ? lensTypeLabelsExport[product.lensType] || product.lensType : "",
        product.sphere || "",
        product.cylinder || "",
        product.axis || "",
        product.addition || "",
        product.baseCurve || "",
        product.diameter || ""
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
    link.download = `produits_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${filteredProducts.length} produit(s) exporté(s) en CSV.`,
    });
  };

  // Import products from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeStoreId) {
      toast({
        title: "Aucun magasin sélectionné",
        description: "Sélectionnez un magasin avant d'importer.",
        variant: "destructive",
      });
      return;
    }
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
        const now = new Date().toISOString();
        
        const lensTypeMap: Record<string, string> = {
          "journalières": "journalieres",
          "bimensuelles": "bimensuelles",
          "mensuelles": "mensuelles",
          "trimestrielles": "trimestrielles",
          "annuelles": "annuelles",
        };

        const importedProducts: Product[] = [];
        let skipped = 0;

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

          const [
            reference, name, categoryLabel, brand, description,
            purchasePriceStr, sellingPriceStr, currentStockStr, minimumStockStr,
            lensTypeStr, sphere, cylinder, axis, addition, baseCurve, diameter
          ] = values.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"').trim());

          // Validate required fields
          if (!reference || !name || !brand) {
            skipped++;
            return;
          }

          // Check for duplicates (by reference)
          const exists = products.some(p => p.reference === reference && p.storeId === activeStoreId) || 
                         importedProducts.some(p => p.reference === reference);
          if (exists) {
            skipped++;
            return;
          }

          // Find category by label or use 'divers'
          const category = categories.find(c => 
            c.label.toLowerCase() === categoryLabel?.toLowerCase() ||
            c.name.toLowerCase() === categoryLabel?.toLowerCase()
          );

          const purchasePrice = parseFloat(purchasePriceStr) || 0;
          const sellingPrice = parseFloat(sellingPriceStr) || 0;
          const currentStock = parseInt(currentStockStr) || 0;
          const minimumStock = parseInt(minimumStockStr) || 5;

          const lensType = lensTypeMap[lensTypeStr?.toLowerCase()] as Product['lensType'];

          importedProducts.push({
            id: crypto.randomUUID(),
            reference,
            name,
            category: category?.name || "divers",
            brand,
            description: description || undefined,
            purchasePrice,
            sellingPrice,
            currentStock,
            minimumStock,
            storeId: activeStoreId,
            lensType: lensType || undefined,
            sphere: sphere || undefined,
            cylinder: cylinder || undefined,
            axis: axis || undefined,
            addition: addition || undefined,
            baseCurve: baseCurve || undefined,
            diameter: diameter || undefined,
            createdAt: now,
            updatedAt: now,
          });
        });

        if (importedProducts.length === 0) {
          toast({
            title: "Aucun produit importé",
            description: skipped > 0 
              ? `${skipped} ligne(s) ignorée(s) (données manquantes ou doublons).`
              : "Le fichier ne contient aucune donnée valide.",
            variant: "destructive",
          });
          return;
        }

        apiFetch<{
          id: number | string;
          reference: string;
          name: string;
          category_id: number | string;
          brand: string;
          description?: string | null;
          purchase_price: string | number;
          selling_price: string | number;
          current_stock: number;
          minimum_stock: number;
          store_id: number | string;
          lens_type?: string | null;
          sphere?: string | null;
          cylinder?: string | null;
          axis?: string | null;
          addition?: string | null;
          base_curve?: string | null;
          diameter?: string | null;
          created_at: string;
          updated_at: string;
        }[]>("/api/stock/products/import", {
          method: "POST",
          body: JSON.stringify({
            products: importedProducts.map((product) => ({
              reference: product.reference,
              name: product.name,
              category: product.category,
              brand: product.brand,
              description: product.description || null,
              purchase_price: product.purchasePrice,
              selling_price: product.sellingPrice,
              current_stock: product.currentStock,
              minimum_stock: product.minimumStock,
              lens_type: product.lensType || null,
              sphere: product.sphere || null,
              cylinder: product.cylinder || null,
              axis: product.axis || null,
              addition: product.addition || null,
              base_curve: product.baseCurve || null,
              diameter: product.diameter || null,
            })),
          }),
        })
          .then((createdProducts) => {
            const mapped = createdProducts.map((product) => {
              const category = categories.find((cat) => String(cat.id) === String(product.category_id));
              return {
                id: String(product.id),
                reference: product.reference,
                name: product.name,
                category: category?.name || "divers",
                brand: product.brand,
                description: product.description ?? undefined,
                purchasePrice: Number(product.purchase_price),
                sellingPrice: Number(product.selling_price),
                currentStock: product.current_stock,
                minimumStock: product.minimum_stock,
                storeId: String(product.store_id),
                lensType: (product.lens_type as Product["lensType"]) || undefined,
                sphere: product.sphere ?? undefined,
                cylinder: product.cylinder ?? undefined,
                axis: product.axis ?? undefined,
                addition: product.addition ?? undefined,
                baseCurve: product.base_curve ?? undefined,
                diameter: product.diameter ?? undefined,
                createdAt: product.created_at,
                updatedAt: product.updated_at,
              };
            });

            setProducts((prev) => [...mapped, ...prev]);
            toast({
              title: "Import réussi",
              description: `${mapped.length} produit(s) importé(s).${skipped > 0 ? ` ${skipped} ligne(s) ignorée(s).` : ""}`,
            });
          })
          .catch((error) => {
            const message = error instanceof Error ? error.message : "Impossible d'importer les produits.";
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

  const stockAlerts: StockAlert[] = filteredProducts
    .filter(p => p.currentStock <= p.minimumStock)
    .map(p => ({
      productId: p.id,
      product: p,
      currentStock: p.currentStock,
      minimumStock: p.minimumStock,
      deficit: p.minimumStock - p.currentStock,
    }))
    .sort((a, b) => b.deficit - a.deficit);

  const stats = {
    totalProducts: filteredProducts.length,
    totalValue: filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0),
    lowStock: stockAlerts.length,
    lensesCount: filteredProducts.filter(p => p.category === 'lentilles').length,
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entree': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sortie': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'transfert': return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default: return <RotateCcw className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entree': return 'Entrée';
      case 'sortie': return 'Sortie';
      case 'transfert': return 'Transfert';
      default: return 'Ajustement';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion du Stock</h1>
            <p className="text-muted-foreground">Catalogue produits, alertes et mouvements</p>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <Button
              variant="outline"
              onClick={() => setIsMovementDialogOpen(true)}
              disabled={!activeStoreId}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Mouvement
            </Button>
            <Button
              onClick={() => { setSelectedProduct(null); setIsProductDialogOpen(true); }}
              disabled={!activeStoreId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau produit
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">dont {stats.lensesCount} lentilles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur du stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalValue.toLocaleString('fr-MA')} MAD</div>
              <p className="text-xs text-muted-foreground">Prix de vente</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
              <p className="text-xs text-muted-foreground">Produits sous le seuil</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mouvements</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movements.length}</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="catalogue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
            <TabsTrigger value="lentilles">Lentilles</TabsTrigger>
            <TabsTrigger value="alertes" className="relative">
              Alertes
              {stockAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {stockAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mouvements">Mouvements</TabsTrigger>
          </TabsList>

          {/* Catalogue Tab */}
          <TabsContent value="catalogue" className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, référence ou marque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setIsCategoryDialogOpen(true)} title="Gérer les catégories">
                <Tags className="h-4 w-4" />
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead className="text-right">Prix vente</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.reference}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell className="text-right">{product.sellingPrice.toLocaleString('fr-MA')} MAD</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={product.currentStock <= product.minimumStock ? "destructive" : "secondary"}
                        >
                          {product.currentStock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedProduct(product); setIsViewDialogOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedProduct(product); setIsProductDialogOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setProductToDelete(product); setIsDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Lentilles Tab */}
          <TabsContent value="lentilles" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sphère</TableHead>
                    <TableHead>Cyl/Axe</TableHead>
                    <TableHead>BC/Diam</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products
                    .filter(p => p.category === 'lentilles')
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.reference}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {product.lensType ? lensTypeLabels[product.lensType] : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.sphere || '-'}</TableCell>
                        <TableCell>
                          {product.cylinder ? `${product.cylinder} / ${product.axis}°` : '-'}
                        </TableCell>
                        <TableCell>
                          {product.baseCurve ? `${product.baseCurve} / ${product.diameter}` : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={product.currentStock <= product.minimumStock ? "destructive" : "secondary"}
                          >
                            {product.currentStock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedProduct(product); setIsViewDialogOpen(true); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedProduct(product); setIsProductDialogOpen(true); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Alertes Tab */}
          <TabsContent value="alertes" className="space-y-4">
            {stockAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucune alerte</h3>
                <p className="text-muted-foreground">Tous les produits sont au-dessus du seuil minimum.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {stockAlerts.map((alert) => (
                  <Card key={alert.productId} className="border-warning/50 bg-warning/5">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20">
                          <AlertTriangle className="h-6 w-6 text-warning" />
                        </div>
                        <div>
                          <p className="font-semibold">{alert.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {alert.product.reference} • {alert.product.brand} • {getCategoryLabel(alert.product.category)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Stock actuel / Minimum</p>
                          <p className="text-lg font-bold text-destructive">
                            {alert.currentStock} / {alert.minimumStock}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setIsMovementDialogOpen(true)}>
                          Réapprovisionner
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Mouvements Tab */}
          <TabsContent value="mouvements" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-center">Stock avant</TableHead>
                    <TableHead className="text-center">Stock après</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => {
                    const product = products.find(p => p.id === movement.productId);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.type)}
                            <span>{getMovementLabel(movement.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {product?.name || 'Produit supprimé'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={movement.type === 'entree' ? 'default' : 'secondary'}>
                            {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{movement.previousStock}</TableCell>
                        <TableCell className="text-center">{movement.newStock}</TableCell>
                        <TableCell className="font-mono text-sm">{movement.reference || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{movement.reason}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? "Modifiez les informations du produit." : "Ajoutez un nouveau produit au catalogue."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct || undefined}
            stores={storeOptions}
            fixedStoreId={activeStoreId}
            showStoreSelect={false}
            categories={categories}
            onSubmit={selectedProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={() => { setIsProductDialogOpen(false); setSelectedProduct(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouveau mouvement de stock</DialogTitle>
            <DialogDescription>
              Enregistrez une entrée, sortie ou transfert de stock.
            </DialogDescription>
          </DialogHeader>
          <StockMovementForm
            products={filteredProducts}
            stores={storeOptions}
            currentStoreId={activeStoreId}
            onSubmit={handleAddMovement}
            onCancel={() => setIsMovementDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du produit</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="font-mono font-medium">{selectedProduct.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Catégorie</p>
                  <Badge variant="outline">{getCategoryLabel(selectedProduct.category)}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marque</p>
                <p className="font-medium">{selectedProduct.brand}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix d'achat</p>
                  <p className="font-medium">{selectedProduct.purchasePrice.toLocaleString('fr-MA')} MAD</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix de vente</p>
                  <p className="font-medium">{selectedProduct.sellingPrice.toLocaleString('fr-MA')} MAD</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Stock actuel</p>
                  <Badge variant={selectedProduct.currentStock <= selectedProduct.minimumStock ? "destructive" : "default"}>
                    {selectedProduct.currentStock}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seuil d'alerte</p>
                  <p className="font-medium">{selectedProduct.minimumStock}</p>
                </div>
              </div>
              {selectedProduct.category === 'lentilles' && (
                <>
                  <div className="border-t pt-4">
                    <p className="mb-2 font-semibold">Paramètres lentille</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">
                          {selectedProduct.lensType ? lensTypeLabels[selectedProduct.lensType] : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sphère</p>
                        <p className="font-medium">{selectedProduct.sphere || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cylindre</p>
                        <p className="font-medium">{selectedProduct.cylinder || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Axe</p>
                        <p className="font-medium">{selectedProduct.axis || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rayon</p>
                        <p className="font-medium">{selectedProduct.baseCurve || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diamètre</p>
                        <p className="font-medium">{selectedProduct.diameter || '-'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit "{productToDelete?.name}" sera définitivement supprimé du catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => { setIsCategoryDialogOpen(open); if (!open) setEditingCategory(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Gérer les catégories"}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? `Modifiez les informations de la catégorie "${editingCategory.label}".`
                : "Créez, modifiez ou supprimez des catégories pour organiser vos produits."
              }
            </DialogDescription>
          </DialogHeader>
          {editingCategory ? (
            <CategoryForm
              existingCategories={categories}
              editingCategory={editingCategory}
              onSubmit={handleUpdateCategory}
              onCancel={() => setEditingCategory(null)}
            />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Catégories existantes</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge 
                      key={cat.id} 
                      variant={cat.isDefault ? "secondary" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {cat.label}
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                      >
                        <Pencil className="h-3 w-3 text-primary" />
                      </button>
                      {!cat.isDefault && (
                        <button
                          onClick={() => { setCategoryToDelete(cat); setIsDeleteCategoryDialogOpen(true); }}
                          className="rounded-full p-0.5 hover:bg-destructive/20"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="mb-2 text-sm font-medium">Nouvelle catégorie</p>
                <CategoryForm
                  existingCategories={categories}
                  onSubmit={handleAddCategory}
                  onCancel={() => setIsCategoryDialogOpen(false)}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              La catégorie "{categoryToDelete?.label}" sera supprimée. Assurez-vous qu'aucun produit n'utilise cette catégorie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
