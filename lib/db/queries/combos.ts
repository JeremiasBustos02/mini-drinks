import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { comboItems, combos, products } from "@/lib/db/schema";

export function getPublishedCombos() {
  return db
    .select()
    .from(combos)
    .where(and(eq(combos.published, true), eq(combos.active, true)))
    .orderBy(asc(combos.name));
}

export async function getPublishedCombosWithComponents() {
  const rows = await db
    .select({ combo: combos, quantity: comboItems.quantity, product: products })
    .from(combos)
    .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
    .leftJoin(products, eq(comboItems.productId, products.id))
    .where(and(eq(combos.published, true), eq(combos.active, true)))
    .orderBy(asc(combos.name), asc(products.name));

  return groupComboComponents(rows);
}

export async function getComboBySlug(slug: string) {
  const [combo] = await db
    .select()
    .from(combos)
    .where(and(eq(combos.slug, slug), eq(combos.published, true), eq(combos.active, true)))
    .limit(1);

  return combo ?? null;
}

export async function getPublishedComboWithComponentsBySlug(slug: string) {
  const rows = await db
    .select({ combo: combos, quantity: comboItems.quantity, product: products })
    .from(combos)
    .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
    .leftJoin(products, eq(comboItems.productId, products.id))
    .where(and(eq(combos.slug, slug), eq(combos.published, true), eq(combos.active, true)))
    .orderBy(asc(products.name));

  return groupComboComponents(rows)[0] ?? null;
}

export function getComboComponents(comboId: string) {
  return db
    .select({
      id: comboItems.id,
      quantity: comboItems.quantity,
      product: products,
    })
    .from(comboItems)
    .innerJoin(products, eq(comboItems.productId, products.id))
    .where(eq(comboItems.comboId, comboId))
    .orderBy(asc(products.name));
}

function groupComboComponents(
  rows: { combo: typeof combos.$inferSelect; quantity: number | null; product: typeof products.$inferSelect | null }[],
) {
  const grouped = new Map<
    string,
    { combo: typeof combos.$inferSelect; components: { quantity: number; product: typeof products.$inferSelect }[] }
  >();

  for (const row of rows) {
    const entry = grouped.get(row.combo.id) ?? { combo: row.combo, components: [] };
    if (row.product && row.quantity !== null) entry.components.push({ product: row.product, quantity: row.quantity });
    grouped.set(row.combo.id, entry);
  }

  return [...grouped.values()];
}
