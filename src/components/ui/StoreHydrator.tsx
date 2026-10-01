"use client";

import { useEffect } from "react";
import { rehydrateStores } from "@/stores/rehydrate";

/**
 * Persisted stores start from defaults so the first client render matches the
 * server HTML; this loads the saved values right after hydration. Keep it ahead
 * of other components in the layout so its effect runs first.
 */
export function StoreHydrator() {
  useEffect(() => {
    void rehydrateStores();
  }, []);
  return null;
}
