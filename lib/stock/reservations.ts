import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  stockReservationItems,
  stockReservations,
} from "@/lib/db/schema";
import type { ResolvedStockRequirement } from "@/types/checkout";

export { findReservationShortage } from "@/lib/checkout/stock";

export type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type LockedStock = {
  id: string;
  name: string;
  stock: number;
  reserved: number;
};

function productIdList(requirements: ResolvedStockRequirement[]) {
  return sql.join(
    requirements.map((requirement) => sql`${requirement.productId}::uuid`),
    sql`, `,
  );
}

export async function lockAndReadAvailableStock(
  tx: DatabaseTransaction,
  requirements: ResolvedStockRequirement[],
  excludedReservationId?: string,
) {
  const sorted = [...requirements].sort((left, right) =>
    left.productId.localeCompare(right.productId),
  );
  if (sorted.length === 0) return [];
  const ids = productIdList(sorted);

  await tx.execute(sql`
    select id
    from products
    where id in (${ids})
    order by id
    for update
  `);

  const exclusion = excludedReservationId
    ? sql`and sr.id <> ${excludedReservationId}::uuid`
    : sql``;
  const rows = await tx.execute<LockedStock>(sql`
    select
      p.id,
      p.name,
      p.stock,
      coalesce((
        select sum(sri.quantity)::integer
        from stock_reservation_items sri
        inner join stock_reservations sr on sr.id = sri.reservation_id
        where sri.product_id = p.id
          and sr.status = 'active'
          and sr.expires_at > now()
          ${exclusion}
      ), 0)::integer as reserved
    from products p
    where p.id in (${ids})
    order by p.id
  `);
  return [...rows];
}

export async function insertStockReservation(
  tx: DatabaseTransaction,
  orderId: string,
  requirements: ResolvedStockRequirement[],
  expiresAt: Date,
) {
  const [reservation] = await tx
    .insert(stockReservations)
    .values({ orderId, expiresAt, status: "active" })
    .returning({ id: stockReservations.id });

  await tx.insert(stockReservationItems).values(
    requirements.map((requirement) => ({
      reservationId: reservation.id,
      productId: requirement.productId,
      quantity: requirement.quantity,
    })),
  );
  return reservation.id;
}
