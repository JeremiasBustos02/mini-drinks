import type { OrderStatus, PaymentStatus } from "@/types/domain";

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
