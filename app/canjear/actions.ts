"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getAccountAccess } from "@/lib/account/auth";
import { logServerEvent } from "@/lib/observability/logger";
import { checkRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
import { redeemRewardCode } from "@/lib/rewards/service";

export type RedeemState = { outcome?: "redeemed" | "invalid" | "already_redeemed" | "unavailable" | "rate_limited"; points?: number };

export async function redeemRewardAction(_previous: RedeemState, formData: FormData): Promise<RedeemState> {
  const token = String(formData.get("token") ?? "");
  const access = await getAccountAccess();
  if (access.status !== "authenticated") return { outcome: "invalid" };
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = await checkRateLimit(rateLimitPolicies.rewardRedeem, `${ip}:${access.userId}`);
  if (!rate.allowed) return { outcome: "rate_limited" };
  try {
    const result = await redeemRewardCode(token, access.userId);
    if (result.outcome === "redeemed") {
      logServerEvent("info", "reward_code.redeemed", { codeId: result.codeId, campaignId: result.campaignId, points: result.points });
      revalidatePath("/mi-cuenta");
      return result;
    }
    logServerEvent("info", result.outcome === "already_redeemed" ? "reward_code.already_redeemed" : "reward_code.invalid", { outcome: result.outcome });
    return result;
  } catch (error) {
    logServerEvent("error", "reward_code.redemption_failed", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return { outcome: "invalid" };
  }
}
