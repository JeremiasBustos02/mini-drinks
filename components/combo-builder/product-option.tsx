import { ProductVisual } from "@/components/products/product-visual";
import type { ComboBuilderProduct } from "@/components/combo-builder/types";
import { formatArsCents as formatPrice } from "@/lib/money";

type ProductOptionProps = {
  product: ComboBuilderProduct;
  selected: boolean;
  onSelect: () => void;
  displayName?: string;
  caption?: string;
  multi?: boolean;
};

export function ProductOption({
  product,
  selected,
  onSelect,
  displayName = product.name,
  caption,
  multi = false,
}: ProductOptionProps) {
  const unavailable = product.stock <= 0;

  return (
    <button
      type="button"
      aria-pressed={selected}
      data-selected={selected}
      disabled={unavailable}
      onClick={onSelect}
      className={`combo-builder-option group relative flex h-full min-w-0 flex-col rounded-[1.1rem] border-2 p-1.5 text-left transition-[border-color,background-color,box-shadow,transform] disabled:cursor-not-allowed disabled:opacity-50 sm:p-[0.4375rem] ${
        selected
          ? "border-action bg-mint/25 shadow-[4px_5px_0_#024018]"
          : "border-transparent bg-canvas hover:-translate-y-0.5 hover:border-ink/20"
      }`}
    >
      <ProductVisual
        variant={product.image}
        imageUrl={product.imageUrl}
        volumeLabel={product.volume ?? (multi ? "Extra" : "Mini")}
        productType={product.productType}
        compact
        className="combo-builder-option-visual !h-32 w-full sm:!h-36"
        imageClassName="combo-builder-option-image"
      />
      <span className="combo-builder-option-content flex min-h-[4.75rem] w-full flex-1 flex-col px-1.5 pt-2 pb-1.5 sm:min-h-20 sm:px-2 sm:pt-2.5">
        <span className="font-display text-sm leading-[1.05] uppercase sm:text-[0.9375rem]">
          {displayName}
        </span>
        {caption ? (
          <span className="mt-1.5 line-clamp-2 text-[0.7rem] leading-relaxed text-ink/60">
            {caption}
          </span>
        ) : null}
        <span className="mt-auto pt-2 text-xs font-black sm:text-[0.8125rem]">
          {formatPrice(product.price)}
        </span>
      </span>
      {selected ? (
          <span className="combo-option-status absolute top-3 right-3 rounded-full bg-action px-2 py-0.5 text-[0.55rem] font-black tracking-wide text-white uppercase shadow-sm">
          {multi ? "Sumado" : "Elegido"}
        </span>
      ) : null}
      {unavailable ? (
          <span className="absolute top-3 right-3 rounded-full bg-ink px-2 py-0.5 text-[0.55rem] font-black tracking-wide text-white uppercase">
          Sin stock
        </span>
      ) : null}
    </button>
  );
}
