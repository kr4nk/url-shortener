const cache = new Map<string, any>();
const cacheTimeouts = new Map<string, number>();

export default async function cachedFetch<T>(
  url: string,
  fetchFunction: () => Promise<T>,
  {
    cacheTimeout: cacheTimeoutMs = 0,
    invalidateCache = false,
  }: {
    cacheTimeout?: number;
    invalidateCache?: boolean;
  } = {}
): Promise<T> {
  if (invalidateCache) {
    cache.delete(url);
    cacheTimeouts.delete(url);
  }

  const cachedResult = cache.get(url);
  const cachedTime = cacheTimeouts.get(url);

  if (
    cachedResult &&
    (cacheTimeoutMs === 0 ||
      (cachedTime && Date.now() - cachedTime <= cacheTimeoutMs))
  ) {
    return cachedResult;
  }

  try {
    const result = await fetchFunction();
    cache.set(url, result);
    if (cacheTimeoutMs > 0) {
      cacheTimeouts.set(url, Date.now());
    }
    return result;
  } catch (error) {
    cache.delete(url);
    cacheTimeouts.delete(url);
    throw error;
  }
}
