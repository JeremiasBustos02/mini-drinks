import "server-only";

import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  orders,
  payments,
  products,
  stockReservationItems,
  stockReservations,
} from "@/lib/db/schema";
import { mercadoPagoAmountToCents } from "@/lib/mercado-pago/money";
import {
  getPaymentValidationError,
  isPendingPaymentStatus,
  mapMercadoPagoPaymentStatus,
  planApprovedReservation,
  type MercadoPagoPayment,
} from "@/lib/mercado-pago/payment";
import {
  findReservationShortage,
  lockAndReadAvailableStock,
} from "@/lib/stock/reservations";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function processMercadoPagoPayment(payment: MercadoPagoPayment) {
  if (!payment.externalReference || !UUID_PATTERN.test(payment.externalReference)) {
    console.warn("mercado_pago.payment_unmatched", {
      paymentId: payment.id,
      reason: "invalid_external_reference",
    });
    return { outcome: "unmatched" as const };
  }

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from orders where id = ${payment.externalReference}::uuid for update`,
    );
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, payment.externalReference!))
      .limit(1);
    if (!order) {
      console.warn("mercado_pago.payment_unmatched", {
        paymentId: payment.id,
        reason: "order_not_found",
      });
      return { outcome: "unmatched" as const };
    }

    const [existingPayment] = await tx
      .select({ orderId: payments.orderId })
      .from(payments)
      .where(eq(payments.providerPaymentId, payment.id))
      .limit(1);
    if (existingPayment && existingPayment.orderId !== order.id) {
      await tx
        .update(orders)
        .set({ status: "manual_review", updatedAt: new Date() })
        .where(eq(orders.id, order.id));
      return { outcome: "manual_review" as const, reason: "payment_id_order_mismatch" };
    }

    let amountCents: number | null = null;
    try {
      amountCents = mercadoPagoAmountToCents(payment.transactionAmount);
    } catch {
      // The validation result below records the controlled mismatch.
    }
    const validationError = getPaymentValidationError(
      payment,
      { id: order.id, total: order.total, preferenceId: order.mercadoPagoPreferenceId },
      amountCents,
    );
    const status = mapMercadoPagoPaymentStatus(payment.status);
    const now = new Date();
    await tx
      .insert(payments)
      .values({
        orderId: order.id,
        provider: "mercado_pago",
        providerPaymentId: payment.id,
        preferenceId: payment.preferenceId ?? order.mercadoPagoPreferenceId,
        status,
        statusDetail: payment.statusDetail,
        amount: amountCents ?? 0,
        currency: payment.currency,
        dateApproved: payment.dateApproved,
        providerMetadata: {
          ...(payment.paymentMethodId ? { paymentMethodId: payment.paymentMethodId } : {}),
          ...(payment.paymentTypeId ? { paymentTypeId: payment.paymentTypeId } : {}),
          ...(validationError ? { validationError } : {}),
        },
        rawReference: payment.externalReference,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: payments.providerPaymentId,
        set: {
          preferenceId: payment.preferenceId ?? order.mercadoPagoPreferenceId,
          status,
          statusDetail: payment.statusDetail,
          amount: amountCents ?? 0,
          currency: payment.currency,
          dateApproved: payment.dateApproved,
          providerMetadata: {
            ...(payment.paymentMethodId ? { paymentMethodId: payment.paymentMethodId } : {}),
            ...(payment.paymentTypeId ? { paymentTypeId: payment.paymentTypeId } : {}),
            ...(validationError ? { validationError } : {}),
          },
          rawReference: payment.externalReference,
          updatedAt: now,
        },
      });

    if (validationError) {
      await tx
        .update(orders)
        .set({ status: "manual_review", updatedAt: now })
        .where(eq(orders.id, order.id));
      console.warn("mercado_pago.payment_validation_failed", {
        orderId: order.id,
        paymentId: payment.id,
        reason: validationError,
      });
      return { outcome: "manual_review" as const, reason: validationError };
    }

    await tx.execute(
      sql`select id from stock_reservations where order_id = ${order.id}::uuid for update`,
    );
    const [reservation] = await tx
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.orderId, order.id))
      .limit(1);

    if (status === "approved") {
      if (!reservation) {
        await tx.update(orders).set({ status: "manual_review", updatedAt: now }).where(eq(orders.id, order.id));
        return { outcome: "manual_review" as const, reason: "reservation_not_found" };
      }
      if (planApprovedReservation(reservation.status, false) === "duplicate") {
        const [otherApprovedPayment] = await tx
          .select({ id: payments.id })
          .from(payments)
          .where(
            and(
              eq(payments.orderId, order.id),
              eq(payments.status, "approved"),
              ne(payments.providerPaymentId, payment.id),
            ),
          )
          .limit(1);
        if (otherApprovedPayment) {
          await tx.update(orders).set({ status: "manual_review", updatedAt: now }).where(eq(orders.id, order.id));
          return { outcome: "manual_review" as const, reason: "multiple_approved_payments" };
        }
        console.info("mercado_pago.payment_duplicate", { orderId: order.id, paymentId: payment.id });
        return { outcome: "duplicate" as const };
      }

      const requirements = await tx
        .select({
          productId: stockReservationItems.productId,
          name: products.name,
          quantity: stockReservationItems.quantity,
        })
        .from(stockReservationItems)
        .innerJoin(products, eq(products.id, stockReservationItems.productId))
        .where(eq(stockReservationItems.reservationId, reservation.id))
        .orderBy(asc(stockReservationItems.productId));
      const stock = await lockAndReadAvailableStock(tx, requirements, reservation.id);
      const shortage = findReservationShortage(requirements, stock);
      if (planApprovedReservation(reservation.status, Boolean(shortage)) === "manual_review") {
        if (!shortage) throw new Error("Missing stock shortage for manual review.");
        await tx
          .update(stockReservations)
          .set({ status: "released", releasedAt: now })
          .where(eq(stockReservations.id, reservation.id));
        await tx.update(orders).set({ status: "manual_review", updatedAt: now }).where(eq(orders.id, order.id));
        console.warn("stock.late_approved_insufficient", {
          orderId: order.id,
          paymentId: payment.id,
          productId: shortage.productId,
        });
        return { outcome: "manual_review" as const, reason: "insufficient_stock" };
      }

      for (const requirement of requirements) {
        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${requirement.quantity}`,
            updatedAt: now,
            version: sql`${products.version} + 1`,
          })
          .where(eq(products.id, requirement.productId));
      }
      await tx
        .update(stockReservations)
        .set({ status: "consumed", consumedAt: now, releasedAt: null })
        .where(and(eq(stockReservations.id, reservation.id), ne(stockReservations.status, "consumed")));
      await tx.update(orders).set({ status: "paid", updatedAt: now }).where(eq(orders.id, order.id));
      console.info("stock.reservation_consumed", { orderId: order.id, paymentId: payment.id });
      return { outcome: "approved" as const };
    }

    if (isPendingPaymentStatus(status)) {
      if (order.status !== "paid") {
        await tx.update(orders).set({ status: "payment_pending", updatedAt: now }).where(eq(orders.id, order.id));
      }
      return { outcome: "pending" as const };
    }

    if (status === "rejected" || status === "cancelled") {
      if (order.status === "paid" || reservation?.status === "consumed") {
        await tx.update(orders).set({ status: "manual_review", updatedAt: now }).where(eq(orders.id, order.id));
        return { outcome: "manual_review" as const, reason: "terminal_after_approved" };
      }
      const [otherLivePayment] = await tx
        .select({ id: payments.id })
        .from(payments)
        .where(
          and(
            eq(payments.orderId, order.id),
            ne(payments.providerPaymentId, payment.id),
            inArray(payments.status, ["pending", "in_process", "authorized"]),
          ),
        )
        .limit(1);
      if (!otherLivePayment && reservation?.status === "active") {
        await tx
          .update(stockReservations)
          .set({ status: "released", releasedAt: now })
          .where(eq(stockReservations.id, reservation.id));
        console.info("stock.reservation_released", { orderId: order.id, paymentId: payment.id });
      }
      await tx
        .update(orders)
        .set({ status: otherLivePayment ? "payment_pending" : "payment_rejected", updatedAt: now })
        .where(eq(orders.id, order.id));
      return { outcome: "rejected" as const };
    }

    await tx.update(orders).set({ status: "manual_review", updatedAt: now }).where(eq(orders.id, order.id));
    return { outcome: "manual_review" as const, reason: status };
  });
}
