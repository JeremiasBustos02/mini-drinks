"use client";

type QuantityControlProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  onRemove?: () => void;
  size?: "compact" | "default";
};

export function QuantityControl({
  quantity,
  onChange,
  onRemove,
  size = "default",
}: QuantityControlProps) {
  const buttonSize = size === "compact" ? "size-8 text-base" : "size-10 text-lg";

  return (
    <div className="flex items-center rounded-xl border border-ink/15 bg-white">
      <button
        type="button"
        onClick={() => (quantity === 1 && onRemove ? onRemove() : onChange(quantity - 1))}
        className={`motion-button grid place-items-center font-black ${buttonSize}`}
        aria-label={quantity === 1 && onRemove ? "Eliminar item" : "Restar una unidad"}
      >
        −
      </button>
      <output key={quantity} className="quantity-value grid min-w-8 place-items-center text-sm font-black">
        {quantity}
      </output>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className={`motion-button grid place-items-center font-black ${buttonSize}`}
        aria-label="Sumar una unidad"
      >
        +
      </button>
    </div>
  );
}
