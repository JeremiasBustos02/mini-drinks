import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { FulfillmentInfo } from "@/components/products/fulfillment-info";
import { ProductDetail } from "@/components/products/product-detail";
import { RelatedProducts } from "@/components/products/related-products";
import {
  getPublishedCombosWithComponents,
  getPublishedComboWithComponentsBySlug,
} from "@/lib/db/queries/combos";
import {
  getProductWithCategoryBySlug,
  getPublishedProductsByCategory,
} from "@/lib/db/queries/products";
import { mapCombo, mapProduct } from "@/lib/mappers/catalog";
import { logServerEvent } from "@/lib/observability/logger";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, combo] = await Promise.all([
    getProductWithCategoryBySlug(slug),
    getPublishedComboWithComponentsBySlug(slug),
  ]);
  const item = product ? mapProduct({ ...product.product, category: product.category }) : combo ? mapCombo(combo) : null;

  return {
    title: item?.name ?? "Producto no encontrado",
    description: item?.description,
    alternates: { canonical: `/productos/${slug}` },
    openGraph: item?.imageUrl
      ? {
          images: [{ url: item.imageUrl, alt: item.name }],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product;
  let combo;

  try {
    [product, combo] = await Promise.all([
      getProductWithCategoryBySlug(slug),
      getPublishedComboWithComponentsBySlug(slug),
    ]);
  } catch (error) {
    logServerEvent("error", "storefront.product_detail_load_failed", { error });
    throw error;
  }

  if (!product && !combo) notFound();

  const item = product
    ? mapProduct({ ...product.product, category: product.category })
    : mapCombo(combo!);
  const relatedItems = product
    ? (await getPublishedProductsByCategory(product.product.categoryId, product.product.id)).map(
        ({ product: relatedProduct, category }) => mapProduct({ ...relatedProduct, category }),
      )
    : (await getPublishedCombosWithComponents())
        .filter((relatedCombo) => relatedCombo.combo.id !== combo!.combo.id)
        .slice(0, 3)
        .map(mapCombo);

  return (
    <StorefrontShell>
      <main id="contenido">
        <ProductDetail item={item} />
        <FulfillmentInfo />
        <RelatedProducts items={relatedItems} />
      </main>
    </StorefrontShell>
  );
}
