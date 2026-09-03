import type {
  CartComponent,
  ComboCartItem,
  CustomComboCartItem,
  CustomComboConfiguration,
  ProductCartItem,
} from "@/types/cart";
import type { Combo, Product } from "@/types/catalog";

function createLineId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
}

function createComponent(product: Product): CartComponent {
  return {
    productId: product.id,
    name: product.name,
    quantity: 1,
    visual: product.image,
  };
}

export function createProductCartItem(product: Product): ProductCartItem {
  return {
    lineId: createLineId("product"),
    type: "product",
    productId: product.id,
    reference: product.slug,
    name: product.name,
    unitPrice: product.price,
    quantity: 1,
    visual: product.image,
  };
}

export function createComboCartItem(combo: Combo): ComboCartItem {
  return {
    lineId: createLineId("combo"),
    type: "combo",
    comboId: combo.id,
    name: combo.name,
    unitPrice: combo.price,
    quantity: 1,
    visual: combo.image,
    components: combo.components.map((component) => ({
      productId: component.productId,
      name: component.name ?? "Producto",
      quantity: component.quantity,
      visual: component.image ?? "extra",
    })),
  };
}

type CreateCustomComboCartItemInput = {
  configuration: CustomComboConfiguration;
  components: Product[];
  unitPrice: number;
  matchedCombo?: Combo;
  savings: number;
};

export function createCustomComboCartItem({
  configuration,
  components,
  unitPrice,
  matchedCombo,
  savings,
}: CreateCustomComboCartItemInput): CustomComboCartItem {
  return {
    lineId: createLineId("custom-combo"),
    type: "custom_combo",
    customComboId: createLineId("configuration"),
    name: matchedCombo ? `${matchedCombo.name} a tu manera` : "Combo a tu manera",
    unitPrice,
    quantity: 1,
    visual: components[0]?.image ?? "packaging",
    configuration,
    components: components.map(createComponent),
    matchedComboId: matchedCombo?.id,
    matchedComboName: matchedCombo?.name,
    savings,
  };
}
