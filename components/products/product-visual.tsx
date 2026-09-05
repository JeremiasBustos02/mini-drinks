import { productVisualStyles } from "@/components/products/product-visual-styles";
import type { ProductType, VisualVariant } from "@/types/catalog";

type ProductVisualProps = {
  variant: VisualVariant;
  imageUrl?: string | null;
  volumeLabel?: string;
  compact?: boolean;
  productType?: ProductType;
  className?: string;
  imageClassName?: string;
};

export function ProductVisual({
  variant,
  imageUrl,
  volumeLabel = "MINI",
  compact = false,
  productType,
  className = "",
  imageClassName = "",
}: ProductVisualProps) {
  const style = productVisualStyles[variant];
  const isExtra = productType === "extra" || productType === "accessory" || productType === "supply";

  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden rounded-[1.25rem] ${style.surface} ${
        compact ? "h-52" : "h-64 sm:h-72"
      } ${className}`}
    >
      <span className="absolute top-4 left-4 z-20 rounded-full bg-white px-3 py-1 text-[0.65rem] font-black tracking-widest uppercase">
        {volumeLabel}
      </span>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className={`absolute inset-0 z-10 size-full object-contain p-4 sm:p-5 ${imageClassName}`} />
      ) : null}
      {!imageUrl ? <div className="absolute -right-5 -bottom-12 size-40 rounded-full border-[24px] border-white/40 sm:size-48" /> : null}
      {!imageUrl && (!productType || productType === "miniature") ? (
        <div
          className={`absolute bottom-6 z-10 h-[62%] w-[24%] min-w-16 -rotate-6 rounded-t-[1.5rem] rounded-b-xl border-2 border-ink/15 shadow-[0_14px_24px_rgba(13,13,13,0.15)] ${
            productType ? "left-1/2 -translate-x-1/2" : "left-[16%]"
          } ${style.bottle}`}
        >
          <div className="absolute -top-[8%] left-1/2 h-[14%] w-[54%] -translate-x-1/2 rounded-t-sm bg-inherit border-x-2 border-t-2 border-ink/15" />
          <span className="absolute top-[42%] inset-x-1 border-y border-current/30 py-2 text-center text-[0.55rem] font-black tracking-wider sm:text-[0.65rem]">
            {style.label}
          </span>
        </div>
      ) : null}
      {!imageUrl && (!productType || productType === "mixer") ? (
        <div
          className={`absolute bottom-9 h-[55%] w-[24%] min-w-16 rotate-6 rounded-[1rem] border-2 border-ink/15 shadow-[0_14px_24px_rgba(13,13,13,0.15)] ${
            productType ? "left-1/2 -translate-x-1/2" : "right-[18%]"
          } ${style.mixer}`}
        >
          <span className="absolute top-[45%] inset-x-0 -rotate-90 text-center text-[0.55rem] font-black tracking-wider sm:text-[0.65rem]">
            {style.mixerLabel}
          </span>
        </div>
      ) : null}
      {!imageUrl && (!productType || productType === "glass") ? (
        <div
          className={`absolute bottom-4 z-20 h-[42%] w-[26%] rounded-b-2xl border-2 border-white/75 bg-white/25 backdrop-blur-[1px] ${
            productType ? "left-1/2 -translate-x-1/2" : "right-[5%]"
          }`}
        >
          <span className="absolute inset-x-2 bottom-3 h-1/2 rounded-b-xl bg-white/60" />
        </div>
      ) : null}
      {!imageUrl && isExtra ? (
        <div className={`absolute top-1/2 left-1/2 grid aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 rotate-6 place-items-center rounded-[1.25rem] border-2 border-ink shadow-[6px_7px_0_#0d0d0d] ${style.bottle}`}>
          <span className="font-display text-sm leading-none uppercase sm:text-lg">{style.label}</span>
        </div>
      ) : null}
    </div>
  );
}
