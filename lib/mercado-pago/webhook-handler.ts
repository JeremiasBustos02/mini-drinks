import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";

import type { MercadoPagoPayment } from "@/lib/mercado-pago/payment";

const MAX_WEBHOOK_BYTES = 64 * 1024;
const PAYMENT_ID_PATTERN = /^\d{1,32}$/;

type WebhookDependencies = {
  secret: string;
  fetchPayment: (paymentId: string) => Promise<MercadoPagoPayment | null>;
  processPayment: (payment: MercadoPagoPayment) => Promise<{ outcome: string }>;
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
      console.warn("mercado_pago.webhook_signature_invalid", { requestId: xRequestId });
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

  console.info("mercado_pago.webhook_received", {
    requestId: xRequestId,
    paymentId: dataId,
  });
  try {
    const payment = await dependencies.fetchPayment(dataId);
    if (!payment) {
      console.warn("mercado_pago.payment_not_found", { paymentId: dataId });
      return Response.json({ received: true, ignored: true });
    }
    console.info("mercado_pago.payment_fetched", {
      paymentId: payment.id,
      status: payment.status,
    });
    const result = await dependencies.processPayment(payment);
    return Response.json({ received: true, outcome: result.outcome });
  } catch (error) {
    console.error("mercado_pago.webhook_processing_failed", {
      paymentId: dataId,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return Response.json({ error: "temporary_processing_error" }, { status: 502 });
  }
}
