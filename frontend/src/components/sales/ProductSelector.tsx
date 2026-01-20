import { useState, useMemo } from "react";
import { Search, Plus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product, Category } from "@/types/stock";

interface ProductSelectorProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
}

export function ProductSelector({ products, categories, onAddToCart }: ProductSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.reference.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory && product.currentStock > 0;
    });
  }, [products, search, selectedCategory]);

  const getCategoryLabel = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.label || categoryName;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category filter */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("all")}
          >
            Tous
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Product list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Aucun produit trouvé</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{product.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{product.reference}</span>
                    <span>{product.brand}</span>
                    <span className={product.currentStock <= product.minimumStock ? "text-destructive" : ""}>
                      Stock: {product.currentStock}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">
                    {product.sellingPrice.toLocaleString('fr-MA')} DH
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddToCart(product)}
                    disabled={product.currentStock <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
