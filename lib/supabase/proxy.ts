import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  console.info(`${new Date().toISOString()} [admin-proxy] request`, request.nextUrl.pathname);
  let response = NextResponse.next({ request });
  let authHeaders: Record<string, string> = {};
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          authHeaders = headers;
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const claimsStartedAt = performance.now();
  const { data } = await supabase.auth.getClaims();
  console.info(`${new Date().toISOString()} [admin-proxy] getClaims end`, {
    authenticated: Boolean(data?.claims),
    durationMs: Math.round(performance.now() - claimsStartedAt),
  });
  const pathname = request.nextUrl.pathname;

  if (!data?.claims && pathname !== "/admin/login" && pathname !== "/admin/acceso-denegado") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    Object.entries(authHeaders).forEach(([key, value]) => redirectResponse.headers.set(key, value));
    console.info(`${new Date().toISOString()} [admin-proxy] redirect target`, "/admin/login");
    return redirectResponse;
  }

  console.info(`${new Date().toISOString()} [admin-proxy] continue`, pathname);
  return response;
}
