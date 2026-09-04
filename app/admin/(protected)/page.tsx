import Link from "next/link";

import { AdminPageHeader, EmptyState, QuickLink, StatCard } from "@/components/admin/admin-ui";
import { FulfillmentBadge, OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { formatAdminDateTime } from "@/lib/admin/presentation";
import { getAdminDashboardStats, getAdminLowStockProducts, getAdminOrders } from "@/lib/db/queries/admin";
import { formatArsCents } from "@/lib/money";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, lowStockProducts] = await Promise.all([
    getAdminDashboardStats(),
    getAdminOrders({}, 5),
    getAdminLowStockProducts(6),
  ]);

  const cards = [
    { label: "Productos totales", value: stats.products, href: "/admin/productos", tone: "neutral" as const },
    { label: "Productos publicados", value: stats.publishedProducts, href: "/admin/productos?status=published", tone: "green" as const },
    { label: "Productos con poco stock", value: stats.lowStockProducts, href: "/admin/productos?status=low_stock", tone: "amber" as const },
    { label: "Combos activos", value: stats.activeCombos, href: "/admin/combos", tone: "blue" as const },
    { label: "Pedidos pendientes", value: stats.pendingOrders, href: "/admin/pedidos?status=pending_payment", tone: "amber" as const },
    { label: "Pedidos pagados", value: stats.paidOrders, href: "/admin/pedidos?payment=approved", tone: "green" as const },
  ];

  return (
    <div className="mx-auto max-w-[92rem]">
      <AdminPageHeader description="Estado general del catálogo y la operación de pedidos." eyebrow="Resumen operativo" title="Dashboard" />
      <section aria-label="Métricas" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => <StatCard {...card} key={card.label} />)}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.75fr)]">
        <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-5"><div><h2 className="font-black">Últimos pedidos</h2><p className="mt-0.5 text-xs text-ink/45">Actividad reciente de la tienda.</p></div><Link className="text-sm font-black text-action hover:underline" href="/admin/pedidos">Ver todos</Link></div>
          {recentOrders.length === 0 ? <div className="p-4"><EmptyState description="Los pedidos aparecerán aquí cuando se registren." title="Todavía no hay pedidos" /></div> : (
            <div className="divide-y divide-ink/[0.07]">
              {recentOrders.map((order) => (
                <Link className="grid gap-3 px-4 py-4 transition hover:bg-canvas/40 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-5" href={`/admin/pedidos/${order.id}`} key={order.id}>
                  <div className="min-w-0"><p className="font-black">{order.publicNumber}</p><p className="mt-1 text-xs text-ink/45">{formatAdminDateTime(order.createdAt)} · {formatArsCents(order.total)}</p></div>
                  <div className="flex flex-wrap gap-1.5"><OrderStatusBadge status={order.status} /><PaymentStatusBadge status={order.paymentStatus} /></div>
                  <FulfillmentBadge type={order.deliveryType} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-5"><div><h2 className="font-black">Stock crítico</h2><p className="mt-0.5 text-xs text-ink/45">Productos activos con 5 o menos disponibles.</p></div><Link className="text-sm font-black text-action hover:underline" href="/admin/productos?status=low_stock">Gestionar</Link></div>
          {lowStockProducts.length === 0 ? <div className="p-4"><EmptyState description="No hay productos activos con poco stock." title="Stock saludable" /></div> : (
            <div className="divide-y divide-ink/[0.07]">
              {lowStockProducts.map((product) => (
                <Link className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-canvas/40 sm:px-5" href={`/admin/productos?edit=${product.id}#editor`} key={product.id}>
                  <div className="min-w-0"><p className="truncate text-sm font-black">{product.name}</p><p className="mt-0.5 truncate text-xs text-ink/40">{product.categoryName} · {product.stock} físico</p></div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${product.availableStock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{product.availableStock} disp.</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3"><h2 className="font-black">Accesos rápidos</h2><p className="mt-0.5 text-xs text-ink/45">Tareas frecuentes de gestión.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickLink description="Cargar precio, stock e imagen" href="/admin/productos?create=1#editor" label="Nuevo producto" />
          <QuickLink description="Armar una promoción" href="/admin/combos?create=1#editor" label="Nuevo combo" />
          <QuickLink description="Organizar el catálogo" href="/admin/categorias" label="Gestionar categorías" />
          <QuickLink description="Revisar estado y pago" href="/admin/pedidos" label="Ver pedidos" />
        </div>
      </section>
    </div>
  );
}
