import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import { getAccountAccess, getCustomerProfile } from "@/lib/account/auth";
import { getAccountDashboard } from "@/lib/account/dashboard";
import { formatArsCents } from "@/lib/money";

const orderStatusLabels: Record<string, string> = {
  cancelled: "Cancelado",
  completed: "Completado",
  expired: "Vencido",
  manual_review: "En revisión",
  paid: "Pagado",
  payment_pending: "Pago pendiente",
  payment_rejected: "Pago rechazado",
  pending_payment: "Esperando pago",
  preparing: "En preparación",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
    value,
  );
}

export default async function MyAccountPage() {
  const access = await getAccountAccess();
  if (access.status === "unauthenticated") redirect("/login");
  if (access.isAdmin) redirect("/admin");
  const [profile, dashboard] = await Promise.all([
    getCustomerProfile(access.userId),
    getAccountDashboard(access.userId),
  ]);
  const displayName = profile?.displayName || access.email || "Tu cuenta";

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="motion-button inline-flex min-h-11 cursor-pointer items-center text-sm font-bold text-ink/65 hover:text-action"
        >
          ← Volver al inicio
        </Link>
        <p className="mt-4 font-display text-2xl tracking-[-0.04em]">
          MINI<span className="text-action">.</span>
        </p>
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
        <section className="mt-8 rounded-3xl border border-ink/10 bg-paper p-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                Email
              </dt>
              <dd className="mt-1 font-bold">
                {access.email ?? "Sin email disponible"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                Estado de sesión
              </dt>
              <dd className="mt-1 font-bold text-action">Sesión activa</dd>
            </div>
          </dl>
        </section>
        <section className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-ink text-white">
          <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-mint">
                Mini Club
              </p>
              <p className="mt-2 text-sm text-white/65">
                Tus puntos disponibles
              </p>
              <p className="mt-1 font-display text-6xl tracking-[-0.06em]">
                {dashboard.balance}
              </p>
            </div>
            <p className="max-w-52 text-sm leading-6 text-white/70">
              Sumás 1 punto cada $1.000 en productos pagados.
            </p>
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
              <p className="mt-3 text-sm leading-6 text-ink/60">
                Los pedidos que hagas con la sesión iniciada aparecerán acá.
              </p>
            ) : (
              <ol className="mt-4 divide-y divide-ink/10">
                {dashboard.orders.map((order) => (
                  <li className="py-4 first:pt-0" key={order.publicNumber}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{order.publicNumber}</p>
                        <p className="mt-1 text-sm text-ink/55">
                          {formatDate(order.createdAt)} ·{" "}
                          {order.deliveryType === "pickup" ? "Retiro" : "Envío"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatArsCents(order.total)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-action">
                          {orderStatusLabels[order.status] ?? order.status}
                        </p>
                      </div>
                    </div>
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
    </main>
  );
}
