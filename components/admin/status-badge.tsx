import type { DeliveryType, OrderStatus, PaymentStatus, StockReservationStatus } from "@/types/domain";

export type EffectiveReservationStatus = StockReservationStatus | "expired" | "none";

const orderLabels: Record<OrderStatus, string> = {
  pending_payment: "Pendiente de pago",
  payment_pending: "Pago en proceso",
  payment_rejected: "Pago rechazado",
  expired: "Vencido",
  manual_review: "Revisión manual",
  paid: "Pagado",
  preparing: "En preparación",
  ready_for_pickup: "Listo para retirar",
  out_for_delivery: "En reparto",
  completed: "Completado",
  cancelled: "Cancelado",
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  in_process: "En proceso",
  authorized: "Autorizado",
  in_mediation: "En mediación",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  refunded: "Reintegrado",
  charged_back: "Contracargo",
  unknown: "Desconocido",
};

const reservationLabels: Record<EffectiveReservationStatus, string> = {
  active: "Activa",
  consumed: "Consumida",
  released: "Liberada",
  expired: "Vencida",
  none: "Sin reserva",
};

const deliveryLabels: Record<DeliveryType, string> = { delivery: "Delivery", pickup: "Retiro" };

const baseClass = "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-bold leading-none";

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "blue" | "amber" | "red" | "neutral" | "violet" }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    blue: "border-sky-200 bg-sky-50 text-sky-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-ink/10 bg-ink/[0.04] text-ink/60",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
  };
  return <span className={`${baseClass} ${tones[tone]}`}>{children}</span>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === "paid" || status === "completed" ? "green" : status === "manual_review" ? "violet" : status === "payment_rejected" || status === "cancelled" || status === "expired" ? "red" : status === "preparing" || status === "ready_for_pickup" || status === "out_for_delivery" ? "blue" : "amber";
  return <Badge tone={tone}>{orderLabels[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus | null }) {
  if (!status) return <Badge tone="neutral">Sin intento</Badge>;
  const tone = status === "approved" ? "green" : status === "rejected" || status === "cancelled" || status === "charged_back" ? "red" : status === "refunded" ? "violet" : status === "unknown" ? "neutral" : "amber";
  return <Badge tone={tone}>{paymentLabels[status]}</Badge>;
}

export function ReservationStatusBadge({ status }: { status: EffectiveReservationStatus }) {
  const tone = status === "consumed" ? "green" : status === "active" ? "blue" : status === "expired" ? "red" : "neutral";
  return <Badge tone={tone}>{reservationLabels[status]}</Badge>;
}

export function FulfillmentBadge({ type }: { type: DeliveryType }) {
  return <Badge tone="neutral">{deliveryLabels[type]}</Badge>;
}

export function orderStatusLabel(status: OrderStatus) { return orderLabels[status]; }
export function paymentStatusLabel(status: PaymentStatus) { return paymentLabels[status]; }
export function reservationStatusLabel(status: EffectiveReservationStatus) { return reservationLabels[status]; }
export function deliveryTypeLabel(type: DeliveryType) { return deliveryLabels[type]; }
