import "server-only";

import { cache } from "react";

import { getAccountAccess } from "@/lib/account/auth";

export type AdminAccess =
  | { status: "unauthenticated" }
  | { status: "forbidden"; userId: string }
  | { status: "authorized"; userId: string; email: string | null };

export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const access = await getAccountAccess();
  if (access.status === "unauthenticated") return access;
  if (!access.isAdmin) return { status: "forbidden", userId: access.userId };

  return {
    status: "authorized",
    userId: access.userId,
    email: access.email,
  };
});

export class AdminAuthorizationError extends Error {
  constructor(public readonly reason: "unauthenticated" | "forbidden") {
    super(reason === "unauthenticated" ? "Sesión no válida." : "Acceso no autorizado.");
    this.name = "AdminAuthorizationError";
  }
}

export async function requireAdmin() {
  const access = await getAdminAccess();
  if (access.status !== "authorized") throw new AdminAuthorizationError(access.status);
  return access;
}
