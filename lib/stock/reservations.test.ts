import assert from "node:assert/strict";
import test from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";

import { calculateAvailableStock, findReservationShortage } from "@/lib/checkout/stock";
import { availableStockSql } from "@/lib/stock/availability-sql";
import { getEffectiveReservationStatus } from "@/lib/stock/effective-status";

const now = new Date("2026-09-03T12:00:00.000Z");

test("availability SQL qualifies correlated reservation columns", () => {
  const query = new PgDialect().sqlToQuery(availableStockSql()).sql;
  assert.match(query, /"stock_reservations"\."id" = "stock_reservation_items"\."reservation_id"/);
  assert.match(query, /"stock_reservation_items"\."product_id" = "products"\."id"/);
});

test("physical stock subtracts only active non-expired reservations", () => {
  const reservations = [
    { quantity: 2, status: "active" as const, expiresAt: new Date("2026-09-03T12:15:00.000Z") },
    { quantity: 4, status: "active" as const, expiresAt: now },
    { quantity: 5, status: "released" as const, expiresAt: new Date("2026-09-03T12:15:00.000Z") },
    { quantity: 6, status: "consumed" as const, expiresAt: new Date("2026-09-03T12:15:00.000Z") },
  ];
  assert.equal(calculateAvailableStock(10, reservations, now), 8);
});

test("availability never reports a negative quantity", () => {
  assert.equal(calculateAvailableStock(1, [
    { quantity: 3, status: "active", expiresAt: new Date("2026-09-03T12:15:00.000Z") },
  ], now), 0);
});

test("reservation validation aggregates against locked available stock", () => {
  const requirements = [
    { productId: "a", name: "Fernet", quantity: 2 },
    { productId: "b", name: "Vaso", quantity: 3 },
  ];
  assert.equal(findReservationShortage(requirements, [
    { id: "a", stock: 5, reserved: 3 },
    { id: "b", stock: 5, reserved: 1 },
  ]), null);
  assert.deepEqual(findReservationShortage(requirements, [
    { id: "a", stock: 4, reserved: 3 },
    { id: "b", stock: 5, reserved: 1 },
  ]), { productId: "a", name: "Fernet", quantity: 2, available: 1 });
});

test("two sequential intents for the last unit admit only the first", () => {
  const firstAvailable = calculateAvailableStock(1, [], now);
  assert.equal(firstAvailable >= 1, true);
  const afterFirst = calculateAvailableStock(1, [
    { quantity: 1, status: "active", expiresAt: new Date("2026-09-03T12:15:00.000Z") },
  ], now);
  assert.equal(afterFirst >= 1, false);
});

test("una reserva active vencida se presenta como expired sin mutarla", () => {
  assert.equal(getEffectiveReservationStatus("active", now, now), "expired");
  assert.equal(getEffectiveReservationStatus("active", new Date(now.getTime() + 1), now), "active");
  assert.equal(getEffectiveReservationStatus("released", now, now), "released");
  assert.equal(getEffectiveReservationStatus(null, null, now), "none");
});
