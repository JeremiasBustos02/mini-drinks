import Link from "next/link";

import { getAdminDashboardStats } from "@/lib/db/queries/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const cards = [
    { label: "Productos", value: stats.products, href: "/admin/productos" },
    { label: "Publicados", value: stats.publishedProducts, href: "/admin/productos" },
    { label: "Poco stock", value: stats.lowStockProducts, href: "/admin/productos" },
    { label: "Combos activos", value: stats.activeCombos, href: "/admin/combos" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-action">Resumen operativo</p>
      <h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">DASHBOARD</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            className="rounded-2xl border-2 border-ink bg-white p-5 transition-transform hover:-translate-y-0.5"
            href={card.href}
            key={card.label}
          >
            <p className="text-sm font-bold text-ink/60">{card.label}</p>
            <p className="mt-4 font-display text-5xl text-action">{card.value}</p>
          </Link>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border-2 border-dashed border-ink/25 bg-white/55 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black">Pedidos</p>
            <p className="mt-1 text-sm text-ink/60">Gestión pendiente para una etapa futura.</p>
          </div>
          <span className="rounded-full bg-ink/8 px-3 py-1 text-sm font-bold">{stats.orders} registrados</span>
        </div>
      </section>
    </div>
  );
}
