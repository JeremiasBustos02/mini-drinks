export type OrderMiniClubRedemption = {
  discountCents: number;
  orderId: string;
  points: number;
  status: "reserved" | "redeemed" | "released";
};

export type OrderMiniClubTransaction = {
  orderId: string | null;
  points: number;
  type: string;
};

export function getOrderMiniClubActivity(
  orderId: string,
  redemptions: OrderMiniClubRedemption[],
  transactions: OrderMiniClubTransaction[],
) {
  const redemption = redemptions.find((entry) => entry.orderId === orderId) ?? null;
  const earnedPoints = transactions
    .filter((entry) => entry.orderId === orderId && entry.type === "earn")
    .reduce((total, entry) => total + entry.points, 0);

  if (!redemption && earnedPoints === 0) return null;
  return { redemption, earnedPoints };
}
