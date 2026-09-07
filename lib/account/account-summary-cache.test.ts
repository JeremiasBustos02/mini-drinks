import assert from "node:assert/strict";
import test from "node:test";

import { createAccountSummaryCache } from "@/lib/account/account-summary-cache";

const summary = { displayName: "Mini", availablePoints: "2.500" };

test("reuses a loaded account summary until it expires", async () => {
  let requests = 0;
  const cache = createAccountSummaryCache(async () => {
    requests += 1;
    return summary;
  });
  await cache.ensure();
  await cache.ensure();
  assert.equal(requests, 1);
});

test("invalidation clears the cached account summary for the next ensure", async () => {
  let requests = 0;
  const cache = createAccountSummaryCache(async () => ({
    ...summary,
    availablePoints: String(++requests),
  }));
  await cache.ensure();
  cache.invalidate();
  const refreshed = await cache.ensure();
  assert.equal(requests, 2);
  assert.equal(refreshed.availablePoints, "2");
});

test("multiple invalidations retain one in-flight request and then fetch fresh", async () => {
  let resolve!: (value: typeof summary) => void;
  let requests = 0;
  const cache = createAccountSummaryCache(() => {
    requests += 1;
    if (requests > 1) return Promise.resolve(summary);
    return new Promise((done) => {
      resolve = done;
    });
  });
  const first = cache.ensure();
  cache.invalidate();
  cache.invalidate();
  const shared = cache.ensure();
  assert.equal(requests, 1);
  resolve(summary);
  await Promise.all([first, shared]);
  await cache.ensure();
  assert.equal(requests, 2);
});

test("expired cache loads a fresh account summary", async () => {
  let timestamp = 0;
  let requests = 0;
  const cache = createAccountSummaryCache(
    async () => ({ ...summary, availablePoints: String(++requests) }),
    () => timestamp,
    50,
  );
  await cache.ensure();
  timestamp = 51;
  await cache.ensure();
  assert.equal(requests, 2);
});
