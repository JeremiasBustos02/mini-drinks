import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { WebhookSignatureValidator } from "mercadopago";

import {
  centsToMercadoPagoAmount,
  mercadoPagoAmountToCents,
} from "@/lib/mercado-pago/money";
import {
  getPaymentValidationError,
  isPendingPaymentStatus,
  mapMercadoPagoPaymentStatus,
  planApprovedReservation,
  type MercadoPagoPayment,
} from "@/lib/mercado-pago/payment";
import { buildMercadoPagoPreference, canReusePreference } from "@/lib/mercado-pago/preference";
import { handleMercadoPagoWebhook } from "@/lib/mercado-pago/webhook-handler";

const orderId = "11111111-1111-4111-8111-111111111111";

function payment(overrides: Partial<MercadoPagoPayment> = {}): MercadoPagoPayment {
  return {
    id: "123",
    status: "approved",
    statusDetail: "accredited",
    externalReference: orderId,
    transactionAmount: 5900,
    currency: "ARS",
    dateApproved: null,
    metadataOrderId: orderId,
    preferenceId: "pref-1",
    paymentMethodId: "visa",
    paymentTypeId: "credit_card",
    ...overrides,
  };
}

test("converts internal cents to Mercado Pago pesos only at the boundary", () => {
  assert.equal(centsToMercadoPagoAmount(590000), 5900);
  assert.equal(centsToMercadoPagoAmount(590099), 5900.99);
  assert.equal(mercadoPagoAmountToCents(5900.99), 590099);
  assert.throws(() => centsToMercadoPagoAmount(1.5));
});

test("builds an expiring Checkout Pro preference from persisted order rows", () => {
  const from = new Date("2026-09-03T12:00:00.000Z");
  const to = new Date("2026-09-03T12:15:00.000Z");
  const preference = buildMercadoPagoPreference({
    id: orderId,
    publicNumber: "MD-TEST",
    customerEmail: "buyer@example.com",
    total: 590000,
    items: [{ id: "item-1", displayName: "Combo Fernet", quantity: 1, unitPrice: 590000 }],
  }, "https://shop.example.com", "22222222-2222-4222-8222-222222222222", from, to);

  assert.equal(preference.items[0].unit_price, 5900);
  assert.equal(preference.items[0].currency_id, "ARS");
  assert.equal(preference.external_reference, orderId);
  assert.deepEqual(preference.metadata, { order_id: orderId });
  assert.equal(preference.expiration_date_to, to.toISOString());
  assert.equal(preference.expires, true);
  assert.match(preference.back_urls.success, /\/pago\/exito\?/);
  assert.deepEqual(preference.payment_methods.excluded_payment_types.map(({ id }) => id), [
    "ticket", "atm", "bank_transfer",
  ]);
});

test("refuses a preference when persisted item totals differ from the order", () => {
  assert.throws(() => buildMercadoPagoPreference({
    id: orderId,
    publicNumber: "MD-TEST",
    customerEmail: null,
    total: 1000,
    items: [{ id: "item-1", displayName: "Item", quantity: 1, unitPrice: 900 }],
  }, "https://shop.example.com", "token", new Date("2026-09-03T12:00:00Z"), new Date("2026-09-03T12:15:00Z")));
});

test("reuses only a complete and non-expired preference", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  assert.equal(canReusePreference({ id: "pref-1", initPoint: "https://mp.test", expiresAt: new Date("2026-09-03T12:15:00Z") }, now), true);
  assert.equal(canReusePreference({ id: "pref-1", initPoint: "https://mp.test", expiresAt: now }, now), false);
  assert.equal(canReusePreference({ id: null, initPoint: null, expiresAt: null }, now), false);
});

test("maps all supported payment states explicitly", () => {
  assert.equal(mapMercadoPagoPaymentStatus("in_process"), "in_process");
  assert.equal(mapMercadoPagoPaymentStatus("charged_back"), "charged_back");
  assert.equal(mapMercadoPagoPaymentStatus("future_status"), "unknown");
  assert.equal(isPendingPaymentStatus("pending"), true);
  assert.equal(isPendingPaymentStatus("approved"), false);
});

test("approved consumes once and late insufficient stock requires manual review", () => {
  assert.equal(planApprovedReservation("active", false), "consume");
  assert.equal(planApprovedReservation("consumed", false), "duplicate");
  assert.equal(planApprovedReservation("released", true), "manual_review");
  assert.equal(planApprovedReservation("released", false), "consume");
});

test("validates payment order, amount and currency before approval", () => {
  const order = { id: orderId, total: 590000, preferenceId: "pref-1" };
  assert.equal(getPaymentValidationError(payment(), order, 590000), null);
  assert.equal(getPaymentValidationError(payment({ externalReference: "other" }), order, 590000), "external_reference_mismatch");
  assert.equal(getPaymentValidationError(payment(), order, 1), "transaction_amount_mismatch");
  assert.equal(getPaymentValidationError(payment({ currency: "USD" }), order, 590000), "currency_mismatch");
  assert.equal(getPaymentValidationError(payment({ preferenceId: "pref-other" }), order, 590000), "preference_id_mismatch");
});

test("official SDK webhook validator rejects invalid signatures", () => {
  assert.throws(() => WebhookSignatureValidator.validate({
    xSignature: "ts=1725364800,v1=invalid",
    xRequestId: "request-1",
    dataId: "123",
    secret: "test-secret",
  }));
});

test("official SDK webhook validator accepts the documented HMAC manifest", () => {
  const ts = "1725364800";
  const hash = createHmac("sha256", "test-secret")
    .update(`id:123;request-id:request-1;ts:${ts};`)
    .digest("hex");
  WebhookSignatureValidator.validate({
    xSignature: `ts=${ts},v1=${hash}`,
    xRequestId: "request-1",
    dataId: "123",
    secret: "test-secret",
  });
});

function signedWebhook(paymentId = "123", type = "payment") {
  const ts = "1725364800";
  const requestId = "request-1";
  const hash = createHmac("sha256", "test-secret")
    .update(`id:${paymentId};request-id:${requestId};ts:${ts};`)
    .digest("hex");
  return new Request(`https://shop.example.com/api/webhooks/mercado-pago?data.id=${paymentId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-request-id": requestId,
      "x-signature": `ts=${ts},v1=${hash}`,
    },
    body: JSON.stringify({ type, data: { id: paymentId } }),
  });
}

test("webhook rejects an invalid signature before fetching the payment", async () => {
  let fetched = false;
  const response = await handleMercadoPagoWebhook(new Request("https://shop.example.com/api/webhooks/mercado-pago?data.id=123", {
    method: "POST",
    headers: { "x-request-id": "request-1", "x-signature": "ts=1,v1=invalid" },
    body: JSON.stringify({ type: "payment", data: { id: "123" } }),
  }), {
    secret: "test-secret",
    fetchPayment: async () => { fetched = true; return payment(); },
    processPayment: async () => ({ outcome: "approved" }),
  });
  assert.equal(response.status, 401);
  assert.equal(fetched, false);
});

test("webhook acknowledges a payment that does not exist", async () => {
  const response = await handleMercadoPagoWebhook(signedWebhook(), {
    secret: "test-secret",
    fetchPayment: async () => null,
    processPayment: async () => { throw new Error("must not run"); },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true, ignored: true });
});

test("webhook fetches and forwards authoritative pending, approved and rejected states", async () => {
  for (const status of ["pending", "approved", "rejected"]) {
    let processed = "";
    const response = await handleMercadoPagoWebhook(signedWebhook(), {
      secret: "test-secret",
      fetchPayment: async () => payment({ status }),
      processPayment: async (fetched) => { processed = fetched.status; return { outcome: status }; },
    });
    assert.equal(response.status, 200);
    assert.equal(processed, status);
  }
});
