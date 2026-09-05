import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "light" | "lightdark" | "heroPrimary" | "heroSecondary";
  className?: string;
};

const variants = {
  primary:
    "bg-action text-white border-action shadow-[0_4px_0_#0D0D0D] hover:bg-ink hover:border-ink hover:shadow-[0_6px_0_#0D0D0D]",
  secondary:
    "bg-white text-ink border-ink shadow-[0_4px_0_#0D0D0D] hover:bg-ink hover:text-white hover:shadow-[0_6px_0_#0D0D0D]",
  light: "bg-white text-action border-white shadow-[0_4px_0_rgb(13_13_13_/_30%)] hover:bg-mint hover:border-mint hover:shadow-[0_6px_0_rgb(13_13_13_/_36%)]",
  lightdark: "bg-white text-action border-white shadow-[0_4px_0_rgb(13_13_13_/_30%)] hover:bg-ink hover:border-ink hover:text-white hover:shadow-[0_6px_0_rgb(13_13_13_/_36%)]",
  heroPrimary: "border-white bg-white text-action shadow-[0_8px_24px_rgb(0_0_0_/_22%)] hover:-translate-y-0.5 hover:border-mint hover:bg-mint active:shadow-[0_3px_12px_rgb(0_0_0_/_20%)]",
  heroSecondary: "border-white/55 bg-white/10 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_18%)] backdrop-blur-md hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/20 active:bg-white/25",
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
      className={`motion-cta inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 px-6 py-3 text-base font-bold ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
