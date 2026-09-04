import assert from "node:assert/strict";
import test from "node:test";

import { hashOrderAccessToken, resolveIdempotentOrder } from "@/lib/checkout/idempotency";
import { createCheckoutQuoteHash } from "@/lib/checkout/quote-hash";
import { resolveCheckout, type CheckoutCatalog } from "@/lib/checkout/resolve-cart";
import { checkoutSchema, createOrderSchema, type ValidCheckoutPayload } from "@/lib/checkout/validation";
import type { CheckoutCartLine, CheckoutFulfillment } from "@/types/checkout";

const ids = {
  miniature: "11111111-1111-4111-8111-111111111111",
  mixer: "22222222-2222-4222-8222-222222222222",
  glass: "33333333-3333-4333-8333-333333333333",
  extra: "44444444-4444-4444-8444-444444444444",
  combo: "55555555-5555-4555-8555-555555555555",
  attempt: "66666666-6666-4666-8666-666666666666",
  token: "77777777-7777-4777-8777-777777777777",
  unknown: "99999999-9999-4999-8999-999999999999",
};

function catalog(overrides: Partial<CheckoutCatalog> = {}): CheckoutCatalog {
  return {
    products: [
      { id: ids.miniature, name: "Fernet", productType: "miniature", price: 500, stock: 10, active: true, published: true },
      { id: ids.mixer, name: "Cola", productType: "mixer", price: 300, stock: 10, active: true, published: true },
      { id: ids.glass, name: "Vaso", productType: "glass", price: 400, stock: 10, active: true, published: true },
      { id: ids.extra, name: "Gomitas", productType: "extra", price: 100, stock: 10, active: true, published: true },
    ],
    combos: [{
      id: ids.combo,
      name: "Fernet completo",
      promotionalPrice: 900,
      active: true,
      published: true,
      components: [
        { productId: ids.miniature, quantity: 1 },
        { productId: ids.mixer, quantity: 1 },
        { productId: ids.glass, quantity: 1 },
      ],
    }],
    ...overrides,
  };
}

function payload(
  lines: CheckoutCartLine[],
  fulfillment: CheckoutFulfillment = { type: "pickup" },
): ValidCheckoutPayload {
  return {
    checkoutAttemptId: ids.attempt,
    accessToken: ids.token,
    customer: { firstName: "Ana", lastName: "Pérez", phone: "+54 223 555-5555", email: "ana@example.com" },
    fulfillment,
    lines,
  };
}

function customLine(quantity = 1, withExtra = false): CheckoutCartLine {
  return {
    type: "custom_combo",
    quantity,
    components: [
      { role: "miniature", productId: ids.miniature, quantity: 1 },
      { role: "mixer", productId: ids.mixer, quantity: 1 },
      { role: "glass", productId: ids.glass, quantity: 1 },
      ...(withExtra ? [{ role: "extra" as const, productId: ids.extra, quantity: 2 }] : []),
    ],
  };
}

test("resolves an individual product from current catalog data", () => {
  const result = resolveCheckout(payload([{ type: "product", productId: ids.miniature, quantity: 2 }]), catalog());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.checkout.total, 1000);
  assert.deepEqual(result.stockRequirements, [
    { productId: ids.miniature, name: "Fernet", quantity: 2 },
  ]);
  assert.equal(result.checkout.lines[0].displayName, "Fernet");
  assert.equal(result.checkout.lines[0].configurationJson, null);
});

test("rejects an unknown product", () => {
  const result = resolveCheckout(payload([{ type: "product", productId: ids.unknown, quantity: 1 }]), catalog());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "product_not_found");
});

test("rejects an unpublished product", () => {
  const current = catalog();
  current.products[0].published = false;
  const result = resolveCheckout(payload([{ type: "product", productId: ids.miniature, quantity: 1 }]), current);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "product_unavailable");
});

test("resolves a preset combo with the lower promotional price and a v1 snapshot", () => {
  const result = resolveCheckout(payload([{ type: "combo", comboId: ids.combo, quantity: 1 }]), catalog());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.checkout.total, 900);
  const snapshot = result.checkout.lines[0].configurationJson;
  assert.equal(snapshot?.version, 1);
  assert.equal(snapshot?.kind, "preset_combo");
  if (snapshot?.kind === "preset_combo") assert.equal(snapshot.components.length, 3);
});

test("never prices a preset combo above its individual component sum", () => {
  const current = catalog();
  current.combos[0].promotionalPrice = 5000;
  const result = resolveCheckout(payload([{ type: "combo", comboId: ids.combo, quantity: 1 }]), current);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.checkout.total, 1200);
});

test("rejects a combo without component stock", () => {
  const current = catalog();
  current.products[1].stock = 0;
  const result = resolveCheckout(payload([{ type: "combo", comboId: ids.combo, quantity: 1 }]), current);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "insufficient_stock");
});

test("reconstructs a custom combo, applies its best exact match and adds extras", () => {
  const result = resolveCheckout(payload([customLine(1, true)]), catalog());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.checkout.total, 1100);
  const snapshot = result.checkout.lines[0].configurationJson;
  assert.equal(snapshot?.kind, "custom_combo");
  if (snapshot?.kind === "custom_combo") {
    assert.equal(snapshot.matchedCombo?.id, ids.combo);
    assert.equal(snapshot.savings, 300);
    assert.equal(snapshot.extrasPrice, 200);
    assert.equal(snapshot.version, 1);
  }
  assert.deepEqual(result.stockRequirements, [
    { productId: ids.miniature, name: "Fernet", quantity: 1 },
    { productId: ids.mixer, name: "Cola", quantity: 1 },
    { productId: ids.glass, name: "Vaso", quantity: 1 },
    { productId: ids.extra, name: "Gomitas", quantity: 2 },
  ]);
});

test("rejects an unknown custom-combo component", () => {
  const line = customLine();
  if (line.type === "custom_combo") line.components[0].productId = ids.unknown;
  const result = resolveCheckout(payload([line]), catalog());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "invalid_custom_combo");
});

test("aggregates stock across individual, preset and multiplied lines", () => {
  const current = catalog();
  current.products[0].stock = 3;
  const valid = resolveCheckout(payload([
    { type: "product", productId: ids.miniature, quantity: 1 },
    { type: "combo", comboId: ids.combo, quantity: 2 },
  ]), current);
  assert.equal(valid.ok, true);

  const invalid = resolveCheckout(payload([
    { type: "product", productId: ids.miniature, quantity: 1 },
    { type: "combo", comboId: ids.combo, quantity: 3 },
  ]), current);
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.equal(invalid.code, "insufficient_stock");
    assert.match(invalid.message, /se necesitan 4 y hay 3/);
  }
});

test("multiplies custom-combo component requirements by line quantity", () => {
  const current = catalog();
  current.products[2].stock = 1;
  const result = resolveCheckout(payload([customLine(2)]), current);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "insufficient_stock");
});

test("reports a price update without trusting the displayed price", () => {
  const result = resolveCheckout(payload([{ type: "product", productId: ids.miniature, quantity: 1, displayedUnitPrice: 300 }]), catalog());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.checkout.total, 500);
  assert.equal(result.checkout.hasPriceChanges, true);
  assert.equal(result.checkout.lines[0].previousUnitPrice, 300);
});

test("rejects empty carts, delivery without address, duplicate custom components and unsafe money", () => {
  assert.equal(checkoutSchema.safeParse(payload([])).success, false);
  assert.equal(checkoutSchema.safeParse({ ...payload([customLine()]), fulfillment: { type: "delivery" } }).success, false);

  const duplicate = customLine();
  if (duplicate.type === "custom_combo") duplicate.components.push({ role: "extra", productId: ids.miniature, quantity: 1 });
  assert.equal(checkoutSchema.safeParse(payload([duplicate])).success, false);
  assert.equal(createOrderSchema.safeParse({
    ...payload([{ type: "product", productId: ids.miniature, quantity: 1 }]),
    acceptedTotal: Number.MAX_SAFE_INTEGER + 1,
    acceptedQuoteHash: "a".repeat(64),
  }).success, false);

  const current = catalog();
  current.products[0].price = Number.MAX_SAFE_INTEGER + 1;
  const result = resolveCheckout(payload([{ type: "product", productId: ids.miniature, quantity: 1 }]), current);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "invalid_money");
});

test("idempotency returns the same order only for the matching access token", () => {
  const hash = hashOrderAccessToken(ids.token);
  const requestHash = "b".repeat(64);
  const repeated = resolveIdempotentOrder(
    { publicNumber: "MD-TEST", accessTokenHash: hash, checkoutRequestHash: requestHash },
    hash,
    requestHash,
  );
  assert.equal(repeated?.ok, true);
  if (repeated?.ok) {
    assert.equal(repeated.publicNumber, "MD-TEST");
    assert.equal(repeated.alreadyCreated, true);
  }
  const conflict = resolveIdempotentOrder(
    { publicNumber: "MD-TEST", accessTokenHash: hash, checkoutRequestHash: requestHash },
    hashOrderAccessToken(ids.unknown),
    requestHash,
  );
  assert.equal(conflict?.ok, false);
  if (conflict && !conflict.ok) assert.equal(conflict.code, "idempotency_conflict");
});

test("idempotency rejects a changed request and quote hashes detect offsetting price changes", () => {
  const accessHash = hashOrderAccessToken(ids.token);
  const changedRequest = resolveIdempotentOrder(
    { publicNumber: "MD-TEST", accessTokenHash: accessHash, checkoutRequestHash: "a".repeat(64) },
    accessHash,
    "b".repeat(64),
  );
  assert.equal(changedRequest?.ok, false);

  const first = resolveCheckout(payload([customLine()]), catalog());
  const changedCatalog = catalog();
  changedCatalog.products[0].price += 100;
  changedCatalog.products[1].price -= 100;
  const second = resolveCheckout(payload([customLine()]), changedCatalog);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (first.ok && second.ok) {
    assert.equal(first.checkout.total, second.checkout.total);
    assert.notEqual(
      createCheckoutQuoteHash(first.checkout, { type: "pickup" }),
      createCheckoutQuoteHash(second.checkout, { type: "pickup" }),
    );
  }
});
