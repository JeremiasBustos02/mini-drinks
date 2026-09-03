import type { Combo, Product } from "@/types/catalog";

export type ComboBuilderProduct = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "price"
  | "stock"
  | "productType"
  | "image"
  | "imageUrl"
  | "volume"
>;

export type ComboBuilderCombo = Pick<
  Combo,
  "id" | "name" | "price" | "published" | "active" | "available" | "components"
>;

export type ComboSelection = {
  miniatureId: string | null;
  mixerId: string | null;
  glassId: string | null;
  extraIds: string[];
};

export type ExtraOption = {
  product: ComboBuilderProduct;
  displayName: string;
  caption: string;
};
