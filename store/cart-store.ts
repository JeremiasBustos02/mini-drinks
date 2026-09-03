"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getCartItemMergeKey, getCartSubtotal, getCartTotalItems } from "@/lib/cart/cart-utils";
import type { CartItem } from "@/types/cart";

function toValidQuantity(quantity: number) {
  return Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
}

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

type PersistedCartState = Pick<CartStore, "items">;

function migratePersistedCart(persistedState: unknown, version: number): PersistedCartState {
  if (!persistedState || typeof persistedState !== "object") return { items: [] };

  const state = persistedState as Partial<PersistedCartState>;

  if (!Array.isArray(state.items)) return { items: [] };
  if (version >= 1) return { items: state.items };

  return {
    items: state.items.flatMap((item) => {
      if (!item || typeof item !== "object" || typeof item.unitPrice !== "number") return [];

      return [
        item.type === "custom_combo"
          ? { ...item, unitPrice: item.unitPrice * 100, savings: item.savings * 100 }
          : { ...item, unitPrice: item.unitPrice * 100 },
      ];
    }),
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // These client snapshots improve UX only. The server must recalculate prices,
      // promotions, and stock before creating an order.
      items: [],
      isOpen: false,
      addItem: (item, quantity = item.quantity) =>
        set((state) => {
          const amount = toValidQuantity(quantity);
          const matchingItem = state.items.find(
            (candidate) => getCartItemMergeKey(candidate) === getCartItemMergeKey(item),
          );

          if (matchingItem) {
            return {
              isOpen: true,
              items: state.items.map((candidate) =>
                candidate.lineId === matchingItem.lineId
                  ? {
                      ...item,
                      lineId: candidate.lineId,
                      quantity: candidate.quantity + amount,
                    }
                  : candidate,
              ),
            };
          }

          return { isOpen: true, items: [...state.items, { ...item, quantity: amount }] };
        }),
      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((item) => item.lineId !== lineId) })),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items:
            !Number.isFinite(quantity) || quantity < 1
              ? state.items.filter((item) => item.lineId !== lineId)
              : state.items.map((item) =>
                  item.lineId === lineId
                    ? { ...item, quantity: toValidQuantity(quantity) }
                    : item,
                ),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      totalItems: () => getCartTotalItems(get().items),
      subtotal: () => getCartSubtotal(get().items),
    }),
    {
      name: "mini-cart",
      version: 1,
      migrate: migratePersistedCart,
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
