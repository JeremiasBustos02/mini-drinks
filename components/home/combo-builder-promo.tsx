import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PlusIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { comboPreviewOptions } from "@/data/home";

export function ComboBuilderPromo() {
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
            aria-hidden="true"
            className="build-preview relative rounded-[1.75rem] bg-canvas p-4 text-ink sm:p-7"
          >
            <div className="mb-7 flex items-center gap-2" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((step) => (
                <span
                  key={step}
                  className={`h-2 flex-1 rounded-full ${step === 1 ? "bg-action" : "bg-ink/10"}`}
                />
              ))}
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-black tracking-widest text-action uppercase">
                  Paso 1 de 5
                </span>
                <h3 className="mt-2 font-display text-2xl leading-none uppercase sm:text-4xl">
                  Elegí tu mini
                </h3>
              </div>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-5">
              {comboPreviewOptions.map(([name, color], index) => (
                <div
                  key={name}
                  className={`relative flex aspect-[0.72] items-end justify-center rounded-xl border-2 p-2 ${
                    index === 0 ? "border-action" : "border-transparent bg-white"
                  }`}
                >
                  <div className={`relative h-[72%] w-[52%] rounded-t-2xl rounded-b-md border border-ink/15 ${color}`}>
                    <span className="absolute top-1/2 inset-x-0 text-center text-[0.6rem] font-black uppercase sm:text-xs">
                      {name}
                    </span>
                  </div>
                  {index === 0 ? (
                    <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-action text-xs text-white">
                      ✓
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold">
              <span>Miniatura + mixer + vaso + extras</span>
              <PlusIcon className="size-5 text-action" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
