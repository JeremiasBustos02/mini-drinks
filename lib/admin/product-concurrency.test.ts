import assert from "node:assert/strict";
import test from "node:test";

import { updateProductWithVersion } from "@/lib/admin/product-concurrency";

type StoredProduct = {
  active: boolean;
  imageUrl: string | null;
  published: boolean;
  version: number;
};

function mutate(
  product: StoredProduct,
  expectedVersion: number,
  patch: Partial<Omit<StoredProduct, "version">>,
) {
  return updateProductWithVersion(async () => {
    if (product.version !== expectedVersion) return false;
    Object.assign(product, patch);
    product.version += 1;
    return true;
  });
}

test("la versión actual permite actualizar e incrementa el contador", async () => {
  const product = { active: true, imageUrl: null, published: false, version: 1 };
  assert.equal(await mutate(product, 1, { active: false }), "success");
  assert.equal(product.version, 2);
});

test("una versión vieja informa conflicto y no modifica el producto", async () => {
  const product = { active: true, imageUrl: null, published: false, version: 2 };
  assert.equal(await mutate(product, 1, { active: false }), "conflict");
  assert.deepEqual(product, { active: true, imageUrl: null, published: false, version: 2 });
});

test("upload con versión actual asocia la URL e incrementa version", async () => {
  const product = { active: true, imageUrl: null, published: false, version: 3 };
  const uploadedUrl = "https://project.supabase.co/storage/v1/object/public/product-images/new.webp";
  assert.equal(await mutate(product, 3, { imageUrl: uploadedUrl }), "success");
  assert.equal(product.imageUrl, uploadedUrl);
  assert.equal(product.version, 4);
});

test("un segundo guardado con la versión refrescada vuelve a funcionar", async () => {
  const product = { active: true, imageUrl: null, published: false, version: 1 };
  assert.equal(await mutate(product, 1, { imageUrl: "https://example.com/first.webp" }), "success");
  assert.equal(await mutate(product, product.version, { imageUrl: "https://example.com/second.webp" }), "success");
  assert.equal(product.version, 3);
});

test("los toggles de active y published incrementan version", async () => {
  const product = { active: true, imageUrl: null, published: false, version: 5 };
  assert.equal(await mutate(product, 5, { published: true }), "success");
  assert.equal(await mutate(product, 6, { active: false }), "success");
  assert.equal(product.version, 7);
});

test("quitar y reemplazar imageUrl incrementa version", async () => {
  const product = {
    active: true,
    imageUrl: "https://example.com/original.webp" as string | null,
    published: true,
    version: 8,
  };
  assert.equal(await mutate(product, 8, { imageUrl: null }), "success");
  assert.equal(await mutate(product, 9, { imageUrl: "https://example.com/replacement.webp" }), "success");
  assert.equal(product.imageUrl, "https://example.com/replacement.webp");
  assert.equal(product.version, 10);
});
