import type { VisualVariant } from "@/types/catalog";

export type CartItemType = "product" | "combo" | "custom_combo" | "pack";

export type CartComponent = {
  productId: string;
  name: string;
  quantity: number;
  visual: VisualVariant;
};

type CartItemBase = {
  lineId: string;
  type: CartItemType;
  name: string;
  unitPrice: number;
  quantity: number;
  visual: VisualVariant;
};

export type ProductCartItem = CartItemBase & {
  type: "product";
  productId: string;
  reference: string;
};

export type ComboCartItem = CartItemBase & {
  type: "combo";
  comboId: string;
  components: CartComponent[];
};

export type CustomComboConfiguration = {
  miniatureId: string;
  mixerId: string;
  glassId: string;
  extraIds: string[];
};

export type CustomComboCartItem = CartItemBase & {
  type: "custom_combo";
  customComboId: string;
  configuration: CustomComboConfiguration;
  components: CartComponent[];
  matchedComboId?: string;
  matchedComboName?: string;
  savings: number;
};

// Reserved for predefined and configurable packs in a future iteration.
export type PackCartItem = CartItemBase & {
  type: "pack";
  packId: string;
  components: CartComponent[];
};

export type CartItem =
  | ProductCartItem
  | ComboCartItem
  | CustomComboCartItem
  | PackCartItem;
