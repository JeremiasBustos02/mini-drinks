"use client";

import { useState } from "react";

import { categories, catalogItems } from "@/data/catalog";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import type { CatalogCategory } from "@/types/catalog";

type Filter = "all" | CatalogCategory;

type CatalogBrowserProps = {
  initialFilter?: Filter;
};

const filters: { label: string; value: Filter }[] = [
  { label: "Todos", value: "all" },
  ...categories.map((category) => ({
    label: category.name,
    value: category.slug,
  })),
];

export function CatalogBrowser({ initialFilter = "all" }: CatalogBrowserProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const visibleItems = catalogItems.filter(
    (item) => activeFilter === "all" || item.category === activeFilter,
  );

  return (
    <>
      <ProductFilters
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <p className="mt-7 text-sm font-bold text-ink/60" aria-live="polite">
        {visibleItems.length} {visibleItems.length === 1 ? "opción" : "opciones"}
        {activeFilter === "all" ? " para elegir" : " en esta categoría"}.
      </p>

      {visibleItems.length > 0 ? (
        <ProductGrid items={visibleItems} />
      ) : (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-ink/25 bg-white p-8 sm:p-12">
          <p className="font-display text-3xl leading-none uppercase sm:text-4xl">
            Todavía no hay packs acá.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/65">
            Estamos preparando las primeras opciones para compartir. Mientras
            tanto, podés elegir un combo o armar la tuya con individuales.
          </p>
        </div>
      )}
    </>
  );
}
