/**
 * Browser-compatible IPFS utilities
 * These functions call API routes instead of using Node.js Lighthouse SDK directly
 */

import { UserProfile } from './types/profile';

export type { UserProfile };

/**
 * Upload profile data to IPFS via API route
 */
export async function uploadProfile(
  profileData: UserProfile,
  walletAddress: string
): Promise<string> {
  const response = await fetch('/api/upload-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileData, walletAddress }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload profile');
  }

  const { ipfsHash } = await response.json();
  return ipfsHash;
}

/**
 * Upload avatar image to IPFS via API route
 */
export async function uploadAvatar(file: File): Promise<string> {
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Avatar must be less than 5MB');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload avatar');
  }

  const { cid } = await response.json();
  return cid;
}

/**
 * Fetch profile data from IPFS
 */
export async function fetchProfile(ipfsHash: string): Promise<UserProfile | null> {
  try {
    const url = `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch profile from IPFS:', response.statusText);
      return null;
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error fetching profile from IPFS:', error);
    return null;
  }
}

/**
 * Get avatar URL from IPFS hash
 */
export function getAvatarUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}
