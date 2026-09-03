import "server-only";

import { and, asc, eq, gt, inArray, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";

export function getPublishedProducts() {
  return db
    .select()
    .from(products)
    .where(and(eq(products.published, true), eq(products.active, true)))
    .orderBy(asc(products.name));
}

export function getPublishedProductsWithCategories() {
  return db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.published, true),
        eq(products.active, true),
        eq(categories.active, true),
      ),
    )
    .orderBy(asc(products.name));
}

export function getAvailableComboBuilderProductsWithCategories() {
  return db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.published, true),
        eq(products.active, true),
        gt(products.stock, 0),
        eq(categories.active, true),
        inArray(products.productType, ["miniature", "mixer", "glass", "extra", "accessory"]),
      ),
    )
    .orderBy(asc(products.name));
}

export function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(
      and(eq(products.slug, slug), eq(products.published, true), eq(products.active, true)),
    )
    .limit(1);

  return product ?? null;
}

export async function getProductWithCategoryBySlug(slug: string) {
  const [product] = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.slug, slug),
        eq(products.published, true),
        eq(products.active, true),
        eq(categories.active, true),
      ),
    )
    .limit(1);

  return product ?? null;
}

export function getPublishedProductsByCategory(categoryId: string, excludedProductId: string, limit = 3) {
  return db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.categoryId, categoryId),
        ne(products.id, excludedProductId),
        eq(products.published, true),
        eq(products.active, true),
        eq(categories.active, true),
      ),
    )
    .orderBy(asc(products.name))
    .limit(limit);
}
