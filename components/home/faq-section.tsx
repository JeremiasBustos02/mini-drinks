import { Container } from "@/components/ui/container";
import { PlusIcon } from "@/components/ui/icons";
import { faqItems } from "@/data/home";

export function FaqSection() {
  return (
    <section data-reveal="fade" className="py-20 sm:py-28" aria-labelledby="faq-title">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
          <div className="home-sticky-title">
            <p className="mb-3 text-xs font-black tracking-[0.2em] text-action uppercase">
              Antes de pedir
            </p>
            <h2
              id="faq-title"
              className="font-display text-[clamp(2.5rem,9vw,5rem)] leading-[0.95] tracking-[-0.04em] uppercase"
            >
              Preguntas frecuentes.
            </h2>
          </div>
          <div className="border-t border-ink/20">
            {faqItems.map((item) => (
              <details key={item.question} className="faq-item group border-b border-ink/20">
                <summary className="faq-summary flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-black sm:text-lg">
                  {item.question}
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white transition-transform group-open:rotate-45">
                    <PlusIcon />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-10 text-sm leading-relaxed text-ink/65 sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
