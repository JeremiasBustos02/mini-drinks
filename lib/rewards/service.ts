import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { customerProfiles, loyaltyAccounts, loyaltyTransactions, rewardCampaigns, rewardCodes } from "@/lib/db/schema";
import { logServerEvent } from "@/lib/observability/logger";
import { createRewardToken, hashRewardToken, rewardDisplayCode } from "@/lib/rewards/tokens";

export type GeneratedRewardCode = { code: string; redeemUrl: string; points: number };

function appUrl() {
  const value = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (value) return value.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("APP_URL is required to generate reward codes.");
}

export async function createRewardCodeBatch(campaignId: string, distribution: { quantity: number; points: number }[]) {
  const generated: GeneratedRewardCode[] = [];
  const tokens = new Set<string>();
  for (const entry of distribution) {
    for (let index = 0; index < entry.quantity; index += 1) {
      let token = createRewardToken();
      while (tokens.has(token)) token = createRewardToken();
      tokens.add(token);
      generated.push({ code: rewardDisplayCode(), redeemUrl: `${appUrl()}/canjear/${token}`, points: entry.points });
    }
  }
  await db.transaction(async (tx) => {
    const [campaign] = await tx.select({ id: rewardCampaigns.id }).from(rewardCampaigns).where(eq(rewardCampaigns.id, campaignId)).limit(1);
    if (!campaign) throw new Error("La campaña no existe.");
    await tx.insert(rewardCodes).values(generated.map((code) => ({
      campaignId,
      tokenHash: hashRewardToken(code.redeemUrl.split("/").at(-1)!),
      displayCode: code.code,
      rewardType: "points" as const,
      rewardPoints: code.points,
    })));
  });
  logServerEvent("info", "reward_campaign.batch_created", { campaignId, count: generated.length });
  return generated;
}

export async function redeemRewardCode(token: string, userId: string) {
  const tokenHash = hashRewardToken(token);
  return db.transaction(async (tx) => {
    const [profile] = await tx.select({ id: customerProfiles.id }).from(customerProfiles).where(eq(customerProfiles.authUserId, userId)).limit(1);
    if (!profile) return { outcome: "invalid" as const };
    await tx.execute(sql`select id from reward_codes where token_hash = ${tokenHash} for update`);
    const [code] = await tx.select({ id: rewardCodes.id, points: rewardCodes.rewardPoints, redeemedAt: rewardCodes.redeemedAt, campaignId: rewardCodes.campaignId, type: rewardCodes.rewardType, status: rewardCampaigns.status, startsAt: rewardCampaigns.startsAt, endsAt: rewardCampaigns.endsAt }).from(rewardCodes).innerJoin(rewardCampaigns, eq(rewardCodes.campaignId, rewardCampaigns.id)).where(eq(rewardCodes.tokenHash, tokenHash)).limit(1);
    if (!code) return { outcome: "invalid" as const };
    if (code.redeemedAt) return { outcome: "already_redeemed" as const };
    const now = new Date();
    if (code.status !== "active" || (code.startsAt && now < code.startsAt) || (code.endsAt && now > code.endsAt)) return { outcome: "unavailable" as const };
    if (code.type !== "points") return { outcome: "unavailable" as const };

    const [createdAccount] = await tx.insert(loyaltyAccounts).values({ customerProfileId: profile.id }).onConflictDoNothing({ target: loyaltyAccounts.customerProfileId }).returning({ id: loyaltyAccounts.id });
    const accountId = createdAccount?.id ?? (await tx.select({ id: loyaltyAccounts.id }).from(loyaltyAccounts).where(eq(loyaltyAccounts.customerProfileId, profile.id)).limit(1))[0]?.id;
    if (!accountId) throw new Error("Reward loyalty account was not created.");
    const [ledger] = await tx.insert(loyaltyTransactions).values({ loyaltyAccountId: accountId, rewardCodeId: code.id, idempotencyKey: `code:${code.id}:reward`, type: "code_reward", points: code.points, earnUnitCents: 1, pointsPerUnit: code.points }).onConflictDoNothing({ target: loyaltyTransactions.idempotencyKey }).returning({ id: loyaltyTransactions.id });
    if (!ledger) return { outcome: "already_redeemed" as const };
    await tx.update(loyaltyAccounts).set({ balance: sql`${loyaltyAccounts.balance} + ${code.points}`, lifetimeEarnedPoints: sql`${loyaltyAccounts.lifetimeEarnedPoints} + ${code.points}`, updatedAt: now }).where(eq(loyaltyAccounts.id, accountId));
    await tx.update(rewardCodes).set({ redeemedAt: now, redeemedByCustomerProfileId: profile.id }).where(eq(rewardCodes.id, code.id));
    return { outcome: "redeemed" as const, points: code.points, codeId: code.id, campaignId: code.campaignId };
  });
}
