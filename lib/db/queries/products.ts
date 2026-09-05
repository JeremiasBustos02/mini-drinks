import "server-only";

import { and, asc, eq, getTableColumns, gt, inArray, ne } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { availableStockSql } from "@/lib/stock/availability-sql";

const availableStock = availableStockSql();
const availableProductColumns = { ...getTableColumns(products), stock: availableStock };

export function getPublishedProducts() {
  noStore();
  return db
    .select(availableProductColumns)
    .from(products)
    .where(and(eq(products.published, true), eq(products.active, true)))
    .orderBy(asc(products.name));
}

export function getPublishedProductsWithCategories() {
  noStore();
  return db
    .select({ product: availableProductColumns, category: categories })
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
  noStore();
  return db
    .select({ product: availableProductColumns, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.published, true),
        eq(products.active, true),
        gt(availableStock, 0),
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
  noStore();
  const [product] = await db
    .select(availableProductColumns)
    .from(products)
    .where(
      and(eq(products.slug, slug), eq(products.published, true), eq(products.active, true)),
    )
    .limit(1);

  return product ?? null;
}

export async function getProductWithCategoryBySlug(slug: string) {
  noStore();
  const [product] = await db
    .select({ product: availableProductColumns, category: categories })
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
  noStore();
  return db
    .select({ product: availableProductColumns, category: categories })
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
