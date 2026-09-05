import { sql } from "drizzle-orm";

export function availableStockSql() {
  return sql<number>`greatest(
    "products"."stock" - coalesce((
      select sum("stock_reservation_items"."quantity")::integer
      from "stock_reservation_items"
      inner join "stock_reservations"
        on "stock_reservations"."id" = "stock_reservation_items"."reservation_id"
      where "stock_reservation_items"."product_id" = "products"."id"
        and "stock_reservations"."status" = 'active'
        and "stock_reservations"."expires_at" > now()
    ), 0),
    0
  )::integer`.mapWith(Number);
}
