import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

import { hashOrderAccessToken } from "@/lib/checkout/idempotency";
import { parseOrderItemConfigurationSnapshot } from "@/lib/checkout/order-snapshot";
import { db } from "@/lib/db";
import { orderItems, orders, payments, stockReservations } from "@/lib/db/schema";
import { getEffectiveReservationStatus } from "@/lib/stock/effective-status";

export async function getPublicOrder(publicNumber: string, accessToken: string) {
  noStore();
  const accessTokenHash = hashOrderAccessToken(accessToken);
  const [order] = await db
    .select({
      id: orders.id,
      publicNumber: orders.publicNumber,
      status: orders.status,
      deliveryType: orders.deliveryType,
      subtotal: orders.subtotal,
      discountTotal: orders.discountTotal,
      deliveryTotal: orders.deliveryTotal,
      total: orders.total,
      mercadoPagoInitPoint: orders.mercadoPagoInitPoint,
      mercadoPagoPreferenceExpiresAt: orders.mercadoPagoPreferenceExpiresAt,
      mercadoPagoPreferenceIsCurrent: sql<boolean>`${orders.mercadoPagoPreferenceExpiresAt} > now()`,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(
      and(
        eq(orders.publicNumber, publicNumber),
        eq(orders.accessTokenHash, accessTokenHash),
      ),
    )
    .limit(1);

  if (!order) return null;
  const [items, paymentRows, reservationRows] = await Promise.all([db
    .select({
      id: orderItems.id,
      itemType: orderItems.itemType,
      displayName: orderItems.displayName,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      configurationJson: orderItems.configurationJson,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.createdAt), asc(orderItems.id)),
  db
    .select({ status: payments.status, statusDetail: payments.statusDetail })
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .orderBy(desc(payments.updatedAt))
    .limit(1),
  db
    .select({
      status: stockReservations.status,
      expiresAt: stockReservations.expiresAt,
      isCurrent: sql<boolean>`${stockReservations.status} = 'active' and ${stockReservations.expiresAt} > now()`,
    })
    .from(stockReservations)
    .where(eq(stockReservations.orderId, order.id))
    .limit(1)]);

  return {
    order: {
      ...order,
      status:
        (order.status === "pending_payment" || order.status === "payment_pending") &&
        getEffectiveReservationStatus(
          reservationRows[0]?.status,
          reservationRows[0]?.expiresAt,
        ) === "expired"
          ? ("expired" as const)
          : order.status,
    },
    items: items.map((item) => ({
      ...item,
      configurationJson: parseOrderItemConfigurationSnapshot(item.configurationJson),
    })),
    payment: paymentRows[0] ?? null,
    reservation: reservationRows[0] ?? null,
  };
}
