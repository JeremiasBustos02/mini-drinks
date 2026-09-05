import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { StorefrontAsset } from "@/lib/storefront/assets";

export function ComboBuilderPromo({ asset }: { asset: StorefrontAsset | null }) {
  void asset;

  return (
    <section
      id="arma-tu-combo"
      data-reveal="up"
      className="combo-builder-promo build-section bg-action py-20 text-white sm:py-28 lg:py-32"
    >
      <Container>
        <div className="combo-builder-layout">
          <div className="combo-builder-intro">
            <SectionHeading
              eyebrow="La parte más divertida"
              title="Armalo a tu manera."
              description="Elegí tu mini, tu mixer y sumale un extra para hacerlo más tuyo."
              inverted
            />
            <p className="combo-builder-categories" aria-label="Categorías disponibles">
              <span>Mini</span><span>Mixer</span><span>Vaso</span><span>+ Extra</span>
            </p>
            <ButtonLink href="/arma-tu-combo" variant="lightdark" className="combo-builder-cta min-w-36">
              Empezar
            </ButtonLink>
          </div>

          <div className="combo-builder-visual" aria-hidden="true">
            <span className="combo-builder-visual-blob" />
            <span className="combo-builder-visual-halo" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="combo-builder-visual-fernet" src="/brancapng.webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="combo-builder-visual-coke" src="/cocacolapng.webp" />
          </div>
        </div>
      </Container>
    </section>
  );
}
