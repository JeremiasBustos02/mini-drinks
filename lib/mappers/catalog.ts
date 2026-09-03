import type { ComboRecord, ProductRecord } from "@/lib/db/schema";
import { getDerivedComboStock } from "@/lib/catalog/availability";
import type {
  ComboBuilderCombo,
  ComboBuilderProduct,
} from "@/components/combo-builder/types";
import type { CatalogCategory, Category, Combo, Product, ProductType, VisualVariant } from "@/types/catalog";

type ProductWithCategory = ProductRecord & {
  category: { id: string; name: string; slug: string; description: string | null };
};

export type ComboWithComponents = {
  combo: ComboRecord;
  components: { quantity: number; product: ProductRecord }[];
};

const productTypeVisuals: Record<ProductType, VisualVariant> = {
  miniature: "fernet",
  mixer: "tonic",
  glass: "glass",
  extra: "extra",
  accessory: "extra",
  supply: "packaging",
};

const knownVisuals: [string, VisualVariant][] = [
  ["fernet", "fernet"],
  ["jack", "jack"],
  ["gin", "gin"],
  ["vodka", "vodka"],
  ["tequila", "tequila"],
  ["coca", "coca"],
  ["tonica", "tonic"],
  ["speed", "speed"],
  ["seven", "sevenup"],
  ["pomelo", "grapefruit"],
  ["jugo", "juice"],
  ["vaso", "glass"],
];

function getVisual(slug: string, productType: ProductType): VisualVariant {
  return knownVisuals.find(([fragment]) => slug.includes(fragment))?.[1] ?? productTypeVisuals[productType];
}

function getVolume(name: string) {
  return name.match(/\b\d+(?:[.,]\d+)?\s*ml\b/i)?.[0];
}

export function mapCategory(category: ProductWithCategory["category"]): Category {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description ?? "",
  };
}

export function mapProduct(record: ProductWithCategory): Product {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    price: record.price,
    published: record.published,
    image: getVisual(record.slug, record.productType),
    imageUrl: record.imageUrl,
    category: record.category.slug,
    categoryName: record.category.name,
    kind: "product",
    stock: record.stock,
    available: record.stock,
    productType: record.productType,
    volume: getVolume(record.name),
  };
}

export function mapComboBuilderProduct(record: ProductWithCategory): ComboBuilderProduct {
  const product = mapProduct(record);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    productType: product.productType,
    image: product.image,
    imageUrl: product.imageUrl,
    volume: product.volume,
  };
}

export function mapCombo(record: ComboWithComponents): Combo {
  const components = record.components.map(({ quantity, product }) => ({
    productId: product.id,
    name: product.name,
    quantity,
    image: getVisual(product.slug, product.productType),
  }));
  const referencePrice = record.components.reduce(
    (total, { product, quantity }) => total + product.price * quantity,
    0,
  );

  return {
    id: record.combo.id,
    slug: record.combo.slug,
    name: record.combo.name,
    description: record.combo.description,
    price: Math.min(record.combo.promotionalPrice ?? referencePrice, referencePrice),
    referencePrice,
    published: record.combo.published,
    image: components[0]?.image ?? "packaging",
    imageUrl: record.combo.imageUrl,
    category: "combos" as CatalogCategory,
    categoryName: "Combos",
    kind: "combo",
    active: record.combo.active,
    available: getDerivedComboStock(
      record.components.map(({ product, quantity }) => ({
        stock: product.stock,
        quantity,
        available: product.active && product.published,
      })),
    ),
    components,
    includesSurprise: true,
  };
}

export function mapComboBuilderCombo(record: ComboWithComponents): ComboBuilderCombo {
  const combo = mapCombo(record);

  return {
    id: combo.id,
    name: combo.name,
    price: combo.price,
    published: combo.published,
    active: combo.active,
    available: combo.available,
    components: combo.components,
  };
}
