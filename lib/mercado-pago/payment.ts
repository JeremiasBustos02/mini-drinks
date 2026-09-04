import type { OrderStatus, PaymentStatus } from "@/types/domain";

export type MercadoPagoPayment = {
  id: string;
  status: string;
  statusDetail: string | null;
  externalReference: string | null;
  transactionAmount: number;
  currency: string;
  dateApproved: Date | null;
  metadataOrderId: string | null;
  preferenceId: string | null;
  paymentMethodId: string | null;
  paymentTypeId: string | null;
};

export function mapMercadoPagoPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case "pending":
    case "in_process":
    case "authorized":
    case "in_mediation":
    case "approved":
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
      return status;
    default:
      return "unknown";
  }
}

export function getPaymentValidationError(
  payment: MercadoPagoPayment,
  order: { id: string; total: number; preferenceId?: string | null },
  transactionAmountCents: number | null,
) {
  if (payment.externalReference !== order.id) return "external_reference_mismatch";
  if (payment.metadataOrderId && payment.metadataOrderId !== order.id) {
    return "metadata_order_mismatch";
  }
  if (payment.preferenceId && order.preferenceId && payment.preferenceId !== order.preferenceId) {
    return "preference_id_mismatch";
  }
  if (transactionAmountCents === null || transactionAmountCents !== order.total) {
    return "transaction_amount_mismatch";
  }
  if (payment.currency !== "ARS") return "currency_mismatch";
  return null;
}

export function isPendingPaymentStatus(status: PaymentStatus) {
  return status === "pending" || status === "in_process" || status === "authorized";
}

export function canPaymentEventChangeOrderStatus(status: OrderStatus) {
  return status === "pending_payment" ||
    status === "payment_pending" ||
    status === "payment_rejected" ||
    status === "expired";
}

export function planApprovedReservation(
  reservationStatus: "active" | "consumed" | "released",
  hasStockShortage: boolean,
) {
  if (reservationStatus === "consumed") return "duplicate" as const;
  if (hasStockShortage) return "manual_review" as const;
  return "consume" as const;
}
