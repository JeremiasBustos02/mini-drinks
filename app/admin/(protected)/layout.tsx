import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/admin/auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  console.info(`${new Date().toISOString()} [admin-layout] enter`);
  await connection();
  console.info(`${new Date().toISOString()} [admin-layout] auth start`);
  const access = await getAdminAccess();
  console.info(`${new Date().toISOString()} [admin-layout] auth end`, {
    status: access.status,
  });
  if (access.status === "unauthenticated") {
    console.info(`${new Date().toISOString()} [admin-layout] redirect target`, "/admin/login");
    redirect("/admin/login");
  }
  if (access.status === "forbidden") {
    console.info(`${new Date().toISOString()} [admin-layout] redirect target`, "/admin/acceso-denegado");
    redirect("/admin/acceso-denegado");
  }

  console.info(`${new Date().toISOString()} [admin-layout] render complete`);
  return <AdminShell email={access.email}>{children}</AdminShell>;
}
