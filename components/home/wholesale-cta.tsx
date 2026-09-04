import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export function WholesaleCta() {
  return (
    <section
      id="mayoristas"
      data-reveal="fade"
      className="wholesale-section overflow-hidden bg-action py-24 text-white sm:py-28"
    >
      <Container>
        <div className="wholesale-content grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="text-xs font-black tracking-[0.2em] text-mint uppercase">Para comercios</p>
            <h2 className="font-display text-[clamp(2.5rem,10vw,6rem)] leading-[0.92] tracking-[-0.045em] uppercase">
              ¿Tenés un negocio?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75 lg:mx-0 sm:text-lg">
              Sumá minis, combos y opciones para reventa a tu mostrador.
            </p>
            <ButtonLink href="#mayoristas" variant="lightdark" className="mt-8 shrink-0 sm:mt-10">
              Quiero venderlos
            </ButtonLink>
          </div>
          <div className="wholesale-visual relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/25 bg-mint text-ink shadow-[10px_12px_0_rgb(13_13_13_/_28%)]" role="img" aria-label="Espacio preparado para una futura foto de productos para reventa">
            <div className="absolute -top-10 -left-10 size-40 rounded-full border-[1.5rem] border-white/55" aria-hidden="true" />
            <div className="absolute right-[18%] bottom-[16%] h-[58%] w-[24%] rotate-[-9deg] rounded-t-[1.5rem] rounded-b-lg bg-action shadow-[8px_8px_0_rgb(13_13_13_/_18%)]" aria-hidden="true" />
            <div className="absolute right-[37%] bottom-[12%] h-[44%] w-[19%] rotate-[7deg] rounded-t-xl rounded-b-lg bg-white shadow-[7px_7px_0_rgb(13_13_13_/_14%)]" aria-hidden="true" />
            <p className="absolute top-5 left-5 rounded-full bg-white px-3 py-1.5 text-[0.65rem] font-black tracking-[0.15em] uppercase">Foto de producto</p>
            <p className="absolute right-5 bottom-5 max-w-36 text-right font-display text-2xl leading-none uppercase">Tu vidriera, en mini.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
