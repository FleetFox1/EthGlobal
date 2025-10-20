/**
 * Shared type definitions for user profiles
 */

export interface UserProfile {
  username?: string;
  bio?: string;
  email?: string;
  avatar?: string; // IPFS hash of avatar image
  socialLinks?: {
    twitter?: string;
    github?: string;
    telegram?: string;
    discord?: string;
  };
  wallets?: {
    eth?: string;
    solana?: string;
    bitcoin?: string;
  };
  metadata?: {
    version?: string;
    createdAt?: number;
    updatedAt?: number | string; // Can be timestamp or ISO string
  };
}
