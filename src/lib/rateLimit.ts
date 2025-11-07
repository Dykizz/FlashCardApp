import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const isDev = process.env.NODE_ENV === "development";

export const rateLimiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(isDev ? 1000 : 5, "1 m"), // 1000 ở dev, 5 ở prod
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(isDev ? 1000 : 30, "1 m"), // 1000 ở dev, 30 ở prod
    analytics: true,
    prefix: "ratelimit:api",
  }),

  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(isDev ? 1000 : 10, "1 m"),
    analytics: true,
    prefix: "ratelimit:public",
  }),
};

export async function checkRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiters = "api"
) {
  // ⭐ Bypass hoàn toàn rate limit trong dev
  if (isDev) {
    return {
      success: true,
      limit: 1000,
      reset: Date.now() + 60000,
      remaining: 1000,
      headers: {
        "X-RateLimit-Limit": "1000",
        "X-RateLimit-Remaining": "1000",
        "X-RateLimit-Reset": new Date(Date.now() + 60000).toISOString(),
      },
    };
  }

  const { success, limit, reset, remaining } = await rateLimiters[
    limiter
  ].limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    },
  };
}
