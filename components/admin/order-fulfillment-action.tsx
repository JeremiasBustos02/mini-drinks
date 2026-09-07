"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import {
  advanceOrderFulfillmentAction,
  initialAdvanceOrderFulfillmentState,
} from "@/app/admin/order-actions";
import { getNextFulfillmentStatus } from "@/lib/admin/order-fulfillment";
import type { DeliveryType, OrderStatus } from "@/types/domain";

const buttonClass = "inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-action px-4 py-2.5 text-sm font-black text-ink shadow-[0_2px_0_rgb(29_29_29_/_24%)] transition duration-200 hover:-translate-y-px hover:brightness-90 hover:shadow-[0_4px_0_rgb(29_29_29_/_20%)] active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-not-allowed disabled:translate-y-0 disabled:brightness-100 disabled:shadow-none disabled:opacity-50";
const secondaryButtonClass = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-action/45 hover:bg-mint/25 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-not-allowed disabled:opacity-50";

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button aria-busy={pending} className={buttonClass} disabled={pending} type="submit">
      {pending ? "Actualizando..." : children}
    </button>
  );
}

function nextActionLabel(nextStatus: OrderStatus) {
  if (nextStatus === "preparing") return "Comenzar preparación";
  if (nextStatus === "ready_for_pickup") return "Marcar listo para retirar";
  if (nextStatus === "out_for_delivery") return "Marcar en camino";
  return "Marcar como entregado";
}

export function OrderFulfillmentAction({
  deliveryType,
  orderId,
  status,
}: {
  deliveryType: DeliveryType;
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    advanceOrderFulfillmentAction,
    initialAdvanceOrderFulfillmentState,
  );
  const [confirming, setConfirming] = useState(false);
  const nextStatus = getNextFulfillmentStatus(status, deliveryType);
  const requiresConfirmation = nextStatus === "completed";

  useEffect(() => {
    if (state.status === "success" || state.status === "concurrent") {
      router.refresh();
    }
  }, [router, state.status]);

  if (!nextStatus) {
    return <p className="text-sm text-ink/50">No hay una acción operativa disponible.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input name="orderId" type="hidden" value={orderId} />
      {state.message && (
        <p
          className={state.status === "success" ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800" : "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900"}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
      {requiresConfirmation && confirming ? (
        <div className="rounded-xl border border-ink/10 bg-canvas/60 p-3">
          <p className="text-sm font-bold">¿Marcar este pedido como entregado?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={secondaryButtonClass} onClick={() => setConfirming(false)} type="button">
              Seguir revisando
            </button>
            <SubmitButton>Confirmar entrega</SubmitButton>
          </div>
        </div>
      ) : requiresConfirmation ? (
        <button className={buttonClass} onClick={() => setConfirming(true)} type="button">
          {nextActionLabel(nextStatus)}
        </button>
      ) : (
        <SubmitButton>{nextActionLabel(nextStatus)}</SubmitButton>
      )}
    </form>
  );
}
