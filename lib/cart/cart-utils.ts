import type { CartItem, CustomComboConfiguration } from "@/types/cart";

export function getCartItemSubtotal(item: CartItem) {
  return item.unitPrice * item.quantity;
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + getCartItemSubtotal(item), 0);
}

export function getCartTotalItems(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function normalizeCustomComboConfiguration(configuration: CustomComboConfiguration) {
  return {
    ...configuration,
    extraIds: [...configuration.extraIds].sort(),
  };
}

export function getCustomComboConfigurationKey(configuration: CustomComboConfiguration) {
  return JSON.stringify(normalizeCustomComboConfiguration(configuration));
}

export function areCustomComboConfigurationsEqual(
  left: CustomComboConfiguration,
  right: CustomComboConfiguration,
) {
  return getCustomComboConfigurationKey(left) === getCustomComboConfigurationKey(right);
}

export function getCartItemMergeKey(item: CartItem) {
  switch (item.type) {
    case "product":
      return `product:${item.productId}`;
    case "combo":
      return `combo:${item.comboId}`;
    case "custom_combo":
      return `custom_combo:${getCustomComboConfigurationKey(item.configuration)}`;
    case "pack":
      return `pack:${item.packId}`;
  }
}
