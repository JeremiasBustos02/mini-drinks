import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "light" | "lightdark";
  className?: string;
};

const variants = {
  primary:
    "bg-action text-white border-action hover:bg-ink hover:border-ink",
  secondary:
    "bg-transparent text-ink border-ink hover:bg-ink hover:text-white",
  light: "bg-white text-action border-white hover:bg-mint hover:border-mint",
  lightdark: "bg-white text-action border-white hover:bg-ink hover:border-ink hover:text-white",
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border-2 px-6 py-3 text-base font-bold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
