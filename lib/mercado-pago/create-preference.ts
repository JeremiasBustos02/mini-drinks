import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, eq, sql } from "drizzle-orm";
import { MercadoPagoConfig, Preference } from "mercadopago";

import { hashOrderAccessToken } from "@/lib/checkout/idempotency";
import { db } from "@/lib/db";
import {
  orderItems,
  orders,
  products,
  stockReservationItems,
  stockReservations,
} from "@/lib/db/schema";
import {
  getAppUrl,
  getMercadoPagoAccessToken,
} from "@/lib/mercado-pago/config";
import { buildMercadoPagoPreference, canReusePreference } from "@/lib/mercado-pago/preference";
import {
  findReservationShortage,
  lockAndReadAvailableStock,
} from "@/lib/stock/reservations";
import { getReservationExpiresAt } from "@/lib/stock/config";
import type { CheckoutCreationResult, ResolvedStockRequirement } from "@/types/checkout";

const CREATION_LEASE_MS = 60_000;

function failure(message: string): CheckoutCreationResult {
  return { ok: false, code: "payment_not_ready", message };
}

function success(
  publicNumber: string,
  accessToken: string,
  paymentUrl: string,
  expiresAt: Date,
  alreadyCreated: boolean,
): CheckoutCreationResult {
  return {
    ok: true,
    publicNumber,
    confirmationUrl: `/pedido/${encodeURIComponent(publicNumber)}?token=${encodeURIComponent(accessToken)}`,
    paymentUrl,
    reservationExpiresAt: expiresAt.toISOString(),
    alreadyCreated,
  };
}

export async function ensureMercadoPagoPreference(
  orderId: string,
  accessToken: string,
  alreadyCreated: boolean,
): Promise<CheckoutCreationResult> {
  const now = new Date();
  const creationKey = randomUUID();
  const prepared = await db.transaction(async (tx) => {
    await tx.execute(sql`select id from orders where id = ${orderId}::uuid for update`);
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || order.accessTokenHash !== hashOrderAccessToken(accessToken)) return null;

    if (canReusePreference({
      id: order.mercadoPagoPreferenceId,
      initPoint: order.mercadoPagoInitPoint,
      expiresAt: order.mercadoPagoPreferenceExpiresAt,
    }, now)) {
      return { kind: "reused" as const, order };
    }
    if (
      order.mercadoPagoPreferenceCreationStartedAt &&
      now.getTime() - order.mercadoPagoPreferenceCreationStartedAt.getTime() < CREATION_LEASE_MS
    ) {
      return { kind: "busy" as const };
    }

    const [reservation] = await tx
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.orderId, order.id))
      .limit(1);
    if (!reservation || reservation.status === "consumed") return { kind: "unavailable" as const };

    let expiresAt = reservation.expiresAt;
    let generation = order.mercadoPagoPreferenceGeneration;
    if (reservation.status !== "active" || expiresAt.getTime() <= now.getTime()) {
      const requirementRows = await tx
        .select({
          productId: stockReservationItems.productId,
          name: products.name,
          quantity: stockReservationItems.quantity,
        })
        .from(stockReservationItems)
        .innerJoin(products, eq(products.id, stockReservationItems.productId))
        .where(eq(stockReservationItems.reservationId, reservation.id))
        .orderBy(asc(stockReservationItems.productId));
      const requirements: ResolvedStockRequirement[] = requirementRows;
      const available = await lockAndReadAvailableStock(tx, requirements, reservation.id);
      if (findReservationShortage(requirements, available)) {
        await tx
          .update(orders)
          .set({ status: "expired", updatedAt: now })
          .where(eq(orders.id, order.id));
        return { kind: "unavailable" as const };
      }
      expiresAt = getReservationExpiresAt(now);
      generation += 1;
      await tx
        .update(stockReservations)
        .set({
          status: "active",
          expiresAt,
          consumedAt: null,
          releasedAt: null,
        })
        .where(eq(stockReservations.id, reservation.id));
    }

    await tx
      .update(orders)
      .set({
        status: "pending_payment",
        mercadoPagoPreferenceGeneration: generation,
        mercadoPagoPreferenceCreationKey: creationKey,
        mercadoPagoPreferenceCreationStartedAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));
    const items = await tx
      .select({
        id: orderItems.id,
        displayName: orderItems.displayName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.createdAt), asc(orderItems.id));

    return {
      kind: "create" as const,
      order: { ...order, mercadoPagoPreferenceGeneration: generation },
      items,
      expiresAt,
    };
  });

  if (!prepared) return failure("No se pudo validar el acceso al pedido.");
  if (prepared.kind === "busy") {
    return failure("Mercado Pago todavía se está preparando. Intentá nuevamente en unos segundos.");
  }
  if (prepared.kind === "unavailable") {
    return failure("La reserva venció y ya no hay stock suficiente para renovarla.");
  }
  if (prepared.kind === "reused") {
    console.info("mercado_pago.preference_reused", {
      orderId,
      preferenceId: prepared.order.mercadoPagoPreferenceId,
    });
    return success(
      prepared.order.publicNumber,
      accessToken,
      prepared.order.mercadoPagoInitPoint!,
      prepared.order.mercadoPagoPreferenceExpiresAt!,
      true,
    );
  }

  try {
    const appUrl = getAppUrl();
    const body = buildMercadoPagoPreference(
      {
        id: prepared.order.id,
        publicNumber: prepared.order.publicNumber,
        customerEmail: prepared.order.customerEmail,
        total: prepared.order.total,
        items: prepared.items,
      },
      appUrl,
      accessToken,
      now,
      prepared.expiresAt,
    );
    const preference = new Preference(
      new MercadoPagoConfig({ accessToken: getMercadoPagoAccessToken(), options: { timeout: 10_000 } }),
    );
    const response = await preference.create({
      body,
      requestOptions: {
        idempotencyKey: `${prepared.order.id}:${prepared.order.mercadoPagoPreferenceGeneration}`,
      },
    });
    const initPoint = response.init_point ?? response.sandbox_init_point;
    if (!response.id || !initPoint) throw new Error("Mercado Pago returned an incomplete preference.");

    const persisted = await db.transaction(async (tx) => {
      await tx.execute(sql`select id from orders where id = ${orderId}::uuid for update`);
      const [updated] = await tx
        .update(orders)
        .set({
          mercadoPagoPreferenceId: response.id,
          mercadoPagoInitPoint: initPoint,
          mercadoPagoPreferenceCreatedAt: now,
          mercadoPagoPreferenceExpiresAt: prepared.expiresAt,
          mercadoPagoPreferenceCreationKey: null,
          mercadoPagoPreferenceCreationStartedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.mercadoPagoPreferenceCreationKey, creationKey),
          ),
        )
        .returning({ publicNumber: orders.publicNumber });
      return updated;
    });
    if (!persisted) throw new Error("Preference ownership changed before persistence.");

    console.info("mercado_pago.preference_created", {
      orderId,
      preferenceId: response.id,
      expiresAt: prepared.expiresAt.toISOString(),
    });
    return success(
      persisted.publicNumber,
      accessToken,
      initPoint,
      prepared.expiresAt,
      alreadyCreated,
    );
  } catch (error) {
    await db
      .update(orders)
      .set({
        mercadoPagoPreferenceCreationKey: null,
        mercadoPagoPreferenceCreationStartedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.mercadoPagoPreferenceCreationKey, creationKey),
        ),
      );
    console.error("mercado_pago.preference_failed", {
      orderId,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return failure("No pudimos iniciar Mercado Pago. Tu pedido y carrito se conservaron para reintentar.");
  }
}
