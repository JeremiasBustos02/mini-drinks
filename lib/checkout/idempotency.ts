import { createHash } from "node:crypto";

import type { CheckoutCreationResult } from "@/types/checkout";

export type ExistingIdempotentOrder = {
  publicNumber: string;
  accessTokenHash: string;
  checkoutRequestHash: string;
};

export function hashOrderAccessToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function resolveIdempotentOrder(
  existing: ExistingIdempotentOrder | undefined,
  accessTokenHash: string,
  checkoutRequestHash: string,
): CheckoutCreationResult | null {
  if (!existing) return null;
  if (
    existing.accessTokenHash !== accessTokenHash ||
    existing.checkoutRequestHash !== checkoutRequestHash
  ) {
    return {
      ok: false,
      code: "idempotency_conflict",
      message: "La intención de checkout ya fue utilizada.",
    };
  }
  return {
    ok: true,
    publicNumber: existing.publicNumber,
    confirmationUrl: "",
    alreadyCreated: true,
  };
}
