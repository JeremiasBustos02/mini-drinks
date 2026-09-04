import assert from "node:assert/strict";
import test from "node:test";

import { getHealthStatus } from "@/lib/health/status";

test("health prioriza DB y degrada si falta el limiter distribuido", () => {
  assert.equal(getHealthStatus(true, true), "ok");
  assert.equal(getHealthStatus(true, false), "degraded");
  assert.equal(getHealthStatus(false, true), "unavailable");
});
