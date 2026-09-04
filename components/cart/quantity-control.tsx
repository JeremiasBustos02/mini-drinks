"use client";

type QuantityControlProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  onRemove?: () => void;
  maximum?: number;
  size?: "compact" | "default";
};

export function QuantityControl({
  quantity,
  onChange,
  onRemove,
  maximum,
  size = "default",
}: QuantityControlProps) {
  const buttonSize = size === "compact" ? "size-8 text-base" : "size-10 text-lg";

  return (
    <div className="flex items-center rounded-xl border border-ink/15 bg-white">
      <button
        type="button"
        onClick={() => (quantity === 1 && onRemove ? onRemove() : onChange(quantity - 1))}
        disabled={quantity === 1 && !onRemove}
        className={`motion-button grid place-items-center font-black disabled:cursor-not-allowed disabled:opacity-30 ${buttonSize}`}
        aria-label={quantity === 1 && onRemove ? "Eliminar item" : "Restar una unidad"}
      >
        −
      </button>
      <output key={quantity} className="quantity-value grid min-w-8 place-items-center text-sm font-black">
        {quantity}
      </output>
      <button
        type="button"
        disabled={maximum !== undefined && quantity >= maximum}
        onClick={() => onChange(quantity + 1)}
        className={`motion-button grid place-items-center font-black disabled:cursor-not-allowed disabled:opacity-30 ${buttonSize}`}
        aria-label="Sumar una unidad"
      >
        +
      </button>
    </div>
  );
}
