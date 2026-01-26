import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Store } from "@/types/store";
import {
  StoreSettings,
  defaultStoreSettings,
  setStoreSettingsCache,
} from "@/types/settings";
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
  storeSettings: StoreSettings;
  isLoading: boolean;
  setSelectedStoreId: (storeId: string) => void;
  refreshStores: () => Promise<void>;
  refreshStoreSettings: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

type StoreSettingsApiResponse = {
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
};

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

const mapStoreSettings = (data: StoreSettingsApiResponse): StoreSettings => ({
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
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [storeCount, setStoreCount] = useState(0);
  const [selectedStoreId, setSelectedStoreIdState] = useState("");
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStoreSettings = useCallback(async () => {
    if (!selectedStoreId || !user || user.role === "super_admin") {
      setStoreSettings(defaultStoreSettings);
      setStoreSettingsCache(defaultStoreSettings);
      return;
    }

    try {
      const data = await apiFetch<StoreSettingsApiResponse>("/api/store-settings");
      const mapped = mapStoreSettings(data);
      setStoreSettings(mapped);
      setStoreSettingsCache(mapped);
    } catch {
      setStoreSettings(defaultStoreSettings);
      setStoreSettingsCache(defaultStoreSettings);
    }
  }, [selectedStoreId, user]);

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
    refreshStoreSettings();
  }, [user, updateUser, refreshStoreSettings]);

  const refreshStores = useCallback(async () => {
    if (!user || user.role === "super_admin") {
      setStores([]);
      setStoreCount(0);
      setSelectedStoreIdState("");
      setActiveStoreId("");
      setStoreSettings(defaultStoreSettings);
      setStoreSettingsCache(defaultStoreSettings);
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
        refreshStoreSettings();
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
        refreshStoreSettings();
      } else {
        setSelectedStoreIdState("");
        setActiveStoreId("");
        setStoreSettings(defaultStoreSettings);
        setStoreSettingsCache(defaultStoreSettings);
      }
    } catch {
      setStores([]);
      setStoreCount(0);
      setSelectedStoreIdState("");
      setActiveStoreId("");
      setStoreSettings(defaultStoreSettings);
      setStoreSettingsCache(defaultStoreSettings);
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser, refreshStoreSettings]);

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
        storeSettings,
        isLoading,
        setSelectedStoreId,
        refreshStores,
        refreshStoreSettings,
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
