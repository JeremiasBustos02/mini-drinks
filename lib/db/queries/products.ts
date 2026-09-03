import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export function getPublishedProducts() {
  return db
    .select()
    .from(products)
    .where(and(eq(products.published, true), eq(products.active, true)))
    .orderBy(asc(products.name));
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
