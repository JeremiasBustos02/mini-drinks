import "server-only";

import { and, asc, count, eq, gt, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getAdminAccess } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { categories, comboItems, combos, orders, products } from "@/lib/db/schema";

async function authorizeAdminRead() {
  console.info(`${new Date().toISOString()} [admin-dashboard] DAL authorization start`);
  const authorizationStartedAt = performance.now();
  await connection();
  const access = await getAdminAccess();
  console.info(`${new Date().toISOString()} [admin-dashboard] DAL authorization end`, {
    durationMs: Math.round(performance.now() - authorizationStartedAt),
    status: access.status,
  });
  if (access.status === "unauthenticated") {
    console.info(`${new Date().toISOString()} [admin-dashboard] redirect target`, "/admin/login");
    redirect("/admin/login");
  }
  if (access.status === "forbidden") {
    console.info(`${new Date().toISOString()} [admin-dashboard] redirect target`, "/admin/acceso-denegado");
    redirect("/admin/acceso-denegado");
  }
}

async function measureDashboardCount(
  label: string,
  query: () => Promise<Array<{ value: number }>>,
) {
  console.info(`${new Date().toISOString()} [admin-dashboard] ${label} start`);
  const startedAt = performance.now();
  const [result] = await query();
  console.info(`${new Date().toISOString()} [admin-dashboard] ${label} end`, {
    durationMs: Math.round(performance.now() - startedAt),
    value: result?.value ?? 0,
  });
  return result?.value ?? 0;
}

export async function getAdminDashboardStats() {
  await authorizeAdminRead();
  console.info(`${new Date().toISOString()} [admin-dashboard] queries start`);
  const [productCount, publishedProductCount, lowStockProductCount, activeComboCount, orderCount] = await Promise.all([
    measureDashboardCount("count products", async () =>
      db.select({ value: count(products.id) }).from(products),
    ),
    measureDashboardCount("count published", async () =>
      db
        .select({ value: count(products.id) })
        .from(products)
        .where(and(eq(products.published, true), eq(products.active, true))),
    ),
    measureDashboardCount("count low stock", async () =>
      db
        .select({ value: count(products.id) })
        .from(products)
        .where(and(eq(products.active, true), gt(products.stock, 0), lte(products.stock, 5))),
    ),
    measureDashboardCount("count active combos", async () =>
      db
        .select({ value: count(combos.id) })
        .from(combos)
        .where(and(eq(combos.active, true), eq(combos.published, true))),
    ),
    measureDashboardCount("count orders", async () =>
      db.select({ value: count(orders.id) }).from(orders),
    ),
  ]);
  console.info(`${new Date().toISOString()} [admin-dashboard] queries end`);

  return {
    products: productCount,
    publishedProducts: publishedProductCount,
    lowStockProducts: lowStockProductCount,
    activeCombos: activeComboCount,
    orders: orderCount,
  };
}

export async function getAdminCategories() {
  await authorizeAdminRead();
  return db
    .select({
      category: categories,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getAdminProducts() {
  await authorizeAdminRead();
  return db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.name));
}

export async function getAdminProductOptions() {
  await authorizeAdminRead();
  return db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      stock: products.stock,
      active: products.active,
      published: products.published,
      categoryActive: categories.active,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.name));
}

export async function getAdminCombos() {
  await authorizeAdminRead();
  const rows = await db
    .select({ combo: combos, item: comboItems, product: products })
    .from(combos)
    .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
    .leftJoin(products, eq(products.id, comboItems.productId))
    .orderBy(asc(combos.name), asc(products.name));

  const grouped = new Map<
    string,
    {
      combo: typeof combos.$inferSelect;
      components: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      referencePrice: number;
    }
  >();

  for (const row of rows) {
    const entry = grouped.get(row.combo.id) ?? {
      combo: row.combo,
      components: [],
      referencePrice: 0,
    };

    if (row.item && row.product) {
      entry.components.push({
        productId: row.product.id,
        name: row.product.name,
        quantity: row.item.quantity,
        price: row.product.price,
      });
      entry.referencePrice += row.product.price * row.item.quantity;
    }
    grouped.set(row.combo.id, entry);
  }

  return [...grouped.values()];
}
