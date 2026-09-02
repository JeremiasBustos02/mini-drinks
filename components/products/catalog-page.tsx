import { CatalogBrowser } from "@/components/products/catalog-browser";
import type { ProductFilter } from "@/components/products/product-filters";
import { BackButton } from "@/components/ui/back-button";
import { Container } from "@/components/ui/container";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { isCatalogCategory } from "@/lib/catalog";

export type CatalogPageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { categoria } = await searchParams;
  const initialFilter: ProductFilter = isCatalogCategory(categoria) ? categoria : "all";

  return (
    <StorefrontShell>
      <main id="contenido">
        <section className="border-b border-ink/10 bg-white py-14 sm:py-20 lg:py-24">
          <Container>
            <BackButton fallbackHref="/" />
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3rem,11vw,7rem)] leading-[0.9] tracking-[-0.05em] uppercase">
              Todo para hacerte uno.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/65 sm:text-lg">
              Miniaturas, mixers, vasos, extras y combos ya pensados. Elegí uno o combiná lo que más
              te guste.
            </p>
          </Container>
        </section>

        <section className="py-10 sm:py-14 lg:py-18">
          <Container>
            <CatalogBrowser initialFilter={initialFilter} />
          </Container>
        </section>
      </main>
    </StorefrontShell>
  );
}
