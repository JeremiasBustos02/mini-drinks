import Link from "next/link";

import { ArrowIcon } from "@/components/ui/icons";
import { ProductVisual } from "@/components/products/product-visual";
import {
  formatPrice,
  getComboStock,
  getItemLabel,
  getStockStatus,
  isCombo,
} from "@/lib/catalog";
import type { CatalogItem } from "@/types/catalog";

type ProductCardProps = {
  item: CatalogItem;
  variant?: "catalog" | "featured";
  className?: string;
};

export function ProductCard({
  item,
  variant = "catalog",
  className = "",
}: ProductCardProps) {
  const combo = isCombo(item);
  const stock = getStockStatus(combo ? getComboStock(item) : item.stock);
  const showStockStatus = stock.label !== "Disponible";
  const isFeatured = variant === "featured";

  return (
    <article
      className={`product-card group flex flex-col rounded-[1.5rem] bg-white p-3 shadow-[0_1px_0_rgba(13,13,13,0.08)] ${
        isFeatured ? "featured-card" : "h-full"
      } ${className}`}
    >
      <ProductVisual
        variant={item.image}
        volumeLabel={item.kind === "product" ? item.volume : "Combo"}
        className={isFeatured ? "featured-card-visual" : ""}
      />
      <div className={`p-3 pt-5 sm:p-4 sm:pt-5 ${isFeatured ? "" : "flex flex-1 flex-col"}`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <p className="text-xs font-black tracking-[0.16em] text-action uppercase">
            {getItemLabel(item)}
          </p>
          {combo ? (
            <span className="rounded-full bg-mint px-2 py-1 text-[0.6rem] font-black tracking-wide uppercase">
              {item.components.length} incluidos
            </span>
          ) : null}
        </div>
        <h3
          className={`font-display text-2xl leading-none uppercase ${
            isFeatured ? "sm:text-[2rem]" : "min-h-12 sm:min-h-15 sm:text-3xl"
          }`}
        >
          {item.name}
        </h3>
        <p
          className={`mt-3 text-sm leading-relaxed text-ink/65 sm:text-base ${
            isFeatured ? "featured-card-description" : "min-h-[4.5rem] line-clamp-3"
          }`}
        >
          {item.description}
        </p>
        <div
          className={`flex items-end justify-between gap-3 pt-5 ${
            isFeatured ? "" : "mt-auto min-h-13"
          }`}
        >
          <div>
            {combo ? (
              <p className="text-xs font-bold text-ink/45 line-through">
                {formatPrice(item.referencePrice)}
              </p>
            ) : null}
            <p className={`text-xl font-black tracking-tight ${isFeatured ? "featured-card-price" : ""}`}>
              {formatPrice(item.price)}
            </p>
          </div>
          {showStockStatus ? (
            <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase ${stock.tone}`}>
              {stock.label}
            </span>
          ) : null}
        </div>
        <Link
          href={`/productos/${item.slug}`}
          className="product-card-link mt-5 inline-flex items-center gap-2 border-b-2 border-ink pb-1 text-sm font-black transition-colors hover:text-action"
        >
          {combo ? "Ver combo" : "Ver producto"}{" "}
          <ArrowIcon className="product-card-arrow size-4" />
        </Link>
      </div>
    </article>
  );
}
