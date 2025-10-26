/**
 * Request Deduplicator
 * Prevents duplicate RPC calls from executing simultaneously
 * If same request is made within 500ms, return cached result
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();

// Cache duration: 500ms
const CACHE_DURATION = 500;

/**
 * Deduplicate a request
 * If same request key exists and is recent, return cached promise
 * Otherwise execute the request and cache it
 */
export async function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  
  // Check if request is already pending
  const pending = pendingRequests.get(key);
  if (pending && (now - pending.timestamp) < CACHE_DURATION) {
    console.log(`🔄 Deduplicating request: ${key}`);
    return pending.promise;
  }
  
  // Execute new request
  const promise = fn();
  pendingRequests.set(key, { promise, timestamp: now });
  
  // Clean up after completion
  promise.finally(() => {
    const current = pendingRequests.get(key);
    if (current && current.timestamp === now) {
      pendingRequests.delete(key);
    }
  });
  
  return promise;
}

/**
 * Generate a request key from contract address + method + args
 */
export function generateRequestKey(
  contractAddress: string,
  method: string,
  args: any[] = []
): string {
  return `${contractAddress}:${method}:${JSON.stringify(args)}`;
}
