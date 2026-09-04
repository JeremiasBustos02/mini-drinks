import type { CheckoutErrorCode, CheckoutFailure } from "@/types/checkout";

const defaultMessages: Record<CheckoutErrorCode, string> = {
  invalid_payload: "Revisá los datos del checkout.",
  empty_cart: "El carrito está vacío.",
  product_not_found: "Un producto del carrito ya no está disponible.",
  product_unavailable: "Un producto del carrito ya no está disponible.",
  combo_not_found: "Un combo del carrito ya no está disponible.",
  combo_unavailable: "Un combo del carrito ya no está disponible.",
  invalid_custom_combo: "La configuración del combo ya no es válida.",
  insufficient_stock: "No hay stock suficiente para completar el pedido.",
  invalid_money: "No pudimos validar el precio actual.",
  price_changed: "El precio cambió. Revisá el total actualizado antes de continuar.",
  idempotency_conflict: "El intento anterior corresponde a otro carrito. Volvé a intentar para iniciar uno nuevo.",
  payment_not_ready: "No pudimos iniciar Mercado Pago. Tu pedido y carrito siguen guardados para reintentar.",
  rate_limited: "Hiciste varios intentos seguidos. Esperá un momento y volvé a intentar.",
  order_not_created: "Ocurrió un error temporal. Tu carrito sigue guardado.",
};

export function checkoutFailure(
  code: CheckoutErrorCode,
  options: Omit<CheckoutFailure, "ok" | "code" | "message"> & { message?: string } = {},
): CheckoutFailure {
  return { ok: false, code, message: options.message ?? defaultMessages[code], ...options };
}

export function isRetryableCheckoutError(code: CheckoutErrorCode) {
  return code === "payment_not_ready" || code === "rate_limited" || code === "order_not_created";
}
