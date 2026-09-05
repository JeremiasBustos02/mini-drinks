import { ProductCard } from "@/components/products/product-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedCombosWithComponents } from "@/lib/db/queries/combos";
import { mapCombo } from "@/lib/mappers/catalog";

export async function FeaturedCombos() {
  const combos = (await getPublishedCombosWithComponents()).map(mapCombo).slice(0, 4);

  if (combos.length === 0) return null;

  return (
    <section
      id="destacados"
      data-reveal="up"
      className="featured-section py-20 sm:py-28 lg:py-36"
    >
      <Container>
        <SectionHeading
          eyebrow="Combos destacados"
          title="Los que no fallan."
          description="Combinaciones simples, conocidas y listas para resolver ese trago que querés ahora."
        />
        <div className="featured-combos mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:items-stretch">
          {combos.map((product) => (
            <ProductCard
              key={product.id}
              item={product}
              variant="featured"
              className="h-full"
            />
          ))}
        </div>
        <p className="mt-6 text-xs font-medium text-ink/60">
          El precio y la disponibilidad se vuelven a validar al avanzar al checkout.
        </p>
      </Container>
    </section>
  );
}
