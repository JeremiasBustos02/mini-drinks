import assert from "node:assert/strict";
import test from "node:test";

import {
  buildManagedImagePath,
  buildProductImagePath,
  detectProductImageMimeType,
  getProductImageDimensionWarning,
  getProductImageExtension,
  isProductImageMimeType,
  isValidProductImageUrl,
  normalizeProductImageUrl,
  PRODUCT_IMAGE_MAX_BYTES,
  resolveProductImageReference,
  validateProductImageFile,
  validateProductImageFileContents,
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

test("genera paths restringidos para combos y assets editoriales", () => {
  assert.equal(
    buildManagedImagePath("products", productId, objectId, "image/jpeg"),
    `products/${productId}/${objectId}.jpg`,
  );
  assert.equal(
    buildManagedImagePath("combos", productId, objectId, "image/webp"),
    `combos/${productId}/${objectId}.webp`,
  );
  assert.equal(
    buildManagedImagePath("storefront", "combo_builder_promo", objectId, "image/png"),
    `storefront/combo_builder_promo/${objectId}.png`,
  );
  assert.throws(() => buildManagedImagePath("storefront", "../hero", objectId, "image/png"));
  assert.throws(() => buildManagedImagePath("otra" as "products", productId, objectId, "image/png"));
});

const signatures = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpeg: [0xff, 0xd8, 0xff, 0xe0],
  webp: [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
} as const;

function imageFile(bytes: readonly number[], type: string, size = bytes.length) {
  return {
    size,
    type,
    async arrayBuffer() {
      return Uint8Array.from(bytes).buffer as ArrayBuffer;
    },
  };
}

test("acepta firmas binarias PNG, JPEG y WebP válidas", async () => {
  for (const [bytes, type] of [
    [signatures.png, "image/png"],
    [signatures.jpeg, "image/jpeg"],
    [signatures.webp, "image/webp"],
  ] as const) {
    const result = await validateProductImageFileContents(imageFile(bytes, type));
    assert.equal(result.ok, true);
  }
  assert.equal(detectProductImageMimeType(Uint8Array.from(signatures.webp)), "image/webp");
});

test("rechaza MIME permitido cuando los bytes no son una imagen válida", async () => {
  const result = await validateProductImageFileContents(imageFile([0x25, 0x50, 0x44, 0x46], "image/png"));
  assert.equal(result.ok, false);
});

test("rechaza MIME no permitido aunque la firma sea válida", async () => {
  const result = await validateProductImageFileContents(imageFile(signatures.png, "application/pdf"));
  assert.equal(result.ok, false);
});

test("rechaza más de 2 MB antes de leer el contenido", async () => {
  const result = await validateProductImageFileContents(
    imageFile(signatures.jpeg, "image/jpeg", PRODUCT_IMAGE_MAX_BYTES + 1),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /2 MB/);
});

test("acepta URL http y https y rechaza protocolos o credenciales no permitidos", () => {
  assert.equal(isValidProductImageUrl("https://example.com/producto.webp"), true);
  assert.equal(isValidProductImageUrl("http://localhost:54321/storage/image.png"), true);
  assert.equal(isValidProductImageUrl("ftp://example.com/image.png"), false);
  assert.equal(isValidProductImageUrl("https://user:secret@example.com/image.png"), false);
  assert.equal(isValidProductImageUrl("sin-protocolo.com/image.png"), false);
});

test("rechaza URLs que exceden el límite persistible", () => {
  assert.throws(
    () => normalizeProductImageUrl(`https://example.com/${"a".repeat(2030)}`),
    /demasiado larga/,
  );
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
