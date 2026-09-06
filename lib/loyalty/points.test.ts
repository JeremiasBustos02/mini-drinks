import assert from "node:assert/strict";
import test from "node:test";

import { calculateLoyaltyPoints, formatLoyaltyPoints } from "@/lib/loyalty/points";

const settings = { earnUnitCents: 100000, pointsPerUnit: 100 };

test("earns 100 points per configured $1,000 subtotal unit without fractions", () => {
  assert.equal(calculateLoyaltyPoints(99900, settings), 0);
  assert.equal(calculateLoyaltyPoints(100000, settings), 100);
  assert.equal(calculateLoyaltyPoints(590000, settings), 500);
  assert.equal(calculateLoyaltyPoints(1275000, settings), 1200);
  assert.equal(calculateLoyaltyPoints(2500000, settings), 2500);
});

test("uses the settings values instead of a hardcoded point formula", () => {
  assert.equal(calculateLoyaltyPoints(250000, { earnUnitCents: 50000, pointsPerUnit: 3 }), 15);
});

test("rejects invalid settings and unsafe amounts", () => {
  assert.throws(() => calculateLoyaltyPoints(-1, settings));
  assert.throws(() => calculateLoyaltyPoints(100000, { earnUnitCents: 0, pointsPerUnit: 1 }));
  assert.throws(() => calculateLoyaltyPoints(Number.MAX_SAFE_INTEGER, { earnUnitCents: 1, pointsPerUnit: 2 }));
});

test("formats points for Argentina", () => {
  assert.equal(formatLoyaltyPoints(500), "500");
  assert.equal(formatLoyaltyPoints(1200), "1.200");
  assert.equal(formatLoyaltyPoints(2500), "2.500");
});
