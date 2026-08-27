import type { Metadata } from "next";

import { BackButton } from "@/components/back-button";
import { CatalogBrowser } from "@/components/catalog-browser";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { CatalogCategory } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Catálogo | MINI.",
  description: "Miniaturas, mixers, vasos, extras y combos para hacerte uno.",
};

type CatalogPageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

const catalogCategories: CatalogCategory[] = [
  "combos",
  "miniatures",
  "glasses",
  "mixers",
  "extras",
  "packs",
];

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { categoria } = await searchParams;
  const initialFilter = catalogCategories.includes(categoria as CatalogCategory)
    ? (categoria as CatalogCategory)
    : "all";

  return (
    <>
      <Header />
      <main id="contenido">
        <section className="border-b border-ink/10 bg-white py-14 sm:py-20 lg:py-24">
          <Container>
            <BackButton fallbackHref="/" />
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3rem,11vw,7rem)] leading-[0.9] tracking-[-0.05em] uppercase">
              Todo para hacerte uno.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/65 sm:text-lg">
              Miniaturas, mixers, vasos, extras y combos ya pensados. Elegí
              uno o combiná lo que más te guste.
            </p>
          </Container>
        </section>

        <section className="py-10 sm:py-14 lg:py-18">
          <Container>
            <CatalogBrowser initialFilter={initialFilter} />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
