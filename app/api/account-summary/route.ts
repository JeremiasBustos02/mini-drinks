import { NextResponse } from "next/server";

import {
  getAccountAccess,
  getCustomerProfileSummary,
} from "@/lib/account/auth";
import { formatLoyaltyPoints } from "@/lib/loyalty/points";
import { getLoyaltyBalanceSummary } from "@/lib/loyalty/redemptions";

export async function GET() {
  const startedAt = performance.now();
  const access = await getAccountAccess();
  const accessMs = performance.now() - startedAt;
  if (access.status === "unauthenticated" || access.isAdmin) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const profileStartedAt = performance.now();
  const profile = await getCustomerProfileSummary(access.userId);
  const profileMs = performance.now() - profileStartedAt;
  const balanceStartedAt = performance.now();
  const balance = profile
    ? await getLoyaltyBalanceSummary(profile.id)
    : { availablePoints: 0 };
  console.info(
    JSON.stringify({
      event: "account_summary.loaded",
      durationMs: Math.round(performance.now() - startedAt),
      accessMs: Math.round(accessMs),
      profileMs: Math.round(profileMs),
      balanceMs: Math.round(performance.now() - balanceStartedAt),
    }),
  );
  return NextResponse.json({
    displayName:
      profile?.displayName?.trim().split(/\s+/)[0] ??
      access.email ??
      "Tu cuenta",
    availablePoints: formatLoyaltyPoints(balance.availablePoints),
  });
}
