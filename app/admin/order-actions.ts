"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  advanceOrderFulfillment,
  type AdvanceOrderFulfillmentState,
  type FulfillmentOrder,
} from "@/lib/admin/order-fulfillment";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { logServerEvent } from "@/lib/observability/logger";

const orderIdSchema = z.object({ orderId: z.uuid() });

async function findOrderForFulfillment(orderId: string): Promise<FulfillmentOrder | null> {
  const [order] = await db
    .select({
      id: orders.id,
      publicNumber: orders.publicNumber,
      status: orders.status,
      deliveryType: orders.deliveryType,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  return order ?? null;
}

async function updateOrderIfCurrent(
  orderId: string,
  expectedStatus: FulfillmentOrder["status"],
  nextStatus: FulfillmentOrder["status"],
) {
  const updated = await db
    .update(orders)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, expectedStatus)))
    .returning({ id: orders.id });
  return updated.length === 1;
}

export async function advanceOrderFulfillmentAction(
  _previousState: AdvanceOrderFulfillmentState,
  formData: FormData,
): Promise<AdvanceOrderFulfillmentState> {
  // Authorization happens before any order read or mutation.
  await requireAdmin();

  const parsed = orderIdSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) return { status: "error", message: "No pudimos identificar el pedido." };

  try {
    const result = await advanceOrderFulfillment({
      authorize: async () => undefined,
      findOrder: findOrderForFulfillment,
      orderId: parsed.data.orderId,
      updateIfCurrent: updateOrderIfCurrent,
    });

    if (result.result === "advanced") {
      logServerEvent("info", "order.fulfillment_transition", {
        from: result.from,
        orderId: result.order.id,
        publicNumber: result.order.publicNumber,
        result: result.result,
        to: result.to,
      });
      revalidatePath("/admin/pedidos");
      revalidatePath(`/admin/pedidos/${result.order.id}`);
      return { status: "success", message: "Estado operativo actualizado." };
    }

    if (result.result === "concurrent") {
      logServerEvent("warn", "order.fulfillment_transition", {
        from: result.from,
        orderId: result.order.id,
        publicNumber: result.order.publicNumber,
        result: result.result,
        to: result.to,
      });
      revalidatePath("/admin/pedidos");
      revalidatePath(`/admin/pedidos/${result.order.id}`);
      return {
        status: "concurrent",
        message: "El pedido cambió mientras lo estabas viendo. Actualizamos su estado.",
      };
    }

    if (result.result === "not_available") {
      logServerEvent("warn", "order.fulfillment_transition", {
        from: result.from,
        orderId: result.order.id,
        publicNumber: result.order.publicNumber,
        result: result.result,
        to: null,
      });
      revalidatePath("/admin/pedidos");
      revalidatePath(`/admin/pedidos/${result.order.id}`);
      return {
        status: "concurrent",
        message: "El pedido cambió mientras lo estabas viendo. Actualizamos su estado.",
      };
    }

    return { status: "error", message: "No encontramos ese pedido." };
  } catch {
    logServerEvent("error", "order.fulfillment_transition", {
      orderId: parsed.data.orderId,
      result: "error",
    });
    return { status: "error", message: "No se pudo actualizar el estado operativo. Intentá nuevamente." };
  }
}
