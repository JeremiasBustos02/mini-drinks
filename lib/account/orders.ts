import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { getCustomerProfileId } from "@/lib/account/auth";
import { customerOrderOwnershipWhere } from "@/lib/account/order-ownership-sql";
import { parseOrderItemConfigurationSnapshot } from "@/lib/checkout/order-snapshot";
import { db } from "@/lib/db";
import {
  loyaltyRedemptions,
  loyaltyTransactions,
  orderItems,
  orders,
  payments,
} from "@/lib/db/schema";

export async function getCustomerOrder(userId: string, publicNumber: string) {
  const profileId = await getCustomerProfileId(userId);
  if (!profileId) return null;
  const [order] = await db
    .select({
      id: orders.id,
      publicNumber: orders.publicNumber,
      status: orders.status,
      createdAt: orders.createdAt,
      deliveryType: orders.deliveryType,
      deliveryAddress: orders.deliveryAddress,
      city: orders.city,
      subtotal: orders.subtotal,
      discountTotal: orders.discountTotal,
      deliveryTotal: orders.deliveryTotal,
      total: orders.total,
      loyaltyRedemptionPoints: orders.loyaltyRedemptionPoints,
      loyaltyRedemptionDiscount: orders.loyaltyRedemptionDiscount,
    })
    .from(orders)
    .where(customerOrderOwnershipWhere(publicNumber, profileId))
    .limit(1);
  if (!order) return null;
  const [items, paymentRows, redemptionRows, earnedRows] = await Promise.all([
    db
      .select({
        id: orderItems.id,
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
      .select({ status: payments.status })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.updatedAt))
      .limit(1),
    db
      .select({
        points: loyaltyRedemptions.points,
        discountCents: loyaltyRedemptions.discountCents,
        status: loyaltyRedemptions.status,
      })
      .from(loyaltyRedemptions)
      .where(eq(loyaltyRedemptions.orderId, order.id))
      .limit(1),
    db
      .select({ points: loyaltyTransactions.points })
      .from(loyaltyTransactions)
      .where(
        and(
          eq(loyaltyTransactions.orderId, order.id),
          eq(loyaltyTransactions.type, "earn"),
        ),
      ),
  ]);
  return {
    order,
    items: items.map((item) => ({
      ...item,
      configurationJson: parseOrderItemConfigurationSnapshot(
        item.configurationJson,
      ),
    })),
    payment: paymentRows[0] ?? null,
    redemption: redemptionRows[0] ?? null,
    earnedPoints: earnedRows.reduce(
      (total, transaction) => total + transaction.points,
      0,
    ),
  };
}
