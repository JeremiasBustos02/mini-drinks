import assert from "node:assert/strict";
import test from "node:test";

import { migratePersistedCart } from "@/lib/cart/persisted-cart";

const productId = "11111111-1111-4111-8111-111111111111";
const comboId = "22222222-2222-4222-8222-222222222222";
const mixerId = "33333333-3333-4333-8333-333333333333";
const glassId = "44444444-4444-4444-8444-444444444444";

function base(type: string) {
  return { lineId: `${type}-line`, type, name: type, unitPrice: 500, quantity: 1, visual: "packaging" };
}

test("preserves current product, preset combo and custom combo snapshots", () => {
  const items = [
    { ...base("product"), productId, reference: "product" },
    { ...base("combo"), comboId, components: [] },
    {
      ...base("custom_combo"),
      customComboId: "custom",
      components: [],
      configuration: {
        miniatureId: productId,
        mixerId,
        glassId,
        extraIds: [],
      },
      savings: 0,
    },
  ];

  assert.deepEqual(migratePersistedCart({ items }, 1).items, items);
});

test("discards legacy slug IDs and malformed persisted lines", () => {
  const valid = { ...base("product"), productId, reference: "product" };
  const legacyItems = [
    { ...base("product"), productId: "fernet-branca-50ml", reference: "legacy" },
    { ...base("combo"), comboId: "combo-fernet-coca", components: [] },
    { ...base("combo"), comboId, components: null },
    { ...base("pack"), packId: "future-pack", components: [] },
    valid,
  ];

  assert.deepEqual(migratePersistedCart({ items: legacyItems }, 1).items, [valid]);
});

test("clamps a persisted line to the checkout quantity limit", () => {
  const item = { ...base("product"), productId, reference: "product", quantity: 30 };
  assert.equal(migratePersistedCart({ items: [item] }, 1).items[0]?.quantity, 24);
});
