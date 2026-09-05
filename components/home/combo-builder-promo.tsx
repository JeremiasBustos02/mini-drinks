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
      className="combo-builder-promo build-section bg-action text-white"
    >
      <div className="combo-builder-visual-ribbon-clip" aria-hidden="true">
        <svg className="combo-builder-visual-ribbon combo-builder-visual-ribbon-desktop" viewBox="0 0 180 540" preserveAspectRatio="none">
          <defs>
            <linearGradient id="combo-builder-ribbon-desktop-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="78%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F5F3F0" />
            </linearGradient>
          </defs>
          <path fill="url(#combo-builder-ribbon-desktop-gradient)" transform="rotate(-7 90 270)" d="M176 -14C181 64 174 125 124 188C80 239 35 289 53 357C66 417 118 475 96 546H62C78 484 22 425 12 354C0 267 50 219 75 170C108 90 48 34 6 -14Z" />
        </svg>
      </div>
      <div className="combo-builder-promo-inner py-20 sm:py-28 lg:py-32">
        <Container>
          <div className="combo-builder-layout">
            <div className="combo-builder-intro">
              <SectionHeading
                eyebrow="Armá tu combo"
                title="Vos elegís. Nosotros lo hacemos mini."
                description="Elegí, mezclá, hacelo tuyo."
                inverted
              />
              <p className="combo-builder-categories" aria-label="Categorías disponibles">
                <span className="combo-builder-category">Mini</span>
                <span className="combo-builder-category-operator">+</span>
                <span className="combo-builder-category">Mixer</span>
                <span className="combo-builder-category-operator">+</span>
                <span className="combo-builder-category">Vaso</span>
                <span className="combo-builder-category-operator">+</span>
                <span className="combo-builder-category combo-builder-category-extra">Extra</span>
              </p>
              <ButtonLink href="/arma-tu-combo" variant="lightdark" className="combo-builder-cta min-w-36">
                Empezar
              </ButtonLink>
            </div>

            <div className="combo-builder-visual" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="combo-builder-visual-fernet" src="/fernetsinfondo.png" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="combo-builder-visual-coke" src="/cocacolapng.webp" />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
