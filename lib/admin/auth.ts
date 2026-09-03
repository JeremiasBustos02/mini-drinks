import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export type AdminAccess =
  | { status: "unauthenticated" }
  | { status: "forbidden"; userId: string }
  | { status: "authorized"; userId: string; email: string | null };

export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  console.info(`${new Date().toISOString()} [admin-auth] execution start`);
  const supabase = await createClient();
  console.info(`${new Date().toISOString()} [admin-auth] auth.getUser start`);
  const getUserStartedAt = performance.now();
  const { data, error } = await supabase.auth.getUser();
  console.info(`${new Date().toISOString()} [admin-auth] auth.getUser end`, {
    durationMs: Math.round(performance.now() - getUserStartedAt),
    status: error || !data.user ? "unauthenticated" : "authenticated",
  });

  if (error || !data.user) return { status: "unauthenticated" };

  console.info(`${new Date().toISOString()} [admin-auth] admin_users query start`);
  const adminQueryStartedAt = performance.now();
  const [admin] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.authUserId, data.user.id))
    .limit(1);
  console.info(`${new Date().toISOString()} [admin-auth] admin_users query end`, {
    durationMs: Math.round(performance.now() - adminQueryStartedAt),
    status: admin ? "authorized" : "forbidden",
  });

  if (!admin) return { status: "forbidden", userId: data.user.id };

  return {
    status: "authorized",
    userId: data.user.id,
    email: data.user.email ?? null,
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
