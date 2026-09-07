import { Container } from "@/components/ui/container";
import Link from "next/link";

const qrPattern = [0, 2, 5, 7, 8, 11, 13, 14];

export function SurpriseSection() {
  return (
    <section data-reveal="scale" className="surprise-section py-20 sm:py-28">
      <Container>
        <div className="grid overflow-hidden rounded-[1.75rem] bg-mint lg:grid-cols-2">
          <div className="p-7 sm:p-12 lg:p-16">
            <h2 className="font-display text-[clamp(2.5rem,10vw,5rem)] leading-[0.94] tracking-[-0.04em] uppercase">
              Siempre viene una sorpresa.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
              Algunos packs y campañas pueden esconder una tarjeta sorpresa.
              Escaneá el QR, iniciá sesión y sumá los puntos a tu Mini Club.
            </p>
            <Link
              href="/mini-club"
              className="motion-button mt-5 inline-flex min-h-11 cursor-pointer items-center text-sm font-black text-action hover:text-ink"
            >
              Conocé Mini Club →
            </Link>
          </div>
          <div className="surprise-visual relative min-h-[25rem] overflow-hidden bg-action sm:min-h-[32rem]">
            <div className="absolute top-[12%] left-[10%] w-[62%] -rotate-7 rounded-xl bg-white p-6 shadow-[10px_12px_0_#0d0d0d] sm:p-8">
              <p className="text-xs font-black tracking-widest text-action uppercase">
                Tarjeta sorpresa
              </p>
              <p className="mt-4 font-display text-2xl leading-none uppercase sm:text-4xl">
                Esto recién empieza.
              </p>
              <div
                className="mt-8 grid size-16 grid-cols-4 gap-1 bg-ink p-2"
                aria-hidden="true"
              >
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      qrPattern.includes(index) ? "bg-white" : "bg-ink"
                    }
                  />
                ))}
              </div>
            </div>
            <div className="absolute right-[8%] bottom-[9%] grid aspect-square w-[45%] rotate-9 place-items-center rounded-[30%] border-4 border-ink bg-[#f1e45c] shadow-[8px_10px_0_#0d0d0d]">
              <span className="font-display text-[clamp(1.4rem,6vw,3.5rem)] leading-none text-center uppercase">
                Mini
                <br /> club
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
