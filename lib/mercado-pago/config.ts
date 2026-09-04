import "server-only";

export function getAppUrl() {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL is required for Mercado Pago URLs.");

  const url = new URL(value);
  const isLocalDevelopment =
    process.env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  if (url.protocol !== "https:" && !isLocalDevelopment) {
    throw new Error("APP_URL must use HTTPS outside local development.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("APP_URL must be an origin without credentials, query, or hash.");
  }
  return url.origin;
}

export function getMercadoPagoAccessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN is required.");
  return token;
}

export function getMercadoPagoWebhookSecret() {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) throw new Error("MERCADO_PAGO_WEBHOOK_SECRET is required.");
  return secret;
}
