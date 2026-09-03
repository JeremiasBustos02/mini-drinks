import { createHash } from "node:crypto";

import type { CheckoutFulfillment, ResolvedCheckout } from "@/types/checkout";
import type { ValidCreateOrderPayload } from "@/lib/checkout/validation";

function sha256(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

export function createCheckoutQuoteHash(
  checkout: ResolvedCheckout,
  fulfillment: CheckoutFulfillment,
) {
  return sha256({ checkout, fulfillment });
}

export function createCheckoutRequestHash(payload: ValidCreateOrderPayload) {
  return sha256({
    checkoutAttemptId: payload.checkoutAttemptId,
    customer: payload.customer,
    fulfillment: payload.fulfillment,
    notes: payload.notes,
    lines: payload.lines,
    acceptedTotal: payload.acceptedTotal,
    acceptedQuoteHash: payload.acceptedQuoteHash,
  });
}
