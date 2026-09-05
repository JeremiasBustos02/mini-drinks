import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import type { StorefrontAsset } from "@/lib/storefront/assets";

export function Hero({ asset }: { asset: StorefrontAsset | null }) {
  return (
    <section
      id="inicio"
      className="hero-section relative isolate -mt-[var(--header-height)] flex min-h-svh items-center overflow-hidden border-b border-ink/10 pt-[calc(var(--header-height)+2.5rem)] pb-12 sm:pt-[calc(var(--header-height)+3.5rem)] sm:pb-16 lg:pt-[calc(var(--header-height)+4rem)] lg:pb-20"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden="true" className="absolute inset-0 -z-20 size-full object-cover object-[62%_center] sm:object-center" src={asset?.imageUrl ?? "/background-hero.webp"} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/25 sm:from-ink/80 sm:via-ink/50 sm:to-ink/10" />
      <Container className="w-full">
        <div className="relative z-10 max-w-4xl">
          <h1 className="hero-title font-display text-paper text-[clamp(3rem,15vw,8.8rem)] leading-[0.82] tracking-[-0.065em] uppercase [text-shadow:0_3px_24px_rgb(0_0_0_/_35%)]">
            <span className="block">Tu</span>
            <span className="block">trago</span>
            <span className="block">en mini</span>
          
          </h1>
          <div className="hero-actions mt-8 flex flex-col gap-3 min-[390px]:flex-row">
            <ButtonLink href="/productos?categoria=combos" variant="heroPrimary" className="min-[390px]:min-w-36">
              Ver combos
            </ButtonLink>
            <ButtonLink
              href="/arma-tu-combo"
              variant="heroSecondary"
              className="min-[390px]:min-w-36"
            >
              Armar el mío
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
