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
    title: item ? `${item.name} | MINI.` : "Producto no encontrado | MINI.",
    description: item?.description,
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
    console.error("Unable to load the product detail.", error);
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
