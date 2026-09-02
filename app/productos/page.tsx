import type { Metadata } from "next";

import {
  CatalogPage,
  type CatalogPageProps,
} from "@/components/products/catalog-page";

export const metadata: Metadata = {
  title: "Catálogo | MINI.",
  description: "Miniaturas, mixers, vasos, extras y combos para hacerte uno.",
};

export default function ProductsPage(props: CatalogPageProps) {
  return <CatalogPage {...props} />;
}
