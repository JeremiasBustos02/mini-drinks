import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export function WholesaleCta() {
  return (
    <section
      id="mayoristas"
      data-reveal="fade"
      className="wholesale-section bg-action py-20 text-white sm:py-24"
    >
      <Container>
        <div className="wholesale-content flex flex-col items-center gap-8 text-center lg:mx-auto lg:w-fit">
          <div>
            <h2 className="font-display text-[clamp(2.5rem,10vw,6rem)] leading-[0.92] tracking-[-0.045em] uppercase">
              ¿Tenés un negocio?
            </h2>
          </div>
          <ButtonLink href="#mayoristas" variant="lightdark" className="shrink-0">
            Quiero venderlos
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
