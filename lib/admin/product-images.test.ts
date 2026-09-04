import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProductImagePath,
  getProductImageDimensionWarning,
  getProductImageExtension,
  isProductImageMimeType,
  isValidProductImageUrl,
  PRODUCT_IMAGE_MAX_BYTES,
  resolveProductImageReference,
  validateProductImageFile,
} from "@/lib/admin/product-images";

const productId = "11111111-1111-4111-8111-111111111111";
const objectId = "22222222-2222-4222-8222-222222222222";

test("acepta exclusivamente los MIME de imagen configurados", () => {
  for (const mimeType of ["image/webp", "image/png", "image/jpeg"]) {
    assert.equal(isProductImageMimeType(mimeType), true);
  }
  for (const mimeType of ["application/pdf", "image/gif", "image/svg+xml", "text/plain"]) {
    assert.equal(isProductImageMimeType(mimeType), false);
  }
});

test("acepta archivos de hasta 2 MB inclusive", () => {
  assert.equal(validateProductImageFile({ size: PRODUCT_IMAGE_MAX_BYTES, type: "image/png" }).ok, true);
});

test("rechaza archivos que superan 2 MB", () => {
  const result = validateProductImageFile({ size: PRODUCT_IMAGE_MAX_BYTES + 1, type: "image/jpeg" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /2 MB/);
});

test("deriva una extensión segura desde el MIME y no desde el nombre", () => {
  assert.equal(getProductImageExtension("image/webp"), "webp");
  assert.equal(getProductImageExtension("image/png"), "png");
  assert.equal(getProductImageExtension("image/jpeg"), "jpg");
  assert.equal(getProductImageExtension("image/gif"), null);
});

test("genera un path versionado dentro del producto", () => {
  assert.equal(
    buildProductImagePath(productId, objectId, "image/jpeg"),
    `products/${productId}/${objectId}.jpg`,
  );
  assert.throws(() => buildProductImagePath("../otro", objectId, "image/png"));
});

test("acepta URL http y https y rechaza protocolos o credenciales no permitidos", () => {
  assert.equal(isValidProductImageUrl("https://example.com/producto.webp"), true);
  assert.equal(isValidProductImageUrl("http://localhost:54321/storage/image.png"), true);
  assert.equal(isValidProductImageUrl("ftp://example.com/image.png"), false);
  assert.equal(isValidProductImageUrl("https://user:secret@example.com/image.png"), false);
  assert.equal(isValidProductImageUrl("sin-protocolo.com/image.png"), false);
});

test("resuelve quitar, reemplazar por URL y reemplazar por upload", () => {
  assert.equal(resolveProductImageReference({ mode: "url", url: "" }), null);
  assert.equal(
    resolveProductImageReference({ mode: "url", url: " https://example.com/new.webp " }),
    "https://example.com/new.webp",
  );
  assert.equal(
    resolveProductImageReference({
      mode: "upload",
      uploadedUrl: "https://project.supabase.co/storage/v1/object/public/product-images/a.webp",
      url: "https://example.com/old.webp",
    }),
    "https://project.supabase.co/storage/v1/object/public/product-images/a.webp",
  );
});

test("advierte dimensiones pequeñas o proporciones alejadas de 3:4", () => {
  assert.equal(getProductImageDimensionWarning(1200, 1600), null);
  assert.match(getProductImageDimensionWarning(800, 800) ?? "", /800×800/);
  assert.match(getProductImageDimensionWarning(900, 1200) ?? "", /900×1200/);
});
