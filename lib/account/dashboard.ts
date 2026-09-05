import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  customerProfiles,
  loyaltyAccounts,
  loyaltyTransactions,
  orders,
} from "@/lib/db/schema";

export async function getAccountDashboard(userId: string) {
  const [profile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(eq(customerProfiles.authUserId, userId))
    .limit(1);
  if (!profile) return { balance: 0, orders: [], transactions: [] };

  const [[account], customerOrders] = await Promise.all([
    db
      .select({ id: loyaltyAccounts.id, balance: loyaltyAccounts.balance })
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

  return { balance: account?.balance ?? 0, orders: customerOrders, transactions };
}
