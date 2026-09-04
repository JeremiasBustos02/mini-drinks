export const PRODUCT_IMAGE_BUCKET = "product-images";
export const PRODUCT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PRODUCT_IMAGE_ACCEPT = "image/webp,image/png,image/jpeg";

export const productImageMimeTypes = ["image/webp", "image/png", "image/jpeg"] as const;
export type ProductImageMimeType = (typeof productImageMimeTypes)[number];
export type ProductImageMode = "url" | "upload";

const extensionByMimeType: Record<ProductImageMimeType, "webp" | "png" | "jpg"> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isProductImageMimeType(value: string): value is ProductImageMimeType {
  return productImageMimeTypes.includes(value as ProductImageMimeType);
}

export function getProductImageExtension(mimeType: string) {
  return isProductImageMimeType(mimeType) ? extensionByMimeType[mimeType] : null;
}

export function validateProductImageFile(file: { size: number; type: string }):
  | { ok: true; extension: "webp" | "png" | "jpg" }
  | { ok: false; error: string } {
  const extension = getProductImageExtension(file.type);
  if (!extension) {
    return { ok: false, error: "El archivo debe ser WebP, PNG o JPG." };
  }
  if (file.size <= 0) {
    return { ok: false, error: "El archivo está vacío." };
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: "La imagen supera el máximo de 2 MB." };
  }
  return { ok: true, extension };
}

export function buildProductImagePath(productId: string, objectId: string, mimeType: string) {
  if (!uuidPattern.test(productId) || !uuidPattern.test(objectId)) {
    throw new Error("Los identificadores de la imagen no son válidos.");
  }
  const extension = getProductImageExtension(mimeType);
  if (!extension) throw new Error("El tipo de imagen no es válido.");
  return `products/${productId}/${objectId}.${extension}`;
}

export function isValidProductImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function normalizeProductImageUrl(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  if (!isValidProductImageUrl(normalized)) {
    throw new Error("Ingresá una URL http:// o https:// válida.");
  }
  return normalized;
}

export function resolveProductImageReference({
  mode,
  uploadedUrl,
  url,
}: {
  mode: ProductImageMode;
  uploadedUrl?: string;
  url: string;
}) {
  if (mode === "url") return normalizeProductImageUrl(url);
  if (!uploadedUrl || !isValidProductImageUrl(uploadedUrl)) {
    throw new Error("La imagen subida no devolvió una URL pública válida.");
  }
  return uploadedUrl;
}

export function getProductImageDimensionWarning(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const ratioDiffers = Math.abs(width / height - 3 / 4) > 0.12;
  if (width < 1200 || height < 1600 || ratioDiffers) {
    return `Esta imagen es ${width}×${height}. Se recomienda formato vertical 3:4 de 1200×1600 px.`;
  }
  return null;
}
