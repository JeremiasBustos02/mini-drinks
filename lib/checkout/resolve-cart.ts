import { getDerivedProductStock } from "@/lib/catalog/availability";
import { calculateComboPrice } from "@/lib/pricing/combo-pricing";
import type {
  CheckoutFailure,
  OrderSnapshotComponent,
  ResolvedCheckout,
  ResolvedCheckoutLine,
  ResolvedStockRequirement,
} from "@/types/checkout";
import type { ProductType } from "@/types/domain";
import type { ValidCheckoutPayload } from "@/lib/checkout/validation";
import {
  addStockRequirement,
  findInsufficientStock,
  type StockRequirement,
} from "@/lib/checkout/stock";

export type CheckoutCatalogProduct = {
  id: string;
  name: string;
  productType: ProductType;
  price: number;
  stock: number;
  active: boolean;
  published: boolean;
};

export type CheckoutCatalogCombo = {
  id: string;
  name: string;
  promotionalPrice: number | null;
  active: boolean;
  published: boolean;
  components: { productId: string; quantity: number }[];
};

export type CheckoutCatalog = {
  products: CheckoutCatalogProduct[];
  combos: CheckoutCatalogCombo[];
};

export type ResolveCheckoutResult =
  | { ok: true; checkout: ResolvedCheckout; stockRequirements: ResolvedStockRequirement[] }
  | CheckoutFailure;

function failure(code: CheckoutFailure["code"], message: string): CheckoutFailure {
  return { ok: false, code, message };
}

function validMoney(value: number) {
  return Number.isSafeInteger(value) && value >= 0;
}

function snapshotComponent(
  product: CheckoutCatalogProduct,
  quantity: number,
): OrderSnapshotComponent {
  return {
    productId: product.id,
    name: product.name,
    productType: product.productType,
    quantity,
    unitPrice: product.price,
  };
}

export function resolveCheckout(
  payload: ValidCheckoutPayload,
  catalog: CheckoutCatalog,
): ResolveCheckoutResult {
  if (payload.lines.length === 0) return failure("empty_cart", "El carrito está vacío.");

  const productsById = new Map(catalog.products.map((product) => [product.id, product]));
  const combosById = new Map(catalog.combos.map((combo) => [combo.id, combo]));
  const requirements = new Map<string, StockRequirement>();
  const resolvedLines: ResolvedCheckoutLine[] = [];

  const pricingCombos = catalog.combos.map((combo) => {
    const components = combo.components.map((component) => ({
      productId: component.productId,
      quantity: component.quantity,
    }));
    const componentProducts = combo.components.flatMap((component) => {
      const product = productsById.get(component.productId);
      return product
        ? [{
            productId: product.id,
            quantity: component.quantity,
            stock: product.stock,
            available: product.active && product.published,
          }]
        : [];
    });
    const referencePrice = combo.components.reduce((total, component) => {
      const product = productsById.get(component.productId);
      return product ? total + product.price * component.quantity : Number.NaN;
    }, 0);

    return {
      id: combo.id,
      name: combo.name,
      price: Math.min(combo.promotionalPrice ?? referencePrice, referencePrice),
      active: combo.active,
      published: combo.published,
      available:
        componentProducts.length === combo.components.length
          ? getDerivedProductStock(componentProducts)
          : 0,
      components,
    };
  });

  try {
    for (const [lineIndex, line] of payload.lines.entries()) {
      let resolved: Omit<ResolvedCheckoutLine, "lineIndex" | "subtotal" | "priceChanged" | "previousUnitPrice">;

      if (line.type === "product") {
        const product = productsById.get(line.productId);
        if (!product) return failure("product_not_found", "Uno de los productos ya no existe.");
        if (!product.active || !product.published) {
          return failure("product_unavailable", `${product.name} ya no está disponible.`);
        }
        if (!validMoney(product.price)) return failure("invalid_money", "El catálogo contiene un precio inválido.");
        addStockRequirement(requirements, product, 1, line.quantity);
        resolved = {
          itemType: "product",
          referenceId: product.id,
          displayName: product.name,
          quantity: line.quantity,
          unitPrice: product.price,
          configurationJson: null,
        };
      } else if (line.type === "combo") {
        const combo = combosById.get(line.comboId);
        if (!combo) return failure("combo_not_found", "Uno de los combos ya no existe.");
        if (!combo.active || !combo.published || combo.components.length === 0) {
          return failure("combo_unavailable", `${combo.name} ya no está disponible.`);
        }

        const components: OrderSnapshotComponent[] = [];
        let referencePrice = 0;
        for (const component of combo.components) {
          const product = productsById.get(component.productId);
          if (!product || !product.active || !product.published) {
            return failure("combo_unavailable", `${combo.name} tiene un componente no disponible.`);
          }
          if (!validMoney(product.price)) return failure("invalid_money", "El catálogo contiene un precio inválido.");
          components.push(snapshotComponent(product, component.quantity));
          referencePrice += product.price * component.quantity;
          addStockRequirement(requirements, product, component.quantity, line.quantity);
        }
        const unitPrice = Math.min(combo.promotionalPrice ?? referencePrice, referencePrice);
        if (!validMoney(referencePrice) || !validMoney(unitPrice)) {
          return failure("invalid_money", "El combo produce un importe fuera del rango seguro.");
        }
        resolved = {
          itemType: "combo",
          referenceId: combo.id,
          displayName: combo.name,
          quantity: line.quantity,
          unitPrice,
          configurationJson: {
            version: 1,
            kind: "preset_combo",
            components,
            referencePrice,
            promotionalPrice: combo.promotionalPrice,
          },
        };
      } else {
        const baseComponents: OrderSnapshotComponent[] = [];
        const extras: OrderSnapshotComponent[] = [];

        for (const component of line.components) {
          const product = productsById.get(component.productId);
          if (!product) return failure("invalid_custom_combo", "El combo personalizado contiene un producto desconocido.");
          if (!product.active || !product.published) {
            return failure("invalid_custom_combo", `${product.name} ya no está disponible.`);
          }
          const validType =
            component.role === "extra"
              ? product.productType === "extra" || product.productType === "accessory"
              : product.productType === component.role;
          if (!validType) return failure("invalid_custom_combo", "La configuración del combo personalizado no es válida.");
          if (!validMoney(product.price)) return failure("invalid_money", "El catálogo contiene un precio inválido.");
          const snapshot = snapshotComponent(product, component.quantity);
          (component.role === "extra" ? extras : baseComponents).push(snapshot);
          addStockRequirement(requirements, product, component.quantity, line.quantity);
        }

        const pricing = calculateComboPrice(
          baseComponents.map(({ productId, quantity }) => ({ productId, quantity })),
          extras.map(({ productId, quantity }) => ({ productId, quantity })),
          catalog.products.map(({ id, price }) => ({ id, price })),
          pricingCombos,
        );
        if (!pricing.ok) return failure("invalid_custom_combo", "No se pudo calcular el combo personalizado.");

        resolved = {
          itemType: "custom_combo",
          referenceId: null,
          displayName: pricing.matchingCombo
            ? `${pricing.matchingCombo.name} a tu manera`
            : "Combo a tu manera",
          quantity: line.quantity,
          unitPrice: pricing.finalPrice,
          configurationJson: {
            version: 1,
            kind: "custom_combo",
            baseComponents,
            extras,
            individualBasePrice: pricing.componentsPrice,
            extrasPrice: pricing.extrasPrice,
            matchedCombo: pricing.matchingCombo
              ? { id: pricing.matchingCombo.id, name: pricing.matchingCombo.name }
              : null,
            savings: pricing.savings,
          },
        };
      }

      const subtotal = resolved.unitPrice * resolved.quantity;
      if (!validMoney(subtotal)) return failure("invalid_money", "El total supera el rango permitido.");
      const displayedUnitPrice = line.displayedUnitPrice ?? null;
      resolvedLines.push({
        lineIndex,
        ...resolved,
        subtotal,
        previousUnitPrice: displayedUnitPrice,
        priceChanged: displayedUnitPrice !== null && displayedUnitPrice !== resolved.unitPrice,
      });
    }
  } catch {
    return failure("invalid_money", "Las cantidades producen un valor fuera del rango permitido.");
  }

  const insufficient = findInsufficientStock(requirements.values());
  if (insufficient.length > 0) {
    const item = insufficient[0];
    return failure(
      "insufficient_stock",
      `Stock insuficiente de ${item.name}: se necesitan ${item.required} y hay ${Math.max(0, item.stock)}.`,
    );
  }

  const subtotal = resolvedLines.reduce((total, line) => total + line.subtotal, 0);
  const discountTotal = 0;
  const deliveryTotal = 0;
  const total = subtotal;
  if (![subtotal, total].every(validMoney)) return failure("invalid_money", "El total supera el rango permitido.");

  return {
    ok: true,
    stockRequirements: [...requirements.values()]
      .map(({ productId, name, required }) => ({ productId, name, quantity: required }))
      .sort((left, right) => left.productId.localeCompare(right.productId)),
    checkout: {
      lines: resolvedLines,
      subtotal,
      discountTotal,
      deliveryTotal,
      total,
      hasPriceChanges: resolvedLines.some((line) => line.priceChanged),
    },
  };
}
