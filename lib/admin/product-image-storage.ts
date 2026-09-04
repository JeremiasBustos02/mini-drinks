import "server-only";

import { randomUUID } from "node:crypto";

import { requireAdmin } from "@/lib/admin/auth";
import {
  buildProductImagePath,
  isValidProductImageUrl,
  PRODUCT_IMAGE_BUCKET,
  validateProductImageFile,
} from "@/lib/admin/product-images";
import { createClient } from "@/lib/supabase/server";

export class ProductImageStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductImageStorageError";
  }
}

export async function uploadProductImage(productId: string, file: File) {
  await requireAdmin();
  const validation = validateProductImageFile(file);
  if (!validation.ok) throw new ProductImageStorageError(validation.error);

  const path = buildProductImagePath(productId, randomUUID(), file.type);
  const supabase = await createClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new ProductImageStorageError(
      "No se pudo subir la imagen. Revisá el bucket y sus policies e intentá nuevamente.",
    );
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  if (!isValidProductImageUrl(data.publicUrl)) {
    throw new ProductImageStorageError("Storage no devolvió una URL pública válida.");
  }

  return { path, publicUrl: data.publicUrl };
}
