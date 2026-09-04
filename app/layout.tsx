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
  metadataBase: process.env.APP_URL ? new URL(process.env.APP_URL) : undefined,
  title: {
    default: "MINI. | Tu trago, en mini",
    template: "%s | MINI.",
  },
  description:
    "Miniaturas, combos y packs con todo lo que necesitás para hacerte un trago.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "MINI.",
    title: "MINI. | Tu trago, en mini",
    description:
      "Miniaturas, combos y packs con todo lo que necesitás para hacerte un trago.",
  },
  twitter: {
    card: "summary",
    title: "MINI. | Tu trago, en mini",
    description:
      "Miniaturas, combos y packs con todo lo que necesitás para hacerte un trago.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
