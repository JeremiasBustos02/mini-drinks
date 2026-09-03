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

type CartComponentInput = {
  product: Pick<Product, "id" | "name" | "image">;
  quantity: number;
};

function createComponents(inputs: CartComponentInput[]): CartComponent[] {
  const components = new Map<string, CartComponent>();

  for (const { product, quantity } of inputs) {
    const current = components.get(product.id);
    components.set(product.id, {
      productId: product.id,
      name: product.name,
      quantity: (current?.quantity ?? 0) + quantity,
      visual: product.image,
    });
  }

  return [...components.values()];
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
  components: CartComponentInput[];
  unitPrice: number;
  matchedCombo?: Pick<Combo, "id" | "name">;
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
    visual: components[0]?.product.image ?? "packaging",
    configuration,
    components: createComponents(components),
    matchedComboId: matchedCombo?.id,
    matchedComboName: matchedCombo?.name,
    savings,
  };
}
