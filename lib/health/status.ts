export type HealthStatus = "ok" | "degraded" | "unavailable";

export function getHealthStatus(databaseAvailable: boolean, rateLimitConfigured: boolean): HealthStatus {
  if (!databaseAvailable) return "unavailable";
  return rateLimitConfigured ? "ok" : "degraded";
}
