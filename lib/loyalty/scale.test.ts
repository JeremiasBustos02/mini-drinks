import assert from "node:assert/strict";
import test from "node:test";

test("the x100 migration preserves the relative value of persisted points", () => {
  const scale = (points: number) => points * 100;

  const before = {
    settings: { pointsPerUnit: 1 },
    account: { balance: 12, lifetimeEarnedPoints: 50 },
    transaction: { points: 5, pointsPerUnit: 1 },
    rewardCode: { rewardPoints: 20 },
  };

  assert.deepEqual({
    settings: { pointsPerUnit: scale(before.settings.pointsPerUnit) },
    account: { balance: scale(before.account.balance), lifetimeEarnedPoints: scale(before.account.lifetimeEarnedPoints) },
    transaction: { points: scale(before.transaction.points), pointsPerUnit: scale(before.transaction.pointsPerUnit) },
    rewardCode: { rewardPoints: scale(before.rewardCode.rewardPoints) },
  }, {
    settings: { pointsPerUnit: 100 },
    account: { balance: 1200, lifetimeEarnedPoints: 5000 },
    transaction: { points: 500, pointsPerUnit: 100 },
    rewardCode: { rewardPoints: 2000 },
  });
});
