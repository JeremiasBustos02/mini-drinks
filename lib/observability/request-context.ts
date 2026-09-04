import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { headers } from "next/headers";

const SAFE_REQUEST_ID = /^[a-zA-Z0-9._:-]{1,100}$/;

export async function getRequestContext() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = forwardedFor || requestHeaders.get("x-real-ip") || "unknown";
  const incomingRequestId = requestHeaders.get("x-request-id") ?? "";

  return {
    correlationId: SAFE_REQUEST_ID.test(incomingRequestId) ? incomingRequestId : randomUUID(),
    clientIdentifier: createHash("sha256").update(clientAddress).digest("hex"),
  };
}
