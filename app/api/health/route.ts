import { sql } from "drizzle-orm";

import { getHealthStatus } from "@/lib/health/status";
import { checkRateLimitStore } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let databaseAvailable = false;
  try {
    const { db } = await import("@/lib/db");
    await db.execute(sql`select 1`);
    databaseAvailable = true;
  } catch {
    // The public response deliberately omits connection and configuration details.
  }

  const rateLimitAvailable = await checkRateLimitStore();
  const status = getHealthStatus(databaseAvailable, rateLimitAvailable);
  return Response.json(
    { status },
    {
      status: status === "unavailable" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
