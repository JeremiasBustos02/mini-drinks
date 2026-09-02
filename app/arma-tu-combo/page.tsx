import type { Metadata } from "next";

import { ComboBuilder } from "@/components/combo-builder/combo-builder";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Container } from "@/components/ui/container";
import { combos, products } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Armá tu combo | MINI.",
  description: "Elegí miniatura, mixer, vaso y extras. El mejor precio se aplica automáticamente.",
};

export default function BuildYourComboPage() {
  return (
    <StorefrontShell>
      <main id="contenido">
        <section className="combo-page overflow-clip pt-6 pb-24 sm:pt-8 sm:pb-28 lg:py-10">
          <Container>
            <div className="combo-page-intro grid min-w-0 items-end gap-4 lg:grid-cols-[1fr_0.55fr] lg:gap-9">
              <div className="min-w-0">
                <p className="text-xs font-black tracking-[0.2em] text-action uppercase">
                  Armá el tuyo
                </p>
                <h1 className="mt-2 max-w-5xl font-display text-[clamp(2.1rem,6.5vw,5rem)] leading-[0.88] tracking-[-0.055em] uppercase [overflow-wrap:anywhere]">
                  <span className="block">Tu combo.</span>
                  <span className="block text-action">A tu manera.</span>
                </h1>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-ink/65 sm:text-base lg:pb-1">
                Cinco pasos, cero vueltas. Elegí cada parte a tu manera.
              </p>
            </div>

            <ComboBuilder products={products} combos={combos} />
          </Container>
        </section>
      </main>
    </StorefrontShell>
  );
}
