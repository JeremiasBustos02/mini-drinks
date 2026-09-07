import assert from "node:assert/strict";
import test from "node:test";
import {
  orderTracker,
  shortOrderReference,
} from "@/lib/account/order-presentation";

test("order reference is a stable presentation alias", () => {
  assert.equal(
    shortOrderReference("MD-20260907-8D8B4433152F4F29"),
    "Pedido #2F4F29",
  );
});
test("trackers separate pickup and delivery", () => {
  assert.equal(
    orderTracker("ready_for_pickup", "pickup").steps[3],
    "Listo para retirar",
  );
  assert.equal(
    orderTracker("out_for_delivery", "delivery").steps[3],
    "En camino",
  );
  assert.equal(orderTracker("manual_review", "pickup").exceptional, true);
});
