import type { Metadata } from "next";
import Link from "next/link";

import { StorefrontShell } from "@/components/layout/storefront-shell";
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
        <section className="events-hero relative isolate overflow-hidden py-16 text-white sm:py-20 lg:py-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="events-hero-background" alt="" aria-hidden="true" src="/background-hero.webp" />
          <div className="events-hero-overlay" aria-hidden="true" />
          <Container className="relative flex min-h-[34rem] items-end">
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
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-action">Para lo que venga</p>
              <h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[.9] tracking-[-.055em] uppercase">No hace falta una excusa gigante.</h2>
            </div>
            <div className="events-occasion-list mt-10">
              {[
                ["01", "CUMPLEAÑOS", "Un detalle que no termina en un cajón."],
                ["02", "PREVIAS", "Minis y mixers para arrancar el plan."],
                ["03", "FIESTAS", "Packs para compartir sin complicarla."],
                ["04", "REGALOS", "Algo distinto para llevar y abrir."],
              ].map(([number, title, copy]) => (
                <article key={title}>
                  <span>{number}</span><h3>{title}</h3><p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
        </Container>

        <section className="events-plan relative isolate overflow-hidden bg-ink py-16 text-white sm:py-20">
          <div className="events-plan-line" aria-hidden="true"><svg viewBox="0 0 1440 330" preserveAspectRatio="none"><path d="M-28 241C157 82 341 333 526 189c130-102 232-165 368-74 152 102 264-55 578-97" fill="none" stroke="currentColor" strokeWidth="4" /></svg></div>
          <Container className="relative grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-mint">Elegí lo que acompaña</p>
              <h2 className="mt-4 font-display text-[clamp(3rem,6vw,5.8rem)] leading-[.87] tracking-[-.06em] uppercase">Armá algo que tenga sentido para tu plan.</h2>
              <p className="mt-6 text-base leading-7 text-white/70">Encontrá packs, combos, minis, mixers y vasos publicados para resolver el brindis a tu manera.</p>
              <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/productos?categoria=combos" variant="lightdark">Ver packs</ButtonLink><Link className="events-text-link" href="/productos">Explorar catálogo <span>→</span></Link></div>
            </div>
            <div className="events-plan-categories" aria-label="Packs, combos, minis, vasos y mixers">
              <span>PACKS</span><span>COMBOS</span><span>MINIS</span><span>VASOS</span><span>MIXERS</span>
            </div>
          </Container>
        </section>

        <Container className="py-16 sm:py-20">
          <section className="events-final">
            <p className="events-final-kicker">CHICO + DISTINTO + LISTO PARA LLEVAR</p>
            <h2>Que el plan empiece antes del primer brindis.</h2>
            <ButtonLink href="/productos">Ver productos</ButtonLink>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
