import "server-only";

import { asc, count, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getAdminAccess } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { categories, comboItems, combos, orders, products } from "@/lib/db/schema";

async function authorizeAdminRead() {
  await connection();
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/admin/login");
  if (access.status === "forbidden") redirect("/admin/acceso-denegado");
}

export async function getAdminDashboardStats() {
  await authorizeAdminRead();
  const [[productStats], [comboStats], [orderStats]] = await Promise.all([
    db
      .select({
        total: count(products.id),
        published: count(sql`case when ${products.published} and ${products.active} then 1 end`),
        lowStock: count(
          sql`case when ${products.active} and ${products.stock} > 0 and ${products.stock} <= 5 then 1 end`,
        ),
      })
      .from(products),
    db
      .select({
        active: count(sql`case when ${combos.active} and ${combos.published} then 1 end`),
      })
      .from(combos),
    db.select({ total: count(orders.id) }).from(orders),
  ]);

  return {
    products: productStats?.total ?? 0,
    publishedProducts: productStats?.published ?? 0,
    lowStockProducts: productStats?.lowStock ?? 0,
    activeCombos: comboStats?.active ?? 0,
    orders: orderStats?.total ?? 0,
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
