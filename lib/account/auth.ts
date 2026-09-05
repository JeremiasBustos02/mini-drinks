import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/lib/db";
import { adminUsers, customerProfiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export type AccountAccess =
  | { status: "unauthenticated" }
  | { status: "authenticated"; userId: string; email: string | null; isAdmin: boolean };

export async function isAdminUser(userId: string) {
  const [admin] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.authUserId, userId))
    .limit(1);

  return Boolean(admin);
}

export const getAccountAccess = cache(async (): Promise<AccountAccess> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "unauthenticated" };

  return {
    status: "authenticated",
    userId: data.user.id,
    email: data.user.email ?? null,
    isAdmin: await isAdminUser(data.user.id),
  };
});

export async function getCustomerProfile(userId: string) {
  const [profile] = await db
    .select({ displayName: customerProfiles.displayName, phone: customerProfiles.phone })
    .from(customerProfiles)
    .where(eq(customerProfiles.authUserId, userId))
    .limit(1);

  return profile ?? null;
}
