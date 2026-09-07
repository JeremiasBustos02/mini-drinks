import assert from "node:assert/strict";
import test from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";

import { customerOrderOwnershipWhere } from "@/lib/account/order-ownership-sql";

test("customer order detail scopes public numbers to the resolved profile", () => {
  const query = new PgDialect().sqlToQuery(
    customerOrderOwnershipWhere("ORD-123", "customer-a")!,
  );
  assert.match(query.sql, /"orders"\."public_number" = \$1/);
  assert.match(query.sql, /"orders"\."customer_profile_id" = \$2/);
  assert.deepEqual(query.params, ["ORD-123", "customer-a"]);
});
