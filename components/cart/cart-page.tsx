"use client";

import Link from "next/link";

import { CartEmpty } from "@/components/cart/cart-empty";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartHydration } from "@/components/cart/use-cart-hydration";
import { Container } from "@/components/ui/container";
import { getCartSubtotal } from "@/lib/cart/cart-utils";
import { useCartStore } from "@/store/cart-store";

export function CartPage() {
  const hydrated = useCartHydration();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  if (!hydrated) {
    return <section className="py-12 sm:py-16"><Container><div className="h-72 rounded-[1.5rem] bg-white" /></Container></section>;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-action uppercase">Tu pedido</p>
            <h1 className="mt-2 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.88] tracking-[-0.05em] uppercase">Carrito</h1>
          </div>
          {items.length > 0 ? <button type="button" onClick={clearCart} className="motion-button text-sm font-bold text-ink/55 underline decoration-2 underline-offset-4 hover:text-action">Vaciar carrito</button> : null}
        </div>
        {items.length === 0 ? (
          <div className="mt-8 max-w-xl"><CartEmpty /></div>
        ) : (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="rounded-[1.5rem] bg-white px-5 sm:px-7">
              {items.map((item) => <CartItem key={item.lineId} item={item} />)}
            </div>
            <aside className="lg:sticky lg:top-28">
              <CartSummary subtotal={getCartSubtotal(items)} />
              <button type="button" disabled className="mt-4 flex min-h-13 w-full cursor-not-allowed items-center justify-center rounded-xl border-2 border-ink/15 bg-ink/10 px-6 py-3 text-base font-bold text-ink/45">Checkout próximamente</button>
              <Link href="/productos" className="motion-button mt-4 flex min-h-11 items-center justify-center text-sm font-bold text-action underline decoration-2 underline-offset-4">Seguir eligiendo</Link>
            </aside>
          </div>
        )}
      </Container>
    </section>
  );
}
