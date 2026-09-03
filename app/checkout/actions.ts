"use server";

import { createOrder } from "@/lib/checkout/create-order";
import { loadCheckoutCatalog } from "@/lib/checkout/catalog";
import { resolveCheckout } from "@/lib/checkout/resolve-cart";
import { createCheckoutQuoteHash } from "@/lib/checkout/quote-hash";
import {
  checkoutSchema,
  createOrderSchema,
  getCheckoutFieldErrors,
} from "@/lib/checkout/validation";
import type { CheckoutCreationResult, CheckoutQuoteResult } from "@/types/checkout";

function isEmptyCart(value: unknown) {
  return Boolean(
    value &&
      typeof value === "object" &&
      "lines" in value &&
      Array.isArray(value.lines) &&
      value.lines.length === 0,
  );
}

export async function quoteCheckoutAction(input: unknown): Promise<CheckoutQuoteResult> {
  if (isEmptyCart(input)) {
    return { ok: false, code: "empty_cart", message: "El carrito está vacío." };
  }
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_payload",
      message: "Revisá los datos del checkout.",
      fieldErrors: getCheckoutFieldErrors(parsed.error),
    };
  }

  try {
    const result = resolveCheckout(parsed.data, await loadCheckoutCatalog());
    return result.ok
      ? {
          ok: true,
          quote: result.checkout,
          quoteHash: createCheckoutQuoteHash(result.checkout, parsed.data.fulfillment),
        }
      : result;
  } catch (error) {
    console.error("Checkout quote failed", { error });
    return {
      ok: false,
      code: "order_not_created",
      message: "No pudimos validar el carrito. Intentá nuevamente.",
    };
  }
}

export async function createOrderAction(input: unknown): Promise<CheckoutCreationResult> {
  if (isEmptyCart(input)) {
    return { ok: false, code: "empty_cart", message: "El carrito está vacío." };
  }
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_payload",
      message: "Revisá los datos del checkout.",
      fieldErrors: getCheckoutFieldErrors(parsed.error),
    };
  }
  try {
    return await createOrder(parsed.data);
  } catch (error) {
    const databaseError = error as { code?: unknown };
    console.error("Checkout request failed", { code: databaseError?.code });
    return {
      ok: false,
      code: "order_not_created",
      message: "No se pudo crear el pedido. Tu carrito sigue guardado.",
    };
  }
}
