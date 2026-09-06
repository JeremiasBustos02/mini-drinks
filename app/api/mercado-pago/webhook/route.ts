import { MPNotFoundError } from "mercadopago";

import { getMercadoPagoWebhookSecret } from "@/lib/mercado-pago/config";
import { fetchMercadoPagoPayment } from "@/lib/mercado-pago/fetch-payment";
import { processMercadoPagoPayment } from "@/lib/mercado-pago/process-payment";
import { handleMercadoPagoWebhook } from "@/lib/mercado-pago/webhook-handler";
import { logServerEvent } from "@/lib/observability/logger";
import { checkRateLimit, rateLimitPolicies } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clientIdentifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const limit = await checkRateLimit(rateLimitPolicies.webhookIp, clientIdentifier);
  if (!limit.allowed) {
    logServerEvent("warn", "mercado_pago.webhook_rate_limited", { source: limit.source });
    return Response.json(
      { error: limit.source === "unavailable" ? "service_unavailable" : "rate_limited" },
      { status: limit.source === "unavailable" ? 503 : 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }
  return handleMercadoPagoWebhook(request, {
    secret: getMercadoPagoWebhookSecret(),
    fetchPayment: async (paymentId) => {
      try {
        return await fetchMercadoPagoPayment(paymentId);
      } catch (error) {
        if (error instanceof MPNotFoundError) return null;
        throw error;
      }
    },
    processPayment: (payment, correlationId) => processMercadoPagoPayment(payment, correlationId),
    checkAuthenticatedRateLimit: (paymentId) => checkRateLimit(rateLimitPolicies.webhookPayment, paymentId),
  });
}
