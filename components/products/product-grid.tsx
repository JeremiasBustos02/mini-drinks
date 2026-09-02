import { ProductCard } from "@/components/products/product-card";
import type { CatalogItem } from "@/types/catalog";

type ProductGridProps = {
  items: CatalogItem[];
};

export function ProductGrid({ items }: ProductGridProps) {
  return (
    <div className="catalog-grid mt-7 grid gap-5 min-[600px]:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}
