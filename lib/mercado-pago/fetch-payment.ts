import "server-only";

import { MercadoPagoConfig, MerchantOrder, Payment } from "mercadopago";

import { getMercadoPagoAccessToken } from "@/lib/mercado-pago/config";
import type { MercadoPagoPayment } from "@/lib/mercado-pago/payment";

export async function fetchMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  const client = new MercadoPagoConfig({
    accessToken: getMercadoPagoAccessToken(),
    options: { timeout: 10_000 },
  });
  const response = await new Payment(client).get({ id: paymentId });
  if (
    response.id === undefined ||
    !response.status ||
    response.transaction_amount === undefined ||
    !response.currency_id
  ) {
    throw new Error("Mercado Pago returned an incomplete payment.");
  }
  const metadata = response.metadata as { order_id?: unknown } | undefined;
  const dateApproved = response.date_approved ? new Date(response.date_approved) : null;
  const merchantOrder = response.order?.id
    ? await new MerchantOrder(client).get({ merchantOrderId: response.order.id })
    : null;

  return {
    id: String(response.id),
    status: response.status,
    statusDetail: response.status_detail ?? null,
    externalReference: response.external_reference ?? null,
    transactionAmount: response.transaction_amount,
    currency: response.currency_id,
    dateApproved:
      dateApproved && Number.isFinite(dateApproved.getTime()) ? dateApproved : null,
    metadataOrderId:
      typeof metadata?.order_id === "string" ? metadata.order_id : null,
    preferenceId: merchantOrder?.preference_id ?? null,
    paymentMethodId: response.payment_method_id ?? null,
    paymentTypeId: response.payment_type_id ?? null,
  };
}
