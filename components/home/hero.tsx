import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section
      id="inicio"
      className="hero-section overflow-hidden border-b border-ink/10 py-10 sm:py-14 lg:py-20"
    >
      <Container>
        <div className="hero-layout grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="relative z-10">
            <h1 className="hero-title font-display max-w-4xl text-[clamp(3.65rem,17vw,8.8rem)] leading-[0.82] tracking-[-0.065em] uppercase">
              Tu trago.
              <span className="block text-action">En mini.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70 sm:text-xl">
              Todo lo que necesitás para hacerte uno.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row">
              <ButtonLink href="/productos?categoria=combos" className="min-[390px]:min-w-36">
                Ver combos
              </ButtonLink>
              <ButtonLink
                href="/arma-tu-combo"
                variant="secondary"
                className="min-[390px]:min-w-36"
              >
                Armar el mío
              </ButtonLink>
            </div>
          </div>

          <div
            aria-label="Placeholder visual de miniatura, mixer, vaso y packaging"
            role="img"
            className="hero-visual relative min-h-[27rem] overflow-hidden rounded-[1.75rem] bg-mint sm:min-h-[35rem]"
          >
            <div className="absolute top-5 right-5 z-20 rotate-6 rounded-full bg-ink px-4 py-3 text-xs font-black tracking-widest text-white uppercase">
              50 ml
            </div>
            <div className="absolute -top-12 -left-12 size-44 rounded-full border-[26px] border-white/45 sm:size-64" />
            <div className="absolute -right-16 -bottom-20 size-72 rounded-full bg-action/90 sm:size-96" />

            <div className="absolute top-[13%] right-[7%] h-[53%] w-[47%] rotate-3 rounded-[1.25rem] border-2 border-ink bg-canvas p-4 shadow-[12px_16px_0_#0d0d0d] sm:p-6">
              <p className="font-display text-[clamp(1.4rem,5vw,3rem)] leading-none uppercase">
                Tu trago
                <span className="block text-action">en mini.</span>
              </p>
              <span className="absolute right-4 bottom-4 left-4 border-t-2 border-ink pt-2 text-[0.6rem] font-black tracking-widest uppercase sm:text-xs">
                Packaging de marca
              </span>
            </div>

            <div className="absolute bottom-[9%] left-[11%] z-20 h-[53%] w-[23%] -rotate-8 rounded-t-[2.5rem] rounded-b-xl border-2 border-ink bg-action shadow-[8px_10px_0_rgba(13,13,13,0.22)]">
              <div className="absolute -top-[8%] left-1/2 h-[13%] w-[48%] -translate-x-1/2 rounded-t-md border-2 border-ink bg-ink" />
              <span className="absolute top-[43%] inset-x-2 border-y border-white/50 py-3 text-center text-[0.6rem] font-black tracking-widest text-white sm:text-sm">
                MINI
              </span>
            </div>

            <div className="absolute bottom-[8%] left-[38%] z-20 h-[43%] w-[20%] rotate-8 rounded-xl border-2 border-ink bg-[#d92d20] shadow-[8px_10px_0_rgba(13,13,13,0.22)]">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-[0.6rem] font-black tracking-widest text-white sm:text-xs">
                MIXER
              </span>
            </div>

            <div className="absolute right-[7%] bottom-[7%] z-30 h-[28%] w-[23%] rounded-b-3xl border-2 border-white bg-white/25 backdrop-blur-sm">
              <span className="absolute right-2 bottom-2 left-2 h-[46%] rounded-b-2xl bg-white/55" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
