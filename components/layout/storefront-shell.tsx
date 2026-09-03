import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MotionController } from "@/components/layout/motion-controller";
import { CartDrawer } from "@/components/cart/cart-drawer";

type StorefrontShellProps = {
  children: ReactNode;
};

export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <>
      <MotionController />
      <Header />
      {children}
      <Footer />
      <CartDrawer />
    </>
  );
}
