import type { Combo, ComboItem, Product } from "@/types/catalog";

function normalizeComponents(components: ComboItem[]) {
  const normalized = new Map<string, number>();

  for (const component of components) {
    if (!Number.isInteger(component.quantity) || component.quantity <= 0) return null;

    const key = JSON.stringify([component.productId, component.variant ?? null]);
    normalized.set(key, (normalized.get(key) ?? 0) + component.quantity);
  }

  return normalized;
}

export function haveExactComponents(selection: ComboItem[], comboComponents: ComboItem[]) {
  const selected = normalizeComponents(selection);
  const expected = normalizeComponents(comboComponents);

  if (!selected || !expected || selected.size !== expected.size) return false;

  for (const [key, quantity] of selected) {
    if (expected.get(key) !== quantity) return false;
  }

  return true;
}

export function findBestMatchingCombo(selection: ComboItem[], combos: Combo[]) {
  if (selection.length === 0) return undefined;

  return combos
    .filter((combo) => combo.active && combo.published)
    .filter((combo) => haveExactComponents(selection, combo.components))
    .reduce<Combo | undefined>(
      (best, combo) => (!best || combo.price < best.price ? combo : best),
      undefined,
    );
}

function getComponentsPrice(components: ComboItem[], products: Product[]) {
  return components.reduce((total, component) => {
    const product = products.find((candidate) => candidate.id === component.productId);
    return total + (product?.price ?? 0) * component.quantity;
  }, 0);
}

export function calculateComboPrice(
  baseComponents: ComboItem[],
  extraComponents: ComboItem[],
  products: Product[],
  combos: Combo[],
) {
  const componentsPrice = getComponentsPrice(baseComponents, products);
  const extrasPrice = getComponentsPrice(extraComponents, products);
  const matchingCombo = findBestMatchingCombo(baseComponents, combos);
  const basePrice = matchingCombo
    ? Math.min(componentsPrice, matchingCombo.price)
    : componentsPrice;

  return {
    basePrice,
    componentsPrice,
    extrasPrice,
    finalPrice: basePrice + extrasPrice,
    matchingCombo,
    savings: componentsPrice - basePrice,
  };
}

export type ComboPricing = ReturnType<typeof calculateComboPrice>;
