import { centsToMercadoPagoAmount } from "@/lib/mercado-pago/money";

export type PreferenceOrder = {
  id: string;
  publicNumber: string;
  customerEmail: string | null;
  total: number;
  items: Array<{
    id: string;
    displayName: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export function canReusePreference(
  preference: { id: string | null; initPoint: string | null; expiresAt: Date | null },
  now: Date,
) {
  return Boolean(
    preference.id &&
      preference.initPoint &&
      preference.expiresAt &&
      preference.expiresAt.getTime() > now.getTime(),
  );
}

export function buildMercadoPagoPreference(
  order: PreferenceOrder,
  appUrl: string,
  accessToken: string,
  createdAt: Date,
  expiresAt: Date,
) {
  const returnQuery = new URLSearchParams({
    order: order.publicNumber,
    token: accessToken,
  }).toString();
  const itemTotal = order.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  if (!Number.isSafeInteger(order.total) || itemTotal !== order.total) {
    throw new Error("Persisted order items do not match the order total.");
  }
  if (expiresAt.getTime() <= createdAt.getTime()) {
    throw new Error("Preference expiration must be in the future.");
  }

  return {
    items: order.items.map((item) => ({
      id: item.id,
      title: item.displayName.slice(0, 256),
      quantity: item.quantity,
      unit_price: centsToMercadoPagoAmount(item.unitPrice),
      currency_id: "ARS",
    })),
    payer: order.customerEmail ? { email: order.customerEmail } : undefined,
    external_reference: order.id,
    metadata: { order_id: order.id },
    back_urls: {
      success: `${appUrl}/pago/exito?${returnQuery}`,
      pending: `${appUrl}/pago/pendiente?${returnQuery}`,
      failure: `${appUrl}/pago/error?${returnQuery}`,
    },
    auto_return: "approved",
    notification_url: `${appUrl}/api/webhooks/mercado-pago`,
    expires: true,
    expiration_date_from: createdAt.toISOString(),
    expiration_date_to: expiresAt.toISOString(),
    payment_methods: {
      excluded_payment_types: [
        { id: "ticket" },
        { id: "atm" },
        { id: "bank_transfer" },
      ],
    },
  };
}
