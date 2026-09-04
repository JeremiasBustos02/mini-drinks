import Link from "next/link";

import { Container } from "@/components/ui/container";

const footerLinks = [
  { label: "Comprar", href: "/productos" },
  { label: "Armá tu combo", href: "/arma-tu-combo" },
  { label: "Packs", href: "/#packs" },
  { label: "Mayoristas", href: "/#mayoristas" },
  { label: "Eventos", href: "/#regalos-eventos" },
];

export function Footer() {
  return (
    <footer className="bg-ink py-12 text-white sm:py-16">
      <Container>
        <div className="grid gap-10 border-b border-white/20 pb-10 sm:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="font-display text-[clamp(3rem,12vw,7rem)] leading-none tracking-[-0.05em]">
              MINI<span className="text-mint">.</span>
            </p>
            <p className="mt-4 max-w-sm text-base text-white/65">
              Tu trago, en mini. Simple, distinto y listo para disfrutar.
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-6 gap-y-4 self-end text-sm font-bold sm:text-base"
            aria-label="Pie de página"
          >
            {footerLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white/75 transition-colors hover:text-mint"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs font-medium text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Marca temporal. Identidad final en desarrollo.</p>
          <p>+18 · Tomá con responsabilidad.</p>
        </div>
      </Container>
    </footer>
  );
}
