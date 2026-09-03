export const productTypeValues = [
  "miniature",
  "mixer",
  "glass",
  "extra",
  "accessory",
  "supply",
] as const;

export type ProductType = (typeof productTypeValues)[number];

export const orderStatusValues = [
  "pending_payment",
  "paid",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatusValues)[number];

export const orderItemTypeValues = ["product", "combo", "custom_combo", "pack"] as const;

export type OrderItemType = (typeof orderItemTypeValues)[number];

export const deliveryTypeValues = ["delivery", "pickup"] as const;

export type DeliveryType = (typeof deliveryTypeValues)[number];

export const paymentStatusValues = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "refunded",
] as const;

export type PaymentStatus = (typeof paymentStatusValues)[number];
