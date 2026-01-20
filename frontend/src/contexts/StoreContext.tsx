import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Store } from "@/types/store";
import { apiFetch, setActiveStoreId } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type StoreApiResponse = {
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
};

interface StoreContextValue {
  stores: Store[];
  storeCount: number;
  selectedStoreId: string;
  selectedStore?: Store;
  isLoading: boolean;
  setSelectedStoreId: (storeId: string) => void;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const mapStore = (store: StoreApiResponse): Store => ({
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
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [storeCount, setStoreCount] = useState(0);
  const [selectedStoreId, setSelectedStoreIdState] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setSelectedStoreId = useCallback((storeId: string) => {
    setSelectedStoreIdState(storeId);
    setActiveStoreId(storeId);

    if (!user || user.role === "super_admin") {
      return;
    }

    apiFetch<{
      last_store_id?: number | string | null;
    }>("/api/stores/selected", {
      method: "PATCH",
      body: JSON.stringify({ store_id: storeId || null }),
    })
      .then((response) => {
        if (!response) return;
        const updatedUser = {
          ...user,
          lastStoreId: response.last_store_id ? String(response.last_store_id) : undefined,
        };
        updateUser(updatedUser);
      })
      .catch(() => undefined);
  }, [user, updateUser]);

  const refreshStores = useCallback(async () => {
    if (!user || user.role === "super_admin") {
      setStores([]);
      setStoreCount(0);
      setSelectedStoreIdState("");
      setActiveStoreId("");
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch<StoreApiResponse[]>("/api/stores");
      setStoreCount(data.length);

      const activeStores = data
        .filter((store) => store.is_active)
        .map(mapStore);

      setStores(activeStores);

      const preferredStoreId = user.lastStoreId;
      if (preferredStoreId && activeStores.some((store) => store.id === preferredStoreId)) {
        setSelectedStoreIdState(preferredStoreId);
        setActiveStoreId(preferredStoreId);
      } else if (activeStores.length > 0) {
        setSelectedStoreIdState(activeStores[0].id);
        setActiveStoreId(activeStores[0].id);
        apiFetch<{
          last_store_id?: number | string | null;
        }>("/api/stores/selected", {
          method: "PATCH",
          body: JSON.stringify({ store_id: activeStores[0].id }),
        })
          .then((response) => {
            if (!response) return;
            updateUser({
              ...user,
              lastStoreId: response.last_store_id ? String(response.last_store_id) : undefined,
            });
          })
          .catch(() => undefined);
      } else {
        setSelectedStoreIdState("");
        setActiveStoreId("");
      }
    } catch {
      setStores([]);
      setStoreCount(0);
      setSelectedStoreIdState("");
      setActiveStoreId("");
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  useEffect(() => {
    refreshStores();
  }, [refreshStores]);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId),
    [stores, selectedStoreId]
  );

  return (
    <StoreContext.Provider
      value={{
        stores,
        storeCount,
        selectedStoreId,
        selectedStore,
        isLoading,
        setSelectedStoreId,
        refreshStores,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
