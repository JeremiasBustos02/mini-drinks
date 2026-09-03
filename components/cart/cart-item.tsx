"use client";

import { ProductVisual } from "@/components/products/product-visual";
import { QuantityControl } from "@/components/cart/quantity-control";
import { formatArsCents as formatPrice } from "@/lib/money";
import { getCartItemSubtotal } from "@/lib/cart/cart-utils";
import { useCartStore } from "@/store/cart-store";
import type { CartItem as CartItemType } from "@/types/cart";

type CartItemProps = {
  item: CartItemType;
  compact?: boolean;
};

const labels = {
  product: "Individual",
  combo: "Combo",
  custom_combo: "Combo a tu manera",
  pack: "Pack",
};

export function CartItem({ item, compact = false }: CartItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const components = item.type === "product" ? [] : item.components;

  return (
    <article className="cart-item grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-b border-ink/10 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
      <ProductVisual variant={item.visual} compact className="!h-[4.5rem] !rounded-xl sm:!h-[5.5rem]" />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-black tracking-[0.15em] text-action uppercase">{labels[item.type]}</p>
            <h3 className="mt-1 text-sm font-black leading-tight sm:text-base">{item.name}</h3>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.lineId)}
            className="motion-button shrink-0 text-xs font-black text-ink/50 underline decoration-1 underline-offset-4 hover:text-action"
          >
            Eliminar
          </button>
        </div>
        {components.length > 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-ink/60">
            {components.map((component) => `${component.quantity} x ${component.name}`).join(" · ")}
          </p>
        ) : null}
        {item.type === "custom_combo" && item.savings > 0 ? (
          <p className="mt-2 text-xs font-bold text-action">Mejor precio aplicado: ahorrás {formatPrice(item.savings)}</p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-3">
          <QuantityControl
            quantity={item.quantity}
            onChange={(quantity) => updateQuantity(item.lineId, quantity)}
            onRemove={() => removeItem(item.lineId)}
            size={compact ? "compact" : "default"}
          />
          <div className="text-right">
            <p className="text-xs text-ink/50">{formatPrice(item.unitPrice)} c/u</p>
            <p className="mt-0.5 text-sm font-black">{formatPrice(getCartItemSubtotal(item))}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
