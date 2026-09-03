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
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return { status: "unauthenticated" };

  const [admin] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.authUserId, data.user.id))
    .limit(1);

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
