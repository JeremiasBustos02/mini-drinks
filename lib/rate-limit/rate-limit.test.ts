import assert from "node:assert/strict";
import test from "node:test";

import { checkRateLimit, resetLocalRateLimitsForTests } from "@/lib/rate-limit";

test("el fallback local limita y vuelve a admitir al abrir otra ventana", async () => {
  resetLocalRateLimitsForTests();
  const policy = { name: "test", limit: 2, windowSeconds: 10 };
  assert.equal((await checkRateLimit(policy, "client", { now: 0 })).allowed, true);
  assert.equal((await checkRateLimit(policy, "client", { now: 1 })).allowed, true);
  assert.equal((await checkRateLimit(policy, "client", { now: 2 })).allowed, false);
  assert.equal((await checkRateLimit(policy, "client", { now: 10_001 })).allowed, true);
});

test("identificadores distintos no comparten cuota", async () => {
  resetLocalRateLimitsForTests();
  const policy = { name: "isolated", limit: 1, windowSeconds: 60 };
  assert.equal((await checkRateLimit(policy, "a", { now: 0 })).allowed, true);
  assert.equal((await checkRateLimit(policy, "b", { now: 0 })).allowed, true);
});
