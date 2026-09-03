import assert from "node:assert/strict";
import test from "node:test";

import { combos } from "@/data/combos";
import { products } from "@/data/products";
import { getDerivedComboStock } from "@/lib/catalog/availability";
import { calculateComboPrice } from "@/lib/pricing/combo-pricing";

test("keeps the valid promotional combo price in cents", () => {
  const result = calculateComboPrice(
    [
      { productId: "fernet-branca-50ml", quantity: 1 },
      { productId: "coca-cola-lata", quantity: 1 },
      { productId: "vaso-mini", quantity: 1 },
    ],
    [],
    products,
    combos,
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.componentsPrice, 660000);
    assert.equal(result.finalPrice, 590000);
    assert.equal(result.savings, 70000);
  }
});

test("rejects an unknown base product instead of pricing it at zero", () => {
  const result = calculateComboPrice(
    [{ productId: "unknown-product", quantity: 1 }],
    [],
    products,
    combos,
  );

  assert.deepEqual(result, {
    ok: false,
    error: { code: "unknown_product", productId: "unknown-product" },
  });
});

test("rejects an unknown extra instead of adding it for free", () => {
  const result = calculateComboPrice(
    [{ productId: "fernet-branca-50ml", quantity: 1 }],
    [{ productId: "unknown-extra", quantity: 1 }],
    products,
    combos,
  );

  assert.deepEqual(result, {
    ok: false,
    error: { code: "unknown_product", productId: "unknown-extra" },
  });
});

test("rejects non-positive and fractional quantities", () => {
  for (const quantity of [0, -1, 1.5]) {
    const result = calculateComboPrice(
      [{ productId: "fernet-branca-50ml", quantity }],
      [],
      products,
      combos,
    );

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "invalid_quantity");
  }
});

test("derives combo stock from the limiting component and required quantity", () => {
  assert.equal(
    getDerivedComboStock([
      { stock: 10, quantity: 2 },
      { stock: 7, quantity: 1 },
      { stock: 20, quantity: 3 },
    ]),
    5,
  );
});
