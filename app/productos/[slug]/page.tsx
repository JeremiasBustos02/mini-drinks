import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { FulfillmentInfo } from "@/components/products/fulfillment-info";
import { ProductDetail } from "@/components/products/product-detail";
import { RelatedProducts } from "@/components/products/related-products";
import { catalogItems } from "@/data/catalog";
import {
  getCatalogItem,
  getComboStock,
  getRelatedItems,
  isCombo,
} from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalogItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getCatalogItem(slug);

  return {
    title: item ? `${item.name} | MINI.` : "Producto no encontrado | MINI.",
    description: item?.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const item = getCatalogItem(slug);

  if (!item) notFound();

  const available = isCombo(item) ? getComboStock(item) : item.stock;
  const relatedItems = getRelatedItems(item);

  return (
    <StorefrontShell>
      <main id="contenido">
        <ProductDetail item={item} available={available} />
        <FulfillmentInfo />
        <RelatedProducts items={relatedItems} />
      </main>
    </StorefrontShell>
  );
}
