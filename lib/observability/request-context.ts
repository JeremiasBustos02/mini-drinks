import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { headers } from "next/headers";

import { getClientIdentifier } from "@/lib/rate-limit/client-identifier";

const SAFE_REQUEST_ID = /^[a-zA-Z0-9._:-]{1,100}$/;

export async function getRequestContext(checkoutAttemptId?: string) {
  const requestHeaders = await headers();
  const incomingRequestId = requestHeaders.get("x-request-id") ?? "";
  const correlationId = SAFE_REQUEST_ID.test(incomingRequestId) ? incomingRequestId : randomUUID();
  const client = getClientIdentifier(requestHeaders, checkoutAttemptId, correlationId);

  return {
    correlationId,
    clientIdentifier: createHash("sha256").update(client.value).digest("hex"),
    clientIdentifierSourceType: client.sourceType,
  };
}
