import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { StorefrontAsset } from "@/lib/storefront/assets";

export function ComboBuilderPromo({ asset }: { asset: StorefrontAsset | null }) {
  return (
    <section
      id="arma-tu-combo"
      data-reveal="up"
      className="build-section bg-action py-20 text-white sm:py-28 lg:py-32"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="La parte más divertida"
              title="Armalo como quieras."
              description="Elegí miniatura, mixer, vaso y extras. Nosotros lo dejamos listo."
              inverted
            />
            <ButtonLink href="/arma-tu-combo" variant="lightdark" className="mt-8 min-w-36">
              Empezar
            </ButtonLink>
          </div>

          <div
            aria-hidden={asset ? undefined : "true"}
            className="build-preview relative rounded-[1.75rem] bg-canvas p-4 text-ink sm:p-7"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {asset ? <img alt={asset.alt} className="aspect-[4/3] w-full rounded-[1.25rem] bg-white object-contain p-5" decoding="async" loading="lazy" src={asset.imageUrl} /> : null}
            {!asset ? <div className="build-preview-products grid aspect-[4/3] grid-cols-3 items-end gap-2 overflow-hidden rounded-[1.25rem] bg-white px-4 pt-6 sm:gap-5 sm:px-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="build-preview-fernet" src="/fernet50ml.webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="build-preview-coke" src="/cocacola354cc.webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="build-preview-glass" src="/minivaso.webp" />
            </div> : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
