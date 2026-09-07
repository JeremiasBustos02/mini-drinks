import "server-only";

import { and, eq, gt, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { loyaltyAccounts, loyaltyRedemptions, loyaltySettings, loyaltyTransactions } from "@/lib/db/schema";
import { calculateLoyaltyRedemption, redemptionIdempotencyKey, type LoyaltyRedemptionSettings } from "@/lib/loyalty/redemption";
import type { DatabaseTransaction } from "@/lib/stock/reservations";

export async function loadLoyaltyRedemptionSettings(executor: Pick<typeof db, "select"> = db) {
  const [settings] = await executor.select({
    redemptionValueCents: loyaltySettings.redemptionValueCents,
    minRedemptionPoints: loyaltySettings.minRedemptionPoints,
    redemptionStepPoints: loyaltySettings.redemptionStepPoints,
    maxRedemptionPercentage: loyaltySettings.maxRedemptionPercentage,
  }).from(loyaltySettings).where(eq(loyaltySettings.key, "default")).limit(1);
  if (!settings) throw new Error("Loyalty settings are missing.");
  return settings satisfies LoyaltyRedemptionSettings;
}

export async function getAvailableLoyaltyBalance(customerProfileId: string) {
  const [account] = await db.select({ id: loyaltyAccounts.id, balance: loyaltyAccounts.balance })
    .from(loyaltyAccounts).where(eq(loyaltyAccounts.customerProfileId, customerProfileId)).limit(1);
  if (!account) return 0;
  const [reserved] = await db.select({ value: sql<number>`coalesce(sum(${loyaltyRedemptions.points}), 0)::integer` })
    .from(loyaltyRedemptions).where(and(eq(loyaltyRedemptions.loyaltyAccountId, account.id), eq(loyaltyRedemptions.status, "reserved"), gt(loyaltyRedemptions.expiresAt, new Date())));
  return Math.max(account.balance - reserved.value, 0);
}

export async function reserveLoyaltyRedemption(
  tx: DatabaseTransaction,
  input: { orderId: string; customerProfileId: string | null; requestedPoints?: number; subtotalCents: number; expiresAt: Date },
) {
  if (!input.requestedPoints) return { points: 0, discountCents: 0, settings: null };
  if (!input.customerProfileId) throw new Error("Guests cannot redeem loyalty points.");
  const settings = await loadLoyaltyRedemptionSettings(tx);
  const [created] = await tx.insert(loyaltyAccounts).values({ customerProfileId: input.customerProfileId })
    .onConflictDoNothing({ target: loyaltyAccounts.customerProfileId }).returning({ id: loyaltyAccounts.id });
  const accountId = created?.id ?? (await tx.select({ id: loyaltyAccounts.id }).from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.customerProfileId, input.customerProfileId)).limit(1))[0]?.id;
  if (!accountId) throw new Error("Loyalty account was not created.");
  await tx.execute(sql`select id from loyalty_accounts where id = ${accountId}::uuid for update`);
  await tx.update(loyaltyRedemptions).set({ status: "released", releasedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(loyaltyRedemptions.loyaltyAccountId, accountId), eq(loyaltyRedemptions.status, "reserved"), lte(loyaltyRedemptions.expiresAt, new Date())));
  const [account] = await tx.select({ balance: loyaltyAccounts.balance }).from(loyaltyAccounts).where(eq(loyaltyAccounts.id, accountId)).limit(1);
  const [reserved] = await tx.select({ value: sql<number>`coalesce(sum(${loyaltyRedemptions.points}), 0)::integer` })
    .from(loyaltyRedemptions).where(and(eq(loyaltyRedemptions.loyaltyAccountId, accountId), eq(loyaltyRedemptions.status, "reserved")));
  if (!account) throw new Error("Loyalty account was not found.");
  const redemption = calculateLoyaltyRedemption(input.requestedPoints, Math.max(account.balance - reserved.value, 0), input.subtotalCents, settings);
  await tx.insert(loyaltyRedemptions).values({
    customerProfileId: input.customerProfileId,
    loyaltyAccountId: accountId,
    orderId: input.orderId,
    points: redemption.points,
    discountCents: redemption.discountCents,
    expiresAt: input.expiresAt,
    ...settings,
  });
  return { ...redemption, settings };
}

export async function redeemLoyaltyReservation(tx: DatabaseTransaction, orderId: string, now = new Date()) {
  const [reservation] = await tx.select().from(loyaltyRedemptions).where(eq(loyaltyRedemptions.orderId, orderId)).limit(1);
  if (!reservation || reservation.status === "redeemed") return reservation ? "duplicate" as const : "none" as const;
  if (reservation.status === "released") return "released" as const;
  await tx.execute(sql`select id from loyalty_accounts where id = ${reservation.loyaltyAccountId}::uuid for update`);
  const [account] = await tx.select({ balance: loyaltyAccounts.balance }).from(loyaltyAccounts).where(eq(loyaltyAccounts.id, reservation.loyaltyAccountId)).limit(1);
  if (!account || account.balance < reservation.points) return "insufficient_balance" as const;
  const [debit] = await tx.insert(loyaltyTransactions).values({
    loyaltyAccountId: reservation.loyaltyAccountId,
    orderId,
    idempotencyKey: redemptionIdempotencyKey(orderId),
    type: "redeem",
    points: reservation.points,
    earnUnitCents: reservation.redemptionValueCents,
    pointsPerUnit: 1,
  }).onConflictDoNothing({ target: loyaltyTransactions.idempotencyKey }).returning({ id: loyaltyTransactions.id });
  if (debit) await tx.update(loyaltyAccounts).set({ balance: sql`${loyaltyAccounts.balance} - ${reservation.points}`, updatedAt: now }).where(eq(loyaltyAccounts.id, reservation.loyaltyAccountId));
  await tx.update(loyaltyRedemptions).set({ status: "redeemed", redeemedAt: now, updatedAt: now }).where(eq(loyaltyRedemptions.id, reservation.id));
  return debit ? "redeemed" as const : "duplicate" as const;
}

export async function renewLoyaltyReservation(tx: DatabaseTransaction, orderId: string, expiresAt: Date, now = new Date()) {
  const [reservation] = await tx.select({ id: loyaltyRedemptions.id, status: loyaltyRedemptions.status })
    .from(loyaltyRedemptions).where(eq(loyaltyRedemptions.orderId, orderId)).limit(1);
  if (!reservation) return true;
  if (reservation.status !== "reserved") return false;
  await tx.update(loyaltyRedemptions).set({ expiresAt, updatedAt: now }).where(eq(loyaltyRedemptions.id, reservation.id));
  return true;
}

export async function releaseLoyaltyReservation(tx: DatabaseTransaction, orderId: string, now = new Date()) {
  const [reservation] = await tx.select({ id: loyaltyRedemptions.id, status: loyaltyRedemptions.status }).from(loyaltyRedemptions).where(eq(loyaltyRedemptions.orderId, orderId)).limit(1);
  if (!reservation || reservation.status !== "reserved") return reservation?.status ?? "none";
  await tx.update(loyaltyRedemptions).set({ status: "released", releasedAt: now, updatedAt: now }).where(eq(loyaltyRedemptions.id, reservation.id));
  return "released" as const;
}
