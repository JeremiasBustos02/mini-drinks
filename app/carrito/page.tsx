import type { Metadata } from "next";

import { CartPage } from "@/components/cart/cart-page";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export const metadata: Metadata = {
  title: "Carrito | MINI.",
  description: "Revisá los minis y combos que elegiste.",
};

export default function CartRoute() {
  return (
    <StorefrontShell>
      <main id="contenido"><CartPage /></main>
    </StorefrontShell>
  );
}
