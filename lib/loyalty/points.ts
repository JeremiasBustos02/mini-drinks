export type LoyaltyEarnSettings = {
  earnUnitCents: number;
  pointsPerUnit: number;
};

const pointsFormatter = new Intl.NumberFormat("es-AR");

export function formatLoyaltyPoints(points: number) {
  return pointsFormatter.format(points);
}

export function calculateLoyaltyPoints(
  subtotalAfterDiscountsCents: number,
  settings: LoyaltyEarnSettings,
) {
  if (
    !Number.isSafeInteger(subtotalAfterDiscountsCents) ||
    !Number.isSafeInteger(settings.earnUnitCents) ||
    !Number.isSafeInteger(settings.pointsPerUnit) ||
    subtotalAfterDiscountsCents < 0 ||
    settings.earnUnitCents <= 0 ||
    settings.pointsPerUnit <= 0
  ) {
    throw new Error("Invalid loyalty earn settings.");
  }

  const points = Math.floor(subtotalAfterDiscountsCents / settings.earnUnitCents) * settings.pointsPerUnit;
  if (!Number.isSafeInteger(points)) throw new Error("Loyalty points exceed the safe integer range.");
  return points;
}
