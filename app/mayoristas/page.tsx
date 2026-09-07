import type { Metadata } from "next";
import Link from "next/link";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Mayoristas | Mini Drinks",
  description: "Minis, mixers y combos para sumar Mini Drinks a tu negocio.",
};

export default function WholesalePage() {
  return (
    <StorefrontShell>
      <main id="contenido" className="wholesale-page overflow-hidden bg-canvas">
        <section className="wholesale-hero relative isolate overflow-hidden border-b border-ink/10 bg-paper">
          <div className="wholesale-hero-line" aria-hidden="true"><svg viewBox="0 0 1440 360" preserveAspectRatio="none"><path d="M-30 269C179 131 302 319 519 203c171-91 264-121 406-45 158 85 296-26 556-94" fill="none" stroke="currentColor" strokeWidth="4" /></svg></div>
          <Container className="flex min-h-[23rem] items-end py-12 sm:min-h-[25rem] sm:py-14 lg:py-16">
            <div className="relative z-10 max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-action">Mayoristas</p>
              <h1 className="wholesale-hero-title mt-4 font-display text-[clamp(3.7rem,7vw,6.6rem)] tracking-[-.065em] uppercase">Mini en tamaño.<br /><span className="text-action">Grande</span> para vender.</h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-ink/70 sm:text-lg">Minis, mixers, vasos, combos y packs para sumar una vuelta distinta a tu mostrador.</p>
              <ButtonLink href="/productos" className="mt-7">Ver catálogo</ButtonLink>
            </div>
          </Container>
        </section>

        <Container className="py-16 sm:py-20">
          <section className="wholesale-process">
            <div className="wholesale-section-heading">
              <h2>CÓMO FUNCIONA</h2>
              <p>Cuatro pasos para sumar MINI a tu negocio.</p>
            </div>
            <ol className="wholesale-process-list mt-10">
              {[
                ["CONSULTÁS", "Nos contás qué necesitás."],
                ["ARMAMOS PROPUESTA", "Te acercamos una selección."],
                ["COORDINAMOS", "Definimos cantidades y entrega."],
                ["RECIBÍS O RETIRÁS", "Listo para tu mostrador."],
              ].map(([step, copy]) => <li key={step}><strong>{step}</strong><p>{copy}</p></li>)}
            </ol>
          </section>

          <section className="wholesale-range relative mt-16 overflow-hidden border-y border-ink/15 py-14 sm:mt-20 sm:py-16">
            <div className="wholesale-section-heading">
              <h2>QUÉ PODÉS VENDER</h2>
              <p>Categorías claras para tu mostrador.</p>
            </div>
            <ul className="wholesale-range-list mt-8">
              {[
                ["MINIS", "Botellas chicas para exhibir fácil."],
                ["MIXERS", "La base lista para cada combinación."],
                ["VASOS", "El complemento para ofrecer el trago completo."],
                ["COMBOS", "Mini y mixer, listos para elegir."],
                ["PACKS", "Variedad para regalo o compartir."],
              ].map(([name, copy]) => <li key={name}><h3>{name}</h3><p>{copy}</p></li>)}
            </ul>
          </section>

          <section className="wholesale-final mt-16 sm:mt-20">
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-mint">Para tu negocio</p><h2><span className="block">Todo empieza</span><span className="block">con lo que</span><span className="block">querés vender.</span></h2></div>
            <div><p>Explorá el catálogo publicado y encontrá la combinación que mejor encaja en tu mostrador.</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink href="/productos" variant="lightdark">Explorar catálogo</ButtonLink><Link className="wholesale-text-link" href="/productos?categoria=combos">Ver combos <span>→</span></Link></div></div>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
