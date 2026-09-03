import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/admin/auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/admin/login");
  if (access.status === "forbidden") redirect("/admin/acceso-denegado");

  return <AdminShell email={access.email}>{children}</AdminShell>;
}
