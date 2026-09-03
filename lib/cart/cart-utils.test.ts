import assert from "node:assert/strict";
import test from "node:test";

import { createCustomComboCartItem } from "@/lib/cart/cart-item-factories";
import {
  areCustomComboConfigurationsEqual,
  getCartItemMergeKey,
} from "@/lib/cart/cart-utils";
import type { CustomComboConfiguration } from "@/types/cart";

const configuration: CustomComboConfiguration = {
  miniatureId: "11111111-1111-4111-8111-111111111111",
  mixerId: "22222222-2222-4222-8222-222222222222",
  glassId: "33333333-3333-4333-8333-333333333333",
  extraIds: [
    "55555555-5555-4555-8555-555555555555",
    "44444444-4444-4444-8444-444444444444",
  ],
};

test("treats real-ID custom configurations as equal regardless of extra order", () => {
  const reordered = { ...configuration, extraIds: [...configuration.extraIds].reverse() };
  const left = createCustomComboCartItem({
    configuration,
    components: [],
    unitPrice: 100,
    savings: 0,
  });
  const right = createCustomComboCartItem({
    configuration: reordered,
    components: [],
    unitPrice: 100,
    savings: 0,
  });

  assert.equal(areCustomComboConfigurationsEqual(configuration, reordered), true);
  assert.equal(getCartItemMergeKey(left), getCartItemMergeKey(right));
});

test("keeps custom configurations with different real products separate", () => {
  const different = {
    ...configuration,
    mixerId: "66666666-6666-4666-8666-666666666666",
  };
  const left = createCustomComboCartItem({
    configuration,
    components: [],
    unitPrice: 100,
    savings: 0,
  });
  const right = createCustomComboCartItem({
    configuration: different,
    components: [],
    unitPrice: 100,
    savings: 0,
  });

  assert.notEqual(getCartItemMergeKey(left), getCartItemMergeKey(right));
});

test("stores real product snapshots and aggregates repeated component quantities", () => {
  const glass = {
    id: configuration.glassId,
    name: "Vaso mini",
    image: "glass" as const,
  };
  const item = createCustomComboCartItem({
    configuration,
    components: [
      { product: glass, quantity: 1 },
      { product: glass, quantity: 1 },
    ],
    unitPrice: 240000,
    matchedCombo: {
      id: "77777777-7777-4777-8777-777777777777",
      name: "Combo real",
    },
    savings: 50000,
  });

  assert.deepEqual(item.components, [
    {
      productId: configuration.glassId,
      name: "Vaso mini",
      quantity: 2,
      visual: "glass",
    },
  ]);
  assert.equal(item.matchedComboId, "77777777-7777-4777-8777-777777777777");
  assert.equal(item.savings, 50000);
});

test("merges equal configurations while refreshing the database-backed snapshot", async () => {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  Object.defineProperty(globalThis, "window", { configurable: true, value: globalThis });

  const { useCartStore } = await import("@/store/cart-store");
  const original = createCustomComboCartItem({
    configuration,
    components: [],
    unitPrice: 590000,
    matchedCombo: { id: "77777777-7777-4777-8777-777777777777", name: "Combo anterior" },
    savings: 70000,
  });
  const refreshed = createCustomComboCartItem({
    configuration,
    components: [],
    unitPrice: 610000,
    matchedCombo: { id: "88888888-8888-4888-8888-888888888888", name: "Combo vigente" },
    savings: 50000,
  });

  useCartStore.setState({ items: [], isOpen: false });
  useCartStore.getState().addItem(original);
  useCartStore.getState().addItem(refreshed);

  const [merged] = useCartStore.getState().items;
  assert.equal(useCartStore.getState().items.length, 1);
  assert.equal(merged.lineId, original.lineId);
  assert.equal(merged.quantity, 2);
  assert.equal(merged.unitPrice, 610000);
  assert.equal(merged.type === "custom_combo" && merged.matchedComboName, "Combo vigente");

  useCartStore.setState({ items: [], isOpen: false });
  delete (globalThis as { localStorage?: Storage }).localStorage;
  delete (globalThis as { window?: Window & typeof globalThis }).window;
});
