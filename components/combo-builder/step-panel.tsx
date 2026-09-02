import type { RefObject } from "react";

import { comboBuilderSteps } from "@/components/combo-builder/config";
import { ComboBuilderNavigation } from "@/components/combo-builder/navigation";
import { ProductOption } from "@/components/combo-builder/product-option";
import { SelectionSummary } from "@/components/combo-builder/selection-summary";
import type { ComboSelection, ExtraOption } from "@/components/combo-builder/types";
import { ProductVisual } from "@/components/products/product-visual";
import type { ComboPricing } from "@/lib/pricing/combo-pricing";
import type { Product } from "@/types/catalog";

type ComboBuilderStepPanelProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  currentStep: number;
  selection: ComboSelection;
  miniatures: Product[];
  mixers: Product[];
  glasses: Product[];
  extraOptions: ExtraOption[];
  miniature?: Product;
  mixer?: Product;
  glass?: Product;
  selectedExtras: ExtraOption[];
  pricing: ComboPricing;
  complete: boolean;
  canContinue: boolean;
  added: boolean;
  onSelectBase: (
    field: "miniatureId" | "mixerId" | "glassId",
    productId: string,
  ) => void;
  onToggleExtra: (productId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onEdit: (step: number) => void;
  onAdd: () => void;
};

export function ComboBuilderStepPanel({
  panelRef,
  currentStep,
  selection,
  miniatures,
  mixers,
  glasses,
  extraOptions,
  miniature,
  mixer,
  glass,
  selectedExtras,
  pricing,
  complete,
  canContinue,
  added,
  onSelectBase,
  onToggleExtra,
  onBack,
  onContinue,
  onEdit,
  onAdd,
}: ComboBuilderStepPanelProps) {
  const step = comboBuilderSteps[currentStep];

  return (
    <div
      ref={panelRef}
      className="combo-builder-panel min-w-0 scroll-mt-28 rounded-[1.25rem] bg-white p-3 sm:p-5 lg:p-6"
    >
      <div
        key={currentStep}
        className="combo-step-heading flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-4"
      >
        <div className="min-w-0">
          <p className="text-xs font-black tracking-[0.18em] text-action uppercase">
            Paso {currentStep + 1} de 5
          </p>
          <h2 className="mt-1.5 max-w-full font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-[0.95] tracking-[-0.035em] uppercase [overflow-wrap:anywhere]">
            {step.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">
            {step.description}
          </p>
        </div>
        {currentStep === 3 ? (
          <span className="rounded-full bg-canvas px-2.5 py-1 text-[0.7rem] font-black uppercase">
            Opcional
          </span>
        ) : null}
      </div>

      {currentStep === 0 ? (
        <div className="combo-step-content combo-builder-options mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
          {miniatures.map((product) => (
            <ProductOption
              key={product.id}
              product={product}
              selected={selection.miniatureId === product.id}
              onSelect={() => onSelectBase("miniatureId", product.id)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="combo-step-content combo-builder-options mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
          {mixers.map((product) => (
            <ProductOption
              key={product.id}
              product={product}
              selected={selection.mixerId === product.id}
              onSelect={() => onSelectBase("mixerId", product.id)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="combo-step-content combo-builder-options mt-5 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {glasses.map((product) => (
            <ProductOption
              key={product.id}
              product={product}
              selected={selection.glassId === product.id}
              onSelect={() => onSelectBase("glassId", product.id)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="combo-step-content combo-builder-options mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {extraOptions.map((option) => (
            <ProductOption
              key={option.product.id}
              product={option.product}
              displayName={option.displayName}
              caption={option.caption}
              selected={selection.extraIds.includes(option.product.id)}
              onSelect={() => onToggleExtra(option.product.id)}
              multi
            />
          ))}
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="combo-step-content mt-5">
          <div className="grid items-center gap-4 overflow-hidden rounded-[1.1rem] bg-action p-4 text-white sm:grid-cols-[0.85fr_1.15fr] sm:p-5">
            {miniature ? (
              <ProductVisual
                variant={miniature.image}
                volumeLabel="Tu combo"
                compact
                className="!h-44 sm:!h-48"
              />
            ) : null}
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-mint uppercase">
                Uno. Y listo.
              </p>
              <h3 className="mt-2 font-display text-2xl leading-none uppercase sm:text-3xl">
                Lo armaste a tu manera.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Packaging, sticker y tarjeta sorpresa ya vienen incluidos como parte de la experiencia.
              </p>
            </div>
          </div>
          <div className="mt-4 lg:hidden">
            <SelectionSummary
              miniature={miniature}
              mixer={mixer}
              glass={glass}
              extras={selectedExtras}
              pricing={pricing}
              currentStep={currentStep}
              complete={complete}
              added={added}
              showAction={false}
              onEdit={onEdit}
              onAdd={onAdd}
            />
          </div>
        </div>
      ) : null}

      <ComboBuilderNavigation
        currentStep={currentStep}
        canContinue={canContinue}
        complete={complete}
        added={added}
        total={pricing.finalPrice}
        onBack={onBack}
        onContinue={onContinue}
        onAdd={onAdd}
      />
    </div>
  );
}
