import type { CartItem } from "@/types/cart";
import type { VisualVariant } from "@/types/catalog";
import {
  CHECKOUT_MAX_COMPONENT_QUANTITY,
  CHECKOUT_MAX_LINE_QUANTITY,
} from "@/lib/checkout/limits";

type PersistedCartState = { items: CartItem[] };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const visualVariants = new Set<VisualVariant>([
  "fernet", "jack", "gin", "vodka", "tequila", "coca", "tonic", "speed",
  "sevenup", "grapefruit", "juice", "glass", "extra", "packaging",
]);

function hasValidBase(item: Record<string, unknown>) {
  return (
    typeof item.lineId === "string" &&
    typeof item.name === "string" &&
    typeof item.visual === "string" &&
    visualVariants.has(item.visual as VisualVariant) &&
    Number.isSafeInteger(item.unitPrice) &&
    Number(item.unitPrice) >= 0 &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) > 0 &&
    Number(item.quantity) <= CHECKOUT_MAX_LINE_QUANTITY
  );
}

function hasValidComponents(value: unknown) {
  return Array.isArray(value) && value.every((component) => {
    if (!component || typeof component !== "object") return false;
    const entry = component as Record<string, unknown>;
    return (
      typeof entry.productId === "string" &&
      uuidPattern.test(entry.productId) &&
      typeof entry.name === "string" &&
      typeof entry.visual === "string" &&
      visualVariants.has(entry.visual as VisualVariant) &&
      Number.isInteger(entry.quantity) &&
      Number(entry.quantity) > 0 &&
      Number(entry.quantity) <= CHECKOUT_MAX_COMPONENT_QUANTITY
    );
  });
}

function isCheckoutCompatibleCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (!hasValidBase(item)) return false;

  if (item.type === "product") {
    return (
      typeof item.productId === "string" &&
      uuidPattern.test(item.productId) &&
      typeof item.reference === "string"
    );
  }
  if (item.type === "combo") {
    return (
      typeof item.comboId === "string" &&
      uuidPattern.test(item.comboId) &&
      hasValidComponents(item.components)
    );
  }
  if (item.type !== "custom_combo" || !item.configuration || typeof item.configuration !== "object") {
    return false;
  }

  const configuration = item.configuration as Record<string, unknown>;
  const ids = [
    configuration.miniatureId,
    configuration.mixerId,
    configuration.glassId,
    ...(Array.isArray(configuration.extraIds) ? configuration.extraIds : []),
  ];
  return (
    typeof configuration.miniatureId === "string" &&
    uuidPattern.test(configuration.miniatureId) &&
    typeof configuration.mixerId === "string" &&
    uuidPattern.test(configuration.mixerId) &&
    typeof configuration.glassId === "string" &&
    uuidPattern.test(configuration.glassId) &&
    Array.isArray(configuration.extraIds) &&
    configuration.extraIds.length <= CHECKOUT_MAX_COMPONENT_QUANTITY &&
    configuration.extraIds.every((id) => typeof id === "string" && uuidPattern.test(id)) &&
    new Set(ids).size === ids.length &&
    hasValidComponents(item.components)
  );
}

export function migratePersistedCart(persistedState: unknown, version: number): PersistedCartState {
  if (!persistedState || typeof persistedState !== "object") return { items: [] };

  const state = persistedState as { items?: unknown };
  if (!Array.isArray(state.items)) return { items: [] };

  const migratedItems = version === 0
    ? state.items.map((item) => {
        if (!item || typeof item !== "object" || typeof (item as { unitPrice?: unknown }).unitPrice !== "number") {
          return item;
        }
        const cartItem = item as Record<string, unknown>;
        return cartItem.type === "custom_combo"
          ? {
              ...cartItem,
              unitPrice: Number(cartItem.unitPrice) * 100,
              savings: Number(cartItem.savings) * 100,
            }
          : { ...cartItem, unitPrice: Number(cartItem.unitPrice) * 100 };
      })
    : state.items;
  const items = migratedItems.map((item) => {
    if (!item || typeof item !== "object" || !Number.isFinite((item as { quantity?: unknown }).quantity)) {
      return item;
    }
    return {
      ...item,
      quantity: Math.min(
        CHECKOUT_MAX_LINE_QUANTITY,
        Math.floor(Number((item as { quantity: number }).quantity)),
      ),
    };
  });

  return { items: items.filter(isCheckoutCompatibleCartItem).slice(0, 30) };
}
