import type { Metadata } from "next";

import { CheckoutPage } from "@/components/checkout/checkout-page";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getAccountAccess, getCustomerProfileId } from "@/lib/account/auth";
import { getAvailableLoyaltyBalance, loadLoyaltyRedemptionSettings } from "@/lib/loyalty/redemptions";

export const metadata: Metadata = {
  title: "Checkout | MINI.",
  description: "Completá tus datos y validá tu pedido.",
};

export default async function CheckoutRoute() {
  const access = await getAccountAccess();
  const customerProfileId = access.status === "authenticated" ? await getCustomerProfileId(access.userId) : null;
  const loyalty = customerProfileId
    ? { balance: await getAvailableLoyaltyBalance(customerProfileId), settings: await loadLoyaltyRedemptionSettings() }
    : null;
  return <StorefrontShell><main id="contenido"><CheckoutPage loyalty={loyalty} /></main></StorefrontShell>;
}
