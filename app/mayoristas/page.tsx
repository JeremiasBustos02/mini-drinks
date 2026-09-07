import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Mayoristas | Mini Drinks",
  description: "Minis, mixers y combos para sumar Mini Drinks a tu negocio.",
};

export default function WholesalePage() {
  return (
    <StorefrontShell>
      <main id="contenido" className="bg-canvas">
        <section className="bg-ink py-16 text-white sm:py-24">
          <Container>
            <p className="text-xs font-black uppercase tracking-[.18em] text-mint">
              Mayoristas
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.9] tracking-[-.06em] sm:text-7xl">
              Mini en tamaño.
              <br />
              Grande para vender.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              Una selección de minis, mixers, vasos, combos y packs para sumar a
              tu mostrador.
            </p>
            <Link
              href="/productos"
              className="motion-button mt-8 inline-flex min-h-11 items-center rounded-xl bg-mint px-5 text-sm font-black text-ink hover:bg-paper"
            >
              Ver catálogo
            </Link>
          </Container>
        </section>
        <Container className="py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-action">
                Cómo funciona
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-[-.05em]">
                Directo al punto.
              </h2>
            </div>
            <ol className="divide-y divide-ink/15 border-y border-ink/15">
              {[
                "Consultás",
                "Armamos una propuesta",
                "Coordinamos el pedido",
                "Recibís o retirás",
              ].map((step, index) => (
                <li className="flex items-center gap-5 py-4" key={step}>
                  <span className="font-display text-3xl text-action">
                    0{index + 1}
                  </span>
                  <span className="font-bold">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <section className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {["Minis", "Mixers", "Vasos", "Combos", "Packs"].map((item) => (
              <div
                className="border border-ink/10 bg-paper p-5 font-black"
                key={item}
              >
                {item}
              </div>
            ))}
          </section>
          <section className="mt-16 border-l-4 border-action bg-mint/25 p-7 sm:p-10">
            <h2 className="font-display text-4xl tracking-[-.05em]">
              Todo empieza con lo que querés vender.
            </h2>
            <Link
              href="/productos"
              className="motion-button mt-6 inline-flex min-h-11 items-center text-sm font-black text-action hover:text-ink"
            >
              Explorar catálogo →
            </Link>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
