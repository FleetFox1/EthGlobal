/**
 * API Middleware for Next.js Route Handlers
 * 
 * Provides rate limiting and circuit breaker protection for API routes
 * Usage:
 * 
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await withRateLimit(request);
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // Your API logic here
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { ipRateLimiter, rpcRateLimiter, getClientIp, checkRateLimit } from './rate-limiter';
import { getAllCircuitStats } from './circuit-breaker';

/**
 * Apply rate limiting to a Next.js API route
 * Returns { success: true } or { success: false, response: NextResponse }
 */
export async function withRateLimit(
  request: NextRequest,
  options: { strict?: boolean } = {}
): Promise<{ success: boolean; response?: NextResponse }> {
  const ip = getClientIp(request.headers);
  const limiter = options.strict ? rpcRateLimiter : ipRateLimiter;
  
  const result = checkRateLimit(ip, limiter);

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: result.error,
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    };
  }

  return { success: true };
}

/**
 * Apply strict rate limiting for RPC-heavy endpoints
 */
export async function withStrictRateLimit(
  request: NextRequest
): Promise<{ success: boolean; response?: NextResponse }> {
  return withRateLimit(request, { strict: true });
}

/**
 * Add rate limit headers to any response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
  return response;
}

/**
 * API route to check rate limiter and circuit breaker health
 * GET /api/admin/health
 */
export async function getHealthStatus(): Promise<{
  rateLimiter: {
    ip: ReturnType<typeof ipRateLimiter.getStats>;
    rpc: ReturnType<typeof rpcRateLimiter.getStats>;
  };
  circuitBreakers: ReturnType<typeof getAllCircuitStats>;
  timestamp: string;
}> {
  return {
    rateLimiter: {
      ip: ipRateLimiter.getStats(),
      rpc: rpcRateLimiter.getStats(),
    },
    circuitBreakers: getAllCircuitStats(),
    timestamp: new Date().toISOString(),
  };
}
