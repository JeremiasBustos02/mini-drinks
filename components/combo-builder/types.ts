import type { Product } from "@/types/catalog";

export type ComboSelection = {
  miniatureId: string | null;
  mixerId: string | null;
  glassId: string | null;
  extraIds: string[];
};

export type ExtraOption = {
  product: Product;
  displayName: string;
  caption: string;
};
