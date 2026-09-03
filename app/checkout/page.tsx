import type { Metadata } from "next";

import { CheckoutPage } from "@/components/checkout/checkout-page";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export const metadata: Metadata = {
  title: "Checkout | MINI.",
  description: "Completá tus datos y validá tu pedido.",
};

export default function CheckoutRoute() {
  return <StorefrontShell><main id="contenido"><CheckoutPage /></main></StorefrontShell>;
}
