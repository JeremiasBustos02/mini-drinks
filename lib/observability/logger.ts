type LogLevel = "info" | "warn" | "error";

const SENSITIVE_KEY = /password|token|cookie|secret|authorization|email|phone|address|document|payload|body/i;

export function sanitizeLogContext(value: unknown): unknown {
  if (value instanceof Error) return { errorName: value.name };
  if (Array.isArray(value)) return value.map(sanitizeLogContext);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[redacted]" : sanitizeLogContext(entry),
    ]),
  );
}

export function logServerEvent(
  level: LogLevel,
  event: string,
  context: Record<string, unknown> = {},
) {
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    ...sanitizeLogContext(context) as Record<string, unknown>,
  });
  console[level](record);
}
