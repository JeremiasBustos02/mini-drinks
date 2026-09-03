import assert from "node:assert/strict";
import test from "node:test";

import { mapCombo, type ComboWithComponents } from "@/lib/mappers/catalog";

const now = new Date();
const record: ComboWithComponents = {
  combo: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Combo",
    slug: "combo",
    description: "Combo de prueba",
    promotionalPrice: 700000,
    active: true,
    published: true,
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
    version: 1,
  },
  components: [
    {
      quantity: 1,
      product: {
        id: "22222222-2222-4222-8222-222222222222",
        categoryId: "33333333-3333-4333-8333-333333333333",
        name: "Producto 50 ml",
        slug: "producto",
        description: "Producto de prueba",
        productType: "miniature",
        price: 600000,
        stock: 5,
        active: true,
        published: true,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
    },
  ],
};

test("un combo predeterminado nunca cuesta más que sus componentes", () => {
  const combo = mapCombo(record);
  assert.equal(combo.referencePrice, 600000);
  assert.equal(combo.price, 600000);
});
