import type { Metadata } from "next";
import { Bowlby_One_SC, Roboto } from "next/font/google";

import "./globals.css";

const bowlby = Bowlby_One_SC({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-bowlby",
  weight: "400",
});

const roboto = Roboto({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "MINI. | Tu trago, en mini",
  description:
    "Miniaturas, combos y packs con todo lo que necesitás para hacerte un trago.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bowlby.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
