import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeLogContext } from "@/lib/observability/logger";

test("sanitiza PII y secretos incluso dentro de objetos", () => {
  assert.deepEqual(sanitizeLogContext({
    orderId: "order-1",
    accessToken: "secret",
    customer: { email: "person@example.com", phone: "123", status: "ok" },
  }), {
    orderId: "order-1",
    accessToken: "[redacted]",
    customer: { email: "[redacted]", phone: "[redacted]", status: "ok" },
  });
});

test("los errores solo conservan su nombre", () => {
  const error = new Error("relation internal_table does not exist");
  assert.deepEqual(sanitizeLogContext({ error }), { error: { errorName: "Error" } });
});
