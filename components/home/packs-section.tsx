import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { packOptions } from "@/data/home";

export function PacksSection() {
  return (
    <section id="packs" className="packs-section overflow-hidden bg-ink py-20 text-white sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="¿Uno o para todos?"
            title="Elegí tu pack."
            description="Desde un duo hasta doce combinaciones para regalar, compartir o resolver un evento."
            inverted
          />
          <ButtonLink href="#packs" variant="light" className="sm:mb-1">
            Ver packs
          </ButtonLink>
        </div>
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
              <span className="text-xs font-black tracking-[0.18em] uppercase">
                Pack {pack.name}
              </span>
              <p className="absolute -right-2 bottom-8 font-display text-[6.5rem] leading-none tracking-[-0.08em] opacity-15 sm:text-[9rem]">
                {pack.amount}
              </p>
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
