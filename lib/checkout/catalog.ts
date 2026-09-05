import "server-only";

import { asc, eq, getTableColumns } from "drizzle-orm";

import { db } from "@/lib/db";
import { comboItems, combos, products } from "@/lib/db/schema";
import type { CheckoutCatalog } from "@/lib/checkout/resolve-cart";
import { availableStockSql } from "@/lib/stock/availability-sql";

type QueryExecutor = Pick<typeof db, "select">;

export async function loadCheckoutCatalog(executor: QueryExecutor = db): Promise<CheckoutCatalog> {
  const [productRows, comboRows] = await Promise.all([
    executor
      .select({
        ...getTableColumns(products),
        stock: availableStockSql(),
      })
      .from(products),
    executor
      .select({ combo: combos, productId: comboItems.productId, quantity: comboItems.quantity })
      .from(combos)
      .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
      .orderBy(asc(combos.name), asc(comboItems.id)),
  ]);

  const groupedCombos = new Map<
    string,
    CheckoutCatalog["combos"][number]
  >();

  for (const row of comboRows) {
    const combo = groupedCombos.get(row.combo.id) ?? {
      id: row.combo.id,
      name: row.combo.name,
      promotionalPrice: row.combo.promotionalPrice,
      active: row.combo.active,
      published: row.combo.published,
      components: [],
    };
    if (row.productId && row.quantity !== null) {
      combo.components.push({ productId: row.productId, quantity: row.quantity });
    }
    groupedCombos.set(combo.id, combo);
  }

  return {
    products: productRows.map((product) => ({
      id: product.id,
      name: product.name,
      productType: product.productType,
      price: product.price,
      stock: product.stock,
      active: product.active,
      published: product.published,
    })),
    combos: [...groupedCombos.values()],
  };
}
