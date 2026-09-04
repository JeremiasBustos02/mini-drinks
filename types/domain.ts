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
  "payment_pending",
  "payment_rejected",
  "expired",
  "manual_review",
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
  "in_process",
  "authorized",
  "in_mediation",
  "approved",
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
  "unknown",
] as const;

export type PaymentStatus = (typeof paymentStatusValues)[number];

export const stockReservationStatusValues = ["active", "consumed", "released"] as const;

export type StockReservationStatus = (typeof stockReservationStatusValues)[number];
