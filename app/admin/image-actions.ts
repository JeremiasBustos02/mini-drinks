"use server";

import { randomUUID } from "node:crypto";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/auth";
import {
  ProductImageStorageError,
  cleanupUploadedImage,
  removeManagedImage,
  uploadComboImage,
  uploadStorefrontImage,
} from "@/lib/admin/product-image-storage";
import { normalizeProductImageUrl } from "@/lib/admin/product-images";
import { db } from "@/lib/db";
import { comboImages, combos, storefrontAssets } from "@/lib/db/schema";
import { isStorefrontAssetKey } from "@/lib/storefront/assets";

const idSchema = z.uuid();

function redirectWithNotice(path: string, type: "success" | "error", message: string): never {
  const [base, hash] = path.split("#", 2);
  const separator = base.includes("?") ? "&" : "?";
  redirect(`${base}${separator}${new URLSearchParams({ [type]: message })}${hash ? `#${hash}` : ""}`);
}

function comboEditorPath(comboId: string) {
  return `/admin/combos?edit=${comboId}#imagenes`;
}

function imageAlt(formData: FormData) {
  return String(formData.get("imageAlt") ?? "").trim().slice(0, 160);
}

async function resolveSubmittedImage(
  formData: FormData,
  upload: (file: File) => Promise<{ path: string; publicUrl: string }>,
) {
  const mode = formData.get("imageMode");
  if (mode === "url") {
    const imageUrl = normalizeProductImageUrl(String(formData.get("imageUrl") ?? ""));
    if (!imageUrl) throw new ProductImageStorageError("Ingresá una URL de imagen.");
    return { imageUrl, storagePath: null };
  }
  if (mode !== "upload") throw new ProductImageStorageError("Elegí URL o archivo.");
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) throw new ProductImageStorageError("Elegí una imagen para subir.");
  const uploaded = await upload(file);
  return { imageUrl: uploaded.publicUrl, storagePath: uploaded.path };
}

export async function addComboImageAction(formData: FormData) {
  await requireAdmin();
  const comboId = String(formData.get("comboId") ?? "");
  if (!idSchema.safeParse(comboId).success) redirectWithNotice("/admin/combos", "error", "Combo inválido.");

  let uploadedPath: string | null = null;
  try {
    const image = await resolveSubmittedImage(formData, async (file) => {
      const uploaded = await uploadComboImage(comboId, file);
      uploadedPath = uploaded.path;
      return uploaded;
    });
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext('combo_images'), hashtext(${comboId}))`);
      const [combo] = await tx.select({ id: combos.id }).from(combos).where(eq(combos.id, comboId)).limit(1);
      if (!combo) throw new Error("combo_not_found");
      const [lastImage] = await tx
        .select({ sortOrder: comboImages.sortOrder })
        .from(comboImages)
        .where(eq(comboImages.comboId, comboId))
        .orderBy(sql`${comboImages.sortOrder} desc`)
        .limit(1);
      const isPrimary = !lastImage;
      await tx.insert(comboImages).values({
        id: randomUUID(),
        comboId,
        ...image,
        alt: imageAlt(formData),
        sortOrder: (lastImage?.sortOrder ?? -1) + 1,
        isPrimary,
      });
      if (isPrimary) await tx.update(combos).set({ imageUrl: image.imageUrl }).where(eq(combos.id, comboId));
    });
  } catch (error) {
    if (uploadedPath) await cleanupUploadedImage(uploadedPath, "combos");
    const message = error instanceof ProductImageStorageError ? error.message : "No se pudo agregar la imagen.";
    redirectWithNotice(comboEditorPath(comboId), "error", message);
  }
  revalidatePath("/admin/combos");
  revalidatePath("/productos");
  revalidatePath("/", "page");
  redirectWithNotice(comboEditorPath(comboId), "success", "Imagen agregada.");
}

export async function setPrimaryComboImageAction(formData: FormData) {
  await requireAdmin();
  const comboId = String(formData.get("comboId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  if (!idSchema.safeParse(comboId).success || !idSchema.safeParse(imageId).success) redirect("/admin/combos");
  await db.transaction(async (tx) => {
    const [image] = await tx.select({ imageUrl: comboImages.imageUrl }).from(comboImages).where(and(eq(comboImages.id, imageId), eq(comboImages.comboId, comboId))).limit(1);
    if (!image) return;
    await tx.update(comboImages).set({ isPrimary: false }).where(eq(comboImages.comboId, comboId));
    await tx.update(comboImages).set({ isPrimary: true }).where(eq(comboImages.id, imageId));
    const ordered = await tx.select({ id: comboImages.id }).from(comboImages).where(eq(comboImages.comboId, comboId)).orderBy(asc(comboImages.sortOrder), asc(comboImages.createdAt));
    const primaryFirst = [imageId, ...ordered.map((entry) => entry.id).filter((id) => id !== imageId)];
    for (const [sortOrder, id] of primaryFirst.entries()) {
      await tx.update(comboImages).set({ sortOrder }).where(eq(comboImages.id, id));
    }
    await tx.update(combos).set({ imageUrl: image.imageUrl }).where(eq(combos.id, comboId));
  });
  revalidatePath("/admin/combos");
  revalidatePath("/productos");
  revalidatePath("/", "page");
  redirectWithNotice(comboEditorPath(comboId), "success", "Imagen principal actualizada.");
}

export async function moveComboImageAction(formData: FormData) {
  await requireAdmin();
  const comboId = String(formData.get("comboId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  const direction = formData.get("direction") === "up" ? -1 : 1;
  if (!idSchema.safeParse(comboId).success || !idSchema.safeParse(imageId).success) redirect("/admin/combos");
  await db.transaction(async (tx) => {
    const images = await tx.select({ id: comboImages.id }).from(comboImages).where(eq(comboImages.comboId, comboId)).orderBy(asc(comboImages.sortOrder), asc(comboImages.createdAt));
    const index = images.findIndex((image) => image.id === imageId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    for (const [sortOrder, image] of reordered.entries()) {
      await tx.update(comboImages).set({ sortOrder }).where(eq(comboImages.id, image.id));
    }
  });
  revalidatePath("/admin/combos");
  redirect(comboEditorPath(comboId));
}

export async function deleteComboImageAction(formData: FormData) {
  await requireAdmin();
  const comboId = String(formData.get("comboId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  if (!idSchema.safeParse(comboId).success || !idSchema.safeParse(imageId).success) redirect("/admin/combos");
  let storagePath: string | null = null;
  await db.transaction(async (tx) => {
    const [image] = await tx.select().from(comboImages).where(and(eq(comboImages.id, imageId), eq(comboImages.comboId, comboId))).limit(1);
    if (!image) return;
    storagePath = image.storagePath;
    await tx.delete(comboImages).where(eq(comboImages.id, imageId));
    if (image.isPrimary) {
      const [next] = await tx.select().from(comboImages).where(eq(comboImages.comboId, comboId)).orderBy(asc(comboImages.sortOrder), asc(comboImages.createdAt)).limit(1);
      if (next) await tx.update(comboImages).set({ isPrimary: true }).where(eq(comboImages.id, next.id));
      await tx.update(combos).set({ imageUrl: next?.imageUrl ?? null }).where(eq(combos.id, comboId));
    }
  });
  if (storagePath) await removeManagedImage(storagePath);
  revalidatePath("/admin/combos");
  revalidatePath("/productos");
  revalidatePath("/", "page");
  redirectWithNotice(comboEditorPath(comboId), "success", "Imagen eliminada.");
}

export async function saveStorefrontAssetAction(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("assetKey") ?? "");
  if (!isStorefrontAssetKey(key)) redirectWithNotice("/admin/contenido", "error", "Asset inválido.");
  let uploadedPath: string | null = null;
  let previousStoragePath: string | null = null;
  try {
    const image = await resolveSubmittedImage(formData, async (file) => {
      const uploaded = await uploadStorefrontImage(key, file);
      uploadedPath = uploaded.path;
      return uploaded;
    });
    await db.transaction(async (tx) => {
      const [previous] = await tx.select({ storagePath: storefrontAssets.storagePath }).from(storefrontAssets).where(eq(storefrontAssets.key, key)).limit(1);
      previousStoragePath = previous?.storagePath ?? null;
      await tx.insert(storefrontAssets).values({ key, ...image, alt: imageAlt(formData) }).onConflictDoUpdate({
        target: storefrontAssets.key,
        set: { ...image, alt: imageAlt(formData), updatedAt: new Date() },
      });
    });
  } catch (error) {
    if (uploadedPath) await cleanupUploadedImage(uploadedPath, "storefront");
    const message = error instanceof ProductImageStorageError ? error.message : "No se pudo guardar la imagen.";
    redirectWithNotice("/admin/contenido", "error", message);
  }
  if (previousStoragePath && previousStoragePath !== uploadedPath) await removeManagedImage(previousStoragePath);
  revalidatePath("/admin/contenido");
  revalidatePath("/", "page");
  redirectWithNotice("/admin/contenido", "success", "Asset actualizado.");
}

export async function deleteStorefrontAssetAction(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("assetKey") ?? "");
  if (!isStorefrontAssetKey(key)) redirect("/admin/contenido");
  const [asset] = await db.delete(storefrontAssets).where(eq(storefrontAssets.key, key)).returning({ storagePath: storefrontAssets.storagePath });
  if (asset?.storagePath) await removeManagedImage(asset.storagePath);
  revalidatePath("/admin/contenido");
  revalidatePath("/", "page");
  redirectWithNotice("/admin/contenido", "success", "Asset quitado; se usa el fallback.");
}
