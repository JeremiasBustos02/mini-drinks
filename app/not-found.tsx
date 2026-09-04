import Link from "next/link";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <StorefrontShell>
      <main id="contenido" className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-black tracking-[0.2em] text-action uppercase">Error 404</p>
            <h1 className="mt-3 font-display text-[clamp(3rem,10vw,6rem)] leading-[0.9] uppercase">
              Esta página no está.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
              Capaz cambió de lugar o el enlace llegó incompleto. Volvé al catálogo para seguir eligiendo.
            </p>
            <Link href="/productos" className="motion-button mt-8 inline-flex min-h-12 items-center rounded-xl bg-action px-6 py-3 font-bold text-white">
              Ver productos
            </Link>
          </div>
        </Container>
      </main>
    </StorefrontShell>
  );
}
