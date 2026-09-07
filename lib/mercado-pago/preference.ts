import { centsToMercadoPagoAmount } from "@/lib/mercado-pago/money";

export type PreferenceOrder = {
  id: string;
  publicNumber: string;
  customerEmail: string | null;
  total: number;
  discountTotal: number;
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

export function canReuseOrderPreference(
  orderStatus: string,
  reservation: { status: string; expiresAt: Date },
  preference: { id: string | null; initPoint: string | null; expiresAt: Date | null },
  now: Date,
) {
  return orderStatus === "pending_payment" &&
    reservation.status === "active" &&
    reservation.expiresAt.getTime() > now.getTime() &&
    canReusePreference(preference, now);
}

export function canPreparePreferenceForOrder(orderStatus: string) {
  return orderStatus === "pending_payment" ||
    orderStatus === "payment_rejected" ||
    orderStatus === "expired";
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
  if (!Number.isSafeInteger(order.total) || !Number.isSafeInteger(order.discountTotal) || order.discountTotal < 0 || itemTotal - order.discountTotal !== order.total) {
    throw new Error("Persisted order items do not match the order total.");
  }
  if (expiresAt.getTime() <= createdAt.getTime()) {
    throw new Error("Preference expiration must be in the future.");
  }

  return {
    items: preferenceItems(order.items, order.discountTotal),
    payer: order.customerEmail ? { email: order.customerEmail } : undefined,
    external_reference: order.id,
    metadata: { order_id: order.id },
    back_urls: {
      success: `${appUrl}/pago/exito?${returnQuery}`,
      pending: `${appUrl}/pago/pendiente?${returnQuery}`,
      failure: `${appUrl}/pago/error?${returnQuery}`,
    },
    auto_return: "approved",
    notification_url: `${appUrl}/api/mercado-pago/webhook`,
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

function preferenceItems(orderItems: PreferenceOrder["items"], discountTotal: number) {
  const itemTotal = orderItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  let remainingDiscount = discountTotal;
  const items: Array<{ id: string; title: string; quantity: number; unit_price: number; currency_id: "ARS" }> = [];
  for (const item of orderItems) {
    for (let unit = 0; unit < item.quantity; unit += 1) {
      const proportional = Math.floor(item.unitPrice * discountTotal / itemTotal);
      const allocated = Math.min(proportional, item.unitPrice - 1, remainingDiscount);
      remainingDiscount -= allocated;
      items.push({ id: item.id, title: item.displayName.slice(0, 256), quantity: 1, unit_price: centsToMercadoPagoAmount(item.unitPrice - allocated), currency_id: "ARS" });
    }
  }
  for (const item of items) {
    if (remainingDiscount === 0) break;
    const cents = Math.round(item.unit_price * 100);
    if (cents <= 1) continue;
    item.unit_price = centsToMercadoPagoAmount(cents - 1);
    remainingDiscount -= 1;
  }
  if (remainingDiscount !== 0) throw new Error("Unable to distribute the order discount across Mercado Pago items.");
  return items;
}
