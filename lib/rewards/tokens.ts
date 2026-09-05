import { createHash, randomBytes } from "node:crypto";

export function createRewardToken() {
  return randomBytes(32).toString("base64url");
}

export function hashRewardToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function rewardDisplayCode() {
  return `MINI-${randomBytes(5).toString("hex").toUpperCase()}`;
}
