import assert from "node:assert/strict";
import test from "node:test";

import {
  orderStatusLabels,
  orderStatusMessage,
  paymentStatusLabels,
} from "@/lib/account/order-presentation";

test("customer order statuses use safe presentation labels", () => {
  assert.equal(orderStatusLabels.paid, "Pagado");
  assert.equal(orderStatusLabels.manual_review, "Estamos revisando tu pago");
  assert.equal(
    orderStatusMessage("manual_review"),
    "Recibimos información del pago y necesitamos verificar el pedido antes de confirmarlo.",
  );
});

test("payment labels never expose provider identifiers", () => {
  assert.equal(paymentStatusLabels.approved, "Aprobado con Mercado Pago");
  assert.equal(paymentStatusLabels.pending, "Pago pendiente");
});
