import assert from "node:assert/strict";
import test from "node:test";

import { checkoutFailure, isRetryableCheckoutError } from "@/lib/checkout/errors";

test("mapea errores públicos sin detalles internos", () => {
  assert.match(checkoutFailure("product_unavailable").message, /producto/i);
  assert.match(checkoutFailure("insufficient_stock").message, /stock/i);
  assert.match(checkoutFailure("price_changed").message, /precio/i);
  assert.doesNotMatch(checkoutFailure("order_not_created").message, /sql|table|supabase/i);
});

test("solo errores temporales se marcan como reintentables", () => {
  assert.equal(isRetryableCheckoutError("payment_not_ready"), true);
  assert.equal(isRetryableCheckoutError("order_not_created"), true);
  assert.equal(isRetryableCheckoutError("invalid_payload"), false);
});
