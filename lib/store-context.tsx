'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { predefinedBaskets as seedBaskets } from '@/data/baskets';
import { products as seedProducts } from '@/data/products';
import {
  CATALOG_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  defaultSettings,
} from '@/data/settings';
import { readStored, writeStored } from '@/lib/utils';
import type { PredefinedBasket, Product, StoreSettings } from '@/types';

/* ==========================================================================
   The catalogue and settings the customer-facing site reads.

   Seeded from `data/`, then overlaid with whatever the owner changed in the
   admin screen. Persistence is localStorage — this is an MVP with no backend,
   and the admin is explicit about that.
   ========================================================================== */

interface CatalogSnapshot {
  products: Product[];
  baskets: PredefinedBasket[];
}

interface StoreContextValue {
  products: Product[];
  baskets: PredefinedBasket[];
  settings: StoreSettings;
  /** False until localStorage has been read, so SSR and first paint agree. */
  ready: boolean;
  saveProducts: (next: Product[]) => void;
  saveBaskets: (next: PredefinedBasket[]) => void;
  saveSettings: (next: StoreSettings) => void;
  resetCatalog: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [baskets, setBaskets] = useState<PredefinedBasket[]>(seedBaskets);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  /* Hydrate after mount — reading localStorage during render would make the
     server and client markup disagree. */
  useEffect(() => {
    const storedCatalog = readStored<CatalogSnapshot>(CATALOG_STORAGE_KEY);
    if (storedCatalog?.products?.length) setProducts(storedCatalog.products);
    if (storedCatalog?.baskets?.length) setBaskets(storedCatalog.baskets);

    const storedSettings = readStored<StoreSettings>(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      setSettings({ ...defaultSettings, ...storedSettings });
    }

    setReady(true);
  }, []);

  const persistCatalog = useCallback(
    (nextProducts: Product[], nextBaskets: PredefinedBasket[]) => {
      writeStored(CATALOG_STORAGE_KEY, {
        products: nextProducts,
        baskets: nextBaskets,
      });
    },
    []
  );

  const saveProducts = useCallback(
    (next: Product[]) => {
      setProducts(next);
      setBaskets((currentBaskets) => {
        persistCatalog(next, currentBaskets);
        return currentBaskets;
      });
    },
    [persistCatalog]
  );

  const saveBaskets = useCallback(
    (next: PredefinedBasket[]) => {
      setBaskets(next);
      setProducts((currentProducts) => {
        persistCatalog(currentProducts, next);
        return currentProducts;
      });
    },
    [persistCatalog]
  );

  const saveSettings = useCallback((next: StoreSettings) => {
    setSettings(next);
    writeStored(SETTINGS_STORAGE_KEY, next);
  }, []);

  const resetCatalog = useCallback(() => {
    setProducts(seedProducts);
    setBaskets(seedBaskets);
    setSettings(defaultSettings);
    writeStored(CATALOG_STORAGE_KEY, {
      products: seedProducts,
      baskets: seedBaskets,
    });
    writeStored(SETTINGS_STORAGE_KEY, defaultSettings);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      baskets,
      settings,
      ready,
      saveProducts,
      saveBaskets,
      saveSettings,
      resetCatalog,
    }),
    [
      products,
      baskets,
      settings,
      ready,
      saveProducts,
      saveBaskets,
      saveSettings,
      resetCatalog,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside <StoreProvider>');
  }
  return context;
}

/** Only what the customer should ever see: active and in stock. */
export function useVisibleCatalog() {
  const { products, baskets } = useStore();
  return useMemo(
    () => ({
      products: products.filter((p) => p.active && p.inStock),
      baskets: baskets.filter((b) => b.active),
    }),
    [products, baskets]
  );
}
