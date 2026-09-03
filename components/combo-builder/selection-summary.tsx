import { CartIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/catalog";
import type { ComboPricing } from "@/lib/pricing/combo-pricing";
import type { Product } from "@/types/catalog";
import type { ExtraOption } from "@/components/combo-builder/types";

type SelectionSummaryProps = {
  miniature?: Product;
  mixer?: Product;
  glass?: Product;
  extras: ExtraOption[];
  pricing: ComboPricing;
  currentStep: number;
  complete: boolean;
  added: boolean;
  showAction?: boolean;
  onEdit: (step: number) => void;
  onAdd: () => void;
};

export function SelectionSummary({
  miniature,
  mixer,
  glass,
  extras,
  pricing,
  currentStep,
  complete,
  added,
  showAction = true,
  onEdit,
  onAdd,
}: SelectionSummaryProps) {
  const rows = [
    {
      label: "Miniatura",
      value: miniature?.name ?? "Todavía no elegiste",
      step: 0,
      canEdit: true,
    },
    {
      label: "Mixer",
      value: mixer?.name ?? "Todavía no elegiste",
      step: 1,
      canEdit: Boolean(miniature),
    },
    {
      label: "Vaso",
      value: glass?.name ?? "Todavía no elegiste",
      step: 2,
      canEdit: Boolean(miniature && mixer),
    },
    {
      label: "Extras",
      value: extras.length > 0 ? extras.map((extra) => extra.displayName).join(", ") : "Sin extras",
      step: 3,
      canEdit: complete,
    },
  ];

  return (
    <div className="rounded-[1.25rem] bg-white p-4 shadow-[0_1px_0_rgba(13,13,13,0.08)] sm:p-[1.125rem]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-action uppercase">
            Tu combo
          </p>
          <h2 className="mt-1.5 font-display text-xl leading-none uppercase sm:text-[1.375rem]">
            Lo que elegiste
          </h2>
        </div>
        <span className="rounded-full bg-mint px-2.5 py-1 text-[0.7rem] font-black">
          {currentStep + 1}/5
        </span>
      </div>

      <dl className="mt-3.5 divide-y divide-ink/10 border-y border-ink/10">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto] gap-2 py-[0.5625rem]">
            <div className="min-w-0">
              <dt className="text-[0.6rem] font-black tracking-[0.14em] text-ink/45 uppercase">
                {row.label}
              </dt>
              <dd
                key={row.value}
                className="summary-value mt-0.5 text-[0.8rem] leading-snug font-bold sm:text-[0.84375rem]"
              >
                {row.value}
              </dd>
            </div>
            <button
              type="button"
              disabled={!row.canEdit}
              onClick={() => onEdit(row.step)}
              className="motion-button self-center text-[0.7rem] font-black text-action underline decoration-2 underline-offset-4 disabled:cursor-not-allowed disabled:text-ink/30 disabled:no-underline"
            >
              {row.canEdit ? "Cambiar" : "Pendiente"}
            </button>
          </div>
        ))}
      </dl>

      {pricing.ok && pricing.matchingCombo ? (
        <div className="combo-price-match mt-2.5 rounded-xl bg-mint/60 p-2.5">
          <p className="text-[0.7rem] font-black tracking-[0.12em] text-action uppercase">
            Mejor precio activado
          </p>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-ink/70">
            Esta combinación coincide con uno de nuestros combos. Te aplicamos el mejor precio.
          </p>
          <p className="mt-1.5 text-[0.8rem] font-black">{pricing.matchingCombo.name}</p>
        </div>
      ) : null}

      {pricing.ok ? <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between gap-3 text-[0.8rem] text-ink/60">
          <span>Componentes</span>
          <span
            key={pricing.componentsPrice}
            className={`price-update ${pricing.savings > 0 ? "line-through" : ""}`}
          >
            {formatPrice(pricing.componentsPrice)}
          </span>
        </div>
        {pricing.extrasPrice > 0 ? (
          <div className="flex items-center justify-between gap-3 text-[0.8rem] text-ink/60">
            <span>Extras</span>
            <span key={pricing.extrasPrice} className="price-update">
              {formatPrice(pricing.extrasPrice)}
            </span>
          </div>
        ) : null}
        {pricing.savings > 0 ? (
          <div className="combo-savings flex items-center justify-between gap-3 text-[0.8rem] font-black text-action">
            <span>Ahorrás</span>
            <span>{formatPrice(pricing.savings)}</span>
          </div>
        ) : null}
        <div className="flex items-end justify-between gap-3 border-t-2 border-ink pt-2.5">
          <span className="text-sm font-black">Total</span>
          <span
            key={pricing.finalPrice}
            className="price-update text-[1.375rem] font-black tracking-tight sm:text-[1.75rem]"
          >
            {formatPrice(pricing.finalPrice)}
          </span>
        </div>
      </div> : (
        <p className="mt-3 text-[0.8rem] font-bold text-action" role="alert">
          Esta combinación no se puede cotizar. Revisá los productos elegidos.
        </p>
      )}

      {showAction ? (
        <button
          type="button"
          disabled={!complete || currentStep !== 4 || !pricing.ok}
          onClick={onAdd}
          className="motion-button mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-action bg-action px-3.5 py-2 text-[0.8125rem] font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-ink/10 disabled:text-ink/45"
        >
          <CartIcon className="size-5" />
          {added
            ? "Agregado al carrito"
            : !pricing.ok
              ? "Combinación no disponible"
              : currentStep === 4
                ? "Agregar al carrito"
                : "Completá los pasos"}
        </button>
      ) : null}

      {added ? (
        <p className="combo-added-status mt-2 text-center text-[0.8rem] font-bold text-action" role="status">
          Listo. Ya está en tu carrito.
        </p>
      ) : null}
    </div>
  );
}
