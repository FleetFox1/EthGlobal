# RPC Optimization - Rate Limiter & Request Deduplicator

**Date:** October 26, 2025  
**Issue:** Alchemy RPC exhaustion (39.4M requests/24h) during ETHOnline 2025 judging  
**Status:** ✅ Deployed

## 🚨 Problem

During hackathon judging, BugDex experienced critical RPC spam:
- **39.4M requests/24h** (~456 req/sec sustained)
- **8.7% success rate** (should be >95%)
- **56% throttled** by Alchemy rate limits
- **Pyth price feed broken** due to API exhaustion

### Root Causes (possible)
1. **FaucetButton**: 3 contract calls per mount with no caching
2. **StakeReturnNotification**: Memory leaks causing duplicate intervals
3. **Judge traffic**: Automated testing tools opening 50-100+ tabs simultaneously
4. **No rate limiting**: Components could make unlimited RPC calls

## ✅ Solution

### 1. Rate Limiter (`lib/rpc-providers.ts`)

**Implementation:**
```typescript
// Rate limit config
const MAX_CALLS_PER_MINUTE = 30; // Max 30 RPC calls per minute per user
const BLOCK_DURATION = 60000; // Block for 1 minute if exceeded

function isRateLimited(): boolean {
  // Tracks calls in sliding 60-second window
  // Blocks for 1 minute if limit exceeded
  // Auto-unblocks when cooldown expires
}
```

**Features:**
- **30 calls/min per user** session
- **1-minute cooldown** if exceeded
- Sliding window (not fixed intervals)
- Console warnings with countdown timer

**Console Output:**
```
🚫 Rate limit exceeded! 30 calls in last minute. Blocking for 60s
🚫 Rate limited. Unblocking in 47s
✅ Rate limit unblocked
```

### 2. Request Deduplicator (`lib/request-deduplicator.ts`)

**Implementation:**
```typescript
export async function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // If same request exists and is <500ms old, return cached promise
  // Otherwise execute and cache for 500ms
}

export function generateRequestKey(
  contractAddress: string,
  method: string,
  args: any[] = []
): string {
  return `${contractAddress}:${method}:${JSON.stringify(args)}`;
}
```

**Features:**
- **500ms deduplication window**
- Prevents duplicate calls from React re-renders
- Auto-cleanup after completion
- Works across all components

**Console Output:**
```
🔄 Deduplicating request: 0x123...abc:hasUnlocked:["0xUser"]
```

### 3. Updated FaucetButton (`components/FaucetButton.tsx`)

**Changes:**
```typescript
import { deduplicateRequest, generateRequestKey } from "@/lib/request-deduplicator";

// Wrap all contract calls
const contractUnlocked = await deduplicateRequest(
  generateRequestKey(bugTokenAddress, 'hasUnlocked', [walletAddress]),
  () => bugToken.hasUnlocked(walletAddress)
);

const canClaimNow = await deduplicateRequest(
  generateRequestKey(bugTokenAddress, 'canClaimFaucet', [walletAddress]),
  () => bugToken.canClaimFaucet(walletAddress)
);

const timeRemaining = await deduplicateRequest(
  generateRequestKey(bugTokenAddress, 'timeUntilNextClaim', [walletAddress]),
  () => bugToken.timeUntilNextClaim(walletAddress)
);
```

**Combined with existing 5-minute cache:**
- First load: 3 RPC calls (deduplicated)
- Within 500ms: 0 calls (deduplicator)
- Within 5 minutes: 0 calls (sessionStorage cache)
- After 5 minutes: 3 RPC calls (cache refresh)

## 📊 Expected Impact

| Metric | Before | After (Projected) |
|--------|--------|-------------------|
| Requests/24h | 39.4M (~456/sec) | <100K (~1-2/sec) |
| Success Rate | 8.7% | >95% |
| Throttled | 56% | <5% |
| Cost (Growth Plan) | ~$150/month | ~$5/month |

## 🛡️ Defense in Depth

The solution uses **4 layers** of protection:

1. **Rate Limiter** (30 calls/min)
   - Prevents runaway loops from any component
   - Even if 100 tabs open, max 3,000 calls/min = 180K/hour

2. **Request Deduplicator** (500ms window)
   - Eliminates duplicate calls from React re-renders
   - Prevents race conditions

3. **SessionStorage Cache** (5 minutes)
   - Prevents repeated checks from same user
   - Persists across navigation

4. **Fallback Providers**
   - Alchemy → rpc.sepolia.org → tenderly → publicnode
   - App stays functional during rate limits

## 🚀 Deployment

**Commit:** `86eed30`  
**Date:** October 26, 2025  
**Files Changed:**
- `apps/web/lib/rpc-providers.ts` (rate limiter added)
- `apps/web/lib/request-deduplicator.ts` (new file)
- `apps/web/components/FaucetButton.tsx` (deduplicator integration)

**Monitoring:**
- Check Alchemy dashboard in 30 minutes
- Target: <100K requests/24h
- Monitor during judging period (next 48-72 hours)

## 🔍 Testing Rate Limiter

To test locally:
1. Open browser console
2. Rapidly click FaucetButton or refresh page 30+ times in 1 minute
3. Should see: `🚫 Rate limit exceeded! 30 calls in last minute. Blocking for 60s`
4. Wait 60 seconds
5. Should see: `✅ Rate limit unblocked`

## 📝 Future Improvements

- [ ] Add rate limiter metrics to admin dashboard
- [ ] Implement per-IP rate limiting (backend)
- [ ] Add circuit breaker for >100 failures/5min
- [ ] Monitor RPC usage by endpoint (hasUnlocked vs canClaimFaucet)
- [ ] Consider upgrading to Alchemy Growth plan if sustained traffic
