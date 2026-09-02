"use client";

import { useState } from "react";

type PurchasePreviewProps = {
  available: number;
};

export function PurchasePreview({ available }: PurchasePreviewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPrepared, setIsPrepared] = useState(false);
  const isOutOfStock = available === 0;

  function updateQuantity(nextQuantity: number) {
    setQuantity(Math.max(1, Math.min(nextQuantity, available)));
    setIsPrepared(false);
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
            disabled={isOutOfStock || quantity === available}
            className="motion-button grid size-11 place-items-center text-xl font-black disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Sumar una unidad"
          >
            +
          </button>
        </div>
        <span className="text-sm font-medium text-ink/55">
          {isOutOfStock ? "No disponible" : `Máximo mock: ${available}`}
        </span>
      </div>
      <button
        type="button"
        disabled={isOutOfStock}
        onClick={() => setIsPrepared(true)}
        className="motion-button mt-5 inline-flex min-h-13 w-full items-center justify-center rounded-xl border-2 border-action bg-action px-6 py-3 text-base font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:border-ink/20 disabled:bg-ink/20 sm:w-auto"
      >
        {isOutOfStock
          ? "Sin stock"
          : isPrepared
            ? "Listo para sumar"
            : `Agregar ${quantity} al carrito`}
      </button>
      <p className="mt-3 text-xs text-ink/55" aria-live="polite">
        {isPrepared
          ? "Vista previa: el carrito real se implementará en la próxima etapa."
          : "Vista previa: todavía no se crea un carrito."}
      </p>
    </div>
  );
}
