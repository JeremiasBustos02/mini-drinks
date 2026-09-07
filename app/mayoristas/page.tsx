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
        <section className="wholesale-hero relative isolate overflow-hidden bg-ink py-16 text-white sm:py-20 lg:py-24">
          <div className="wholesale-hero-repeat" aria-hidden="true">MINI MINI MINI MINI</div>
          <Container className="relative grid min-h-[34rem] items-end gap-8 lg:grid-cols-[1.03fr_.97fr]">
            <div className="relative z-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-mint">Mayoristas</p>
              <h1 className="mt-4 font-display text-[clamp(4rem,9vw,8rem)] leading-[.82] tracking-[-.065em] uppercase">Mini en tamaño.<br /><span className="text-mint">Grande</span> para vender.</h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">Minis, mixers, vasos, combos y packs para sumar una vuelta distinta a tu mostrador.</p>
              <ButtonLink href="/productos" variant="lightdark" className="mt-8">Ver catálogo</ButtonLink>
            </div>
            <div className="wholesale-hero-shelf" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="wholesale-shelf-fernet" alt="" src="/fernetsinfondo.png" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="wholesale-shelf-coke" alt="" src="/cocacolapng.webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="wholesale-shelf-pack" alt="" src="/packx12.webp" />
            </div>
          </Container>
        </section>

        <Container className="py-16 sm:py-20">
          <section className="wholesale-process">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-action">Cómo funciona</p>
              <h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[.9] tracking-[-.055em] uppercase">Directo al punto.</h2>
            </div>
            <ol className="wholesale-process-list mt-10">
              {["CONSULTÁS", "ARMAMOS PROPUESTA", "COORDINAMOS", "RECIBÍS O RETIRÁS"].map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}
            </ol>
          </section>

          <section className="wholesale-range relative mt-16 overflow-hidden border-y border-ink/15 py-14 sm:mt-20 sm:py-16">
            <p className="text-xs font-black uppercase tracking-[.18em] text-action">Qué podés vender</p>
            <div className="wholesale-range-words mt-7" aria-label="Minis, mixers, vasos, combos y packs">
              <span>MINIS</span><span>MIXERS</span><span>VASOS</span><span>COMBOS</span><span>PACKS</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wholesale-range-product" alt="" aria-hidden="true" src="/packx12.webp" />
          </section>

          <section className="wholesale-final mt-16 sm:mt-20">
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-mint">Para tu negocio</p><h2>Todo empieza con lo que querés vender.</h2></div>
            <div><p>Explorá el catálogo publicado y encontrá la combinación que mejor encaja en tu mostrador.</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink href="/productos" variant="lightdark">Explorar catálogo</ButtonLink><Link className="wholesale-text-link" href="/productos?categoria=combos">Ver combos <span>→</span></Link></div></div>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
