import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración | MINI.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  console.info(`${new Date().toISOString()} [admin-root-layout] enter`);
  return children;
}
