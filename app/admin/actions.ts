"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminAccess } from "@/lib/admin/auth";
import {
  categorySchema,
  categoryStateChangeSchema,
  comboSchema,
  firstValidationError,
  loginSchema,
  productSchema,
  stateChangeSchema,
} from "@/lib/admin/validation";
import { db } from "@/lib/db";
import { categories, comboItems, combos, products } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

function redirectWithNotice(path: string, type: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`${path}?${params.toString()}`);
}

async function authorizeMutation() {
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/admin/login");
  if (access.status === "forbidden") redirect("/admin/acceso-denegado");
  return access;
}

function databaseErrorMessage(error: unknown) {
  if (error instanceof AdminMutationError) return error.message;
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : null;

  if (code === "23505") return "Ese slug ya está en uso.";
  if (code === "23503") return "La operación referencia datos que ya no existen.";
  if (code === "23514") return "Los datos no cumplen las reglas de integridad.";
  return "No se pudo guardar el cambio. Intentá nuevamente.";
}

class AdminMutationError extends Error {}

function revalidateCatalog(slugs: string[] = []) {
  revalidatePath("/", "page");
  revalidatePath("/productos", "page");
  revalidatePath("/arma-tu-combo", "page");
  slugs.forEach((slug) => revalidatePath(`/productos/${slug}`, "page"));
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirectWithNotice("/admin/login", "error", firstValidationError(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirectWithNotice("/admin/login", "error", "Email o contraseña incorrectos.");

  const access = await getAdminAccess();
  if (access.status !== "authorized") redirect("/admin/acceso-denegado");

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

export async function saveCategoryAction(formData: FormData) {
  await authorizeMutation();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirectWithNotice("/admin/categorias", "error", firstValidationError(parsed.error));
  }

  const { id, revision, ...values } = parsed.data;
  try {
    if (id) {
      if (!revision) throw new AdminMutationError("La versión de la categoría no es válida.");
      const updated = await db
        .update(categories)
        .set({ ...values, updatedAt: new Date() })
        .where(and(eq(categories.id, id), eq(categories.updatedAt, revision)))
        .returning({ id: categories.id });
      if (updated.length === 0) throw new AdminMutationError("La categoría cambió en otra sesión. Recargá antes de guardar.");
    } else {
      await db.insert(categories).values(values);
    }
  } catch (error) {
    redirectWithNotice("/admin/categorias", "error", databaseErrorMessage(error));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/categorias");
  revalidateCatalog();
  redirectWithNotice("/admin/categorias", "success", id ? "Categoría actualizada." : "Categoría creada.");
}

export async function setCategoryActiveAction(formData: FormData) {
  await authorizeMutation();
  const parsed = categoryStateChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirectWithNotice("/admin/categorias", "error", "Cambio de estado inválido.");
  }
  const { id, revision, value: active } = parsed.data;

  try {
    if (!active) {
      const [visibleProduct] = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.categoryId, id), eq(products.active, true), eq(products.published, true)))
        .limit(1);
      if (visibleProduct) {
        throw new AdminMutationError("Ocultá o desactivá los productos publicados antes de desactivar la categoría.");
      }
    }
    const updated = await db
      .update(categories)
      .set({ active, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.updatedAt, revision)))
      .returning({ id: categories.id });
    if (updated.length === 0) throw new AdminMutationError("La categoría cambió en otra sesión. Recargá la página.");
  } catch (error) {
    redirectWithNotice("/admin/categorias", "error", databaseErrorMessage(error));
  }
  revalidatePath("/admin/categorias");
  revalidateCatalog();
  redirectWithNotice("/admin/categorias", "success", active ? "Categoría activada." : "Categoría desactivada.");
}

export async function saveProductAction(formData: FormData) {
  await authorizeMutation();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirectWithNotice("/admin/productos", "error", firstValidationError(parsed.error));
  }

  const { id, revision, ...values } = parsed.data;
  let previousSlug: string | undefined;
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${values.slug}))`);
      const [comboWithSlug] = await tx.select({ id: combos.id }).from(combos).where(eq(combos.slug, values.slug)).limit(1);
      if (comboWithSlug) throw new AdminMutationError("Ese slug ya pertenece a un combo.");

      const [category] = await tx.select({ active: categories.active }).from(categories).where(eq(categories.id, values.categoryId)).limit(1);
      if (!category) throw new AdminMutationError("La categoría ya no existe.");
      if (values.published && !category.active) throw new AdminMutationError("No se puede publicar dentro de una categoría inactiva.");

      if (id) {
        if (!revision) throw new AdminMutationError("La versión del producto no es válida.");
        const [existing] = await tx.select({ slug: products.slug }).from(products).where(eq(products.id, id)).limit(1);
        if (!existing) throw new AdminMutationError("El producto ya no existe.");
        previousSlug = existing.slug;
        const updated = await tx
          .update(products)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(products.id, id), eq(products.updatedAt, revision)))
          .returning({ id: products.id });
        if (updated.length === 0) throw new AdminMutationError("El producto cambió en otra sesión. Recargá antes de guardar.");
      } else {
        await tx.insert(products).values(values);
      }
    });
  } catch (error) {
    redirectWithNotice("/admin/productos", "error", databaseErrorMessage(error));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidateCatalog([values.slug, ...(previousSlug ? [previousSlug] : [])]);
  redirectWithNotice("/admin/productos", "success", id ? "Producto actualizado." : "Producto creado.");
}

export async function setProductStateAction(formData: FormData) {
  await authorizeMutation();
  const parsed = stateChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirectWithNotice("/admin/productos", "error", "Cambio de estado inválido.");
  }
  const { id, revision, field, value } = parsed.data;

  const [product] = await db
    .select({ slug: products.slug, categoryActive: categories.active })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.id, id))
    .limit(1);
  if (!product) redirectWithNotice("/admin/productos", "error", "El producto ya no existe.");
  if (field === "published" && value && !product.categoryActive) {
    redirectWithNotice("/admin/productos", "error", "No se puede publicar dentro de una categoría inactiva.");
  }

  const updated = await db
    .update(products)
    .set({ [field]: value, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.updatedAt, revision)))
    .returning({ id: products.id });
  if (updated.length === 0) redirectWithNotice("/admin/productos", "error", "El producto cambió en otra sesión. Recargá la página.");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidateCatalog([product.slug]);
  redirectWithNotice("/admin/productos", "success", "Estado actualizado.");
}

export async function saveComboAction(formData: FormData) {
  await authorizeMutation();
  const parsed = comboSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirectWithNotice("/admin/combos", "error", firstValidationError(parsed.error));
  }

  const { id, revision, components, ...values } = parsed.data;
  let previousSlug: string | undefined;
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${values.slug}))`);
      const [productWithSlug] = await tx.select({ id: products.id }).from(products).where(eq(products.slug, values.slug)).limit(1);
      if (productWithSlug) throw new AdminMutationError("Ese slug ya pertenece a un producto.");

      const productIds = components.map((component) => component.productId);
      const existingProducts = await tx
        .select({
          id: products.id,
          price: products.price,
          active: products.active,
          published: products.published,
          categoryActive: categories.active,
        })
        .from(products)
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .where(inArray(products.id, productIds));
      if (existingProducts.length !== productIds.length) throw new AdminMutationError("Uno de los productos ya no existe.");

      const productById = new Map(existingProducts.map((product) => [product.id, product]));
      let referencePrice = 0;
      for (const component of components) {
        const product = productById.get(component.productId)!;
        const lineTotal = product.price * component.quantity;
        referencePrice += lineTotal;
        if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(referencePrice)) {
          throw new AdminMutationError("Las cantidades producen un importe fuera del rango seguro.");
        }
        if (values.published && (!product.active || !product.published || !product.categoryActive)) {
          throw new AdminMutationError("Para publicar el combo, todos sus componentes deben estar activos, publicados y en categorías activas.");
        }
      }

      let comboId = id;
      if (id) {
        if (!revision) throw new AdminMutationError("La versión del combo no es válida.");
        const [existing] = await tx.select({ slug: combos.slug }).from(combos).where(eq(combos.id, id)).limit(1);
        if (!existing) throw new AdminMutationError("El combo ya no existe.");
        previousSlug = existing.slug;
        const updated = await tx
          .update(combos)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(combos.id, id), eq(combos.updatedAt, revision)))
          .returning({ id: combos.id });
        if (updated.length === 0) throw new AdminMutationError("El combo cambió en otra sesión. Recargá antes de guardar.");
      } else {
        const [created] = await tx.insert(combos).values(values).returning({ id: combos.id });
        comboId = created.id;
      }

      await tx.delete(comboItems).where(eq(comboItems.comboId, comboId!));
      await tx.insert(comboItems).values(
        components.map((component) => ({ comboId: comboId!, ...component })),
      );
    });
  } catch (error) {
    redirectWithNotice("/admin/combos", "error", databaseErrorMessage(error));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/combos");
  revalidateCatalog([values.slug, ...(previousSlug ? [previousSlug] : [])]);
  redirectWithNotice("/admin/combos", "success", id ? "Combo actualizado." : "Combo creado.");
}

export async function setComboStateAction(formData: FormData) {
  await authorizeMutation();
  const parsed = stateChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirectWithNotice("/admin/combos", "error", "Cambio de estado inválido.");
  }
  const { id, revision, field, value } = parsed.data;

  const [combo] = await db.select({ slug: combos.slug }).from(combos).where(eq(combos.id, id)).limit(1);
  if (!combo) redirectWithNotice("/admin/combos", "error", "El combo ya no existe.");

  if (field === "published" && value) {
    const componentStates = await db
      .select({
        active: products.active,
        published: products.published,
        categoryActive: categories.active,
      })
      .from(comboItems)
      .innerJoin(products, eq(products.id, comboItems.productId))
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(eq(comboItems.comboId, id));
    if (
      componentStates.length === 0 ||
      componentStates.some((item) => !item.active || !item.published || !item.categoryActive)
    ) {
      redirectWithNotice("/admin/combos", "error", "Todos los componentes deben estar disponibles antes de publicar.");
    }
  }

  const updated = await db
    .update(combos)
    .set({ [field]: value, updatedAt: new Date() })
    .where(and(eq(combos.id, id), eq(combos.updatedAt, revision)))
    .returning({ id: combos.id });
  if (updated.length === 0) redirectWithNotice("/admin/combos", "error", "El combo cambió en otra sesión. Recargá la página.");
  revalidatePath("/admin");
  revalidatePath("/admin/combos");
  revalidateCatalog([combo.slug]);
  redirectWithNotice("/admin/combos", "success", "Estado actualizado.");
}
