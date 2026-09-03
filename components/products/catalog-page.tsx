import { CatalogBrowser } from "@/components/products/catalog-browser";
import type { ProductFilter } from "@/components/products/product-filters";
import { BackButton } from "@/components/ui/back-button";
import { Container } from "@/components/ui/container";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getPublishedCombosWithComponents } from "@/lib/db/queries/combos";
import { getActiveCategories, getPublishedProductsWithCategories } from "@/lib/db/queries/products";
import { mapCategory, mapCombo, mapProduct } from "@/lib/mappers/catalog";

export type CatalogPageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { categoria } = await searchParams;
  let items;
  let categories;

  try {
    const [products, combos, categoryRecords] = await Promise.all([
      getPublishedProductsWithCategories(),
      getPublishedCombosWithComponents(),
      getActiveCategories(),
    ]);
    items = [...combos.map(mapCombo), ...products.map(({ product, category }) => mapProduct({ ...product, category }))];
    categories = categoryRecords.map(mapCategory);
  } catch (error) {
    console.error("Unable to load the product catalog.", error);
    throw error;
  }

  const initialFilter: ProductFilter =
    categoria === "combos" || categories.some((category) => category.slug === categoria)
      ? categoria ?? "all"
      : "all";

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
            <CatalogBrowser initialFilter={initialFilter} items={items} categories={categories} />
          </Container>
        </section>
      </main>
    </StorefrontShell>
  );
}
