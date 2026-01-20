import { useMemo } from "react";
import { Search, Store as StoreIcon, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";

export function Header() {
  const { user } = useAuth();
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId, isLoading } = useStore();

  const isStoreSelectorVisible = useMemo(() => user?.role === "admin", [user?.role]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher clients, factures, produits..."
          className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Store selector */}
        {isStoreSelectorVisible && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                <StoreIcon className="h-4 w-4" />
                <span className="max-w-[150px] truncate">
                  {selectedStore?.name || "Sélectionner un magasin"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
              {stores.length === 0 ? (
                <DropdownMenuItem disabled>
                  Aucun magasin actif
                </DropdownMenuItem>
              ) : (
                stores.map((store) => (
                  <DropdownMenuItem
                    key={store.id}
                    onClick={() => setSelectedStoreId(store.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <StoreIcon className="h-4 w-4" />
                      <span>{store.name}</span>
                    </div>
                    {store.id === selectedStoreId && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Notifications */}
        <NotificationDropdown />
      </div>
    </header>
  );
}
