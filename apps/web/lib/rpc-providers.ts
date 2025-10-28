/**
 * RPC Provider with automatic fallback, rate limiting, and circuit breaker
 * Falls back to public Sepolia RPC if Alchemy is rate limited
 * Implements client-side rate limiter to prevent RPC spam
 * Uses circuit breaker to prevent cascading failures
 */

import { ethers } from "ethers";
import { alchemyCircuitBreaker } from "./circuit-breaker";

// Primary provider (Alchemy)
const ALCHEMY_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/zhDx7ikWXX8vnhobQBhMb";

// Fallback providers (free public RPCs)
const FALLBACK_RPCS = [
  "https://rpc.sepolia.org",
  "https://sepolia.gateway.tenderly.co",
  "https://ethereum-sepolia.publicnode.com",
];

// Rate limiter state (in-memory)
interface RateLimiterState {
  calls: number[];
  blocked: boolean;
  blockedUntil: number;
}

const rateLimiter: RateLimiterState = {
  calls: [],
  blocked: false,
  blockedUntil: 0,
};

// Rate limit config
const MAX_CALLS_PER_MINUTE = 30; // Max 30 RPC calls per minute per user
const BLOCK_DURATION = 60000; // Block for 1 minute if rate limit exceeded

/**
 * Check if rate limit is exceeded
 * Returns true if too many calls in last minute
 */
function isRateLimited(): boolean {
  const now = Date.now();
  
  // Check if currently blocked
  if (rateLimiter.blocked && now < rateLimiter.blockedUntil) {
    console.warn(`🚫 Rate limited. Unblocking in ${Math.ceil((rateLimiter.blockedUntil - now) / 1000)}s`);
    return true;
  } else if (rateLimiter.blocked && now >= rateLimiter.blockedUntil) {
    // Unblock
    rateLimiter.blocked = false;
    rateLimiter.calls = [];
    console.log("✅ Rate limit unblocked");
  }
  
  // Remove calls older than 1 minute
  rateLimiter.calls = rateLimiter.calls.filter(timestamp => now - timestamp < 60000);
  
  // Check if exceeded limit
  if (rateLimiter.calls.length >= MAX_CALLS_PER_MINUTE) {
    console.error(`🚫 Rate limit exceeded! ${rateLimiter.calls.length} calls in last minute. Blocking for ${BLOCK_DURATION / 1000}s`);
    rateLimiter.blocked = true;
    rateLimiter.blockedUntil = now + BLOCK_DURATION;
    return true;
  }
  
  // Record this call
  rateLimiter.calls.push(now);
  return false;
}

/**
 * Get a provider with automatic fallback and circuit breaker
 * Tries Alchemy first, then falls back to public RPCs
 */
export async function getRobustProvider(): Promise<ethers.JsonRpcProvider> {
  // Check rate limit
  if (isRateLimited()) {
    throw new Error("Rate limit exceeded. Please wait before making more requests.");
  }
  
  // Try Alchemy first with circuit breaker protection
  if (alchemyCircuitBreaker.isAvailable()) {
    try {
      const provider = await alchemyCircuitBreaker.execute(async () => {
        const p = new ethers.JsonRpcProvider(ALCHEMY_RPC);
        await p.getBlockNumber(); // Test if it works
        return p;
      });
      console.log("✅ Using Alchemy RPC");
      return provider;
    } catch (error) {
      console.warn("⚠️ Alchemy RPC failed (circuit breaker may be open), trying fallbacks...");
    }
  } else {
    console.warn("⚠️ Alchemy circuit breaker is OPEN, using fallbacks...");
  }

  // Try fallbacks
  for (const rpc of FALLBACK_RPCS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      await provider.getBlockNumber(); // Test if it works
      console.log(`✅ Using fallback RPC: ${rpc}`);
      return provider;
    } catch (error) {
      console.warn(`❌ Fallback failed: ${rpc}`);
      continue;
    }
  }

  // All failed - return Alchemy anyway (will throw errors but better than nothing)
  console.error("❌ All RPC providers failed, using Alchemy as last resort");
  return new ethers.JsonRpcProvider(ALCHEMY_RPC);
}

/**
 * Get a browser provider with fallback
 * For user-initiated transactions that need wallet connection
 */
export async function getBrowserProvider(): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) {
    throw new Error("No wallet detected");
  }
  
  return new ethers.BrowserProvider(window.ethereum);
}
