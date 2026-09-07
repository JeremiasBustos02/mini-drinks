import type { DeliveryType, OrderStatus, PaymentStatus } from "@/types/domain";

export function shortOrderReference(publicNumber: string) {
  const suffix = publicNumber.match(/[A-F0-9]{6}$/i)?.[0];
  return `Pedido #${(suffix ?? publicNumber.slice(-6)).toUpperCase()}`;
}

export function orderTracker(status: OrderStatus, deliveryType: DeliveryType) {
  const exceptional =
    status === "payment_rejected" ||
    status === "expired" ||
    status === "manual_review" ||
    status === "cancelled";
  const steps =
    deliveryType === "pickup"
      ? [
          "Pedido recibido",
          "Pago confirmado",
          "En preparación",
          "Listo para retirar",
          "Entregado",
        ]
      : [
          "Pedido recibido",
          "Pago confirmado",
          "En preparación",
          "En camino",
          "Entregado",
        ];
  const current =
    status === "completed"
      ? 4
      : status === "ready_for_pickup" || status === "out_for_delivery"
        ? 3
        : status === "preparing"
          ? 2
          : status === "paid"
            ? 1
            : 0;
  const copy: Record<OrderStatus, { title: string; body: string }> = {
    pending_payment: {
      title: "Pago pendiente",
      body: "Estamos esperando la confirmación del pago.",
    },
    payment_pending: {
      title: "Estamos confirmando tu pago",
      body: "Mercado Pago todavía está procesando el pago.",
    },
    payment_rejected: {
      title: "El pago no pudo completarse.",
      body: "Podés volver a elegir cuando quieras.",
    },
    expired: {
      title: "Este intento de compra venció.",
      body: "Volvé a elegir para iniciar un pedido nuevo.",
    },
    manual_review: {
      title: "Estamos revisando tu pago.",
      body: "Recibimos información del pago y necesitamos verificar el pedido antes de confirmarlo.",
    },
    paid: {
      title: "Pago confirmado",
      body: "Ya recibimos tu pago. El pedido está listo para entrar en preparación.",
    },
    preparing: {
      title: "Estamos preparando tu pedido",
      body: "Estamos armando tus minis.",
    },
    ready_for_pickup: {
      title: "Ya podés retirarlo",
      body: "Tu pedido está listo para retirar.",
    },
    out_for_delivery: {
      title: "Tu pedido está en camino",
      body: "Ya salió para la entrega.",
    },
    completed: {
      title: "Pedido entregado",
      body: "Esperamos que lo disfrutes.",
    },
    cancelled: {
      title: "Pedido cancelado.",
      body: "Este pedido ya no sigue en curso.",
    },
  };
  return { exceptional, steps, current, ...copy[status] };
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "Esperando pago",
  payment_pending: "Pago pendiente",
  payment_rejected: "Pago rechazado",
  expired: "Vencido",
  manual_review: "Estamos revisando tu pago",
  paid: "Pagado",
  preparing: "En preparación",
  ready_for_pickup: "Listo para retirar",
  out_for_delivery: "En camino",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pago pendiente",
  in_process: "Pago en proceso",
  authorized: "Pago autorizado",
  in_mediation: "Pago en revisión",
  approved: "Aprobado con Mercado Pago",
  rejected: "Pago rechazado",
  cancelled: "Pago cancelado",
  refunded: "Pago devuelto",
  charged_back: "Pago desconocido",
  unknown: "Estado de pago pendiente",
};

export function orderStatusMessage(status: OrderStatus) {
  return status === "manual_review"
    ? "Recibimos información del pago y necesitamos verificar el pedido antes de confirmarlo."
    : null;
}
