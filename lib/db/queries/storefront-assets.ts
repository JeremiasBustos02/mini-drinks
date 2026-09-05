import "server-only";

import { inArray } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

import { db } from "@/lib/db";
import { storefrontAssets } from "@/lib/db/schema";
import {
  isStorefrontAssetKey,
  storefrontAssetDefinitions,
  storefrontAssetKeys,
  type StorefrontAsset,
  type StorefrontAssetKey,
} from "@/lib/storefront/assets";

export async function getStorefrontAssets(): Promise<Record<StorefrontAssetKey, StorefrontAsset | null>> {
  noStore();
  const rows = await db
    .select()
    .from(storefrontAssets)
    .where(inArray(storefrontAssets.key, [...storefrontAssetKeys]));
  const databaseAssets = new Map(
    rows
      .filter((row): row is typeof row & { key: StorefrontAssetKey } => isStorefrontAssetKey(row.key))
      .map((row) => [row.key, { key: row.key, imageUrl: row.imageUrl, alt: row.alt }]),
  );

  return Object.fromEntries(storefrontAssetKeys.map((key) => {
    const databaseAsset = databaseAssets.get(key);
    const fallbackUrl = storefrontAssetDefinitions[key].fallbackUrl;
    return [key, databaseAsset ?? (fallbackUrl ? { key, imageUrl: fallbackUrl, alt: "" } : null)];
  })) as Record<StorefrontAssetKey, StorefrontAsset | null>;
}

export async function getAdminStorefrontAssets() {
  noStore();
  return db.select().from(storefrontAssets);
}
