import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Eventos | Mini Drinks",
  description:
    "Packs y minis para hacer que cada celebración se sienta distinta.",
};

export default function EventsPage() {
  return (
    <StorefrontShell>
      <main id="contenido" className="bg-canvas">
        <section className="border-b border-ink/10 bg-mint/35 py-16 sm:py-24">
          <Container>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-action">
              Eventos
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.9] tracking-[-.06em] sm:text-7xl">
              Que el mini también sea parte del plan.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/70">
              Cumpleaños, previas, regalos y celebraciones con algo chico que se
              hace notar.
            </p>
            <Link
              href="/productos?categoria=combos"
              className="motion-button mt-8 inline-flex min-h-11 items-center rounded-xl bg-action px-5 text-sm font-black text-white hover:bg-action/85"
            >
              Ver packs
            </Link>
          </Container>
        </section>
        <Container className="py-16 sm:py-20">
          <div className="grid gap-px bg-ink/15 md:grid-cols-3">
            {[
              [
                "Cumpleaños",
                "Packs para regalar, compartir o abrir la previa.",
              ],
              ["Fiestas", "Minis y combos para sumar una vuelta distinta."],
              [
                "Recuerdos",
                "Un detalle que queda bien en cualquier celebración.",
              ],
            ].map(([title, copy], index) => (
              <article
                className={`p-7 ${index === 1 ? "bg-ink text-white" : "bg-paper"}`}
                key={title}
              >
                <p className="font-display text-4xl text-action">
                  0{index + 1}
                </p>
                <h2 className="mt-6 text-xl font-black">{title}</h2>
                <p className="mt-2 text-sm leading-6 opacity-70">{copy}</p>
              </article>
            ))}
          </div>
          <section className="mt-16 border-l-4 border-action bg-paper p-7 sm:p-10">
            <h2 className="font-display text-4xl tracking-[-.05em]">
              Empezá por elegir el plan.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ink/65">
              Mirá los packs y combos publicados para encontrar la combinación
              que mejor acompaña tu fecha.
            </p>
            <Link
              href="/productos"
              className="motion-button mt-6 inline-flex min-h-11 items-center text-sm font-black text-action hover:text-ink"
            >
              Ver productos →
            </Link>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
