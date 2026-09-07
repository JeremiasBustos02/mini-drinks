import { sql } from "drizzle-orm";

export function activeReservedLoyaltyPointsSql() {
  return sql<number>`coalesce(
    (
      select sum("reserved_redemptions"."points")::integer
      from "loyalty_redemptions" as "reserved_redemptions"
      where "reserved_redemptions"."loyalty_account_id" = "loyalty_accounts"."id"
        and "reserved_redemptions"."status" = 'reserved'
        and "reserved_redemptions"."expires_at" > now()
    ),
    0
  )::integer`.mapWith(Number);
}

export function calculateAvailableLoyaltyPoints(
  balance: number,
  reservedPoints: number,
) {
  return Math.max(balance - reservedPoints, 0);
}
