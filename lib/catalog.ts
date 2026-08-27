import { catalogItems, categories, products } from "@/data/catalog";
import type { CatalogItem, Combo, ProductType } from "@/types/catalog";

const productTypeLabels: Record<ProductType, string> = {
  miniature: "Miniatura",
  mixer: "Mixer",
  glass: "Vaso",
  extra: "Extra",
  accessory: "Accesorio",
  supply: "Insumo",
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(price);
}

export function getCategoryName(categorySlug: CatalogItem["category"]) {
  return categories.find((category) => category.slug === categorySlug)?.name ?? categorySlug;
}

export function getItemLabel(item: CatalogItem) {
  return item.kind === "combo"
    ? "Combo"
    : productTypeLabels[item.productType];
}

export function getStockStatus(stock: number) {
  if (stock === 0) return { label: "Sin stock", tone: "text-[#a82a20] bg-[#f7ddd8]" };
  if (stock <= 8) return { label: "Últimas unidades", tone: "text-ink bg-[#f1e45c]" };
  return { label: "Disponible", tone: "text-action bg-mint" };
}

export function getCatalogItem(slug: string) {
  return catalogItems.find((item) => item.slug === slug);
}

export function getProduct(productId: string) {
  return products.find((product) => product.id === productId);
}

export function getComboStock(combo: Combo) {
  const componentStock = combo.components.map((component) => {
    const product = getProduct(component.productId);
    return product ? Math.floor(product.stock / component.quantity) : 0;
  });

  return Math.min(...componentStock);
}

export function getRelatedItems(item: CatalogItem, limit = 3) {
  const relatedByCategory = catalogItems
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => {
      if (item.kind === "combo") return candidate.kind === "combo";
      return candidate.kind === "product" && candidate.category === item.category;
    });

  if (relatedByCategory.length > 0) return relatedByCategory.slice(0, limit);

  return catalogItems
    .filter((candidate) => candidate.id !== item.id && candidate.kind === item.kind)
    .slice(0, limit);
}

export function isCombo(item: CatalogItem): item is Combo {
  return item.kind === "combo";
}
