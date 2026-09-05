import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  loyaltyAccounts,
  loyaltySettings,
  loyaltyTransactions,
  orders,
} from "@/lib/db/schema";
import { calculateLoyaltyPoints } from "@/lib/loyalty/points";
import { purchaseEarnIdempotencyKey } from "@/lib/loyalty/award-utils";

export async function awardLoyaltyForPaidOrder(orderId: string) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select({
        customerProfileId: orders.customerProfileId,
        discountTotal: orders.discountTotal,
        status: orders.status,
        subtotal: orders.subtotal,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order || order.status !== "paid" || !order.customerProfileId) {
      return { outcome: "not_eligible" as const };
    }

    const [settings] = await tx
      .select({
        earnUnitCents: loyaltySettings.earnUnitCents,
        pointsPerUnit: loyaltySettings.pointsPerUnit,
      })
      .from(loyaltySettings)
      .where(eq(loyaltySettings.key, "default"))
      .limit(1);
    if (!settings) throw new Error("Loyalty settings are missing.");

    const points = calculateLoyaltyPoints(order.subtotal - order.discountTotal, settings);
    if (points === 0) return { outcome: "no_points" as const };

    const [createdAccount] = await tx
      .insert(loyaltyAccounts)
      .values({ customerProfileId: order.customerProfileId })
      .onConflictDoNothing({ target: loyaltyAccounts.customerProfileId })
      .returning({ id: loyaltyAccounts.id });
    const accountId = createdAccount?.id ?? (await tx
      .select({ id: loyaltyAccounts.id })
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.customerProfileId, order.customerProfileId))
      .limit(1))[0]?.id;
    if (!accountId) throw new Error("Loyalty account was not created.");

    const [credit] = await tx
      .insert(loyaltyTransactions)
      .values({
        loyaltyAccountId: accountId,
        orderId,
        idempotencyKey: purchaseEarnIdempotencyKey(orderId),
        points,
        earnUnitCents: settings.earnUnitCents,
        pointsPerUnit: settings.pointsPerUnit,
      })
      .onConflictDoNothing({ target: loyaltyTransactions.idempotencyKey })
      .returning({ id: loyaltyTransactions.id });
    if (!credit) return { outcome: "duplicate" as const };

    await tx
      .update(loyaltyAccounts)
      .set({
        balance: sql`${loyaltyAccounts.balance} + ${points}`,
        lifetimeEarnedPoints: sql`${loyaltyAccounts.lifetimeEarnedPoints} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyAccounts.id, accountId));
    return { outcome: "credited" as const, points };
  });
}
