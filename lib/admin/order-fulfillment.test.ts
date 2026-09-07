import assert from "node:assert/strict";
import test from "node:test";

import {
  adminAttentionOrderStatuses,
  advanceOrderFulfillment,
  getNextFulfillmentStatus,
  type FulfillmentOrder,
} from "@/lib/admin/order-fulfillment";

const orderId = "11111111-1111-4111-8111-111111111111";

function order(
  status: FulfillmentOrder["status"],
  deliveryType: FulfillmentOrder["deliveryType"] = "pickup",
): FulfillmentOrder {
  return { id: orderId, publicNumber: "MINI-2026-001", status, deliveryType };
}

function transitionFor(storedOrder: FulfillmentOrder) {
  return advanceOrderFulfillment({
    authorize: async () => undefined,
    findOrder: async () => storedOrder,
    orderId,
    updateIfCurrent: async (
      _id: string,
      expectedStatus: FulfillmentOrder["status"],
      nextStatus: FulfillmentOrder["status"],
    ) => {
      if (storedOrder.status !== expectedStatus) return false;
      storedOrder.status = nextStatus;
      return true;
    },
  });
}

test("un usuario no administrador no puede iniciar una mutación", async () => {
  let read = false;
  let updated = false;
  await assert.rejects(
    advanceOrderFulfillment({
      authorize: async () => {
        throw new Error("forbidden");
      },
      findOrder: async () => {
        read = true;
        return order("paid");
      },
      orderId,
      updateIfCurrent: async () => {
        updated = true;
        return true;
      },
    }),
  );
  assert.equal(read, false);
  assert.equal(updated, false);
});

test("paid avanza únicamente a preparing", async () => {
  const stored = order("paid");
  assert.equal((await transitionFor(stored)).result, "advanced");
  assert.equal(stored.status, "preparing");
  assert.notEqual(getNextFulfillmentStatus("paid", "pickup"), "completed");
});

test("preparing respeta la modalidad persistida", async () => {
  const pickup = order("preparing", "pickup");
  const delivery = order("preparing", "delivery");
  await transitionFor(pickup);
  await transitionFor(delivery);
  assert.equal(pickup.status, "ready_for_pickup");
  assert.equal(delivery.status, "out_for_delivery");
  assert.notEqual(getNextFulfillmentStatus("preparing", "pickup"), "out_for_delivery");
  assert.notEqual(getNextFulfillmentStatus("preparing", "delivery"), "ready_for_pickup");
});

test("los estados de entrega completan sólo desde su paso final", async () => {
  const pickup = order("ready_for_pickup", "pickup");
  const delivery = order("out_for_delivery", "delivery");
  await transitionFor(pickup);
  await transitionFor(delivery);
  assert.equal(pickup.status, "completed");
  assert.equal(delivery.status, "completed");
  assert.equal(getNextFulfillmentStatus("preparing", "pickup"), "ready_for_pickup");
});

test("completed y estados de pago o conciliación no tienen transición operativa", () => {
  for (const status of [
    "completed",
    "manual_review",
    "payment_pending",
    "pending_payment",
    "payment_rejected",
    "expired",
    "cancelled",
  ] as const) {
    assert.equal(getNextFulfillmentStatus(status, "pickup"), null);
  }
});

test("el browser no puede elegir un próximo estado arbitrario", async () => {
  const stored = order("paid");
  const result = await advanceOrderFulfillment({
    authorize: async () => undefined,
    findOrder: async () => stored,
    orderId,
    updateIfCurrent: async (
      _id: string,
      expectedStatus: FulfillmentOrder["status"],
      nextStatus: FulfillmentOrder["status"],
    ) => {
      assert.equal(expectedStatus, "paid");
      assert.equal(nextStatus, "preparing");
      stored.status = nextStatus;
      return true;
    },
    // Extra browser data is not part of the action contract and is ignored.
    nextStatus: "completed",
  } as never);
  assert.equal(result.result, "advanced");
  assert.equal(stored.status, "preparing");
});

test("dos avances simultáneos sólo aplican una transición", async () => {
  const stored = order("paid");
  const updateIfCurrent = async (
    _id: string,
    expectedStatus: FulfillmentOrder["status"],
    nextStatus: FulfillmentOrder["status"],
  ) => {
    if (stored.status !== expectedStatus) return false;
    stored.status = nextStatus;
    return true;
  };
  const [first, second] = await Promise.all([
    advanceOrderFulfillment({ authorize: async () => undefined, findOrder: async () => ({ ...stored, status: "paid" }), orderId, updateIfCurrent }),
    advanceOrderFulfillment({ authorize: async () => undefined, findOrder: async () => ({ ...stored, status: "paid" }), orderId, updateIfCurrent }),
  ]);
  assert.deepEqual([first.result, second.result].sort(), ["advanced", "concurrent"]);
  assert.equal(stored.status, "preparing");
});

test("Requieren atención incluye la cola operativa y no payment_pending", () => {
  assert.deepEqual(adminAttentionOrderStatuses, [
    "manual_review",
    "paid",
    "preparing",
    "ready_for_pickup",
    "out_for_delivery",
  ]);
  assert.equal(adminAttentionOrderStatuses.includes("payment_pending"), false);
});
