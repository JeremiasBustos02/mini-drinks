import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/combos", label: "Combos" },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string | null }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b-2 border-ink bg-action px-4 py-4 text-white lg:min-h-screen lg:border-r-2 lg:border-b-0 lg:px-5 lg:py-7">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 lg:block">
          <Link className="font-display text-2xl tracking-[-0.04em]" href="/admin">
            MINI. ADMIN
          </Link>
          <nav aria-label="Administración" className="hidden lg:mt-10 lg:block">
            {links.map((link) => (
              <Link
                className="mb-2 block rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:bg-white/12"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
            <span className="mt-4 block rounded-xl border border-white/20 px-3 py-2.5 text-sm text-white/55">
              Pedidos · futuro
            </span>
          </nav>
          <form action={logoutAction} className="lg:mt-10">
            <p className="mb-2 hidden truncate text-xs text-white/60 lg:block">{email}</p>
            <button className="rounded-xl border border-white/40 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] hover:bg-white hover:text-action">
              Cerrar sesión
            </button>
          </form>
        </div>
        <nav aria-label="Administración móvil" className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
          {links.map((link) => (
            <Link
              className="shrink-0 rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
