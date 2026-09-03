import "server-only";

import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { loadCheckoutCatalog } from "@/lib/checkout/catalog";
import { hashOrderAccessToken, resolveIdempotentOrder } from "@/lib/checkout/idempotency";
import {
  createCheckoutQuoteHash,
  createCheckoutRequestHash,
} from "@/lib/checkout/quote-hash";
import { resolveCheckout } from "@/lib/checkout/resolve-cart";
import type { ValidCreateOrderPayload } from "@/lib/checkout/validation";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import type { CheckoutCreationResult } from "@/types/checkout";

function confirmationResult(
  publicNumber: string,
  accessToken: string,
  alreadyCreated: boolean,
): CheckoutCreationResult {
  return {
    ok: true,
    publicNumber,
    confirmationUrl: `/pedido/${encodeURIComponent(publicNumber)}?token=${encodeURIComponent(accessToken)}`,
    alreadyCreated,
  };
}

function createPublicNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `MD-${date}-${randomBytes(8).toString("hex").toUpperCase()}`;
}

function isUniqueViolation(error: unknown, constraint: string) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505" &&
      "constraint_name" in error &&
      error.constraint_name === constraint,
  );
}

async function findByAttemptId(checkoutAttemptId: string) {
  const [existing] = await db
    .select({
      publicNumber: orders.publicNumber,
      accessTokenHash: orders.accessTokenHash,
      checkoutRequestHash: orders.checkoutRequestHash,
    })
    .from(orders)
    .where(eq(orders.checkoutAttemptId, checkoutAttemptId))
    .limit(1);
  return existing;
}

export async function createOrder(payload: ValidCreateOrderPayload): Promise<CheckoutCreationResult> {
  const accessTokenHash = hashOrderAccessToken(payload.accessToken);
  const checkoutRequestHash = createCheckoutRequestHash(payload);
  const existingResult = resolveIdempotentOrder(
    await findByAttemptId(payload.checkoutAttemptId),
    accessTokenHash,
    checkoutRequestHash,
  );
  if (existingResult) {
    return existingResult.ok
      ? confirmationResult(existingResult.publicNumber, payload.accessToken, true)
      : existingResult;
  }

  for (let publicNumberAttempt = 0; publicNumberAttempt < 3; publicNumberAttempt += 1) {
    const publicNumber = createPublicNumber();
    try {
      const result = await db.transaction(async (tx) => {
        const catalog = await loadCheckoutCatalog(tx);
        const resolved = resolveCheckout(payload, catalog);
        if (!resolved.ok) return resolved;
        const currentQuoteHash = createCheckoutQuoteHash(
          resolved.checkout,
          payload.fulfillment,
        );
        if (
          resolved.checkout.total !== payload.acceptedTotal ||
          currentQuoteHash !== payload.acceptedQuoteHash
        ) {
          return {
            ok: false as const,
            code: "price_changed" as const,
            message: "El total cambió. Revisá el resumen actualizado antes de confirmar.",
            quote: resolved.checkout,
            quoteHash: currentQuoteHash,
          };
        }

        const deliveryAddress =
          payload.fulfillment.type === "delivery"
            ? `${payload.fulfillment.address.street} ${payload.fulfillment.address.number}${
                payload.fulfillment.address.reference
                  ? ` - ${payload.fulfillment.address.reference}`
                  : ""
              }`
            : null;
        const city =
          payload.fulfillment.type === "delivery"
            ? payload.fulfillment.address.locality
            : null;
        const [order] = await tx
          .insert(orders)
          .values({
            publicNumber,
            checkoutAttemptId: payload.checkoutAttemptId,
            accessTokenHash,
            checkoutRequestHash,
            status: "pending_payment",
            customerName: payload.customer.firstName,
            customerLastName: payload.customer.lastName,
            customerPhone: payload.customer.phone,
            customerEmail: payload.customer.email,
            deliveryType: payload.fulfillment.type,
            deliveryAddress,
            city,
            notes: payload.notes || null,
            subtotal: resolved.checkout.subtotal,
            discountTotal: resolved.checkout.discountTotal,
            deliveryTotal: resolved.checkout.deliveryTotal,
            total: resolved.checkout.total,
          })
          .returning({ id: orders.id });

        await tx.insert(orderItems).values(
          resolved.checkout.lines.map((line) => ({
            orderId: order.id,
            itemType: line.itemType,
            referenceId: line.referenceId,
            displayName: line.displayName,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.subtotal,
            configurationJson: line.configurationJson,
          })),
        );

        return confirmationResult(publicNumber, payload.accessToken, false);
      });

      return result;
    } catch (error) {
      if (isUniqueViolation(error, "orders_public_number_unique")) continue;
      if (isUniqueViolation(error, "orders_checkout_attempt_id_unique")) {
        const racedResult = resolveIdempotentOrder(
          await findByAttemptId(payload.checkoutAttemptId),
          accessTokenHash,
          checkoutRequestHash,
        );
        if (racedResult) {
          return racedResult.ok
            ? confirmationResult(racedResult.publicNumber, payload.accessToken, true)
            : racedResult;
        }
      }
      const databaseError = error as { code?: unknown; constraint_name?: unknown };
      console.error("Checkout order creation failed", {
        code: databaseError?.code,
        constraint: databaseError?.constraint_name,
      });
      return {
        ok: false,
        code: "order_not_created",
        message: "No se pudo crear el pedido. Intentá nuevamente.",
      };
    }
  }

  return {
    ok: false,
    code: "order_not_created",
    message: "No se pudo generar el número de pedido. Intentá nuevamente.",
  };
}
