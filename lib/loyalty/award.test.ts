import assert from "node:assert/strict";
import test from "node:test";

import { purchaseEarnIdempotencyKey, tryLoyaltyAwardAfterPaymentCommit } from "@/lib/loyalty/award-utils";

const orderId = "11111111-1111-4111-8111-111111111111";

test("uses an operation-specific idempotency key for purchase earnings", () => {
  assert.equal(purchaseEarnIdempotencyKey(orderId), `order:${orderId}:purchase-earned`);
  assert.notEqual(
    purchaseEarnIdempotencyKey(orderId),
    `order:${orderId}:purchase-reversal`,
  );
});

test("contains a loyalty failure so payment processing can remain committed and retry later", async () => {
  const failed = await tryLoyaltyAwardAfterPaymentCommit(async () => {
    throw new Error("database unavailable");
  });
  assert.deepEqual(failed, { status: "failed", errorName: "Error" });

  const retried = await tryLoyaltyAwardAfterPaymentCommit(async () => ({ outcome: "credited" as const, points: 5 }));
  assert.deepEqual(retried, { status: "completed", result: { outcome: "credited", points: 5 } });
});
