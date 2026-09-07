import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import { ProfileEditor } from "@/components/account/profile-editor";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Container } from "@/components/ui/container";
import { getAccountAccess, getCustomerProfile } from "@/lib/account/auth";
import { getAccountDashboard } from "@/lib/account/dashboard";
import { formatLoyaltyPoints } from "@/lib/loyalty/points";
import { loadLoyaltyRedemptionSettings } from "@/lib/loyalty/redemptions";
import { formatArsCents } from "@/lib/money";
import { orderStatusLabels } from "@/lib/account/order-presentation";
import { shortOrderReference } from "@/lib/account/order-presentation";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
    value,
  );
}

export default async function MyAccountPage() {
  const access = await getAccountAccess();
  if (access.status === "unauthenticated") redirect("/login");
  if (access.isAdmin) redirect("/admin");
  const [profile, dashboard, loyaltySettings] = await Promise.all([
    getCustomerProfile(access.userId),
    getAccountDashboard(access.userId),
    loadLoyaltyRedemptionSettings(),
  ]);
  const displayName = profile?.displayName || access.email || "Tu cuenta";

  return (
    <StorefrontShell>
      <main id="contenido" className="account-page bg-canvas">
        <Container className="py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
        <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-action">
              Mi cuenta
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">
              Hola, {displayName}
            </h1>
          </div>
          <form action={logoutAction}>
            <button
              className="min-h-11 rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-bold hover:bg-paper"
              type="submit"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
        <ProfileEditor displayName={displayName} email={access.email} phone={profile?.phone ?? null} />
        <section className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-ink text-white">
          <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-mint">
                Mini Club
              </p>
              <p className="mt-2 text-sm text-white/65">Mini Club</p>
              <p className="mt-1 font-display text-6xl tracking-[-0.06em]">
                {dashboard.hasReservedPoints
                  ? dashboard.totalPoints
                  : dashboard.availablePoints}
              </p>
              {dashboard.hasReservedPoints ? (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/70">
                  <p>{dashboard.reservedPoints} pts reservados</p>
                  <p>{dashboard.availablePoints} pts disponibles</p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-white/70">puntos disponibles</p>
              )}
            </div>
            <div className="max-w-60 text-sm leading-6 text-white/70">
              <p>
                Sumás {formatLoyaltyPoints(loyaltySettings.pointsPerUnit)} pts
                cada {formatArsCents(loyaltySettings.earnUnitCents)} en
                productos pagados.
              </p>
              <p className="mt-2">
                Desde {formatLoyaltyPoints(loyaltySettings.minRedemptionPoints)}{" "}
                pts podés empezar a canjear.
              </p>
              <Link
                href="/mini-club"
                className="motion-button mt-3 inline-flex min-h-11 items-center font-bold text-mint hover:text-white"
              >
                Cómo funciona Mini Club →
              </Link>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-ink/10 bg-white p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-black">Mis pedidos</h2>
              <span className="text-xs font-bold text-ink/45">
                Últimos {dashboard.orders.length}
              </span>
            </div>
            {dashboard.orders.length === 0 ? (
              <div className="mt-4">
                <p className="text-sm leading-6 text-ink/60">
                  Todavía no hiciste ningún pedido. Cuando hagas tu primer
                  pedido, lo vas a encontrar acá.
                </p>
                <Link
                  href="/productos"
                  className="motion-button mt-3 inline-flex min-h-11 items-center text-sm font-bold text-action hover:text-ink"
                >
                  Ver productos →
                </Link>
              </div>
            ) : (
              <ol className="mt-4 divide-y divide-ink/10">
                {dashboard.orders.map((order) => (
                  <li className="py-4 first:pt-0" key={order.publicNumber}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">
                          {shortOrderReference(order.publicNumber)}
                        </p>
                        <p className="mt-1 text-sm text-ink/55">
                          {formatDate(order.createdAt)} ·{" "}
                          {order.deliveryType === "pickup" ? "Retiro" : "Envío"}
                        </p>
                        {order.productSummary ? (
                          <p className="mt-1 text-xs leading-5 text-ink/55">
                            {order.productSummary}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatArsCents(order.total)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-action">
                          {orderStatusLabels[order.status]}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/mi-cuenta/pedidos/${encodeURIComponent(order.publicNumber)}`}
                      className="motion-button mt-3 inline-flex min-h-11 cursor-pointer items-center text-sm font-bold text-action hover:text-ink"
                    >
                      Ver pedido →
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <section className="rounded-3xl border border-ink/10 bg-white p-6">
            <h2 className="text-xl font-black">Historial</h2>
            {dashboard.transactions.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-ink/60">
                Cuando acredites puntos por un pedido pagado, el movimiento va a
                aparecer acá.
              </p>
            ) : (
              <ol className="mt-4 divide-y divide-ink/10">
                {dashboard.transactions.map((transaction) => (
                  <li
                    className="flex items-start justify-between gap-3 py-4 first:pt-0"
                    key={`${transaction.publicNumber}-${transaction.createdAt.toISOString()}`}
                  >
                    <div>
                      <p className="font-bold">
                        Pedido {transaction.publicNumber}
                      </p>
                      <p className="mt-1 text-sm text-ink/55">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <p className="font-black text-action">
                      +{transaction.points}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
          </div>
        </Container>
      </main>
    </StorefrontShell>
  );
}
