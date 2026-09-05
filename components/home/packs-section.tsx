import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { packOptions } from "@/data/home";
import type { StorefrontAsset } from "@/lib/storefront/assets";

export function PacksSection({ asset }: { asset: StorefrontAsset | null }) {
  return (
    <section
      id="packs"
      data-reveal="fade"
      className="packs-section overflow-hidden bg-ink py-20 text-white sm:py-28"
    >
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="¿Uno o para todos?"
            title="Elegí tu pack."
            description="Desde un duo hasta doce combinaciones para regalar, compartir o resolver un evento."
            inverted
          />
          <p className="text-sm font-bold text-white/70 sm:mb-1">Próximamente</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {asset ? <img alt={asset.alt} className="mt-10 aspect-[16/7] w-full rounded-[1.5rem] bg-white object-contain p-4 sm:p-6" decoding="async" loading="lazy" src={asset.imageUrl} /> : null}
        <div className="packs-grid mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {packOptions.map((pack, index) => (
            <article
              key={pack.name}
              className={`pack-card relative min-h-64 overflow-hidden rounded-[1.5rem] p-5 sm:min-h-80 sm:p-7 ${
                index === 1
                  ? "bg-mint text-ink"
                  : index === 3
                    ? "bg-action text-white"
                    : "bg-white text-ink"
              }`}
            >
              <p className="absolute -right-2 bottom-8 font-display text-[6.5rem] leading-none tracking-[-0.08em] opacity-15 sm:text-[9rem]">
                {pack.amount}
              </p>
              {"image" in pack && pack.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 z-0 h-full w-full object-contain pointer-events-none"
                  decoding="async"
                  loading="lazy"
                  src={pack.image}
                />
              ) : null}
              <span className="text-xs font-black tracking-[0.18em] uppercase">
                Pack {pack.name}
              </span>
              
              <div className="absolute right-5 bottom-5 left-5 sm:right-7 sm:bottom-7 sm:left-7">
                <p className="font-display text-4xl leading-none uppercase sm:text-5xl">
                  {pack.name}
                </p>
                <p className="mt-3 text-sm opacity-65 sm:text-base">{pack.use}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
