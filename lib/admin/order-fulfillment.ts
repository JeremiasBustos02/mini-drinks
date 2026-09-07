import type { DeliveryType, OrderStatus } from "@/types/domain";

export type AdvanceOrderFulfillmentState = {
  message?: string;
  status: "idle" | "success" | "concurrent" | "error";
};

export const initialAdvanceOrderFulfillmentState: AdvanceOrderFulfillmentState = {
  status: "idle",
};

export const adminAttentionOrderStatuses = [
  "manual_review",
  "paid",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
] as const satisfies readonly OrderStatus[];

export type FulfillmentOrder = {
  id: string;
  publicNumber: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
};

export type FulfillmentTransitionResult =
  | {
      result: "advanced";
      order: FulfillmentOrder;
      from: OrderStatus;
      to: OrderStatus;
    }
  | {
      result: "concurrent";
      order: FulfillmentOrder;
      from: OrderStatus;
      to: OrderStatus;
    }
  | { result: "not_found" }
  | { result: "not_available"; order: FulfillmentOrder; from: OrderStatus };

export function getNextFulfillmentStatus(
  status: OrderStatus,
  deliveryType: DeliveryType,
): OrderStatus | null {
  if (status === "paid") return "preparing";
  if (status === "preparing") {
    return deliveryType === "pickup" ? "ready_for_pickup" : "out_for_delivery";
  }
  if (status === "ready_for_pickup" || status === "out_for_delivery") {
    return "completed";
  }
  return null;
}

export async function advanceOrderFulfillment({
  authorize,
  findOrder,
  orderId,
  updateIfCurrent,
}: {
  authorize: () => Promise<unknown>;
  findOrder: (orderId: string) => Promise<FulfillmentOrder | null>;
  orderId: string;
  updateIfCurrent: (
    orderId: string,
    expectedStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) => Promise<boolean>;
}): Promise<FulfillmentTransitionResult> {
  await authorize();

  const order = await findOrder(orderId);
  if (!order) return { result: "not_found" };

  const from = order.status;
  const to = getNextFulfillmentStatus(from, order.deliveryType);
  if (!to) return { result: "not_available", order, from };

  const advanced = await updateIfCurrent(order.id, from, to);
  return advanced
    ? { result: "advanced", order, from, to }
    : { result: "concurrent", order, from, to };
}
