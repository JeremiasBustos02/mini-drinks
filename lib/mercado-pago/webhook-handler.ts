import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";

import type { MercadoPagoPayment } from "@/lib/mercado-pago/payment";
import { logServerEvent } from "@/lib/observability/logger";
import type { RateLimitResult } from "@/lib/rate-limit";

const MAX_WEBHOOK_BYTES = 64 * 1024;
const PAYMENT_ID_PATTERN = /^\d{1,32}$/;

type WebhookDependencies = {
  secret: string;
  fetchPayment: (paymentId: string) => Promise<MercadoPagoPayment | null>;
  processPayment: (payment: MercadoPagoPayment, correlationId: string) => Promise<{ outcome: string }>;
  checkAuthenticatedRateLimit?: (paymentId: string) => Promise<RateLimitResult>;
};

export async function handleMercadoPagoWebhook(
  request: Request,
  dependencies: WebhookDependencies,
) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id")?.trim() ?? "";
  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";
  if (!PAYMENT_ID_PATTERN.test(dataId) || !xSignature || !xRequestId) {
    return Response.json({ error: "invalid_webhook" }, { status: 400 });
  }

  let payload: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, "utf8") > MAX_WEBHOOK_BYTES) {
      return Response.json({ error: "payload_too_large" }, { status: 413 });
    }
    payload = JSON.parse(text);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret: dependencies.secret,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      logServerEvent("warn", "mercado_pago.webhook_signature_invalid", { correlationId: xRequestId });
      return Response.json({ error: "invalid_signature" }, { status: 401 });
    }
    throw error;
  }

  const body = payload as { type?: unknown; data?: { id?: unknown } };
  if (body.type !== "payment") {
    return Response.json({ received: true, ignored: true });
  }
  if (body.data?.id !== undefined && String(body.data.id) !== dataId) {
    return Response.json({ error: "payment_id_mismatch" }, { status: 400 });
  }

  const authenticatedLimit = await dependencies.checkAuthenticatedRateLimit?.(dataId);
  if (authenticatedLimit && !authenticatedLimit.allowed) {
    logServerEvent("warn", "mercado_pago.webhook_payment_rate_limited", {
      correlationId: xRequestId,
      paymentId: dataId,
      source: authenticatedLimit.source,
    });
    return Response.json(
      { error: "temporary_processing_error" },
      {
        status: authenticatedLimit.source === "unavailable" ? 503 : 429,
        headers: { "Retry-After": String(authenticatedLimit.retryAfterSeconds) },
      },
    );
  }

  logServerEvent("info", "mercado_pago.webhook_received", {
    correlationId: xRequestId,
    paymentId: dataId,
  });
  try {
    const payment = await dependencies.fetchPayment(dataId);
    if (!payment) {
      logServerEvent("warn", "mercado_pago.payment_not_found", { correlationId: xRequestId, paymentId: dataId });
      return Response.json({ error: "temporary_processing_error" }, { status: 503 });
    }
    logServerEvent("info", "mercado_pago.payment_fetched", {
      correlationId: xRequestId,
      paymentId: payment.id,
      status: payment.status,
    });
    const result = await dependencies.processPayment(payment, xRequestId);
    return Response.json({ received: true, outcome: result.outcome });
  } catch (error) {
    logServerEvent("error", "mercado_pago.webhook_processing_failed", {
      correlationId: xRequestId,
      paymentId: dataId,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return Response.json({ error: "temporary_processing_error" }, { status: 502 });
  }
}
