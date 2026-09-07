import { NextResponse } from "next/server";

import {
  getAccountAccess,
  getCustomerProfile,
  getCustomerProfileId,
} from "@/lib/account/auth";
import { formatLoyaltyPoints } from "@/lib/loyalty/points";
import { getAvailableLoyaltyBalance } from "@/lib/loyalty/redemptions";

export async function GET() {
  const access = await getAccountAccess();
  if (access.status === "unauthenticated" || access.isAdmin) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const [profile, profileId] = await Promise.all([
    getCustomerProfile(access.userId),
    getCustomerProfileId(access.userId),
  ]);
  const availablePoints = profileId
    ? await getAvailableLoyaltyBalance(profileId)
    : 0;
  return NextResponse.json({
    displayName:
      profile?.displayName?.trim().split(/\s+/)[0] ??
      access.email ??
      "Tu cuenta",
    availablePoints: formatLoyaltyPoints(availablePoints),
  });
}
