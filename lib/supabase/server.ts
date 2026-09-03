import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          console.info(`${new Date().toISOString()} [login] cookie setAll start`, {
            count: cookiesToSet.length,
          });
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
            console.info(`${new Date().toISOString()} [login] cookie setAll complete`);
          } catch (error) {
            console.error(`${new Date().toISOString()} [login] cookie setAll error`, {
              errorType: error instanceof Error ? error.name : "unknown",
            });
            // Server Components cannot write cookies; proxy.ts refreshes them.
          }
        },
      },
    },
  );
}
