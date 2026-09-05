"use client";

import { useRef, useState } from "react";

import { createCustomComboCartItem } from "@/lib/cart/cart-item-factories";
import { CHECKOUT_MAX_LINE_QUANTITY } from "@/lib/checkout/limits";
import { ComboBuilderProgress } from "@/components/combo-builder/progress";
import { SelectionSummary } from "@/components/combo-builder/selection-summary";
import { ComboBuilderStepPanel } from "@/components/combo-builder/step-panel";
import type {
  ComboBuilderCombo,
  ComboBuilderProduct,
  ComboSelection,
} from "@/components/combo-builder/types";
import { getDerivedProductStock } from "@/lib/catalog/availability";
import { calculateComboPrice } from "@/lib/pricing/combo-pricing";
import { useCartStore } from "@/store/cart-store";
import type { ComboItem } from "@/types/catalog";

type ComboBuilderProps = {
  products: ComboBuilderProduct[];
  combos: ComboBuilderCombo[];
};

export function ComboBuilder({ products, combos }: ComboBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState<ComboSelection>({
    miniatureId: null,
    mixerId: null,
    glassId: null,
    extraIds: [],
  });
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const stepPanelRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  const miniatures = products.filter((product) => product.productType === "miniature");
  const mixers = products.filter((product) => product.productType === "mixer");
  const glasses = products.filter((product) => product.productType === "glass");
  const extraOptions = products
    .filter((product) => product.productType === "extra" || product.productType === "accessory")
    .map((product) => ({
      product,
      displayName: product.name,
      caption: product.description,
    }));

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
  const productsById = new Map(products.map((product) => [product.id, product]));
  const availableQuantity = getDerivedProductStock(
    [...baseComponents, ...extraComponents].map((component) => ({
      productId: component.productId,
      quantity: component.quantity,
      stock: productsById.get(component.productId)?.stock ?? 0,
      available: productsById.has(component.productId),
    })),
  );
  const complete = Boolean(miniature && mixer && glass && pricing.ok && availableQuantity > 0);
  const canContinue =
    (currentStep === 0 && Boolean(miniature)) ||
    (currentStep === 1 && Boolean(mixer)) ||
    (currentStep === 2 && Boolean(glass)) ||
    currentStep >= 3;

  function goToStep(nextStep: number) {
    setCurrentStep(nextStep);
    setAdded(false);
    requestAnimationFrame(() => {
      stepPanelRef.current?.scrollIntoView({ block: "start" });
    });
  }

  function selectBase(field: "miniatureId" | "mixerId" | "glassId", productId: string) {
    setSelection((current) => ({ ...current, [field]: productId }));
    setQuantity(1);
    setAdded(false);
  }

  function toggleExtra(productId: string) {
    setSelection((current) => ({
      ...current,
      extraIds: current.extraIds.includes(productId)
        ? current.extraIds.filter((id) => id !== productId)
        : [...current.extraIds, productId],
    }));
    setQuantity(1);
    setAdded(false);
  }

  function addCombo() {
    if (!complete || currentStep !== 4 || !miniature || !mixer || !glass || !pricing.ok) return;

    addItem(
      createCustomComboCartItem({
        configuration: {
          miniatureId: miniature.id,
          mixerId: mixer.id,
          glassId: glass.id,
          extraIds: selection.extraIds,
        },
        components: [
          { product: miniature, quantity: 1 },
          { product: mixer, quantity: 1 },
          { product: glass, quantity: 1 },
          ...selectedExtras.map((extra) => ({ product: extra.product, quantity: 1 })),
        ],
        unitPrice: pricing.finalPrice,
        matchedCombo: pricing.matchingCombo,
        savings: pricing.savings,
      }),
      quantity,
    );
    setAdded(true);
  }

  return (
    <div className="combo-builder min-w-0 mt-6 lg:mt-7">
      <ComboBuilderProgress currentStep={currentStep} />

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-6">
        <ComboBuilderStepPanel
          panelRef={stepPanelRef}
          currentStep={currentStep}
          selection={selection}
          miniatures={miniatures}
          mixers={mixers}
          glasses={glasses}
          extraOptions={extraOptions}
          miniature={miniature}
          mixer={mixer}
          glass={glass}
          selectedExtras={selectedExtras}
          pricing={pricing}
          complete={complete}
          canContinue={canContinue}
          added={added}
          quantity={quantity}
          maximumQuantity={Math.min(availableQuantity, CHECKOUT_MAX_LINE_QUANTITY)}
          onSelectBase={selectBase}
          onToggleExtra={toggleExtra}
          onBack={() => goToStep(currentStep - 1)}
          onContinue={() => goToStep(currentStep + 1)}
          onEdit={goToStep}
          onAdd={addCombo}
          onQuantityChange={(nextQuantity) => {
            setQuantity(Math.min(availableQuantity, CHECKOUT_MAX_LINE_QUANTITY, Math.max(1, nextQuantity)));
            setAdded(false);
          }}
        />

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
