import Link from "next/link";

import {
  adminInputClass,
  AdminPageHeader,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  EmptyState,
} from "@/components/admin/admin-ui";
import {
  FulfillmentBadge,
  OrderStatusBadge,
  orderStatusLabel,
  PaymentStatusBadge,
  paymentStatusLabel,
  ReservationStatusBadge,
} from "@/components/admin/status-badge";
import { formatAdminDateTime } from "@/lib/admin/presentation";
import { getAdminOrders } from "@/lib/db/queries/admin";
import { formatArsCents } from "@/lib/money";
import {
  orderStatusValues,
  paymentStatusValues,
  type OrderStatus,
  type PaymentStatus,
} from "@/types/domain";

type OrdersSearchParams = { payment?: string; q?: string; status?: string };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<OrdersSearchParams> }) {
  const params = await searchParams;
  const orderStatus = orderStatusValues.includes(params.status as OrderStatus) ? params.status as OrderStatus : undefined;
  const paymentStatus = paymentStatusValues.includes(params.payment as PaymentStatus) ? params.payment as PaymentStatus : undefined;
  const orders = await getAdminOrders({ search: params.q, orderStatus, paymentStatus });

  return (
    <div className="mx-auto max-w-[92rem]">
      <AdminPageHeader description="Consultá fulfillment, pago y reserva sin modificar estados manualmente." eyebrow="Operación" title="Pedidos" />

      <form className="mt-7 grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.4fr)_1fr_1fr_auto] lg:items-end" method="get">
        <label className="text-sm font-bold">Número de pedido<input className={adminInputClass} defaultValue={params.q} name="q" placeholder="Ej. MINI-2026" type="search" /></label>
        <label className="text-sm font-bold">Estado del pedido<select className={adminInputClass} defaultValue={orderStatus ?? ""} name="status"><option value="">Todos</option>{orderStatusValues.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}</select></label>
        <label className="text-sm font-bold">Estado del pago<select className={adminInputClass} defaultValue={paymentStatus ?? ""} name="payment"><option value="">Todos</option>{paymentStatusValues.map((status) => <option key={status} value={status}>{paymentStatusLabel(status)}</option>)}</select></label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1"><button className={`${adminPrimaryButtonClass} flex-1`} type="submit">Filtrar</button><Link className={adminSecondaryButtonClass} href="/admin/pedidos">Limpiar</Link></div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-ink/50">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</p>{orders.length === 100 && <p className="text-xs text-ink/40">Mostrando los 100 más recientes</p>}</div>

      {orders.length === 0 ? (
        <div className="mt-4"><EmptyState action={(params.q || orderStatus || paymentStatus) ? <Link className={adminSecondaryButtonClass} href="/admin/pedidos">Limpiar filtros</Link> : undefined} description="Los pedidos nuevos aparecerán acá con sus estados de pago y reserva." title="No encontramos pedidos" /></div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-ink/10 bg-white md:block">
            <table className="w-full min-w-[68rem] text-left text-sm">
              <caption className="sr-only">Listado de pedidos</caption>
              <thead className="border-b border-ink/10 bg-canvas/70 text-xs font-bold uppercase tracking-[0.08em] text-ink/45"><tr><th className="px-4 py-3" scope="col">Pedido</th><th className="px-4 py-3" scope="col">Fecha</th><th className="px-4 py-3 text-right" scope="col">Total</th><th className="px-4 py-3" scope="col">Fulfillment</th><th className="px-4 py-3" scope="col">Pedido</th><th className="px-4 py-3" scope="col">Pago</th><th className="px-4 py-3" scope="col">Reserva</th><th className="px-4 py-3 text-right" scope="col">Acción</th></tr></thead>
              <tbody className="divide-y divide-ink/[0.07]">
                {orders.map((order) => (
                  <tr className="hover:bg-canvas/35" key={order.id}>
                    <td className="px-4 py-4 font-black">{order.publicNumber}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-ink/55">{formatAdminDateTime(order.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-black">{formatArsCents(order.total)}</td>
                    <td className="px-4 py-4"><FulfillmentBadge type={order.deliveryType} /></td>
                    <td className="px-4 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-4"><PaymentStatusBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-4"><ReservationStatusBadge status={order.effectiveReservationStatus} /></td>
                    <td className="px-4 py-4 text-right"><Link className={adminSecondaryButtonClass} href={`/admin/pedidos/${order.id}`}>Ver</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 md:hidden">
            {orders.map((order) => (
              <article className="rounded-2xl border border-ink/10 bg-white p-4" key={order.id}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-black">{order.publicNumber}</p><p className="mt-1 text-xs text-ink/45">{formatAdminDateTime(order.createdAt)}</p></div><p className="shrink-0 font-black">{formatArsCents(order.total)}</p></div>
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 rounded-xl bg-canvas/60 p-3"><div><p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink/40">Entrega</p><FulfillmentBadge type={order.deliveryType} /></div><div><p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink/40">Pedido</p><OrderStatusBadge status={order.status} /></div><div><p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink/40">Pago</p><PaymentStatusBadge status={order.paymentStatus} /></div><div><p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink/40">Reserva</p><ReservationStatusBadge status={order.effectiveReservationStatus} /></div></div>
                <Link className={`${adminPrimaryButtonClass} mt-4 w-full`} href={`/admin/pedidos/${order.id}`}>Ver detalle</Link>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
