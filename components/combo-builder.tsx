"use client";

import { useRef, useState } from "react";

import { ArrowBackIcon, ArrowIcon, CartIcon } from "@/components/icons";
import { ProductVisual } from "@/components/product-visual";
import { calculateComboPrice } from "@/lib/combo-builder";
import { formatPrice } from "@/lib/catalog";
import type { Combo, ComboItem, Product } from "@/types/catalog";

type ComboBuilderProps = {
  products: Product[];
  combos: Combo[];
};

type Selection = {
  miniatureId: string | null;
  mixerId: string | null;
  glassId: string | null;
  extraIds: string[];
};

type ExtraOption = {
  product: Product;
  displayName: string;
  caption: string;
};

const steps = [
  {
    short: "Mini",
    title: "Elegí tu miniatura",
    description: "La protagonista de tu combo. Elegí la que tengas ganas de tomar hoy.",
  },
  {
    short: "Mixer",
    title: "Elegí tu mixer",
    description: "Clásico, cítrico o con energía. Acá no hay combinaciones prohibidas.",
  },
  {
    short: "Vaso",
    title: "Elegí tu vaso",
    description: "Hoy hay un modelo. El paso queda listo para sumar nuevas ediciones.",
  },
  {
    short: "Extras",
    title: "Sumá extras",
    description: "Este paso es opcional. Podés elegir todos los que quieras.",
  },
  {
    short: "Listo",
    title: "Así quedó tu combo",
    description: "Revisá lo que elegiste. Si coincide con un combo, el mejor precio ya está aplicado.",
  },
] as const;

const extraDefinitions = [
  {
    productId: "golosina-extra",
    displayName: "Golosina",
    caption: "Un toque dulce para acompañar.",
  },
  {
    productId: "sorbete-rayado",
    displayName: "Sorbete",
    caption: "El detalle simple que completa el vaso.",
  },
  {
    productId: "vaso-mini",
    displayName: "Segundo vaso",
    caption: "Por si este mini se comparte.",
  },
  {
    productId: "packaging-especial",
    displayName: "Packaging especial",
    caption: "Para regalar o hacerlo más especial.",
  },
] as const;

type ProductOptionProps = {
  product: Product;
  selected: boolean;
  onSelect: () => void;
  displayName?: string;
  caption?: string;
  multi?: boolean;
};

function ProductOption({
  product,
  selected,
  onSelect,
  displayName = product.name,
  caption,
  multi = false,
}: ProductOptionProps) {
  const unavailable = product.stock === 0;

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={unavailable}
      onClick={onSelect}
      className={`combo-builder-option group relative flex h-full min-w-0 flex-col rounded-[1.1rem] border-2 p-1.5 text-left transition-[border-color,background-color,box-shadow,transform] disabled:cursor-not-allowed disabled:opacity-50 sm:p-2 ${
        selected
          ? "border-action bg-mint/25 shadow-[4px_5px_0_#024018]"
          : "border-transparent bg-canvas hover:-translate-y-0.5 hover:border-ink/20"
      }`}
    >
      <ProductVisual
        variant={product.image}
        volumeLabel={product.volume ?? (multi ? "Extra" : "Mini")}
        productType={product.productType}
        compact
        className="combo-builder-option-visual !h-28 w-full sm:!h-32"
      />
      <span className="combo-builder-option-content flex min-h-20 w-full flex-1 flex-col px-1.5 pt-2.5 pb-1.5 sm:min-h-22 sm:px-2 sm:pt-3">
        <span className="font-display text-sm leading-[1.05] uppercase sm:text-base">
          {displayName}
        </span>
        {caption ? (
          <span className="mt-1.5 line-clamp-2 text-[0.7rem] leading-relaxed text-ink/60">
            {caption}
          </span>
        ) : null}
        <span className="mt-auto pt-2 text-xs font-black sm:text-sm">{formatPrice(product.price)}</span>
      </span>
      {selected ? (
        <span className="absolute top-3 right-3 rounded-full bg-action px-2 py-0.5 text-[0.55rem] font-black tracking-wide text-white uppercase shadow-sm">
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

type SelectionSummaryProps = {
  miniature?: Product;
  mixer?: Product;
  glass?: Product;
  extras: ExtraOption[];
  pricing: ReturnType<typeof calculateComboPrice>;
  currentStep: number;
  complete: boolean;
  added: boolean;
  showAction?: boolean;
  onEdit: (step: number) => void;
  onAdd: () => void;
};

function SelectionSummary({
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
    <div className="rounded-[1.25rem] bg-white p-4 shadow-[0_1px_0_rgba(13,13,13,0.08)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-action uppercase">
            Tu combo
          </p>
          <h2 className="mt-1.5 font-display text-xl leading-none uppercase sm:text-2xl">
            Lo que elegiste
          </h2>
        </div>
        <span className="rounded-full bg-mint px-2.5 py-1 text-[0.7rem] font-black">
          {currentStep + 1}/5
        </span>
      </div>

      <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto] gap-2 py-2.5">
            <div className="min-w-0">
              <dt className="text-[0.6rem] font-black tracking-[0.14em] text-ink/45 uppercase">
                {row.label}
              </dt>
              <dd className="mt-0.5 text-[0.8rem] leading-snug font-bold sm:text-sm">{row.value}</dd>
            </div>
            <button
              type="button"
              disabled={!row.canEdit}
              onClick={() => onEdit(row.step)}
              className="self-center text-[0.7rem] font-black text-action underline decoration-2 underline-offset-4 disabled:cursor-not-allowed disabled:text-ink/30 disabled:no-underline"
            >
              {row.canEdit ? "Cambiar" : "Pendiente"}
            </button>
          </div>
        ))}
      </dl>

      {pricing.matchingCombo ? (
        <div className="mt-3 rounded-xl bg-mint/60 p-3">
          <p className="text-[0.7rem] font-black tracking-[0.12em] text-action uppercase">
            Mejor precio activado
          </p>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-ink/70">
            Esta combinación coincide con uno de nuestros combos. Te aplicamos el mejor precio.
          </p>
          <p className="mt-1.5 text-[0.8rem] font-black">{pricing.matchingCombo.name}</p>
        </div>
      ) : null}

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-[0.8rem] text-ink/60">
          <span>Componentes</span>
          <span className={pricing.savings > 0 ? "line-through" : ""}>
            {formatPrice(pricing.componentsPrice)}
          </span>
        </div>
        {pricing.extrasPrice > 0 ? (
          <div className="flex items-center justify-between gap-3 text-[0.8rem] text-ink/60">
            <span>Extras</span>
            <span>{formatPrice(pricing.extrasPrice)}</span>
          </div>
        ) : null}
        {pricing.savings > 0 ? (
          <div className="flex items-center justify-between gap-3 text-[0.8rem] font-black text-action">
            <span>Ahorrás</span>
            <span>{formatPrice(pricing.savings)}</span>
          </div>
        ) : null}
        <div className="flex items-end justify-between gap-3 border-t-2 border-ink pt-3">
          <span className="text-sm font-black">Total</span>
          <span className="text-2xl font-black tracking-tight sm:text-3xl">
            {formatPrice(pricing.finalPrice)}
          </span>
        </div>
      </div>

      {showAction ? (
        <button
          type="button"
          disabled={!complete || currentStep !== 4}
          onClick={onAdd}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-action bg-action px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-ink/10 disabled:text-ink/45"
        >
          <CartIcon className="size-5" />
          {added ? "Combo preparado" : currentStep === 4 ? "Agregar al carrito" : "Completá los pasos"}
        </button>
      ) : null}

      {added ? (
        <p className="mt-2 text-center text-[0.8rem] font-bold text-action" role="status">
          Listo. El carrito real se conecta en la próxima etapa.
        </p>
      ) : null}
    </div>
  );
}

export function ComboBuilder({ products, combos }: ComboBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState<Selection>({
    miniatureId: null,
    mixerId: null,
    glassId: null,
    extraIds: [],
  });
  const [added, setAdded] = useState(false);
  const stepPanelRef = useRef<HTMLDivElement>(null);

  const miniatures = products.filter(
    (product) => product.published && product.productType === "miniature",
  );
  const mixers = products.filter(
    (product) => product.published && product.productType === "mixer",
  );
  const glasses = products.filter(
    (product) => product.published && product.productType === "glass",
  );
  const extraOptions = extraDefinitions.flatMap((definition) => {
    const product = products.find(
      (candidate) => candidate.id === definition.productId && candidate.published,
    );
    return product ? [{ product, ...definition }] : [];
  });

  const miniature = products.find((product) => product.id === selection.miniatureId);
  const mixer = products.find((product) => product.id === selection.mixerId);
  const glass = products.find((product) => product.id === selection.glassId);
  const selectedExtras = extraOptions.filter((option) =>
    selection.extraIds.includes(option.product.id),
  );
  const baseProductIds = [selection.miniatureId, selection.mixerId, selection.glassId].filter(
    (productId): productId is string => productId !== null,
  );
  const baseComponents: ComboItem[] = baseProductIds.map((productId) => ({
    productId,
    quantity: 1,
  }));
  const extraComponents: ComboItem[] = selection.extraIds.map((productId) => ({
    productId,
    quantity: 1,
  }));
  const pricing = calculateComboPrice(baseComponents, extraComponents, products, combos);
  const complete = Boolean(miniature && mixer && glass);
  const canContinue =
    (currentStep === 0 && Boolean(miniature)) ||
    (currentStep === 1 && Boolean(mixer)) ||
    (currentStep === 2 && Boolean(glass)) ||
    currentStep >= 3;
  const step = steps[currentStep];

  function goToStep(nextStep: number) {
    setCurrentStep(nextStep);
    setAdded(false);
    requestAnimationFrame(() => {
      stepPanelRef.current?.scrollIntoView({ block: "start" });
    });
  }

  function selectBase(field: "miniatureId" | "mixerId" | "glassId", productId: string) {
    setSelection((current) => ({ ...current, [field]: productId }));
    setAdded(false);
  }

  function toggleExtra(productId: string) {
    setSelection((current) => ({
      ...current,
      extraIds: current.extraIds.includes(productId)
        ? current.extraIds.filter((id) => id !== productId)
        : [...current.extraIds, productId],
    }));
    setAdded(false);
  }

  function addCombo() {
    if (complete && currentStep === 4) setAdded(true);
  }

  return (
    <div className="combo-builder min-w-0 mt-6 lg:mt-7">
      <ol aria-label="Progreso del armado" className="grid grid-cols-5 gap-2">
        {steps.map((item, index) => (
          <li
            key={item.short}
            aria-current={index === currentStep ? "step" : undefined}
            className={index === currentStep ? "text-action" : "text-ink/45"}
          >
            <span
              className={`block h-1.5 rounded-full ${
                index <= currentStep ? (index === currentStep ? "bg-action" : "bg-ink") : "bg-ink/10"
              }`}
            />
            <span className="mt-1.5 block text-center text-[0.6rem] font-black uppercase sm:text-[0.7rem]">
              <span className="sm:hidden">0{index + 1}</span>
              <span className="hidden sm:inline">{item.short}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-6">
        <div
          ref={stepPanelRef}
          className="combo-builder-panel min-w-0 scroll-mt-28 rounded-[1.25rem] bg-white p-3 sm:p-5 lg:p-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-4">
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
            <div className="combo-builder-options mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
              {miniatures.map((product) => (
                <ProductOption
                  key={product.id}
                  product={product}
                  selected={selection.miniatureId === product.id}
                  onSelect={() => selectBase("miniatureId", product.id)}
                />
              ))}
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="combo-builder-options mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
              {mixers.map((product) => (
                <ProductOption
                  key={product.id}
                  product={product}
                  selected={selection.mixerId === product.id}
                  onSelect={() => selectBase("mixerId", product.id)}
                />
              ))}
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="combo-builder-options mt-5 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {glasses.map((product) => (
                <ProductOption
                  key={product.id}
                  product={product}
                  selected={selection.glassId === product.id}
                  onSelect={() => selectBase("glassId", product.id)}
                />
              ))}
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="combo-builder-options mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {extraOptions.map((option) => (
                <ProductOption
                  key={option.product.id}
                  product={option.product}
                  displayName={option.displayName}
                  caption={option.caption}
                  selected={selection.extraIds.includes(option.product.id)}
                  onSelect={() => toggleExtra(option.product.id)}
                  multi
                />
              ))}
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="mt-5">
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
                  onEdit={goToStep}
                  onAdd={addCombo}
                />
              </div>
            </div>
          ) : null}

          <div className="fixed inset-x-0 bottom-0 z-40 mt-5 border-t border-ink/10 bg-canvas/95 px-4 py-2.5 backdrop-blur-sm sm:px-6 lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:backdrop-blur-none">
            <div className="mx-auto flex max-w-[90rem] items-center gap-2.5 lg:max-w-none">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => goToStep(currentStep - 1)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-ink px-3.5 py-2.5 text-sm font-bold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-ink/15 disabled:text-ink/30 disabled:hover:bg-transparent"
              >
                <ArrowBackIcon className="size-4" />
                Atrás
              </button>
              <div className="mr-auto min-w-0 lg:hidden">
                <span className="block text-[0.6rem] font-black tracking-wide text-ink/45 uppercase">
                  Total
                </span>
                <span className="block truncate text-base font-black">
                  {formatPrice(pricing.finalPrice)}
                </span>
              </div>
              {currentStep < 4 ? (
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => goToStep(currentStep + 1)}
                  className="ml-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-action bg-action px-3.5 py-2.5 text-sm font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-ink/10 disabled:text-ink/35"
                >
                  Continuar <ArrowIcon className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!complete}
                  onClick={addCombo}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-action bg-action px-3.5 py-2.5 text-sm font-bold text-white transition-colors hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45 lg:hidden"
                >
                  <CartIcon className="size-5" />
                  <span className="hidden min-[390px]:inline">
                    {added ? "Preparado" : "Agregar"}
                  </span>
                </button>
              )}
            </div>
            <span className="sr-only" aria-live="polite">
              {added ? "Combo preparado. El carrito real se conectará en la próxima etapa." : ""}
            </span>
          </div>
        </div>

        <aside
          aria-label="Resumen de tu combo"
          className="sticky top-[calc(var(--header-height)+0.75rem)] hidden self-start lg:block"
        >
          <SelectionSummary
            miniature={miniature}
            mixer={mixer}
            glass={glass}
            extras={selectedExtras}
            pricing={pricing}
            currentStep={currentStep}
            complete={complete}
            added={added}
            onEdit={goToStep}
            onAdd={addCombo}
          />
        </aside>
      </div>
    </div>
  );
}
