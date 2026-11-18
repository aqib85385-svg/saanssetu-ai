/**
 * In-memory token bucket rate limiter for Next.js API Routes.
 * Lightweight, zero external Redis dependencies, leak-free with automatic sweep.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Sweep expired records every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number; // e.g. 20 requests
  windowMs: number; // e.g. 60 * 1000 (1 min)
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 30, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetMs: config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(record.resetTime - now, 0),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetMs: Math.max(record.resetTime - now, 0),
  };
}
