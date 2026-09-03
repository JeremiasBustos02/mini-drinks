"use client";

import Link from "next/link";
import { useEffect } from "react";

import { CartEmpty } from "@/components/cart/cart-empty";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartHydration } from "@/components/cart/use-cart-hydration";
import { getCartSubtotal } from "@/lib/cart/cart-utils";
import { useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const hydrated = useCartHydration();
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeCart, isOpen]);

  if (!hydrated) return null;

  return (
    <div className={`cart-drawer fixed inset-0 z-[70] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/35 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
        aria-label="Cerrar carrito"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        className={`absolute right-0 flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl transition-transform duration-200 ease-out sm:w-[28rem] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-action uppercase">Tu pedido</p>
            <h2 className="mt-1 font-display text-3xl leading-none uppercase">Carrito</h2>
          </div>
          <button type="button" onClick={closeCart} className="motion-button grid size-10 place-items-center rounded-xl border border-ink/15 bg-white text-xl font-black" aria-label="Cerrar carrito">×</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
          {items.length === 0 ? <div className="py-8"><CartEmpty compact onNavigate={closeCart} /></div> : items.map((item) => <CartItem key={item.lineId} item={item} compact />)}
        </div>
        {items.length > 0 ? (
          <div className="border-t border-ink/10 bg-white px-5 py-5 sm:px-6">
            <CartSummary subtotal={getCartSubtotal(items)} compact />
            <Link href="/carrito" onClick={closeCart} className="motion-button mt-4 flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-action bg-action px-5 py-3 text-sm font-bold text-white hover:border-ink hover:bg-ink">Ver carrito</Link>
            <button type="button" onClick={closeCart} className="motion-button mt-3 w-full text-sm font-bold text-action underline decoration-2 underline-offset-4">Seguir comprando</button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
