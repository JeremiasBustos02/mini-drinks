import { sql, type AnyColumn } from "drizzle-orm";

import { stockReservationItems, stockReservations } from "@/lib/db/schema";

export function availableStockSql(productId: AnyColumn, physicalStock: AnyColumn) {
  return sql<number>`greatest(
    ${physicalStock} - coalesce((
      select sum(${stockReservationItems.quantity})::integer
      from ${stockReservationItems}
      inner join ${stockReservations}
        on ${stockReservations.id} = ${stockReservationItems.reservationId}
      where ${stockReservationItems.productId} = ${productId}
        and ${stockReservations.status} = 'active'
        and ${stockReservations.expiresAt} > now()
    ), 0),
    0
  )::integer`.mapWith(Number);
}
