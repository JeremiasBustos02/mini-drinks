import assert from "node:assert/strict";
import test from "node:test";

import { getOrderMiniClubActivity } from "@/lib/admin/order-mini-club";

test("Mini Club muestra sólo canjes y movimientos earn de la order consultada", () => {
  const activity = getOrderMiniClubActivity(
    "order-a",
    [
      { orderId: "order-a", points: 2500, discountCents: 100000, status: "redeemed" },
      { orderId: "order-b", points: 9000, discountCents: 500000, status: "released" },
    ],
    [
      { orderId: "order-a", points: 400, type: "earn" },
      { orderId: "order-b", points: 900, type: "earn" },
      { orderId: "order-a", points: 50, type: "redeem" },
    ],
  );

  assert.deepEqual(activity, {
    redemption: { orderId: "order-a", points: 2500, discountCents: 100000, status: "redeemed" },
    earnedPoints: 400,
  });
});

test("Mini Club no genera bloque cuando la order no tiene actividad", () => {
  assert.equal(getOrderMiniClubActivity("order-a", [], []), null);
});
