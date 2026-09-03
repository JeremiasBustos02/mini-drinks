"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useCartStore } from "@/store/cart-store";

export function useCartHydration() {
  const hydrated = useSyncExternalStore(
    (onStoreChange) => useCartStore.persist.onFinishHydration(onStoreChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return hydrated;
}
