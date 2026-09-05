import { Container } from "@/components/ui/container";
import type { StorefrontAsset } from "@/lib/storefront/assets";

export function GiftsEvents({ asset }: { asset: StorefrontAsset | null }) {
  return (
    <section
      id="regalos-eventos"
      data-reveal="up"
      className="gifts-section pb-20 sm:pb-28"
    >
      <Container>
        <div className="gifts-grid grid gap-5 lg:grid-cols-2">
          <article className="gift-card relative flex min-h-[27rem] flex-col overflow-hidden rounded-[1.75rem] bg-white p-7 sm:min-h-[34rem] sm:p-12">
            <p className="text-xs font-black tracking-[0.18em] text-action uppercase">
              Regalos
            </p>
            <h2 className="mt-4 max-w-lg font-display text-[clamp(2.5rem,9vw,4.8rem)] leading-[0.96] tracking-[-0.04em] uppercase">
              Chico. Distinto. Regalable.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-ink/65">
              Boxes, packs temáticos y una presentación que no pasa desapercibida.
            </p>
            <div className="grid flex-1 place-items-center pt-10">
              <span className="gift-sticker grid size-32 rotate-8 place-items-center rounded-2xl bg-mint text-center font-display text-2xl leading-none uppercase shadow-[7px_8px_0_#0d0d0d] sm:size-44 sm:text-3xl">
                Para vos
              </span>
            </div>
          </article>

          <article className="gift-card relative min-h-[27rem] overflow-hidden rounded-[1.75rem] bg-mint p-7 sm:min-h-[34rem] sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {asset ? <><img alt={asset.alt} className="absolute inset-0 size-full object-cover" decoding="async" loading="lazy" src={asset.imageUrl} /><div className="absolute inset-0 bg-mint/80" /></> : null}
            <p className="relative text-xs font-black tracking-[0.18em] text-action uppercase">
              Eventos
            </p>
            <h2 className="relative mt-4 max-w-lg font-display text-[clamp(2.5rem,9vw,4.8rem)] leading-[0.96] tracking-[-0.04em] uppercase">
              Hagámoslo a tu manera.
            </h2>
            <p className="relative mt-5 max-w-sm text-base leading-relaxed text-ink/65">
              Packs, souvenirs y opciones personalizadas para celebraciones.
            </p>
            <p className="absolute right-7 bottom-7 border-b-2 border-ink pb-2 text-sm font-black sm:right-12 sm:bottom-12">
              Consultas para eventos, próximamente
            </p>
          </article>
        </div>
      </Container>
    </section>
  );
}
