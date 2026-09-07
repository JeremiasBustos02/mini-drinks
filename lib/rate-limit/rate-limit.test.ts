import assert from "node:assert/strict";
import test from "node:test";

import { getClientIdentifier } from "@/lib/rate-limit/client-identifier";
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

test("prioriza la IP calculada por Vercel", () => {
  const identifier = getClientIdentifier(new Headers({
    "x-real-ip": " 203.0.113.10 ",
    "x-forwarded-for": "198.51.100.1, 203.0.113.10",
  }), "11111111-1111-4111-8111-111111111111");
  assert.deepEqual(identifier, { value: "ip:203.0.113.10", sourceType: "ip" });
});

test("normaliza una lista forwarded cuando no existe x-real-ip", () => {
  const identifier = getClientIdentifier(new Headers({
    "x-forwarded-for": " invalid,  198.51.100.20 , 203.0.113.10 ",
  }));
  assert.deepEqual(identifier, { value: "ip:198.51.100.20", sourceType: "ip" });
});

test("sin IP usa el attempt validado y no un bucket unavailable global", async () => {
  resetLocalRateLimitsForTests();
  const policy = { name: "checkout-fallback", limit: 1, windowSeconds: 60 };
  const first = getClientIdentifier(new Headers(), "11111111-1111-4111-8111-111111111111");
  const second = getClientIdentifier(new Headers(), "22222222-2222-4222-8222-222222222222");
  assert.deepEqual(first, { value: "attempt:11111111-1111-4111-8111-111111111111", sourceType: "attempt" });
  assert.equal((await checkRateLimit(policy, first.value, { now: 0 })).allowed, true);
  assert.equal((await checkRateLimit(policy, second.value, { now: 0 })).allowed, true);
  assert.equal((await checkRateLimit(policy, first.value, { now: 1 })).allowed, false);
});

test("sin IP ni attempt genera un fallback aislado", async () => {
  resetLocalRateLimitsForTests();
  const policy = { name: "request-fallback", limit: 1, windowSeconds: 60 };
  const first = getClientIdentifier(new Headers(), undefined, "request-a");
  const second = getClientIdentifier(new Headers(), undefined, "request-b");
  assert.deepEqual(first, { value: "fallback:request-a", sourceType: "fallback" });
  assert.notEqual(first.value, second.value);
  assert.equal((await checkRateLimit(policy, first.value, { now: 0 })).allowed, true);
  assert.equal((await checkRateLimit(policy, second.value, { now: 0 })).allowed, true);
});
