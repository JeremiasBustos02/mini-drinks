import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

import { hashOrderAccessToken } from "@/lib/checkout/idempotency";
import { parseOrderItemConfigurationSnapshot } from "@/lib/checkout/order-snapshot";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";

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
  const items = await db
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
    .orderBy(asc(orderItems.createdAt), asc(orderItems.id));

  return {
    order,
    items: items.map((item) => ({
      ...item,
      configurationJson: parseOrderItemConfigurationSnapshot(item.configurationJson),
    })),
  };
}
