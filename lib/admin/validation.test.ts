import assert from "node:assert/strict";
import test from "node:test";

import { comboComponentsSchema, productSchema } from "@/lib/admin/validation";

const productId = "11111111-1111-4111-8111-111111111111";

test("acepta componentes distintos con cantidades enteras positivas", () => {
  const result = comboComponentsSchema.safeParse([
    { productId, quantity: 1 },
    { productId: "22222222-2222-4222-8222-222222222222", quantity: 2 },
  ]);
  assert.equal(result.success, true);
});

test("rechaza productos duplicados en un combo", () => {
  const result = comboComponentsSchema.safeParse([
    { productId, quantity: 1 },
    { productId, quantity: 2 },
  ]);
  assert.equal(result.success, false);
});

test("rechaza cantidades cero, negativas o fraccionarias", () => {
  for (const quantity of [0, -1, 1.5]) {
    assert.equal(comboComponentsSchema.safeParse([{ productId, quantity }]).success, false);
  }
});

test("valida precio y stock de producto en unidades administrativas", () => {
  const result = productSchema.parse({
    name: "Producto",
    slug: "producto",
    description: "Descripción",
    categoryId: "33333333-3333-4333-8333-333333333333",
    productType: "miniature",
    price: "5900",
    stock: "4",
    active: "on",
    published: "on",
    imageUrl: "",
  });
  assert.equal(result.price, 590000);
  assert.equal(result.stock, 4);
});
