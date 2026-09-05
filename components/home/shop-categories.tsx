import Link from "next/link";

import { ArrowIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { homeCategories } from "@/data/home";

export function ShopCategories() {
  return (
    <section
      data-reveal="fade"
      className="buy-section bg-white py-20 sm:py-28"
      aria-labelledby="comprar-title"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
          <div className="home-sticky-title">
            <p className="mb-3 text-xs font-black tracking-[0.2em] text-action uppercase">
              Hay más de una forma
            </p>
            <h2
              id="comprar-title"
              className="buy-title font-display text-[clamp(2.5rem,9vw,5.4rem)] leading-[0.95] tracking-[-0.04em] uppercase"
            >
              ¿Que podes comprar?
            </h2>
          </div>
          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {homeCategories.map((category) => (
              <Link
                key={category.number}
                href={category.href}
                className="category-link group grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 py-7 transition-colors active:bg-mint/30 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-6 sm:py-9"
              >
                <span className="text-xs font-black text-action">{category.number}</span>
                <div>
                  <h3 className="font-display text-2xl leading-none uppercase sm:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/60 sm:text-base">
                    {category.copy}
                  </p>
                </div>
                <span className="category-arrow col-start-2 grid size-8 place-items-center justify-self-end rounded-full border border-ink/40 text-action transition-transform group-active:translate-x-1 sm:col-auto sm:size-12 sm:border-2 sm:text-ink sm:group-hover:bg-mint">
                  <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
