import { createHash } from "node:crypto";

export type RateLimitPolicy = {
  name: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  source: "redis" | "local" | "unavailable";
};

export const rateLimitPolicies = {
  quoteIp: { name: "checkout-quote-ip", limit: 60, windowSeconds: 60 },
  quoteAttempt: { name: "checkout-quote-attempt", limit: 30, windowSeconds: 60 },
  createIp: { name: "checkout-create-ip", limit: 20, windowSeconds: 60 },
  createAttempt: { name: "checkout-create-attempt", limit: 10, windowSeconds: 60 },
  webhookIp: { name: "mp-webhook-ip", limit: 300, windowSeconds: 60 },
  webhookPayment: { name: "mp-webhook-payment", limit: 120, windowSeconds: 60 },
} satisfies Record<string, RateLimitPolicy>;

const localWindows = new Map<string, { count: number; resetAt: number }>();
const INCREMENT_SCRIPT = `local current = redis.call('INCR', KEYS[1]); if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; local ttl = redis.call('TTL', KEYS[1]); return {current, ttl}`;

function keyFor(policy: RateLimitPolicy, identifier: string) {
  const digest = createHash("sha256").update(identifier).digest("hex");
  return `mini-drinks:rate-limit:${policy.name}:${digest}`;
}

function result(policy: RateLimitPolicy, count: number, retryAfterSeconds: number, source: RateLimitResult["source"]): RateLimitResult {
  return {
    allowed: count <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(policy.limit - count, 0),
    retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    source,
  };
}

export async function checkRateLimit(
  policy: RateLimitPolicy,
  identifier: string,
  options: { now?: number; fetch?: typeof fetch } = {},
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = keyFor(policy, identifier);

  if (url && token) {
    try {
      const response = await (options.fetch ?? fetch)(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(["EVAL", INCREMENT_SCRIPT, "1", key, String(policy.windowSeconds)]),
        signal: AbortSignal.timeout(1_000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Rate limit store rejected the request.");
      const body = await response.json() as { result?: [number, number]; error?: string };
      if (body.error || !Array.isArray(body.result)) throw new Error("Invalid rate limit response.");
      return result(policy, Number(body.result[0]), Number(body.result[1]), "redis");
    } catch {
      if (process.env.NODE_ENV === "production") {
        return { allowed: false, limit: policy.limit, remaining: 0, retryAfterSeconds: 30, source: "unavailable" };
      }
    }
  } else if (process.env.NODE_ENV === "production") {
    return { allowed: false, limit: policy.limit, remaining: 0, retryAfterSeconds: 30, source: "unavailable" };
  }

  const now = options.now ?? Date.now();
  const existing = localWindows.get(key);
  const window = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + policy.windowSeconds * 1_000 }
    : existing;
  window.count += 1;
  localWindows.set(key, window);
  return result(policy, window.count, Math.ceil((window.resetAt - now) / 1_000), "local");
}

export function resetLocalRateLimitsForTests() {
  localWindows.clear();
}

export async function checkRateLimitStore(request: typeof fetch = fetch) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const response = await request(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["PING"]),
      signal: AbortSignal.timeout(1_000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const body = await response.json() as { result?: string };
    return body.result === "PONG";
  } catch {
    return false;
  }
}
