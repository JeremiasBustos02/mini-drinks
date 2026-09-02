import type { CatalogCategory } from "@/types/catalog";

export type ProductFilter = "all" | CatalogCategory;

type ProductFiltersProps = {
  filters: { label: string; value: ProductFilter }[];
  activeFilter: ProductFilter;
  onFilterChange: (filter: ProductFilter) => void;
};

export function ProductFilters({
  filters,
  activeFilter,
  onFilterChange,
}: ProductFiltersProps) {
  return (
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
            onClick={() => onFilterChange(filter.value)}
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
  );
}
