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
          <div className="mini-club-hero-ribbon" aria-hidden="true">
            <svg viewBox="0 0 420 580" preserveAspectRatio="none">
              <path d="M-20 83C85 32 111 112 191 130c92 21 142-50 248-2" fill="none" stroke="currentColor" strokeWidth="17" />
              <path d="M137 109c-8 123 53 152 45 289-5 84-63 132-11 215" fill="none" stroke="currentColor" strokeWidth="10" />
            </svg>
          </div>
          <Container className="relative grid min-h-[34rem] items-end gap-10 py-16 sm:min-h-[38rem] sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
            <div className="relative z-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-action">Mini Club</p>
              <h1 className="mt-4 font-display text-[clamp(4rem,10vw,8.8rem)] leading-[.82] tracking-[-.065em] uppercase">
                Tomás <span className="mini-club-word-shift text-action">mini.</span>
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
            <div className="mini-club-hero-score relative z-10 self-center lg:justify-self-end" aria-label={`${formatLoyaltyPoints(settings.minRedemptionPoints)} puntos para empezar a canjear`}>
              <span className="mini-club-score-label">PUNTOS</span>
              <strong>{formatLoyaltyPoints(settings.minRedemptionPoints)}</strong>
              <span className="mini-club-score-sticker">EN<br />GRANDE</span>
              <p>para empezar a pagar menos.</p>
            </div>
          </Container>
        </section>

        <section className="mini-club-numbers relative overflow-hidden bg-ink py-16 text-white sm:py-20">
          <Container className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[.18em] text-mint">La cuenta, sin letra chica</p>
            <div className="mini-club-number-grid mt-8">
              <div>
                <p className="mini-club-big-number">{formatLoyaltyPoints(settings.pointsPerUnit)}</p>
                <p className="mini-club-big-label">PTS</p>
                <p className="mini-club-number-copy">por cada {formatArsCents(settings.earnUnitCents)} en productos.</p>
              </div>
              <span className="mini-club-number-arrow" aria-hidden="true">→</span>
              <div className="mini-club-discount-number">
                <p className="mini-club-big-number">{formatLoyaltyPoints(settings.minRedemptionPoints)}</p>
                <p className="mini-club-equation">=</p>
                <p className="mini-club-cash-number">{formatArsCents(minimumDiscount)}</p>
                <p className="mini-club-number-copy">de descuento en productos.</p>
              </div>
            </div>
          </Container>
          <svg className="mini-club-numbers-line" aria-hidden="true" viewBox="0 0 1440 280" preserveAspectRatio="none">
            <path d="M-40 82c179-100 279 141 496 43 184-82 246-142 427-21 183 123 339-43 597-1" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </section>

        <Container className="py-16 sm:py-20">
          <section className="mini-club-route">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-action">Así funciona</p>
              <h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[.9] tracking-[-.055em] uppercase">Tres pasos. Cero vueltas.</h2>
            </div>
            <ol className="mini-club-steps mt-10">
              {[
                ["01", "SUMÁ", `Cada ${formatArsCents(settings.earnUnitCents)} en productos te da ${formatLoyaltyPoints(settings.pointsPerUnit)} pts.`],
                ["02", "ACUMULÁ", "Tus puntos quedan en Mini Club hasta que quieras usarlos."],
                ["03", "CANJEÁ", `Desde ${formatLoyaltyPoints(settings.minRedemptionPoints)} pts empezás a pagar menos.`],
              ].map(([number, title, copy]) => (
                <li key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mini-surprise-feature relative mt-16 overflow-hidden sm:mt-20">
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
