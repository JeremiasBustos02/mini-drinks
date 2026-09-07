import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  customerProfiles,
  loyaltyAccounts,
  loyaltyRedemptions,
  loyaltyTransactions,
  orders,
} from "@/lib/db/schema";
import { formatLoyaltyPoints } from "@/lib/loyalty/points";

export async function getAccountDashboard(userId: string) {
  const now = new Date();
  const [profile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(eq(customerProfiles.authUserId, userId))
    .limit(1);
  if (!profile)
    return {
      availablePoints: formatLoyaltyPoints(0),
      totalPoints: formatLoyaltyPoints(0),
      reservedPoints: formatLoyaltyPoints(0),
      hasReservedPoints: false,
      orders: [],
      transactions: [],
    };

  const [[account], customerOrders] = await Promise.all([
    db
      .select({
        id: loyaltyAccounts.id,
        balance: loyaltyAccounts.balance,
        reservedPoints: sql<number>`coalesce((select sum(${loyaltyRedemptions.points}) from ${loyaltyRedemptions} where ${loyaltyRedemptions.loyaltyAccountId} = ${loyaltyAccounts.id} and ${loyaltyRedemptions.status} = 'reserved' and ${loyaltyRedemptions.expiresAt} > ${now}), 0)::integer`,
      })
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.customerProfileId, profile.id))
      .limit(1),
    db
      .select({
        publicNumber: sql<string>`coalesce(${orders.publicNumber}, 'Mini Sorpresa')`,
        status: orders.status,
        total: orders.total,
        deliveryType: orders.deliveryType,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.customerProfileId, profile.id))
      .orderBy(desc(orders.createdAt))
      .limit(20),
  ]);

  const transactions = account
    ? await db
        .select({
          points: loyaltyTransactions.points,
          type: loyaltyTransactions.type,
          createdAt: loyaltyTransactions.createdAt,
          publicNumber: sql<string>`coalesce(${orders.publicNumber}, 'Mini Sorpresa')`,
        })
        .from(loyaltyTransactions)
        .leftJoin(orders, eq(loyaltyTransactions.orderId, orders.id))
        .where(eq(loyaltyTransactions.loyaltyAccountId, account.id))
        .orderBy(desc(loyaltyTransactions.createdAt))
        .limit(20)
    : [];

  return {
    totalPoints: formatLoyaltyPoints(account?.balance ?? 0),
    reservedPoints: formatLoyaltyPoints(account?.reservedPoints ?? 0),
    availablePoints: formatLoyaltyPoints(
      Math.max((account?.balance ?? 0) - (account?.reservedPoints ?? 0), 0),
    ),
    hasReservedPoints: (account?.reservedPoints ?? 0) > 0,
    orders: customerOrders,
    transactions: transactions.map((transaction) => ({
      ...transaction,
      points: formatLoyaltyPoints(transaction.points),
    })),
  };
}
