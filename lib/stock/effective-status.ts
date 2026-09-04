import type { StockReservationStatus } from "@/types/domain";

export type EffectiveReservationStatus = StockReservationStatus | "expired" | "none";

export function getEffectiveReservationStatus(
  status: StockReservationStatus | null | undefined,
  expiresAt: Date | null | undefined,
  now = new Date(),
): EffectiveReservationStatus {
  if (!status) return "none";
  if (status === "active" && expiresAt && expiresAt.getTime() <= now.getTime()) return "expired";
  return status;
}
