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

export async function getComboBySlug(slug: string) {
  const [combo] = await db
    .select()
    .from(combos)
    .where(and(eq(combos.slug, slug), eq(combos.published, true), eq(combos.active, true)))
    .limit(1);

  return combo ?? null;
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
