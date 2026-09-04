import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Container } from "@/components/ui/container";
import { getPublicOrder } from "@/lib/db/queries/orders";
import { formatArsCents } from "@/lib/money";

export const metadata: Metadata = {
  title: "Pedido registrado | MINI.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const accessTokenSchema = z.uuid();
const statusLabels = {
  pending_payment: "Pendiente de pago",
  payment_pending: "Pago pendiente",
  payment_rejected: "Pago rechazado",
  expired: "Reserva vencida",
  manual_review: "Revisión manual",
  paid: "Pagado",
  preparing: "En preparación",
  ready_for_pickup: "Listo para retirar",
  out_for_delivery: "En camino",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusMessages = {
  pending_payment: "Reservamos tu stock. Completá el pago antes del vencimiento indicado.",
  payment_pending: "Pago pendiente. Mercado Pago todavía lo está procesando; no figura como pagado.",
  payment_rejected: "El pago fue rechazado o cancelado y liberamos la reserva.",
  expired: "La reserva venció. Volvé al checkout para validar stock e iniciar un pago nuevo.",
  manual_review: "Recibimos un estado que requiere revisión manual. No confirmamos ni descontamos stock de forma insegura.",
  paid: "Pago confirmado. El stock fue descontado una sola vez.",
  preparing: "Pago confirmado. Estamos preparando tu pedido.",
  ready_for_pickup: "Tu pedido está listo para retirar.",
  out_for_delivery: "Tu pedido está en camino.",
  completed: "Pedido completado.",
  cancelled: "El pedido fue cancelado.",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicNumber: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const [{ publicNumber }, query] = await Promise.all([params, searchParams]);
  const parsedToken = accessTokenSchema.safeParse(
    typeof query.token === "string" ? query.token : "",
  );
  if (!parsedToken.success || publicNumber.length > 64) notFound();
  const result = await getPublicOrder(publicNumber, parsedToken.data);
  if (!result) notFound();

  return (
    <StorefrontShell>
      <main id="contenido" className="py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="rounded-[1.75rem] bg-mint/55 p-6 sm:p-10">
              <p className="text-xs font-black tracking-[0.2em] text-action uppercase">Pedido registrado</p>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.9] uppercase">Lo recibimos</h1>
              <p className="mt-5 text-lg font-bold">Número: {result.order.publicNumber}</p>
              <p className="mt-2 text-sm text-ink/65">{statusMessages[result.order.status]}</p>
              <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black">{statusLabels[result.order.status]}</span>
              {result.reservation?.isCurrent ? <p className="mt-3 text-xs font-bold text-ink/60">Stock reservado hasta {result.reservation.expiresAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}.</p> : null}
            </div>
            <div className="mt-6 rounded-[1.5rem] bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between"><h2 className="font-display text-2xl uppercase">Resumen</h2><span className="text-sm font-bold text-action">{result.order.deliveryType === "pickup" ? "Retiro" : "Envío local"}</span></div>
              <div className="mt-5 space-y-4">{result.items.map((item) => { const configuration = item.configurationJson; const components = configuration ? configuration.kind === "preset_combo" ? configuration.components : [...configuration.baseComponents, ...configuration.extras] : []; return <div key={item.id} className="border-b border-ink/10 pb-4"><div className="flex justify-between gap-4"><p className="font-black">{item.quantity} x {item.displayName}</p><p className="shrink-0 font-bold">{formatArsCents(item.subtotal)}</p></div>{components.length > 0 ? <p className="mt-1 text-xs text-ink/55">{components.map((component) => `${component.quantity} x ${component.name}`).join(" · ")}</p> : null}</div>; })}</div>
              <div className="mt-5 flex justify-between border-t-2 border-ink pt-4"><p className="font-black">Total</p><p className="text-2xl font-black">{formatArsCents(result.order.total)}</p></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">{result.order.status === "pending_payment" && result.order.mercadoPagoInitPoint && result.order.mercadoPagoPreferenceIsCurrent ? <a href={result.order.mercadoPagoInitPoint} className="motion-button inline-flex min-h-12 items-center rounded-xl bg-action px-6 py-3 font-black text-white">Pagar con Mercado Pago</a> : null}<Link href="/" className="motion-button inline-flex min-h-12 items-center rounded-xl border-2 border-action px-6 py-3 font-black text-action">Volver al inicio</Link></div>
          </div>
        </Container>
      </main>
    </StorefrontShell>
  );
}
