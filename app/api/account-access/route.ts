import { NextResponse } from "next/server";

import { getAccountAccess } from "@/lib/account/auth";

export async function GET() {
  const access = await getAccountAccess();
  if (access.status === "unauthenticated")
    return NextResponse.json({
      label: "Ingresar",
      href: "/login",
      kind: "guest",
    });
  return NextResponse.json(
    access.isAdmin
      ? { label: "Dashboard", href: "/admin", kind: "admin" }
      : { label: "Mi cuenta", href: "/mi-cuenta", kind: "customer" },
  );
}
