import assert from "node:assert/strict";
import test from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";

import {
  activeReservedLoyaltyPointsSql,
  calculateAvailableLoyaltyPoints,
} from "@/lib/loyalty/available-balance-sql";

test("active loyalty reservation SQL uses the PostgreSQL clock without Date parameters", () => {
  const query = new PgDialect().sqlToQuery(activeReservedLoyaltyPointsSql());
  assert.match(query.sql, /"reserved_redemptions"\."expires_at" > now\(\)/);
  assert.deepEqual(query.params, []);
});

test("active loyalty reservation SQL qualifies the correlated loyalty account", () => {
  const query = new PgDialect().sqlToQuery(
    activeReservedLoyaltyPointsSql(),
  ).sql;
  assert.match(
    query,
    /"reserved_redemptions"\."loyalty_account_id" = "loyalty_accounts"\."id"/,
  );
  assert.match(query, /"reserved_redemptions"\."status" = 'reserved'/);
});

test("only current reservations reduce the available balance for their own account", () => {
  assert.equal(calculateAvailableLoyaltyPoints(5100, 2500), 2600);
  assert.equal(calculateAvailableLoyaltyPoints(5100, 0), 5100);
  assert.equal(calculateAvailableLoyaltyPoints(100, 2500), 0);
});
