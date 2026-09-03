import { formatArsCents as formatPrice } from "@/lib/money";

type CartSummaryProps = {
  subtotal: number;
  compact?: boolean;
};

export function CartSummary({ subtotal, compact = false }: CartSummaryProps) {
  return (
    <div className={compact ? "pt-4" : "rounded-[1.25rem] bg-white p-5 sm:p-6"}>
      <div className="flex items-end justify-between gap-4 border-t-2 border-ink pt-4">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-action uppercase">Subtotal</p>
          <p className="mt-1 text-xs text-ink/55">Envío y descuentos se calculan al finalizar.</p>
        </div>
        <p className="text-2xl font-black tracking-tight">{formatPrice(subtotal)}</p>
      </div>
      {!compact ? (
        <p className="mt-5 rounded-xl bg-mint/50 p-3 text-xs leading-relaxed text-ink/70">
          El backend recalculará precios, promociones y stock antes de crear el pedido.
        </p>
      ) : null}
    </div>
  );
}
