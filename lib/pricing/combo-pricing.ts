import type { Combo, ComboItem, Product } from "@/types/catalog";

export type ComboPricingError =
  | { code: "unknown_product"; productId: string }
  | { code: "invalid_quantity"; productId: string }
  | { code: "invalid_price"; referenceId: string };

export type ValidComboPricing = {
  ok: true;
  basePrice: number;
  componentsPrice: number;
  extrasPrice: number;
  finalPrice: number;
  matchingCombo: Combo | undefined;
  savings: number;
};

export type InvalidComboPricing = {
  ok: false;
  error: ComboPricingError;
};

export type ComboPricing = ValidComboPricing | InvalidComboPricing;

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

function getComponentsPrice(
  components: ComboItem[],
  productsById: ReadonlyMap<string, Product>,
): { ok: true; price: number } | InvalidComboPricing {
  let price = 0;

  for (const component of components) {
    if (!Number.isSafeInteger(component.quantity) || component.quantity <= 0) {
      return {
        ok: false,
        error: { code: "invalid_quantity", productId: component.productId },
      };
    }

    const product = productsById.get(component.productId);

    if (!product) {
      return {
        ok: false,
        error: { code: "unknown_product", productId: component.productId },
      };
    }

    if (!Number.isSafeInteger(product.price) || product.price < 0) {
      return { ok: false, error: { code: "invalid_price", referenceId: product.id } };
    }

    price += product.price * component.quantity;

    if (!Number.isSafeInteger(price)) {
      return { ok: false, error: { code: "invalid_price", referenceId: product.id } };
    }
  }

  return { ok: true, price };
}

export function calculateComboPrice(
  baseComponents: ComboItem[],
  extraComponents: ComboItem[],
  products: Product[],
  combos: Combo[],
) : ComboPricing {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const componentsResult = getComponentsPrice(baseComponents, productsById);

  if (!componentsResult.ok) return componentsResult;

  const extrasResult = getComponentsPrice(extraComponents, productsById);

  if (!extrasResult.ok) return extrasResult;

  const matchingCombo = findBestMatchingCombo(baseComponents, combos);
  const componentsPrice = componentsResult.price;
  const extrasPrice = extrasResult.price;

  if (
    matchingCombo &&
    (!Number.isSafeInteger(matchingCombo.price) || matchingCombo.price < 0)
  ) {
    return {
      ok: false,
      error: { code: "invalid_price", referenceId: matchingCombo.id },
    };
  }

  const basePrice = matchingCombo
    ? Math.min(componentsPrice, matchingCombo.price)
    : componentsPrice;
  const finalPrice = basePrice + extrasPrice;

  if (!Number.isSafeInteger(finalPrice)) {
    return {
      ok: false,
      error: { code: "invalid_price", referenceId: matchingCombo?.id ?? "selection" },
    };
  }

  return {
    ok: true,
    basePrice,
    componentsPrice,
    extrasPrice,
    finalPrice,
    matchingCombo,
    savings: componentsPrice - basePrice,
  };
}
