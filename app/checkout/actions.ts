"use server";

import { createOrder } from "@/lib/checkout/create-order";
import { checkoutFailure } from "@/lib/checkout/errors";
import { loadCheckoutCatalog } from "@/lib/checkout/catalog";
import { resolveCheckout } from "@/lib/checkout/resolve-cart";
import { createCheckoutQuoteHash } from "@/lib/checkout/quote-hash";
import {
  checkoutSchema,
  createOrderSchema,
  getCheckoutFieldErrors,
} from "@/lib/checkout/validation";
import type { CheckoutCreationResult, CheckoutQuoteResult } from "@/types/checkout";
import { logServerEvent } from "@/lib/observability/logger";
import { getRequestContext } from "@/lib/observability/request-context";
import { checkRateLimit, rateLimitPolicies } from "@/lib/rate-limit";

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
  const startedAt = Date.now();
  let stage = "rate_limit";
  const request = await getRequestContext();
  const ipLimit = await checkRateLimit(rateLimitPolicies.quoteIp, request.clientIdentifier);
  if (!ipLimit.allowed) {
    logServerEvent("warn", "checkout.quote_rate_limited", { correlationId: request.correlationId, stage, source: ipLimit.source });
    return checkoutFailure("rate_limited", { correlationId: request.correlationId, retryAfterSeconds: ipLimit.retryAfterSeconds });
  }
  if (isEmptyCart(input)) {
    logServerEvent("info", "checkout.quote_rejected", { correlationId: request.correlationId, stage: "validation", code: "empty_cart" });
    return { ok: false, code: "empty_cart", message: "El carrito está vacío." };
  }
  stage = "validation";
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    stage = parsed.error.issues.some((issue) => issue.path[0] === "fulfillment")
      ? "fulfillment"
      : stage;
    logServerEvent("info", "checkout.quote_rejected", { correlationId: request.correlationId, stage, code: "invalid_payload" });
    return {
      ok: false,
      code: "invalid_payload",
      message: "Revisá los datos del checkout.",
      fieldErrors: getCheckoutFieldErrors(parsed.error),
    };
  }

  stage = "rate_limit";
  const attemptLimit = await checkRateLimit(rateLimitPolicies.quoteAttempt, parsed.data.checkoutAttemptId);
  if (!attemptLimit.allowed) {
    logServerEvent("warn", "checkout.quote_rate_limited", { correlationId: request.correlationId, checkoutAttemptId: parsed.data.checkoutAttemptId, stage, source: attemptLimit.source });
    return checkoutFailure("rate_limited", { correlationId: request.correlationId, retryAfterSeconds: attemptLimit.retryAfterSeconds });
  }

  try {
    stage = "catalog_load";
    const catalog = await loadCheckoutCatalog();
    stage = "resolve_cart";
    const result = resolveCheckout(parsed.data, catalog);
    if (!result.ok) {
      const resultStage = result.code === "insufficient_stock"
        ? "stock"
        : result.code === "invalid_money"
          ? "pricing"
          : stage;
      logServerEvent("info", "checkout.quote_rejected", {
        correlationId: request.correlationId,
        checkoutAttemptId: parsed.data.checkoutAttemptId,
        stage: resultStage,
        code: result.code,
      });
    }
    stage = "quote_hash";
    const response: CheckoutQuoteResult = result.ok
      ? {
          ok: true,
          quote: result.checkout,
          quoteHash: createCheckoutQuoteHash(result.checkout, parsed.data.fulfillment),
        }
      : result;
    stage = "response";
    logServerEvent("info", "checkout.quote_completed", { correlationId: request.correlationId, checkoutAttemptId: parsed.data.checkoutAttemptId, stage, status: response.ok ? "ok" : response.code, durationMs: Date.now() - startedAt });
    return response;
  } catch (error) {
    logServerEvent("error", "checkout.quote_failed", { correlationId: request.correlationId, checkoutAttemptId: parsed.data.checkoutAttemptId, stage, durationMs: Date.now() - startedAt, error });
    return checkoutFailure("order_not_created", { correlationId: request.correlationId, message: "No pudimos actualizar tu pedido. Intentá nuevamente." });
  }
}

export async function createOrderAction(input: unknown): Promise<CheckoutCreationResult> {
  const startedAt = Date.now();
  const request = await getRequestContext();
  const ipLimit = await checkRateLimit(rateLimitPolicies.createIp, request.clientIdentifier);
  if (!ipLimit.allowed) return checkoutFailure("rate_limited", { correlationId: request.correlationId, retryAfterSeconds: ipLimit.retryAfterSeconds });
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
  const attemptLimit = await checkRateLimit(rateLimitPolicies.createAttempt, parsed.data.checkoutAttemptId);
  if (!attemptLimit.allowed) return checkoutFailure("rate_limited", { correlationId: request.correlationId, retryAfterSeconds: attemptLimit.retryAfterSeconds });
  try {
    const result = await createOrder(parsed.data, request.correlationId);
    logServerEvent("info", "checkout.order_request_completed", { correlationId: request.correlationId, checkoutAttemptId: parsed.data.checkoutAttemptId, status: result.ok ? "ok" : result.code, durationMs: Date.now() - startedAt });
    return result;
  } catch (error) {
    const databaseError = error as { code?: unknown };
    logServerEvent("error", "checkout.order_request_failed", { correlationId: request.correlationId, checkoutAttemptId: parsed.data.checkoutAttemptId, code: databaseError?.code, durationMs: Date.now() - startedAt });
    return checkoutFailure("order_not_created", { correlationId: request.correlationId, message: "No se pudo crear el pedido. Tu carrito sigue guardado para reintentar." });
  }
}
