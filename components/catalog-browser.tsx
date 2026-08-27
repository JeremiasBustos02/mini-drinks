"use client";

import { useState } from "react";

import { categories, catalogItems } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";
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
      <div
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
        aria-label="Filtrar catálogo"
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-full border-2 px-4 py-2.5 text-sm font-black transition-colors ${
                isActive
                  ? "border-action bg-action text-white"
                  : "border-ink/15 bg-white text-ink hover:border-ink"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <p className="mt-7 text-sm font-bold text-ink/60" aria-live="polite">
        {visibleItems.length} {visibleItems.length === 1 ? "opción" : "opciones"}
        {activeFilter === "all" ? " para elegir" : " en esta categoría"}.
      </p>

      {visibleItems.length > 0 ? (
        <div className="mt-7 grid gap-5 min-[600px]:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
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
