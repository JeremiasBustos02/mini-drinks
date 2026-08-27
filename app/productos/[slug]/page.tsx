import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { catalogItems } from "@/data/catalog";
import { BackButton } from "@/components/back-button";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { PurchasePreview } from "@/components/purchase-preview";
import {
  formatPrice,
  getCategoryName,
  getComboStock,
  getItemLabel,
  getProduct,
  getRelatedItems,
  getStockStatus,
  isCombo,
} from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalogItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = catalogItems.find((catalogItem) => catalogItem.slug === slug);

  return {
    title: item ? `${item.name} | MINI.` : "Producto no encontrado | MINI.",
    description: item?.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const item = catalogItems.find((catalogItem) => catalogItem.slug === slug);

  if (!item) notFound();

  const combo = isCombo(item);
  const available = combo ? getComboStock(item) : item.stock;
  const stock = getStockStatus(available);
  const relatedItems = getRelatedItems(item);

  return (
    <>
      <Header />
      <main id="contenido">
        <section className="product-detail-section py-7 sm:py-10 lg:py-14">
          <Container>
            <BackButton fallbackHref="/catalogo" />

            <div className="product-detail-grid mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
              <div className="product-detail-visual lg:sticky lg:top-28">
                <ProductVisual
                  variant={item.image}
                  volumeLabel={item.kind === "product" ? item.volume : "Combo"}
                />
              </div>

              <div className="product-detail-panel rounded-[1.5rem] bg-white p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-black tracking-[0.2em] text-action uppercase">
                    {combo ? "Combo" : `${getItemLabel(item)} · ${getCategoryName(item.category)}`}
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
                        const product = getProduct(component.productId);
                        if (!product) return null;

                        return (
                          <li key={component.productId} className="text-sm font-bold sm:text-base">
                            <span className="font-bold">
                              {component.quantity} × {product.name}
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

                <PurchasePreview available={available} />
              </div>
            </div>
          </Container>
        </section>

        <section className="border-y border-ink/10 bg-white py-10 sm:py-14">
          <Container>
            <div className="grid gap-5 sm:grid-cols-2">
              <article className="rounded-xl bg-canvas p-5 sm:p-6">
                <p className="text-xs font-black tracking-[0.18em] text-action uppercase">Delivery</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65 sm:text-base">
                  Delivery propio en zonas habilitadas de Mar del Plata y Balcarce.
                </p>
              </article>
              <article className="rounded-xl bg-canvas p-5 sm:p-6">
                <p className="text-xs font-black tracking-[0.18em] text-action uppercase">Retiro</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65 sm:text-base">
                  Retiro disponible. Punto y horarios a confirmar antes del lanzamiento.
                </p>
              </article>
            </div>
          </Container>
        </section>

        {relatedItems.length > 0 ? (
          <section className="py-16 sm:py-22 lg:py-28">
            <Container>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.92] uppercase">
                  También te puede gustar.
                </h2>
                <ButtonLink href="/catalogo" variant="secondary">
                  Ver catálogo
                </ButtonLink>
              </div>
              <div className="mt-8 grid gap-5 min-[600px]:grid-cols-2 lg:mt-12 lg:grid-cols-3">
                {relatedItems.map((relatedItem) => (
                  <ProductCard key={relatedItem.id} item={relatedItem} />
                ))}
              </div>
            </Container>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
