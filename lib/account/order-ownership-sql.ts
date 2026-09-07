import { and, eq } from "drizzle-orm";

import { orders } from "@/lib/db/schema";

export function customerOrderOwnershipWhere(
  publicNumber: string,
  customerProfileId: string,
) {
  return and(
    eq(orders.publicNumber, publicNumber),
    eq(orders.customerProfileId, customerProfileId),
  );
}
