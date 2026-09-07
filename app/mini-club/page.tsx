import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { getAccountAccess } from "@/lib/account/auth";
import { formatArsCents } from "@/lib/money";
import { formatLoyaltyPoints } from "@/lib/loyalty/points";
import { loadLoyaltyRedemptionSettings } from "@/lib/loyalty/redemptions";

export const metadata: Metadata = {
  title: "Mini Club | Mini Drinks",
  description:
    "Sumá puntos con tus compras en Mini Drinks y usalos para ahorrar en tus próximos pedidos.",
};

export default async function MiniClubPage() {
  const [settings, access] = await Promise.all([
    loadLoyaltyRedemptionSettings(),
    getAccountAccess(),
  ]);
  const minimumDiscount =
    settings.minRedemptionPoints * settings.redemptionValueCents;
  const exampleSpend = settings.earnUnitCents * 10;
  const exampleEarned = settings.pointsPerUnit * 10;
  const exampleRemaining = exampleSpend - minimumDiscount;
  const canViewAccount = access.status === "authenticated" && !access.isAdmin;

  return (
    <main className="min-h-screen overflow-hidden bg-canvas pb-16">
      <section className="border-b border-ink/10 bg-paper">
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-action">
              Mini Club
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.92] tracking-[-0.055em] sm:text-7xl">
              Tomás mini.
              <br />
              Sumás en grande.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/70">
              Comprá, sumá puntos y usalos para pagar menos en tus próximos
              tragos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="motion-button inline-flex min-h-11 items-center rounded-xl bg-action px-5 text-sm font-black text-white hover:bg-action/85"
              >
                Ver productos
              </Link>
              {canViewAccount ? (
                <Link
                  href="/mi-cuenta"
                  className="motion-button inline-flex min-h-11 items-center rounded-xl border border-ink/15 bg-white px-5 text-sm font-black hover:bg-mint/25"
                >
                  Ver mis puntos
                </Link>
              ) : null}
            </div>
          </div>
          <div className="border-l-4 border-action bg-mint/35 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/55">
              En corto
            </p>
            <p className="mt-5 font-display text-5xl leading-none tracking-[-0.06em]">
              {formatLoyaltyPoints(settings.minRedemptionPoints)} pts
            </p>
            <p className="mt-2 text-sm font-bold text-ink/70">
              te dan {formatArsCents(minimumDiscount)} de ahorro.
            </p>
            <div className="mt-7 border-t border-ink/10 pt-4 text-sm leading-6 text-ink/65">
              Usalos en productos. El envío queda afuera.
            </div>
          </div>
        </Container>
      </section>
      <Container className="py-16 sm:py-24">
        <section>
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-action">
              Cómo funciona
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-[-0.05em] sm:text-5xl">
              Tres pasos. Cero vueltas.
            </h2>
          </div>
          <ol className="mt-10 grid gap-0 border-t border-ink/15 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Sumá",
                copy: `Cada ${formatArsCents(settings.earnUnitCents)} en productos te da ${formatLoyaltyPoints(settings.pointsPerUnit)} pts.`,
                note: "El envío no suma puntos.",
              },
              {
                number: "02",
                title: "Acumulá",
                copy: "Tus puntos quedan en Mini Club para que los uses cuando quieras.",
                note: "Los ves siempre desde tu cuenta.",
              },
              {
                number: "03",
                title: "Canjeá",
                copy: `Desde ${formatLoyaltyPoints(settings.minRedemptionPoints)} pts podés empezar a pagar menos.`,
                note: `Hasta ${settings.maxRedemptionPercentage}% de los productos de tu pedido.`,
              },
            ].map((step) => (
              <li
                className="border-b border-ink/15 py-7 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"
                key={step.number}
              >
                <p className="font-display text-3xl text-action">
                  {step.number}
                </p>
                <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  {step.copy}
                </p>
                <p className="mt-3 text-xs font-bold text-ink/50">
                  {step.note}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-20 sm:mt-28">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-action">
                Así se ve
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-[-0.05em] sm:text-5xl">
                Un mini gesto, un ahorro real.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-ink/60">
              Los ejemplos usan sólo productos para que la cuenta sea clara.
            </p>
          </div>
          <div className="mt-9 grid gap-3 lg:grid-cols-3">
            <article className="border border-ink/10 bg-paper p-6">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-ink/45">
                Gastás
              </p>
              <p className="mt-3 font-display text-5xl tracking-[-0.06em]">
                {formatArsCents(exampleSpend)}
              </p>
              <p className="my-5 text-2xl text-action">↓</p>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-ink/45">
                Sumás
              </p>
              <p className="mt-2 text-2xl font-black">
                {formatLoyaltyPoints(exampleEarned)} pts
              </p>
            </article>
            <article className="border border-ink/10 bg-ink p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-mint">
                Tenés
              </p>
              <p className="mt-3 font-display text-5xl tracking-[-0.06em]">
                {formatLoyaltyPoints(settings.minRedemptionPoints)} pts
              </p>
              <p className="my-5 text-2xl text-mint">↓</p>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-white/50">
                Ahorrás
              </p>
              <p className="mt-2 text-2xl font-black">
                {formatArsCents(minimumDiscount)}
              </p>
            </article>
            <article className="border border-ink/10 bg-mint/35 p-6">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-ink/45">
                Compra
              </p>
              <p className="mt-3 font-display text-5xl tracking-[-0.06em]">
                {formatArsCents(exampleSpend)}
              </p>
              <p className="my-5 text-2xl text-action">↓</p>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-ink/45">
                Pagás
              </p>
              <p className="mt-2 text-2xl font-black">
                {formatArsCents(exampleRemaining)}
              </p>
            </article>
          </div>
        </section>
        <section className="mt-20 grid gap-8 border-y border-ink/15 py-10 sm:mt-28 sm:grid-cols-[0.7fr_1fr] sm:py-14">
          <p className="font-display text-4xl tracking-[-0.05em]">
            Mini
            <br />
            Sorpresa.
          </p>
          <div>
            <p className="text-lg font-bold">
              A veces los puntos también aparecen donde menos los esperás.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ink/65">
              Algunos packs, campañas o códigos Mini Sorpresa pueden darte
              puntos extra. No todos los pedidos incluyen una, pero vale la pena
              estar atento.
            </p>
          </div>
        </section>
        <section className="mt-20 sm:mt-28">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-action">
            Preguntas rápidas
          </p>
          <div className="mt-5 divide-y divide-ink/15 border-y border-ink/15">
            {[
              [
                "¿Cómo gano puntos?",
                `Ganás ${formatLoyaltyPoints(settings.pointsPerUnit)} pts por cada ${formatArsCents(settings.earnUnitCents)} en productos pagados.`,
              ],
              ["¿Cuándo se acreditan?", "Después de que el pago se confirma."],
              [
                "¿Cuántos necesito para usarlos?",
                `Actualmente, desde ${formatLoyaltyPoints(settings.minRedemptionPoints)} pts.`,
              ],
              [
                "¿Puedo pagar todo con puntos?",
                `No. Podés cubrir hasta ${settings.maxRedemptionPercentage}% de los productos de tu pedido.`,
              ],
              [
                "¿El envío suma o acepta puntos?",
                "No. Los puntos aplican sólo a productos.",
              ],
            ].map(([question, answer]) => (
              <details className="group py-5" key={question}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-bold">
                  <span>{question}</span>
                  <span className="text-xl text-action transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>
        <section className="mt-20 border-l-4 border-action bg-paper p-7 sm:mt-28 sm:p-10">
          <p className="font-display text-4xl tracking-[-0.05em] sm:text-5xl">
            Tus próximos puntos están en tu próximo mini.
          </p>
          <Link
            href="/productos"
            className="motion-button mt-7 inline-flex min-h-11 items-center rounded-xl bg-action px-5 text-sm font-black text-white hover:bg-action/85"
          >
            Ver productos
          </Link>
        </section>
      </Container>
    </main>
  );
}
