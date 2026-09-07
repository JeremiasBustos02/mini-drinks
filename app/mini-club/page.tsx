import type { Metadata } from "next";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { getAccountAccess } from "@/lib/account/auth";
import { formatLoyaltyPoints } from "@/lib/loyalty/points";
import { formatArsCents } from "@/lib/money";
import { loadLoyaltyRedemptionSettings } from "@/lib/loyalty/redemptions";

export const metadata: Metadata = {
  title: "Mini Club | Mini Drinks",
  description: "Sumá puntos con tus compras en Mini Drinks y usalos para ahorrar en tus próximos pedidos.",
};

const qrPattern = [0, 2, 3, 7, 8, 10, 12, 13, 15, 17, 18, 22, 24, 27, 29, 30, 34];

export default async function MiniClubPage() {
  const [settings, access] = await Promise.all([
    loadLoyaltyRedemptionSettings(),
    getAccountAccess(),
  ]);
  const minimumDiscount = settings.minRedemptionPoints * settings.redemptionValueCents;
  const canViewAccount = access.status === "authenticated" && !access.isAdmin;

  return (
    <StorefrontShell>
      <main id="contenido" className="mini-club-page overflow-hidden bg-canvas">
        <section className="mini-club-hero relative isolate overflow-hidden border-b border-ink/10 bg-paper">
          <Container className="relative grid min-h-[27rem] items-center gap-8 py-12 sm:min-h-[30rem] sm:py-14 lg:grid-cols-[1.08fr_.92fr] lg:py-16">
            <div className="relative z-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-action">Mini Club</p>
              <h1 className="mt-4 font-display text-[clamp(3.7rem,8vw,7rem)] leading-[.84] tracking-[-.065em] uppercase">
                Tomás <span className="text-action">mini.</span>
                <br />
                Sumás en grande.
              </h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-ink/70 sm:text-lg">
                Comprás minis, acumulás puntos y los convertís en descuento cuando te pinta.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/productos">Ver productos</ButtonLink>
                {canViewAccount ? <ButtonLink href="/mi-cuenta" variant="secondary">Ver mis puntos</ButtonLink> : null}
              </div>
            </div>
            <div className="mini-club-hero-ticket relative z-10 self-center lg:justify-self-end" aria-label="Resumen de beneficios de Mini Club">
              <p className="mini-club-ticket-kicker">TU PASE MINI</p>
              <div className="mini-club-ticket-row">
                <strong>{formatLoyaltyPoints(settings.pointsPerUnit)}</strong>
                <span>PTS<br />POR CADA<br />{formatArsCents(settings.earnUnitCents)}</span>
              </div>
              <div className="mini-club-ticket-row mini-club-ticket-row-accent">
                <strong>{formatLoyaltyPoints(settings.minRedemptionPoints)}</strong>
                <span>PTS =<br />{formatArsCents(minimumDiscount)}</span>
              </div>
              <p className="mini-club-ticket-limit">HASTA {settings.maxRedemptionPercentage}% <span>de los productos</span></p>
            </div>
          </Container>
        </section>

        <section className="mini-club-numbers relative overflow-hidden bg-ink py-16 text-white sm:py-20">
          <Container className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[.18em] text-mint">La cuenta, sin letra chica</p>
            <ol className="mini-club-number-flow mt-8">
              <li>
                <span className="mini-club-flow-step">01 · COMPRÁS</span>
                <strong>{formatArsCents(settings.earnUnitCents)}</strong>
                <p>en productos</p>
              </li>
              <li>
                <span className="mini-club-flow-step">02 · SUMÁS</span>
                <strong>{formatLoyaltyPoints(settings.pointsPerUnit)} <small>PTS</small></strong>
                <p>automáticamente</p>
              </li>
              <li>
                <span className="mini-club-flow-step">03 · CANJEÁS</span>
                <strong>{formatLoyaltyPoints(settings.minRedemptionPoints)} <small>PTS</small></strong>
                <p>= {formatArsCents(minimumDiscount)} de descuento · hasta {settings.maxRedemptionPercentage}%</p>
              </li>
            </ol>
          </Container>
          <svg className="mini-club-numbers-line" aria-hidden="true" viewBox="0 0 1440 280" preserveAspectRatio="none">
            <path d="M-40 82c179-100 279 141 496 43 184-82 246-142 427-21 183 123 339-43 597-1" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </section>

        <Container className="py-16 sm:py-20">
          <section className="mini-surprise-feature relative overflow-hidden">
            <div className="mini-surprise-ribbon" aria-hidden="true">
              <svg viewBox="0 0 780 510" preserveAspectRatio="none"><path d="M-46 129C93 49 178 171 293 153c141-22 159-137 308-78 90 36 124 63 223 13" fill="none" stroke="currentColor" strokeWidth="13" /></svg>
            </div>
            <div className="mini-surprise-copy relative z-10">
              <p className="text-xs font-black uppercase tracking-[.18em] text-action">Mini Sorpresa</p>
              <h2 className="mt-4 font-display text-[clamp(3rem,6vw,5.8rem)] leading-[.88] tracking-[-.06em] uppercase">Hay puntos que aparecen donde menos los esperás.</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-ink/70">Algunos packs y campañas esconden una tarjeta. Encontrala, escaneala e incorporá la sorpresa a tu cuenta.</p>
              <ol className="mini-surprise-flow mt-8" aria-label="Cómo usar una Mini Sorpresa">
                <li>ENCONTRALA</li><li>ESCANEALA</li><li>CANJEALA</li>
              </ol>
            </div>
            <div className="mini-surprise-ticket-wrap relative z-10" aria-label="Representación decorativa de una tarjeta Mini Sorpresa">
              <div className="mini-surprise-ticket">
                <p>MINI<br />SORPRESA</p>
                <span>HAY ALGO<br />PARA VOS</span>
                <div className="mini-surprise-qr" aria-hidden="true">
                  {Array.from({ length: 36 }).map((_, index) => <i className={qrPattern.includes(index) ? "bg-ink" : "bg-white"} key={index} />)}
                </div>
                <small>ESCANEÁ CUANDO LA ENCUENTRES</small>
              </div>
              <span className="mini-surprise-seal">+<br />PTS</span>
            </div>
          </section>

          <section className="mini-club-faq mt-16 sm:mt-20">
            <p className="text-xs font-black uppercase tracking-[.18em] text-action">Preguntas rápidas</p>
            <div className="mt-5 divide-y divide-ink/15 border-y border-ink/15">
              {[
                ["¿Cuándo se acreditan?", "Después de que el pago se confirma."],
                ["¿Puedo pagar todo con puntos?", `No. Podés cubrir hasta ${settings.maxRedemptionPercentage}% de los productos de tu pedido.`],
                ["¿El envío suma o acepta puntos?", "No. Los puntos aplican sólo a productos."],
              ].map(([question, answer]) => (
                <details className="group py-5" key={question}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-bold"><span>{question}</span><span className="text-2xl text-action transition-transform group-open:rotate-45">+</span></summary>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mini-club-final mt-16 sm:mt-20">
            <p>Tus próximos puntos están en tu próximo mini.</p>
            <ButtonLink href="/productos" variant="lightdark">Ver productos</ButtonLink>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
