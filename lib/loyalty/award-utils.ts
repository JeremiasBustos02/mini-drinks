export function purchaseEarnIdempotencyKey(orderId: string) {
  return `order:${orderId}:purchase-earned`;
}

export async function tryLoyaltyAwardAfterPaymentCommit<T>(award: () => Promise<T>) {
  try {
    return { status: "completed" as const, result: await award() };
  } catch (error) {
    return {
      status: "failed" as const,
      errorName: error instanceof Error ? error.name : "UnknownError",
    };
  }
}
