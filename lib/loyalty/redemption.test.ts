import assert from "node:assert/strict";
import test from "node:test";

import { applyLoyaltyRedemption, calculateLoyaltyRedemption, isLoyaltyRedemptionAvailable, maximumRedeemablePoints, planLoyaltyRedemptionTransition, redemptionIdempotencyKey } from "@/lib/loyalty/redemption";

const settings = { redemptionValueCents: 40, minRedemptionPoints: 2500, redemptionStepPoints: 100, maxRedemptionPercentage: 20 };

test("2499 points cannot be redeemed and 2500 points save ARS 1,000", () => {
  assert.equal(maximumRedeemablePoints(2499, 1_000_000, settings), 0);
  assert.deepEqual(calculateLoyaltyRedemption(2500, 2500, 1_000_000, settings), { points: 2500, discountCents: 100_000 });
});

test("redemption requires the configured 100-point step and respects the 20% cap", () => {
  assert.throws(() => calculateLoyaltyRedemption(2550, 10_000, 1_000_000, settings));
  assert.equal(maximumRedeemablePoints(10_000, 1_000_000, settings), 5000);
  assert.throws(() => calculateLoyaltyRedemption(5100, 10_000, 1_000_000, settings));
});

test("shipping is excluded and a subtotal whose cap is below the minimum cannot redeem", () => {
  assert.equal(maximumRedeemablePoints(20_000, 400_000, settings), 0);
  const checkout = applyLoyaltyRedemption(
    { subtotal: 1_000_000, discountTotal: 0, deliveryTotal: 25_000, total: 1_025_000 },
    calculateLoyaltyRedemption(2500, 2500, 1_000_000, settings),
  );
  assert.equal(checkout.total, 925_000);
  assert.equal(checkout.deliveryTotal, 25_000);
});

test("insufficient balance and invalid requests are rejected", () => {
  assert.throws(() => calculateLoyaltyRedemption(2500, 2499, 1_000_000, settings));
  assert.throws(() => calculateLoyaltyRedemption(2500, 2500, 1_000_000, { ...settings, redemptionValueCents: 0 }));
});

test("historical discount snapshots and earning base remain independent from later settings", () => {
  const snapshot = calculateLoyaltyRedemption(2500, 2500, 1_000_000, settings);
  assert.equal(snapshot.discountCents, 100_000);
  assert.equal(calculateLoyaltyRedemption(2500, 2500, 1_000_000, { ...settings, redemptionValueCents: 50 }).discountCents, 125_000);
  assert.equal(1_000_000 - snapshot.discountCents, 900_000);
});

test("redemption debit idempotency is unique per order", () => {
  assert.equal(redemptionIdempotencyKey("order-1"), "order:order-1:points-redeemed");
  assert.notEqual(redemptionIdempotencyKey("order-1"), redemptionIdempotencyKey("order-2"));
});

test("rejected and cancelled attempts keep a valid order reservation for a later approval", () => {
  assert.equal(planLoyaltyRedemptionTransition("reserved", "approved"), "redeem");
  assert.equal(planLoyaltyRedemptionTransition("redeemed", "approved"), "duplicate");
  assert.equal(planLoyaltyRedemptionTransition("reserved", "pending"), "keep");
  assert.equal(planLoyaltyRedemptionTransition("reserved", "rejected"), "keep");
  assert.equal(planLoyaltyRedemptionTransition("reserved", "cancelled"), "keep");
  assert.equal(planLoyaltyRedemptionTransition("released", "cancelled"), "duplicate");
});

test("a shared checkout expiration releases availability only after the preference lifetime", () => {
  const expiresAt = new Date("2026-09-07T12:15:00.000Z");
  assert.equal(isLoyaltyRedemptionAvailable(expiresAt, new Date("2026-09-07T12:14:59.999Z")), true);
  assert.equal(isLoyaltyRedemptionAvailable(expiresAt, expiresAt), false);
});

test("available balance excludes reserved points before a new checkout calculates its maximum", () => {
  assert.equal(maximumRedeemablePoints(6000, 1_000_000, settings), 5000);
  assert.throws(() => calculateLoyaltyRedemption(5100, 6000, 1_000_000, settings));
});

test("repeated rejected attempts keep the same reservation and an expired release cannot be debited", () => {
  assert.equal(planLoyaltyRedemptionTransition("reserved", "rejected"), "keep");
  assert.equal(planLoyaltyRedemptionTransition("reserved", "rejected"), "keep");
  assert.equal(planLoyaltyRedemptionTransition("released", "approved"), "duplicate");
});
