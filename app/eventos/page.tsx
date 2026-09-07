import type { Metadata } from "next";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { OccasionSelector } from "@/components/events/occasion-selector";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Eventos | Mini Drinks",
  description: "Packs y minis para hacer que cada celebración se sienta distinta.",
};

export default function EventsPage() {
  return (
    <StorefrontShell>
      <main id="contenido" className="events-page overflow-hidden bg-canvas">
        <section className="events-hero relative isolate -mt-[var(--header-height)] flex min-h-svh items-center overflow-hidden pt-[calc(var(--header-height)+2.5rem)] pb-12 text-white sm:pt-[calc(var(--header-height)+3.5rem)] sm:pb-16 lg:pt-[calc(var(--header-height)+4rem)] lg:pb-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="events-hero-background" alt="" aria-hidden="true" src="/background-hero.webp" />
          <div className="events-hero-overlay" aria-hidden="true" />
          <Container className="relative w-full">
            <div className="relative z-10 max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-mint">Eventos</p>
              <h1 className="mt-4 font-display text-[clamp(4rem,9vw,8rem)] leading-[.82] tracking-[-.065em] uppercase">El mini también es parte del plan.</h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-white/75 sm:text-lg">Cumpleaños, previas, regalos y juntadas con algo chico que se hace notar.</p>
              <ButtonLink href="/productos?categoria=combos" variant="heroPrimary" className="mt-8">Ver packs</ButtonLink>
            </div>
          </Container>
        </section>

        <Container className="py-16 sm:py-20">
          <section className="events-occasions">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-action">Para lo que venga</p>
              <h2 className="events-occasions-title mt-3 font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[.9] tracking-[-.055em] uppercase">
                <span>No hace falta una</span>
                <span>excusa gigante.</span>
              </h2>
            </div>
            <OccasionSelector />
          </section>
        </Container>

        <section className="events-formats relative isolate overflow-hidden bg-ink py-16 text-white sm:py-20">
          <div className="events-formats-line" aria-hidden="true"><svg viewBox="0 0 1440 360" preserveAspectRatio="none"><path d="M-35 272C185 123 316 319 519 202c170-98 257-131 400-50 160 90 294-35 557-91" fill="none" stroke="currentColor" strokeWidth="4" /></svg></div>
          <Container className="events-formats-layout relative">
            <div className="events-formats-intro">
              <p className="text-xs font-black uppercase tracking-[.18em] text-mint">Formatos para el plan</p>
              <h2>Elegí cómo llevarlo.</h2>
            </div>
            <div className="events-formats-list" aria-label="Formatos disponibles">
              <article><h3>PACKS</h3><p>Todo resuelto.</p></article>
              <article><h3>COMBOS</h3><p>Mezclá tus favoritos.</p></article>
              <article><h3>MINIS</h3><p>Elegí una por una.</p></article>
            </div>
            <div className="events-formats-close">
              <p>Vos elegís el formato. Nosotros ponemos los minis.</p>
              <ButtonLink href="/productos?categoria=combos" variant="lightdark">Ver packs</ButtonLink>
            </div>
          </Container>
        </section>

        <Container className="py-16 sm:py-20">
          <section className="events-final">
            <div>
              <p className="events-final-kicker">CHICO + DISTINTO + LISTO PARA LLEVAR</p>
              <h2>Que el plan empiece antes del primer brindis.</h2>
            </div>
            <ButtonLink href="/productos">Ver productos</ButtonLink>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
