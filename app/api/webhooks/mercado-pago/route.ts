import { MPNotFoundError } from "mercadopago";

import { getMercadoPagoWebhookSecret } from "@/lib/mercado-pago/config";
import { fetchMercadoPagoPayment } from "@/lib/mercado-pago/fetch-payment";
import { processMercadoPagoPayment } from "@/lib/mercado-pago/process-payment";
import { handleMercadoPagoWebhook } from "@/lib/mercado-pago/webhook-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    processPayment: processMercadoPagoPayment,
  });
}
