import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAccountAccess } from "@/lib/account/auth";
import { getCustomerOrder } from "@/lib/account/orders";
import {
  orderStatusLabels,
  orderStatusMessage,
  paymentStatusLabels,
} from "@/lib/account/order-presentation";
import { formatLoyaltyPoints } from "@/lib/loyalty/points";
import { formatArsCents } from "@/lib/money";

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ publicNumber: string }>;
}) {
  const [{ publicNumber }, access] = await Promise.all([
    params,
    getAccountAccess(),
  ]);
  if (access.status === "unauthenticated") redirect("/login");
  if (access.isAdmin || publicNumber.length > 64) notFound();
  const result = await getCustomerOrder(access.userId, publicNumber);
  if (!result) notFound();
  const { order } = result;
  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/mi-cuenta"
          className="motion-button inline-flex min-h-11 cursor-pointer items-center text-sm font-bold text-ink/65 hover:text-action"
        >
          ← Volver a mi cuenta
        </Link>
        <header className="mt-7 border-b border-ink/15 pb-6">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-action">
            Pedido
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl tracking-[-0.05em] sm:text-5xl">
                {order.publicNumber}
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                {order.createdAt.toLocaleDateString("es-AR", {
                  dateStyle: "long",
                })}{" "}
                · {order.deliveryType === "pickup" ? "Retiro" : "Envío"}
              </p>
            </div>
            <span className="rounded-full bg-mint/45 px-3 py-2 text-sm font-black text-ink">
              {orderStatusLabels[order.status]}
            </span>
          </div>
          {orderStatusMessage(order.status) ? (
            <p className="mt-4 max-w-xl text-sm leading-6 text-ink/65">
              {orderStatusMessage(order.status)}
            </p>
          ) : null}
        </header>
        <section className="mt-6 rounded-3xl border border-ink/10 bg-paper p-5 sm:p-7">
          <h2 className="font-display text-2xl uppercase">Productos</h2>
          <ol className="mt-5 divide-y divide-ink/10">
            {result.items.map((item) => {
              const c = item.configurationJson;
              const components = c
                ? c.kind === "preset_combo"
                  ? c.components
                  : [...c.baseComponents, ...c.extras]
                : [];
              return (
                <li className="py-4 first:pt-0" key={item.id}>
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-bold">
                        {item.quantity} x {item.displayName}
                      </p>
                      {components.length ? (
                        <p className="mt-1 text-xs leading-5 text-ink/55">
                          {components
                            .map((x) => `${x.quantity} x ${x.name}`)
                            .join(" · ")}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-ink/50">
                        {formatArsCents(item.unitPrice)} c/u
                      </p>
                    </div>
                    <p className="shrink-0 font-black">
                      {formatArsCents(item.subtotal)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-2xl uppercase">Resumen</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatArsCents(order.subtotal)}</dd>
              </div>
              {order.discountTotal - order.loyaltyRedemptionDiscount > 0 ? (
                <div className="flex justify-between">
                  <dt>Descuentos</dt>
                  <dd>
                    -
                    {formatArsCents(
                      order.discountTotal - order.loyaltyRedemptionDiscount,
                    )}
                  </dd>
                </div>
              ) : null}
              {order.loyaltyRedemptionDiscount > 0 ? (
                <div className="flex justify-between text-action">
                  <dt>Descuento Mini Club</dt>
                  <dd>-{formatArsCents(order.loyaltyRedemptionDiscount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt>Envío</dt>
                <dd>{formatArsCents(order.deliveryTotal)}</dd>
              </div>
              <div className="flex justify-between border-t-2 border-ink pt-3 text-base font-black">
                <dt>Total</dt>
                <dd>{formatArsCents(order.total)}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-2xl uppercase">Entrega y pago</h2>
            <p className="mt-5 text-sm font-bold">
              {order.deliveryType === "pickup" ? "Retiro" : "Envío"}
            </p>
            {order.deliveryAddress ? (
              <p className="mt-1 text-sm leading-6 text-ink/60">
                {order.deliveryAddress}
                {order.city ? `, ${order.city}` : ""}
              </p>
            ) : null}
            <div className="mt-5 border-t border-ink/10 pt-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/45">
                Pago
              </p>
              <p className="mt-1 font-bold">
                {result.payment
                  ? paymentStatusLabels[result.payment.status]
                  : orderStatusLabels[order.status]}
              </p>
            </div>
          </section>
        </div>
        {result.redemption || result.earnedPoints > 0 ? (
          <section className="mt-6 rounded-3xl bg-ink p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-mint">
              Mini Club
            </p>
            {result.redemption ? (
              <p className="mt-3 text-sm text-white/75">
                {result.redemption.status === "reserved"
                  ? `${formatLoyaltyPoints(result.redemption.points)} pts reservados para este pedido`
                  : `Usaste ${formatLoyaltyPoints(result.redemption.points)} pts y ahorraste ${formatArsCents(result.redemption.discountCents)}.`}
              </p>
            ) : null}
            {result.earnedPoints > 0 ? (
              <p className="mt-2 text-sm font-bold">
                Ganaste {formatLoyaltyPoints(result.earnedPoints)} pts con este
                pedido.
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
