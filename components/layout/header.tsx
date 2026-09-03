"use client";

import Link from "next/link";

import { useCartHydration } from "@/components/cart/use-cart-hydration";
import { CartIcon, MenuIcon, UserIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { getCartTotalItems } from "@/lib/cart/cart-utils";
import { useCartStore } from "@/store/cart-store";

const navigation = [
  { label: "Comprar", href: "/productos" },
  { label: "Armá tu combo", href: "/arma-tu-combo" },
  { label: "Packs", href: "/productos?categoria=packs" },
  { label: "Eventos", href: "/#regalos-eventos" },
  { label: "Mayoristas", href: "/#mayoristas" },
];

export function Header() {
  const hydrated = useCartHydration();
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = hydrated ? getCartTotalItems(items) : 0;

  return (
    <>
      <Link
        href="#contenido"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-white px-4 py-3 font-bold shadow-lg focus:translate-y-0"
      >
        Saltar al contenido
      </Link>
      <header className="site-header sticky top-0 z-50 border-b border-ink/10 bg-canvas/95 backdrop-blur-sm">
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
            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrito, ${totalItems} producto${totalItems === 1 ? "" : "s"}`}
              className="motion-button relative grid size-11 place-items-center rounded-xl border border-ink/15 bg-white"
            >
              <CartIcon />
              <span key={totalItems} className="quantity-value absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-action text-[0.65rem] font-black text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </button>

            <details className="mobile-menu group relative md:hidden">
              <summary
                aria-label="Abrir o cerrar menú"
                className="motion-button grid size-11 cursor-pointer list-none place-items-center rounded-xl border border-ink/15 bg-white"
              >
                <MenuIcon />
              </summary>
              <nav
                className="mobile-menu-panel absolute top-14 right-0 w-[min(18rem,calc(100vw-2.5rem))] rounded-2xl border border-ink/10 bg-white p-3 shadow-xl"
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
