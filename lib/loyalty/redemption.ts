export type LoyaltyRedemptionSettings = {
  redemptionValueCents: number;
  minRedemptionPoints: number;
  redemptionStepPoints: number;
  maxRedemptionPercentage: number;
};

export type LoyaltyRedemption = { points: number; discountCents: number };

function validSettings(settings: LoyaltyRedemptionSettings) {
  return Object.values(settings).every(Number.isSafeInteger) &&
    settings.redemptionValueCents > 0 && settings.minRedemptionPoints > 0 &&
    settings.redemptionStepPoints > 0 && settings.maxRedemptionPercentage > 0 &&
    settings.maxRedemptionPercentage <= 100;
}

export function maximumRedeemablePoints(
  balance: number,
  subtotalCents: number,
  settings: LoyaltyRedemptionSettings,
) {
  if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(subtotalCents) || balance < 0 || subtotalCents < 0 || !validSettings(settings)) {
    throw new Error("Invalid loyalty redemption inputs.");
  }
  const maxDiscount = Math.floor(subtotalCents * settings.maxRedemptionPercentage / 100);
  const byDiscount = Math.floor(maxDiscount / settings.redemptionValueCents);
  const points = Math.min(balance, byDiscount);
  const stepped = Math.floor(points / settings.redemptionStepPoints) * settings.redemptionStepPoints;
  return stepped >= settings.minRedemptionPoints ? stepped : 0;
}

export function calculateLoyaltyRedemption(
  requestedPoints: number | undefined,
  balance: number,
  subtotalCents: number,
  settings: LoyaltyRedemptionSettings,
): LoyaltyRedemption {
  if (requestedPoints === undefined || requestedPoints === 0) return { points: 0, discountCents: 0 };
  if (!Number.isSafeInteger(requestedPoints) || requestedPoints < settings.minRedemptionPoints || requestedPoints % settings.redemptionStepPoints !== 0) {
    throw new Error("Invalid loyalty redemption request.");
  }
  const maximum = maximumRedeemablePoints(balance, subtotalCents, settings);
  if (requestedPoints > maximum) throw new Error("Loyalty redemption exceeds the available maximum.");
  const discountCents = requestedPoints * settings.redemptionValueCents;
  if (!Number.isSafeInteger(discountCents) || discountCents > subtotalCents) throw new Error("Invalid loyalty redemption discount.");
  return { points: requestedPoints, discountCents };
}

export function redemptionIdempotencyKey(orderId: string) {
  return `order:${orderId}:points-redeemed`;
}

export function planLoyaltyRedemptionTransition(
  status: "reserved" | "redeemed" | "released",
  paymentStatus: "approved" | "pending" | "rejected" | "cancelled",
) {
  if (status !== "reserved") return "duplicate" as const;
  if (paymentStatus === "approved") return "redeem" as const;
  if (paymentStatus === "rejected" || paymentStatus === "cancelled") return "keep" as const;
  return "keep" as const;
}

export function isLoyaltyRedemptionAvailable(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() > now.getTime();
}

export function applyLoyaltyRedemption<T extends { subtotal: number; deliveryTotal: number; discountTotal: number; total: number }>(
  checkout: T,
  redemption: LoyaltyRedemption,
) {
  const discountTotal = checkout.discountTotal + redemption.discountCents;
  const total = checkout.subtotal - discountTotal + checkout.deliveryTotal;
  if (!Number.isSafeInteger(total) || total < 0) throw new Error("Invalid checkout total after loyalty redemption.");
  return { ...checkout, discountTotal, total, loyaltyRedemption: redemption };
}
