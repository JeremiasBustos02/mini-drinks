import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MotionController } from "@/components/layout/motion-controller";

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
    </>
  );
}
