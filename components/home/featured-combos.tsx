import { ProductCard } from "@/components/products/product-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { combos } from "@/data/combos";

export function FeaturedCombos() {
  return (
    <section id="destacados" className="featured-section py-20 sm:py-28 lg:py-36">
      <Container>
        <SectionHeading
          eyebrow="Combos destacados"
          title="Los que no fallan."
          description="Combinaciones simples, conocidas y listas para resolver ese trago que querés ahora."
        />
        <div className="featured-combos mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:items-start">
          {combos.map((product, index) => (
            <ProductCard
              key={product.id}
              item={product}
              variant="featured"
              className={index % 2 === 1 ? "lg:mt-12" : ""}
            />
          ))}
        </div>
        <p className="mt-6 text-xs font-medium text-ink/60">
          Imágenes y precios finales pendientes. Las composiciones son placeholders visuales.
        </p>
      </Container>
    </section>
  );
}
