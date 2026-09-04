import assert from "node:assert/strict";
import test from "node:test";

import {
  getCheckoutQuoteUiState,
  isCheckoutReadyForQuote,
  isCurrentCheckoutQuote,
  isLatestQuoteRequest,
} from "@/lib/checkout/quote-ui";

const completePickup = {
  hasLines: true,
  customer: {
    firstName: "Ana",
    lastName: "Pérez",
    phone: "1122334455",
    email: "ana@example.com",
  },
  fulfillment: "pickup" as const,
};

test("datos incompletos no habilitan la cotización", () => {
  assert.equal(isCheckoutReadyForQuote({ ...completePickup, customer: { ...completePickup.customer, email: "" } }), false);
  assert.equal(isCheckoutReadyForQuote({ ...completePickup, customer: { ...completePickup.customer, email: "ana" } }), false);
  assert.equal(isCheckoutReadyForQuote({ ...completePickup, customer: { ...completePickup.customer, phone: "123" } }), false);
  assert.equal(isCheckoutReadyForQuote({ ...completePickup, hasLines: false }), false);
  assert.equal(isCheckoutReadyForQuote({ ...completePickup, fulfillment: "delivery" }), false);
});

test("datos completos habilitan cotización para retiro y envío", () => {
  assert.equal(isCheckoutReadyForQuote(completePickup), true);
  assert.equal(isCheckoutReadyForQuote({
    ...completePickup,
    fulfillment: "delivery",
    address: { street: "San Martín", number: "123", locality: "Mar del Plata" },
  }), true);
});

test("un cambio invalida una quote anterior", () => {
  assert.equal(isCurrentCheckoutQuote("carrito-a", "carrito-a"), true);
  assert.equal(isCurrentCheckoutQuote("carrito-a", "carrito-b"), false);
});

test("una respuesta vieja no pisa la última cotización", () => {
  assert.equal(isLatestQuoteRequest(2, 2), true);
  assert.equal(isLatestQuoteRequest(1, 2), false);
});

test("el estado conserva el formulario y solo habilita pago con quote vigente", () => {
  assert.equal(getCheckoutQuoteUiState({ ready: false, hasQuote: false, hasPriceChanges: false, hasError: false }), "incomplete");
  assert.equal(getCheckoutQuoteUiState({ ready: true, hasQuote: false, hasPriceChanges: false, hasError: false }), "validating");
  assert.equal(getCheckoutQuoteUiState({ ready: true, hasQuote: false, hasPriceChanges: false, hasError: true }), "error");
  assert.equal(getCheckoutQuoteUiState({ ready: true, hasQuote: true, hasPriceChanges: false, hasError: false }), "valid");
  assert.equal(getCheckoutQuoteUiState({ ready: true, hasQuote: true, hasPriceChanges: true, hasError: false }), "price_changed");
});
