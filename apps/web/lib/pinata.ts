/**
 * IPFS Utility Functions
 * NOTE: All upload functions now use Pinata via ipfs-client.ts
 */

import { UserProfile } from './types/profile';

export type { UserProfile };

export function getIPFSUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/`;
}

export function extractCID(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', '');
  }
  if (ipfsUrl.includes('/ipfs/')) {
    return ipfsUrl.split('/ipfs/')[1];
  }
  return ipfsUrl;
}