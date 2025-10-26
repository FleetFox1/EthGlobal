/**
 * RPC Provider with automatic fallback
 * Falls back to public Sepolia RPC if Alchemy is rate limited
 */

import { ethers } from "ethers";

// Primary provider (Alchemy)
const ALCHEMY_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/zhDx7ikWXX8vnhobQBhMb";

// Fallback providers (free public RPCs)
const FALLBACK_RPCS = [
  "https://rpc.sepolia.org",
  "https://sepolia.gateway.tenderly.co",
  "https://ethereum-sepolia.publicnode.com",
];

/**
 * Get a provider with automatic fallback
 * Tries Alchemy first, then falls back to public RPCs
 */
export async function getRobustProvider(): Promise<ethers.JsonRpcProvider> {
  // Try Alchemy first
  try {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC);
    await provider.getBlockNumber(); // Test if it works
    console.log("✅ Using Alchemy RPC");
    return provider;
  } catch (error) {
    console.warn("⚠️ Alchemy RPC failed, trying fallbacks...");
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
