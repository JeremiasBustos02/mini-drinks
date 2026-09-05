"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";

const links = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/productos", label: "Productos", icon: "box" },
  { href: "/admin/categorias", label: "Categorías", icon: "tag" },
  { href: "/admin/combos", label: "Combos", icon: "layers" },
  { href: "/admin/contenido", label: "Contenido", icon: "image" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "receipt" },
] as const;

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  const paths = {
    grid: <><rect height="6" rx="1" width="6" x="3" y="3" /><rect height="6" rx="1" width="6" x="15" y="3" /><rect height="6" rx="1" width="6" x="3" y="15" /><rect height="6" rx="1" width="6" x="15" y="15" /></>,
    box: <><path d="m21 8-9 5-9-5" /><path d="M3 8l9-5 9 5v8l-9 5-9-5Z" /><path d="M12 13v8" /></>,
    tag: <><path d="M20 13 13 20a2 2 0 0 1-3 0l-6-6a2 2 0 0 1 0-3l7-7h7l2 2Z" /><path d="M15 8h.01" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
    image: <><rect height="16" rx="2" width="18" x="3" y="4" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-5L5 21" /></>,
    receipt: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2Z" /><path d="M9 7h6M9 11h6M9 15h3" /></>,
  };
  return <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children, email }: { children: React.ReactNode; email: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentSection = links.find((link) => isActivePath(pathname, link.href))?.label ?? "Administración";

  const navigation = (
    <nav aria-label="Administración" className="space-y-1">
      {links.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${active ? "bg-action text-white shadow-sm" : "text-ink/65 hover:bg-canvas hover:text-ink"}`}
            href={link.href}
            key={link.href}
            onClick={() => setMenuOpen(false)}
          >
            <NavIcon name={link.icon} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const session = (
    <div className="border-t border-ink/10 pt-4">
      <p className="truncate px-1 text-xs text-ink/45">{email}</p>
      <form action={logoutAction} className="mt-2">
        <AdminSubmitButton className="flex min-h-11 w-full items-center justify-center rounded-xl border border-ink/15 bg-white px-3 text-sm font-bold text-ink hover:border-ink/30 hover:bg-canvas" pendingLabel="Cerrando...">
          Cerrar sesión
        </AdminSubmitButton>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink/10 bg-paper px-5 py-6 lg:flex">
        <Link className="flex items-center gap-3" href="/admin">
          <span className="grid size-10 place-items-center rounded-xl bg-action font-display text-sm text-white">M.</span>
          <span>
            <span className="block text-sm font-black tracking-[-0.02em]">MINI.</span>
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink/40">Administración</span>
          </span>
        </Link>
        <div className="mt-9 flex-1">{navigation}</div>
        {session}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink/10 bg-canvas/95 px-4 backdrop-blur sm:px-6 lg:h-[4.5rem] lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-controls="admin-mobile-navigation"
              aria-expanded={menuOpen}
              aria-label="Abrir navegación"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-ink/15 bg-white lg:hidden"
              onClick={() => setMenuOpen(true)}
              type="button"
            >
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{currentSection}</p>
              <p className="hidden truncate text-xs text-ink/45 sm:block">Panel de gestión MINI.</p>
            </div>
          </div>
          <span className="hidden max-w-64 truncate rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink/55 sm:block">{email}</span>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" id="admin-mobile-navigation">
            <button aria-label="Cerrar navegación" className="absolute inset-0 bg-ink/35" onClick={() => setMenuOpen(false)} type="button" />
            <aside className="relative flex h-full w-[min(19rem,86vw)] flex-col bg-paper p-5 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-xl tracking-[-0.04em]">MINI. ADMIN</span>
                <button aria-label="Cerrar navegación" className="grid size-10 place-items-center rounded-xl border border-ink/15" onClick={() => setMenuOpen(false)} type="button">
                  <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
              </div>
              <div className="mt-8 flex-1">{navigation}</div>
              {session}
            </aside>
          </div>
        )}

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">{children}</main>
      </div>
    </div>
  );
}
