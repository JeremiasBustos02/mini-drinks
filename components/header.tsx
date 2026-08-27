import Link from "next/link";

import { CartIcon, MenuIcon, UserIcon } from "@/components/icons";
import { Container } from "@/components/container";

const navigation = [
  { label: "Comprar", href: "/catalogo" },
  { label: "Armá tu combo", href: "/#arma-tu-combo" },
  { label: "Packs", href: "/catalogo?categoria=packs" },
  { label: "Eventos", href: "/#regalos-eventos" },
  { label: "Mayoristas", href: "/#mayoristas" },
];

export function Header() {
  return (
    <>
      <Link
        href="#contenido"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-white px-4 py-3 font-bold shadow-lg focus:translate-y-0"
      >
        Saltar al contenido
      </Link>
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-canvas/95 backdrop-blur-sm">
        <Container className="flex h-[var(--header-height)] items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-2xl leading-none tracking-[-0.04em]"
            aria-label="MINI, volver al inicio"
          >
            MINI<span className="text-action">.</span>
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Principal"
          >
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-bold transition-colors ${
                  item.label === "Mayoristas"
                    ? "text-mint hover:text-action"
                    : "hover:text-action"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span
              role="img"
              aria-label="Acceso a cuenta, próximamente"
              title="Iniciar sesión próximamente"
              className="grid size-11 place-items-center rounded-xl border border-ink/15 bg-white"
            >
              <UserIcon />
            </span>
            <span
              role="img"
              aria-label="Carrito, sin productos"
              className="relative grid size-11 place-items-center rounded-xl border border-ink/15 bg-white"
            >
              <CartIcon />
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-action text-[0.65rem] font-black text-white">
                0
              </span>
            </span>

            <details className="group relative md:hidden">
              <summary
                aria-label="Abrir o cerrar menú"
                className="grid size-11 cursor-pointer list-none place-items-center rounded-xl border border-ink/15 bg-white"
              >
                <MenuIcon />
              </summary>
              <nav
                className="absolute top-14 right-0 w-[min(18rem,calc(100vw-2.5rem))] rounded-2xl border border-ink/10 bg-white p-3 shadow-xl"
                aria-label="Menú móvil"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-xl px-4 py-3 text-base font-bold hover:bg-canvas"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </details>
          </div>
        </Container>
      </header>
    </>
  );
}
