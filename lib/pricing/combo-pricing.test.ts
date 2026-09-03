import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateComboPrice,
  haveExactComponents,
  type ComboPricingCombo,
  type ComboPricingProduct,
} from "@/lib/pricing/combo-pricing";

const ids = {
  miniature: "11111111-1111-4111-8111-111111111111",
  mixer: "22222222-2222-4222-8222-222222222222",
  glass: "33333333-3333-4333-8333-333333333333",
  extra: "44444444-4444-4444-8444-444444444444",
  combo: "55555555-5555-4555-8555-555555555555",
};

const products: ComboPricingProduct[] = [
  { id: ids.miniature, price: 390000 },
  { id: ids.mixer, price: 150000 },
  { id: ids.glass, price: 120000 },
  { id: ids.extra, price: 45000 },
];

const baseComponents = [
  { productId: ids.miniature, quantity: 1 },
  { productId: ids.mixer, quantity: 1 },
  { productId: ids.glass, quantity: 1 },
];

function createCombo(overrides: Partial<ComboPricingCombo> = {}): ComboPricingCombo {
  return {
    id: ids.combo,
    name: "Fernet + Coca",
    price: 590000,
    active: true,
    published: true,
    available: 8,
    components: baseComponents,
    ...overrides,
  };
}

test("applies a persisted combo promotion using real product IDs", () => {
  const result = calculateComboPrice(baseComponents, [], products, [createCombo()]);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.componentsPrice, 660000);
    assert.equal(result.finalPrice, 590000);
    assert.equal(result.savings, 70000);
    assert.equal(result.matchingCombo?.id, ids.combo);
  }
});

test("adds extras after matching the persisted base combo", () => {
  const result = calculateComboPrice(
    baseComponents,
    [{ productId: ids.extra, quantity: 1 }],
    products,
    [createCombo()],
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.extrasPrice, 45000);
    assert.equal(result.finalPrice, 635000);
    assert.equal(result.savings, 70000);
  }
});

test("uses the component total when the persisted combo is more expensive", () => {
  const result = calculateComboPrice(baseComponents, [], products, [
    createCombo({ price: 700000 }),
  ]);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.basePrice, 660000);
    assert.equal(result.finalPrice, 660000);
    assert.equal(result.savings, 0);
  }
});

test("does not match an equivalent combo without component availability", () => {
  const result = calculateComboPrice(baseComponents, [], products, [
    createCombo({ available: 0 }),
  ]);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.matchingCombo, undefined);
    assert.equal(result.finalPrice, 660000);
  }
});

test("matches by product IDs and aggregated quantities regardless of order", () => {
  assert.equal(
    haveExactComponents(
      [
        { productId: ids.glass, quantity: 1 },
        { productId: ids.miniature, quantity: 1 },
        { productId: ids.glass, quantity: 1 },
      ],
      [
        { productId: ids.miniature, quantity: 1 },
        { productId: ids.glass, quantity: 2 },
      ],
    ),
    true,
  );
});

test("rejects an unknown base product instead of pricing it at zero", () => {
  const unknownId = "99999999-9999-4999-8999-999999999999";
  const result = calculateComboPrice(
    [{ productId: unknownId, quantity: 1 }],
    [],
    products,
    [],
  );

  assert.deepEqual(result, {
    ok: false,
    error: { code: "unknown_product", productId: unknownId },
  });
});

test("rejects an unknown extra instead of adding it for free", () => {
  const unknownId = "99999999-9999-4999-8999-999999999999";
  const result = calculateComboPrice(
    [{ productId: ids.miniature, quantity: 1 }],
    [{ productId: unknownId, quantity: 1 }],
    products,
    [],
  );

  assert.deepEqual(result, {
    ok: false,
    error: { code: "unknown_product", productId: unknownId },
  });
});

test("rejects non-positive and fractional quantities", () => {
  for (const quantity of [0, -1, 1.5]) {
    const result = calculateComboPrice(
      [{ productId: ids.miniature, quantity }],
      [],
      products,
      [],
    );

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "invalid_quantity");
  }
});
