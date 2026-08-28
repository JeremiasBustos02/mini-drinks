import type { ProductType, VisualVariant } from "@/types/catalog";

type ProductVisualProps = {
  variant: VisualVariant;
  volumeLabel?: string;
  compact?: boolean;
  productType?: ProductType;
  className?: string;
};

const visualStyles = {
  fernet: {
    bottle: "bg-action text-white",
    label: "BRANCA",
    mixer: "bg-[#d92d20] text-white",
    mixerLabel: "COLA",
    surface: "bg-mint",
  },
  jack: {
    bottle: "bg-ink text-white",
    label: "JACK",
    mixer: "bg-[#d92d20] text-white",
    mixerLabel: "COLA",
    surface: "bg-[#dad4ca]",
  },
  gin: {
    bottle: "bg-[#dce8e2] text-action",
    label: "GIN",
    mixer: "bg-white text-action",
    mixerLabel: "TONIC",
    surface: "bg-[#cbded5]",
  },
  vodka: {
    bottle: "bg-white text-[#335b8e]",
    label: "VODKA",
    mixer: "bg-[#d7e635] text-ink",
    mixerLabel: "ENERGY",
    surface: "bg-[#b9cfdd]",
  },
  tequila: {
    bottle: "bg-[#f1e45c] text-ink",
    label: "TEQUILA",
    mixer: "bg-white text-action",
    mixerLabel: "MINI",
    surface: "bg-[#f3c7a6]",
  },
  coca: {
    bottle: "bg-[#d92d20] text-white",
    label: "COLA",
    mixer: "bg-[#d92d20] text-white",
    mixerLabel: "COKE",
    surface: "bg-[#f4c8c3]",
  },
  tonic: {
    bottle: "bg-white text-action",
    label: "TONIC",
    mixer: "bg-mint text-action",
    mixerLabel: "FRESH",
    surface: "bg-[#dce8e2]",
  },
  speed: {
    bottle: "bg-[#d7e635] text-ink",
    label: "SPEED",
    mixer: "bg-ink text-white",
    mixerLabel: "ENERGY",
    surface: "bg-[#dbe48c]",
  },
  sevenup: {
    bottle: "bg-[#167c43] text-white",
    label: "7UP",
    mixer: "bg-[#167c43] text-white",
    mixerLabel: "7UP",
    surface: "bg-[#cde3ce]",
  },
  grapefruit: {
    bottle: "bg-[#ef9b78] text-ink",
    label: "POMELO",
    mixer: "bg-[#ef9b78] text-ink",
    mixerLabel: "POMELO",
    surface: "bg-[#f3c7b5]",
  },
  juice: {
    bottle: "bg-[#f0b842] text-ink",
    label: "JUGO",
    mixer: "bg-[#f0b842] text-ink",
    mixerLabel: "JUGO",
    surface: "bg-[#f4d89b]",
  },
  glass: {
    bottle: "bg-white/65 text-action",
    label: "VASO",
    mixer: "bg-mint text-action",
    mixerLabel: "MINI",
    surface: "bg-[#dce8e2]",
  },
  extra: {
    bottle: "bg-[#f1e45c] text-ink",
    label: "EXTRA",
    mixer: "bg-white text-action",
    mixerLabel: "SUMA",
    surface: "bg-[#f3c7a6]",
  },
  packaging: {
    bottle: "bg-action text-white",
    label: "PACK",
    mixer: "bg-mint text-action",
    mixerLabel: "BOX",
    surface: "bg-[#dce8e2]",
  },
} satisfies Record<VisualVariant, Record<string, string>>;

export function ProductVisual({
  variant,
  volumeLabel = "MINI",
  compact = false,
  productType,
  className = "",
}: ProductVisualProps) {
  const style = visualStyles[variant];
  const isExtra = productType === "extra" || productType === "accessory" || productType === "supply";

  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden rounded-[1.25rem] ${style.surface} ${
        compact ? "h-52" : "h-64 sm:h-72"
      } ${className}`}
    >
      <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-[0.65rem] font-black tracking-widest uppercase">
        {volumeLabel}
      </span>
      <div className="absolute -right-5 -bottom-12 size-40 rounded-full border-[24px] border-white/40 sm:size-48" />
      {!productType || productType === "miniature" ? (
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
      {!productType || productType === "mixer" ? (
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
      {!productType || productType === "glass" ? (
        <div
          className={`absolute bottom-4 z-20 h-[42%] w-[26%] rounded-b-2xl border-2 border-white/75 bg-white/25 backdrop-blur-[1px] ${
            productType ? "left-1/2 -translate-x-1/2" : "right-[5%]"
          }`}
        >
          <span className="absolute inset-x-2 bottom-3 h-1/2 rounded-b-xl bg-white/60" />
        </div>
      ) : null}
      {isExtra ? (
        <div className={`absolute top-1/2 left-1/2 grid aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 rotate-6 place-items-center rounded-[1.25rem] border-2 border-ink shadow-[6px_7px_0_#0d0d0d] ${style.bottle}`}>
          <span className="font-display text-sm leading-none uppercase sm:text-lg">{style.label}</span>
        </div>
      ) : null}
    </div>
  );
}
