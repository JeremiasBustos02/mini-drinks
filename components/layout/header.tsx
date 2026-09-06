"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useCartHydration } from "@/components/cart/use-cart-hydration";
import { CartIcon, MenuIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { getCartTotalItems } from "@/lib/cart/cart-utils";
import { useCartStore } from "@/store/cart-store";

const navigation = [
  { label: "Comprar", href: "/productos" },
  { label: "Armá tu combo", href: "/arma-tu-combo" },
  { label: "Packs", href: "/#packs" },
  { label: "Eventos", href: "/#regalos-eventos" },
  { label: "Mayoristas", href: "/#mayoristas" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [accountLink, setAccountLink] = useState<{ label: string; href: string } | null>(null);
  const pathname = usePathname();
  const hydrated = useCartHydration();
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = hydrated ? getCartTotalItems(items) : 0;

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 8);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/account-access", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((value) => { if (active) setAccountLink(value?.label && value?.href ? value : { label: "Ingresar", href: "/login" }); })
      .catch(() => { if (active) setAccountLink({ label: "Ingresar", href: "/login" }); });
    return () => { active = false; };
  }, [pathname]);

  return (
    <>
      <Link
        href="#contenido"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-white px-4 py-3 font-bold shadow-lg focus:translate-y-0"
      >
        Saltar al contenido
      </Link>
      <header className="site-header sticky top-0 z-50 border-b border-white/20 bg-paper/55 backdrop-blur-xl" data-scrolled={scrolled ? "" : undefined}>
        <Container className="flex h-[var(--header-height)] items-center justify-between gap-4">
          <Link
            href="/"
            className="site-header-brand font-display text-2xl leading-none tracking-[-0.04em]"
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
                className={`site-header-link text-sm font-bold transition-colors ${
                  item.label === "Mayoristas"
                    ? "text-action hover:text-ink"
                    : "text-ink/75 hover:text-action"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrito, ${totalItems} producto${totalItems === 1 ? "" : "s"}`}
              className="header-control motion-button relative grid size-11 cursor-pointer place-items-center rounded-xl border border-ink/10 bg-white/85 shadow-[0_2px_0_rgb(13_13_13_/_10%)]"
            >
              <CartIcon />
              <span key={totalItems} className="quantity-value absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-action text-[0.65rem] font-black text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </button>

            {accountLink && <Link
              aria-label={accountLink.label}
              className="header-control motion-button inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-ink/10 bg-white/85 px-3 text-sm font-bold leading-none shadow-[0_2px_0_rgb(13_13_13_/_10%)] transition duration-200 hover:-translate-y-px hover:border-action/35 hover:bg-mint/25 hover:text-action hover:shadow-[0_4px_0_rgb(13_13_13_/_12%)] active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              href={accountLink.href}
            >
              {accountLink.label}
            </Link>}

            <details className="mobile-menu group relative md:hidden">
              <summary
                aria-label="Abrir o cerrar menú"
                className="header-control motion-button grid size-11 cursor-pointer list-none place-items-center rounded-xl border border-ink/10 bg-white/85 shadow-[0_2px_0_rgb(13_13_13_/_10%)]"
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
                {accountLink && <Link href={accountLink.href} className="block rounded-xl px-4 py-3 text-base font-bold hover:bg-canvas">{accountLink.label}</Link>}
              </nav>
            </details>
          </div>
        </Container>
      </header>
    </>
  );
}
