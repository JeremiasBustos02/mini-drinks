"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export default function ComboBuilderError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Combo builder route failed to render.", error);
  }, [error]);

  return (
    <main id="contenido" className="py-20 sm:py-28">
      <Container>
        <h1 className="font-display text-[clamp(3rem,10vw,6rem)] leading-[0.9] uppercase">
          No pudimos cargar el constructor.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
          Probá de nuevo en unos instantes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border-2 border-action bg-action px-6 py-3 font-bold text-white"
          >
            Reintentar
          </button>
          <ButtonLink href="/" variant="secondary">
            Volver al inicio
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
