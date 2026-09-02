import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { brandBenefits } from "@/data/home";

export function BrandBenefits() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="No es solo una mini"
          title="Todo suma."
          description="El diferencial está en cómo llega, cómo se abre y lo fácil que es disfrutarlo."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {brandBenefits.map((item, index) => (
            <article
              key={item.title}
              className={`min-h-64 rounded-[1.5rem] border border-ink/10 p-6 sm:p-7 ${
                index === 2 ? "bg-mint" : "bg-white"
              }`}
            >
              <span className="grid size-12 place-items-center rounded-xl bg-ink font-black text-white">
                {item.icon}
              </span>
              <h3 className="mt-10 font-display text-xl leading-tight uppercase sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{item.copy}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
