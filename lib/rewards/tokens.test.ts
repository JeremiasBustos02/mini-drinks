import assert from "node:assert/strict";
import test from "node:test";

import { createRewardToken, hashRewardToken } from "@/lib/rewards/tokens";
import { parseRewardDistribution } from "@/lib/rewards/validation";

test("reward tokens are random and hashes are deterministic", () => {
  const first = createRewardToken();
  const second = createRewardToken();
  assert.notEqual(first, second);
  assert.equal(hashRewardToken(first), hashRewardToken(first));
  assert.notEqual(hashRewardToken(first), hashRewardToken(second));
});

test("validates configured reward batches", () => {
  assert.deepEqual(parseRewardDistribution("70 | 500\n20 | 1000"), [{ quantity: 70, points: 500 }, { quantity: 20, points: 1000 }]);
  assert.throws(() => parseRewardDistribution("0 | 5"));
  assert.throws(() => parseRewardDistribution("2 | 0"));
});
