import "server-only";

import { and, asc, desc, eq, getTableColumns, inArray } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

import { db } from "@/lib/db";
import { comboImages, comboItems, combos, products } from "@/lib/db/schema";
import { availableStockSql } from "@/lib/stock/availability-sql";

const availableProductColumns = {
  ...getTableColumns(products),
  stock: availableStockSql(),
};

export function getPublishedCombos() {
  return db
    .select()
    .from(combos)
    .where(and(eq(combos.published, true), eq(combos.active, true)))
    .orderBy(asc(combos.name));
}

export async function getPublishedCombosWithComponents() {
  noStore();
  const rows = await db
    .select({ combo: combos, quantity: comboItems.quantity, product: availableProductColumns })
    .from(combos)
    .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
    .leftJoin(products, eq(comboItems.productId, products.id))
    .where(and(eq(combos.published, true), eq(combos.active, true)))
    .orderBy(asc(combos.name), asc(products.name));

  return attachComboImages(groupComboComponents(rows));
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
  noStore();
  const rows = await db
    .select({ combo: combos, quantity: comboItems.quantity, product: availableProductColumns })
    .from(combos)
    .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
    .leftJoin(products, eq(comboItems.productId, products.id))
    .where(and(eq(combos.slug, slug), eq(combos.published, true), eq(combos.active, true)))
    .orderBy(asc(products.name));

  const grouped = groupComboComponents(rows);
  if (grouped.length === 0) return null;
  return (await attachComboImages(grouped))[0] ?? null;
}

export function getComboComponents(comboId: string) {
  noStore();
  return db
    .select({
      id: comboItems.id,
      quantity: comboItems.quantity,
      product: availableProductColumns,
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

async function attachComboImages(
  records: Array<{
    combo: typeof combos.$inferSelect;
    components: { quantity: number; product: typeof products.$inferSelect }[];
  }>,
) {
  if (records.length === 0) return [];
  const images = await db
    .select()
    .from(comboImages)
    .where(inArray(comboImages.comboId, records.map(({ combo }) => combo.id)))
    .orderBy(asc(comboImages.comboId), desc(comboImages.isPrimary), asc(comboImages.sortOrder), asc(comboImages.createdAt), asc(comboImages.id));
  const byCombo = new Map<string, typeof images>();
  for (const image of images) {
    const combo = byCombo.get(image.comboId);
    if (combo) combo.push(image);
    else byCombo.set(image.comboId, [image]);
  }
  return records.map((record) => ({ ...record, images: byCombo.get(record.combo.id) ?? [] }));
}
