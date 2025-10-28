/**
 * Server-Side Rate Limiter
 * 
 * Implements token bucket algorithm with:
 * - Per-IP rate limiting
 * - Global rate limiting
 * - Configurable time windows
 * - Automatic cleanup of stale entries
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private config: RateLimitConfig) {
    // Cleanup stale entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request is allowed
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    // No entry or entry expired - allow and create new entry
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.config.windowMs;
      this.store.set(key, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Entry exists and not expired
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current stats
   */
  getStats(): { totalKeys: number; activeKeys: number } {
    const now = Date.now();
    let activeKeys = 0;

    for (const entry of this.store.values()) {
      if (now < entry.resetTime) {
        activeKeys++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys,
    };
  }

  /**
   * Destroy rate limiter and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Create rate limiter instances
export const ipRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 100,        // 100 requests per minute per IP
});

export const globalRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 10000,      // 10k requests per minute globally
});

// Strict rate limiter for RPC-heavy endpoints
export const rpcRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 20,         // 20 requests per minute per IP for RPC endpoints
});

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIp(headers: Headers): string {
  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a constant if we can't determine IP
  // This means all requests will share the same rate limit
  return 'unknown';
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

/**
 * Apply rate limiting to a request
 * Returns result with rate limit headers
 */
export function checkRateLimit(
  ip: string,
  limiter: RateLimiter = ipRateLimiter
): RateLimitResult {
  const result = limiter.check(ip);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return {
      success: false,
      limit: limiter['config'].maxRequests,
      remaining: 0,
      reset: result.resetTime,
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    };
  }

  return {
    success: true,
    limit: limiter['config'].maxRequests,
    remaining: result.remaining,
    reset: result.resetTime,
  };
}
