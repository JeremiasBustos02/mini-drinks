import assert from "node:assert/strict";
import test from "node:test";

import { calculateLoyaltyPoints } from "@/lib/loyalty/points";

const settings = { earnUnitCents: 100000, pointsPerUnit: 1 };

test("earns one point per configured $1,000 subtotal unit without fractions", () => {
  assert.equal(calculateLoyaltyPoints(99900, settings), 0);
  assert.equal(calculateLoyaltyPoints(100000, settings), 1);
  assert.equal(calculateLoyaltyPoints(590000, settings), 5);
  assert.equal(calculateLoyaltyPoints(1275000, settings), 12);
});

test("uses the settings values instead of a hardcoded point formula", () => {
  assert.equal(calculateLoyaltyPoints(250000, { earnUnitCents: 50000, pointsPerUnit: 3 }), 15);
});

test("rejects invalid settings and unsafe amounts", () => {
  assert.throws(() => calculateLoyaltyPoints(-1, settings));
  assert.throws(() => calculateLoyaltyPoints(100000, { earnUnitCents: 0, pointsPerUnit: 1 }));
  assert.throws(() => calculateLoyaltyPoints(Number.MAX_SAFE_INTEGER, { earnUnitCents: 1, pointsPerUnit: 2 }));
});
