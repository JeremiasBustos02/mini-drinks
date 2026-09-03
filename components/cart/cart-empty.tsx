import Link from "next/link";

type CartEmptyProps = {
  onNavigate?: () => void;
  compact?: boolean;
};

export function CartEmpty({ onNavigate, compact = false }: CartEmptyProps) {
  return (
    <div className={`rounded-[1.25rem] bg-white text-center ${compact ? "p-6" : "p-8 sm:p-12"}`}>
      <p className="font-display text-2xl leading-none uppercase">Todavía no elegiste nada.</p>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">
        Hay minis, combos y todo para armar el tuyo.
      </p>
      <Link
        href="/productos"
        onClick={onNavigate}
        className="motion-button mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-action bg-action px-5 py-2 text-sm font-bold text-white hover:border-ink hover:bg-ink"
      >
        Ver productos
      </Link>
    </div>
  );
}
