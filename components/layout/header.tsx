"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { logoutAction } from "@/app/auth/actions";
import { useCartHydration } from "@/components/cart/use-cart-hydration";
import { Container } from "@/components/ui/container";
import {
  createAccountSummaryCache,
  type AccountSummary,
} from "@/lib/account/account-summary-cache";
import { CartIcon, MenuIcon } from "@/components/ui/icons";
import { getCartTotalItems } from "@/lib/cart/cart-utils";
import { useCartStore } from "@/store/cart-store";

const navigation = [
  { label: "Comprar", href: "/productos" },
  { label: "Armá tu combo", href: "/arma-tu-combo" },
  { label: "Packs", href: "/#packs" },
  { label: "Eventos", href: "/#regalos-eventos" },
  { label: "Mayoristas", href: "/#mayoristas" },
];

type AccountLink = {
  label: string;
  href: string;
  kind: "guest" | "admin" | "customer";
};
const accountSummaryCache = createAccountSummaryCache(() =>
  fetch("/api/account-summary", { cache: "no-store" }).then((response) =>
    response.ok ? response.json() : Promise.reject(),
  ),
);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [accountLink, setAccountLink] = useState<AccountLink | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(
    null,
  );
  const [summaryError, setSummaryError] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
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
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => {
        if (active)
          setAccountLink(
            value?.label && value?.href && value?.kind
              ? value
              : { label: "Ingresar", href: "/login", kind: "guest" },
          );
      })
      .catch(() => {
        if (active)
          setAccountLink({ label: "Ingresar", href: "/login", kind: "guest" });
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (accountLink?.kind !== "customer") return;
    let cancelled = false;
    const prefetch = () => {
      void accountSummaryCache
        .ensure()
        .then((summary) => {
          if (!cancelled) setAccountSummary(summary);
        })
        .catch(() => {
          if (!cancelled) setSummaryError(true);
        });
    };
    const idleId = window.setTimeout(prefetch, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(idleId);
    };
  }, [accountLink?.kind]);

  useEffect(() => {
    const invalidate = () => {
      accountSummaryCache.invalidate();
      setAccountSummary(null);
      setSummaryError(false);
    };
    window.addEventListener("mini-account-summary-invalidated", invalidate);
    return () =>
      window.removeEventListener(
        "mini-account-summary-invalidated",
        invalidate,
      );
  }, []);

  const loadAccountSummary = () => {
    void accountSummaryCache
      .ensure()
      .then((summary) => {
        setAccountSummary(summary);
        setSummaryError(false);
      })
      .catch(() => {
        setSummaryError(true);
      });
  };

  const closeAccountMenu = useEffectEvent((restoreFocus = false) => {
    setAccountOpen(false);
    if (restoreFocus) accountTriggerRef.current?.focus();
  });

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node))
        closeAccountMenu();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAccountMenu(true);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  const accountControlClass =
    "header-control motion-button inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-ink/10 bg-white/85 px-3 text-sm font-bold leading-none shadow-[0_2px_0_rgb(13_13_13_/_10%)] transition duration-200 hover:-translate-y-px hover:border-action/35 hover:bg-mint/25 hover:text-action hover:shadow-[0_4px_0_rgb(13_13_13_/_12%)] active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action";

  return (
    <>
      <Link
        href="#contenido"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-white px-4 py-3 font-bold shadow-lg focus:translate-y-0"
      >
        Saltar al contenido
      </Link>
      <header
        className="site-header sticky top-0 z-50 border-b border-white/20 bg-paper/55 backdrop-blur-xl"
        data-scrolled={scrolled ? "" : undefined}
      >
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
                className={`site-header-link text-sm font-bold transition-colors ${item.label === "Mayoristas" ? "text-action hover:text-ink" : "text-ink/75 hover:text-action"}`}
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
              <span
                key={totalItems}
                className="quantity-value absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-action text-[0.65rem] font-black text-white"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </button>
            {accountLink?.kind === "customer" ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  ref={accountTriggerRef}
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={accountOpen}
                  aria-controls="account-popover"
                  onClick={() => {
                    loadAccountSummary();
                    setAccountOpen((open) => !open);
                  }}
                  onPointerEnter={loadAccountSummary}
                  onFocus={loadAccountSummary}
                  className={accountControlClass}
                >
                  Mi cuenta
                </button>
                {accountOpen ? (
                  <section
                    id="account-popover"
                    className="account-popover absolute top-[calc(100%+0.65rem)] right-0 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-ink/10 bg-paper p-4 text-left shadow-[0_16px_38px_rgb(13_13_13_/_18%)]"
                    aria-label="Resumen de cuenta"
                  >
                    <p className="text-sm font-bold">
                      {accountSummary
                        ? `Hola, ${accountSummary.displayName}`
                        : summaryError
                          ? "Mi cuenta"
                          : "Cargando tu cuenta..."}
                    </p>
                    {accountSummary ? (
                      <div className="mt-4 border-y border-ink/10 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-action">
                          Mini Club
                        </p>
                        <p className="mt-1 text-lg font-black tabular-nums">
                          {accountSummary.availablePoints} pts{" "}
                          <span className="text-sm font-normal text-ink/55">
                            disponibles
                          </span>
                        </p>
                      </div>
                    ) : !summaryError ? (
                      <div
                        className="mt-4 h-[4.75rem] border-y border-ink/10 py-3"
                        aria-label="Cargando puntos"
                      >
                        <span
                          className="account-summary-loader block h-px w-20 bg-action/25"
                          aria-hidden="true"
                        />
                        <span
                          className="mt-3 block h-5 w-36 animate-pulse rounded bg-ink/10"
                          aria-hidden="true"
                        />
                      </div>
                    ) : null}
                    <Link
                      href="/mini-club"
                      onClick={() => setAccountOpen(false)}
                      className="motion-button mt-3 inline-flex min-h-11 items-center text-sm font-bold text-ink/65 hover:text-action"
                    >
                      Cómo funciona
                    </Link>
                    <Link
                      href="/mi-cuenta"
                      onClick={() => setAccountOpen(false)}
                      className="motion-button mt-4 flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-action px-4 text-sm font-black text-white hover:bg-action/85"
                    >
                      Ver mi cuenta
                    </Link>
                    <form
                      action={logoutAction}
                      onSubmit={() => accountSummaryCache.invalidate()}
                    >
                      <button
                        type="submit"
                        className="motion-button mt-2 min-h-11 w-full cursor-pointer rounded-xl px-4 text-sm font-bold text-ink/70 hover:bg-mint/25 hover:text-ink"
                      >
                        Cerrar sesión
                      </button>
                    </form>
                  </section>
                ) : null}
              </div>
            ) : accountLink ? (
              <Link
                aria-label={accountLink.label}
                className={accountControlClass}
                href={accountLink.href}
              >
                {accountLink.label}
              </Link>
            ) : null}
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
                    className="block cursor-pointer rounded-xl px-4 py-3 text-base font-bold transition-colors hover:bg-mint/25 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                  >
                    {item.label}
                  </Link>
                ))}
                {accountLink && (
                  <Link
                    href={accountLink.href}
                    className="block cursor-pointer rounded-xl px-4 py-3 text-base font-bold transition-colors hover:bg-mint/25 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                  >
                    {accountLink.label}
                  </Link>
                )}
              </nav>
            </details>
          </div>
        </Container>
      </header>
    </>
  );
}
