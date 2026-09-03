import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export default function ProductsNotFound() {
  return (
    <StorefrontShell>
      <main id="contenido" className="py-20 sm:py-28">
        <Container>
          <p className="text-xs font-black tracking-[0.18em] text-action uppercase">404</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,10vw,6rem)] leading-[0.9] uppercase">
            No encontramos esta opción.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Puede que ya no esté disponible o que el enlace haya cambiado.
          </p>
          <ButtonLink href="/productos" className="mt-8">
            Ver catálogo
          </ButtonLink>
        </Container>
      </main>
    </StorefrontShell>
  );
}
