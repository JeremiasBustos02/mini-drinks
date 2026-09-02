import { ProductCard } from "@/components/products/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import type { CatalogItem } from "@/types/catalog";

type RelatedProductsProps = {
  items: CatalogItem[];
};

export function RelatedProducts({ items }: RelatedProductsProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-22 lg:py-28">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.92] uppercase">
            También te puede gustar.
          </h2>
          <ButtonLink href="/productos" variant="secondary">
            Ver catálogo
          </ButtonLink>
        </div>
        <div className="mt-8 grid gap-5 min-[600px]:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
