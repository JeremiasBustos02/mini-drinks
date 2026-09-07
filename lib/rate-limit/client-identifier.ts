import { isIP } from "node:net";

export type ClientIdentifierSource = "ip" | "attempt" | "fallback";

export type ClientIdentifier = {
  value: string;
  sourceType: ClientIdentifierSource;
};

function firstValidIp(value: string | null) {
  if (!value) return null;
  for (const candidate of value.split(",")) {
    const ip = candidate.trim();
    if (isIP(ip)) return ip;
  }
  return null;
}

export function getClientIdentifier(
  requestHeaders: Headers,
  checkoutAttemptId?: string,
  fallbackIdentifier?: string,
): ClientIdentifier {
  // Vercel Proxy calculates x-real-ip; prefer it over client-supplied forwarding headers.
  const ip = firstValidIp(requestHeaders.get("x-real-ip"))
    ?? firstValidIp(requestHeaders.get("x-forwarded-for"));
  if (ip) return { value: `ip:${ip}`, sourceType: "ip" };

  if (checkoutAttemptId) {
    return { value: `attempt:${checkoutAttemptId}`, sourceType: "attempt" };
  }

  return { value: `fallback:${fallbackIdentifier ?? crypto.randomUUID()}`, sourceType: "fallback" };
}
