import "server-only";

import { randomUUID } from "node:crypto";

import { requireAdmin } from "@/lib/admin/auth";
import {
  buildManagedImagePath,
  isValidProductImageUrl,
  type ManagedImageScope,
  PRODUCT_IMAGE_BUCKET,
  validateProductImageFileContents,
} from "@/lib/admin/product-images";
import { createClient } from "@/lib/supabase/server";
import { logServerEvent } from "@/lib/observability/logger";

export class ProductImageStorageError extends Error {
  name = "ProductImageStorageError";
}

async function uploadManagedImage(scope: ManagedImageScope, ownerId: string, file: File) {
  await requireAdmin();
  const validation = await validateProductImageFileContents(file);
  if (!validation.ok) throw new ProductImageStorageError(validation.error);

  const path = buildManagedImagePath(scope, ownerId, randomUUID(), validation.mimeType);
  const supabase = await createClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: validation.mimeType,
    upsert: false,
  });

  if (error) {
    logServerEvent("error", "admin.image_upload_failed", {
      scope,
      errorName: error.name,
    });
    throw new ProductImageStorageError(
      "No se pudo subir la imagen. Revisá el bucket y sus policies e intentá nuevamente.",
    );
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  if (!isValidProductImageUrl(data.publicUrl)) {
    try {
      const { error: cleanupError } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
      if (cleanupError) throw cleanupError;
    } catch (error) {
      logServerEvent("error", "admin.image_orphaned", {
        scope,
        reason: "invalid_public_url_cleanup_failed",
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }
    throw new ProductImageStorageError("Storage no devolvió una URL pública válida.");
  }

  return { path, publicUrl: data.publicUrl };
}

export function uploadProductImage(productId: string, file: File) {
  return uploadManagedImage("products", productId, file);
}

export function uploadComboImage(comboId: string, file: File) {
  return uploadManagedImage("combos", comboId, file);
}

export function uploadStorefrontImage(key: string, file: File) {
  return uploadManagedImage("storefront", key, file);
}

export async function removeManagedImage(path: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) {
    const scope = path.split("/", 1)[0];
    logServerEvent("warn", "admin.image_delete_failed", { scope, errorName: error.name });
    return false;
  }
  return true;
}

export async function cleanupUploadedImage(path: string, scope: ManagedImageScope) {
  try {
    if (await removeManagedImage(path)) return;
  } catch (error) {
    logServerEvent("warn", "admin.image_cleanup_request_failed", {
      scope,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
  }
  logServerEvent("error", "admin.image_orphaned", {
    scope,
    reason: "database_mutation_failed_cleanup_failed",
  });
}
