import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 900 // 15 minutes default
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return cached as T;
  }

  // Cache miss → fetch data
  const data = await fetcher();

  // Save to cache
  await redis.set(key, data, { ex: ttl });

  return data;
}

export async function invalidateCache(key: string) {
  await redis.del(key);
}
