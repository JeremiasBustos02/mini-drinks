import assert from "node:assert/strict";
import test from "node:test";

import { getDerivedComboStock, getDerivedProductStock } from "@/lib/catalog/availability";

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

test("aggregates repeated requirements for the same real product ID", () => {
  const glassId = "33333333-3333-4333-8333-333333333333";

  assert.equal(
    getDerivedProductStock([
      { productId: glassId, stock: 5, quantity: 1 },
      { productId: glassId, stock: 5, quantity: 1 },
      {
        productId: "11111111-1111-4111-8111-111111111111",
        stock: 9,
        quantity: 1,
      },
    ]),
    2,
  );
});

test("returns no availability when a required product is unavailable", () => {
  assert.equal(
    getDerivedProductStock([
      {
        productId: "11111111-1111-4111-8111-111111111111",
        stock: 9,
        quantity: 1,
        available: false,
      },
    ]),
    0,
  );
});
