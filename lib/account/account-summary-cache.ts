export type AccountSummary = { displayName: string; availablePoints: string };

export function createAccountSummaryCache(
  load: () => Promise<AccountSummary>,
  now: () => number = Date.now,
  ttlMs = 60_000,
) {
  let cached: { value: AccountSummary; loadedAt: number } | null = null;
  let request: Promise<AccountSummary> | null = null;
  let generation = 0;

  return {
    ensure() {
      if (cached && now() - cached.loadedAt < ttlMs)
        return Promise.resolve(cached.value);
      if (!request) {
        const requestGeneration = generation;
        request = load()
          .then((value) => {
            if (requestGeneration === generation)
              cached = { value, loadedAt: now() };
            return value;
          })
          .finally(() => {
            request = null;
          });
      }
      return request;
    },
    invalidate() {
      generation += 1;
      cached = null;
    },
  };
}
