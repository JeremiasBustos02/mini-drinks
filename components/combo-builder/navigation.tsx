import { ArrowBackIcon, ArrowIcon, CartIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/catalog";

type ComboBuilderNavigationProps = {
  currentStep: number;
  canContinue: boolean;
  complete: boolean;
  added: boolean;
  total: number;
  onBack: () => void;
  onContinue: () => void;
  onAdd: () => void;
};

export function ComboBuilderNavigation({
  currentStep,
  canContinue,
  complete,
  added,
  total,
  onBack,
  onContinue,
  onAdd,
}: ComboBuilderNavigationProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mt-4 border-t border-ink/10 bg-canvas/95 px-4 py-2 backdrop-blur-sm sm:px-6 lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:backdrop-blur-none">
      <div className="mx-auto flex max-w-[90rem] items-center gap-2 lg:max-w-none">
        <button
          type="button"
          disabled={currentStep === 0}
          onClick={onBack}
          className="motion-button inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-ink px-3 py-2 text-[0.8125rem] font-bold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-ink/15 disabled:text-ink/30 disabled:hover:bg-transparent"
        >
          <ArrowBackIcon className="size-4" />
          Atrás
        </button>
        <div className="mr-auto min-w-0 lg:hidden">
          <span className="block text-[0.6rem] font-black tracking-wide text-ink/45 uppercase">
            Total
          </span>
          <span key={total} className="price-update block truncate text-base font-black">
            {formatPrice(total)}
          </span>
        </div>
        {currentStep < 4 ? (
          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className="motion-button ml-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-action bg-action px-3 py-2 text-[0.8125rem] font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-ink/10 disabled:text-ink/35"
          >
            Continuar <ArrowIcon className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!complete}
            onClick={onAdd}
            className="motion-button inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-action bg-action px-3 py-2 text-[0.8125rem] font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45 lg:hidden"
          >
            <CartIcon className="size-5" />
            <span className="hidden min-[390px]:inline">{added ? "Preparado" : "Agregar"}</span>
          </button>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {added ? "Combo agregado al carrito." : ""}
      </span>
    </div>
  );
}
