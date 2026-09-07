import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import type { StorefrontAsset } from "@/lib/storefront/assets";

export function WholesaleCta({
  asset: _asset,
}: {
  asset: StorefrontAsset | null;
}) {
  void _asset;
  return (
    <section
      id="mayoristas"
      data-reveal="fade"
      className="wholesale-section relative isolate bg-action py-24 text-white sm:py-28"
    >
      <div className="wholesale-backdrop" aria-hidden="true">
        <span className="wholesale-mass wholesale-mass-left" />
        <span className="wholesale-mass wholesale-mass-right" />
        <span className="wholesale-central-shape" />
      </div>
      <div
        className="wholesale-product wholesale-product-fernet"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/fernetsinfondo.png" />
      </div>
      <div
        className="wholesale-product wholesale-product-coke"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/cocacolapng.webp" />
      </div>
      <Container className="relative z-10">
        <div className="wholesale-content mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[clamp(2.5rem,10vw,6rem)] leading-[0.92] tracking-[-0.045em] uppercase">
            ¿Tenés un negocio?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Sumá minis, combos y opciones para reventa a tu mostrador.
          </p>
          <ButtonLink
            href="/mayoristas"
            variant="lightdark"
            className="mt-8 shrink-0 sm:mt-10"
          >
            Quiero venderlos
          </ButtonLink>
          <Link
            href="/mayoristas"
            className="motion-button mt-4 inline-flex min-h-11 cursor-pointer items-center text-sm font-bold text-white/75 hover:text-white"
          >
            ¿Cómo funciona? →
          </Link>
        </div>
      </Container>
    </section>
  );
}
