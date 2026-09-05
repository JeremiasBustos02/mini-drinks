"use client";

import { useState } from "react";

import { createComboCartItem, createProductCartItem } from "@/lib/cart/cart-item-factories";
import { CHECKOUT_MAX_LINE_QUANTITY } from "@/lib/checkout/limits";
import { useCartStore } from "@/store/cart-store";
import type { CatalogItem } from "@/types/catalog";

type PurchasePreviewProps = {
  item: CatalogItem;
  available: number;
};

export function PurchasePreview({ item, available }: PurchasePreviewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = available === 0;
  const maximumQuantity = Math.min(available, CHECKOUT_MAX_LINE_QUANTITY);

  function updateQuantity(nextQuantity: number) {
    setQuantity(Math.max(1, Math.min(nextQuantity, maximumQuantity)));
    setIsAdded(false);
  }

  function addToCart() {
    const cartItem = item.kind === "combo" ? createComboCartItem(item) : createProductCartItem(item);
    addItem(cartItem, quantity);
    setIsAdded(true);
  }

  return (
    <div className="purchase-preview mt-8">
      <p className="text-xs font-black tracking-[0.18em] text-action uppercase">
        Cantidad
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 items-center rounded-xl border-2 border-ink bg-white">
          <button
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={isOutOfStock || quantity === 1}
            className="motion-button grid size-11 place-items-center text-xl font-black disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Restar una unidad"
          >
            −
          </button>
          <output
            key={isOutOfStock ? 0 : quantity}
            className="quantity-value grid min-w-9 place-items-center text-base font-black"
          >
            {isOutOfStock ? 0 : quantity}
          </output>
          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isOutOfStock || quantity === maximumQuantity}
            className="motion-button grid size-11 place-items-center text-xl font-black disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Sumar una unidad"
          >
            +
          </button>
        </div>
        <span className="text-sm font-medium text-ink/55">
          {isOutOfStock ? "No disponible" : `Máximo disponible: ${available}`}
        </span>
      </div>
      <button
        type="button"
        disabled={isOutOfStock}
        onClick={addToCart}
        className="motion-button mt-5 inline-flex min-h-13 w-full items-center justify-center rounded-xl border-2 border-action bg-action px-6 py-3 text-base font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:border-ink/20 disabled:bg-ink/20 sm:w-auto"
      >
        {isOutOfStock
          ? "Sin stock"
          : isAdded
            ? "Agregado al carrito"
            : `Agregar ${quantity} al carrito`}
      </button>
      <p className="mt-3 text-xs text-ink/55" aria-live="polite">
        {isAdded ? "Listo, ya está en tu carrito." : "Podés revisar tu pedido desde el ícono del carrito."}
      </p>
    </div>
  );
}
