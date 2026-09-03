import { ProductVisual } from "@/components/products/product-visual";
import { PurchasePreview } from "@/components/products/purchase-preview";
import { BackButton } from "@/components/ui/back-button";
import { Container } from "@/components/ui/container";
import {
  formatPrice,
  getItemLabel,
  getStockStatus,
  isCombo,
} from "@/lib/catalog";
import type { CatalogItem } from "@/types/catalog";

type ProductDetailProps = {
  item: CatalogItem;
};

export function ProductDetail({ item }: ProductDetailProps) {
  const combo = isCombo(item);
  const stock = getStockStatus(item.available);

  return (
    <section className="product-detail-section py-7 sm:py-10 lg:py-14">
      <Container>
        <BackButton fallbackHref="/productos" />

        <div className="product-detail-grid mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
          <div className="product-detail-visual lg:sticky lg:top-28">
            <ProductVisual
              variant={item.image}
              imageUrl={item.imageUrl}
              volumeLabel={item.kind === "product" ? item.volume : "Combo"}
              className="product-detail-media"
            />
          </div>

          <div className="product-detail-panel rounded-[1.5rem] bg-white p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black tracking-[0.2em] text-action uppercase">
                {combo ? "Combo" : `${getItemLabel(item)} · ${item.categoryName ?? item.category}`}
              </p>
              {stock.label !== "Disponible" ? (
                <span className={`rounded-full px-3 py-1.5 text-xs font-black uppercase ${stock.tone}`}>
                  {stock.label}
                </span>
              ) : null}
            </div>
            <h1 className="product-detail-title mt-5 font-display text-[clamp(3rem,9vw,6rem)] leading-[0.91] tracking-[-0.05em] uppercase">
              {item.name}
            </h1>
            <p className="detail-description mt-5 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
              {item.description}
            </p>

            <div className="detail-price mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
              {combo ? (
                <p className="text-base font-bold text-ink/45 line-through">
                  {formatPrice(item.referencePrice)}
                </p>
              ) : null}
              <p className="detail-current-price text-3xl font-black tracking-tight">
                {formatPrice(item.price)}
              </p>
              {combo && item.referencePrice > item.price ? (
                <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-black uppercase">
                  Ahorrás {formatPrice(item.referencePrice - item.price)}
                </span>
              ) : null}
            </div>

            {combo ? (
              <section className="detail-includes mt-9 border-t border-ink/10 pt-8" aria-labelledby="incluye-title">
                <h2 id="incluye-title" className="font-display text-3xl leading-none uppercase">
                  Incluye
                </h2>
                <ul className="mt-5 space-y-3">
                  {item.components.map((component) => {
                    return (
                      <li key={component.productId} className="text-sm font-bold sm:text-base">
                        <span className="font-bold">
                          {component.quantity} × {component.name ?? "Producto"}
                        </span>
                      </li>
                    );
                  })}
                  <li className="text-sm font-bold sm:text-base">
                    Packaging, sticker y tarjeta sorpresa
                  </li>
                </ul>
              </section>
            ) : (
              <div className="mt-8">
                {item.volume ? (
                  <span className="text-xs font-black tracking-[0.18em] text-action uppercase">
                    {item.volume}
                  </span>
                ) : null}
              </div>
            )}

            {combo && item.optionalExtras?.length ? (
              <section className="detail-extras mt-8 rounded-xl bg-canvas p-5" aria-labelledby="extras-title">
                <p id="extras-title" className="text-xs font-black tracking-[0.18em] text-action uppercase">
                  Extras opcionales
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {item.optionalExtras.join(" · ")} estarán disponibles al armar el pedido.
                </p>
              </section>
            ) : null}

            <PurchasePreview item={item} available={item.available} />
          </div>
        </div>
      </Container>
    </section>
  );
}
