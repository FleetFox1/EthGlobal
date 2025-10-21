/**
 * Local storage utilities for persisting user data
 * This is a temporary solution until we add a proper database
 */

export interface StoredUpload {
  id: string;
  imageCid: string;
  metadataCid: string;
  imageUrl: string;
  metadataUrl: string;
  discoverer: string;
  timestamp: number;
  location: {
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  bugInfo?: any;
  submittedToBlockchain: boolean;
  transactionHash?: string;
  submissionId?: number;
}

const UPLOADS_KEY = 'bugdex_uploads';
const PROFILE_KEY = 'bugdex_profile';

/**
 * Get all uploads for a wallet address
 */
export function getLocalUploads(walletAddress: string): StoredUpload[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `${UPLOADS_KEY}_${walletAddress.toLowerCase()}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load uploads from localStorage:', error);
    return [];
  }
}

/**
 * Save an upload to localStorage
 */
export function saveLocalUpload(walletAddress: string, upload: StoredUpload): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${UPLOADS_KEY}_${walletAddress.toLowerCase()}`;
    const uploads = getLocalUploads(walletAddress);
    
    // Check if upload already exists (by id or imageCid)
    const existingIndex = uploads.findIndex(
      u => u.id === upload.id || u.imageCid === upload.imageCid
    );
    
    if (existingIndex >= 0) {
      // Update existing upload
      uploads[existingIndex] = upload;
    } else {
      // Add new upload
      uploads.push(upload);
    }
    
    localStorage.setItem(key, JSON.stringify(uploads));
    console.log(`✅ Saved upload to localStorage: ${upload.id}`);
  } catch (error) {
    console.error('Failed to save upload to localStorage:', error);
  }
}

/**
 * Delete an upload from localStorage
 */
export function deleteLocalUpload(walletAddress: string, uploadId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${UPLOADS_KEY}_${walletAddress.toLowerCase()}`;
    const uploads = getLocalUploads(walletAddress);
    const filtered = uploads.filter(u => u.id !== uploadId);
    
    localStorage.setItem(key, JSON.stringify(filtered));
    console.log(`🗑️ Deleted upload from localStorage: ${uploadId}`);
  } catch (error) {
    console.error('Failed to delete upload from localStorage:', error);
  }
}

/**
 * Mark an upload as submitted to blockchain
 */
export function markUploadAsSubmitted(
  walletAddress: string,
  uploadId: string,
  submissionId: number,
  transactionHash: string
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const uploads = getLocalUploads(walletAddress);
    const upload = uploads.find(u => u.id === uploadId);
    
    if (upload) {
      upload.submittedToBlockchain = true;
      upload.submissionId = submissionId;
      upload.transactionHash = transactionHash;
      
      const key = `${UPLOADS_KEY}_${walletAddress.toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify(uploads));
      console.log(`✅ Marked upload as submitted: ${uploadId}`);
    }
  } catch (error) {
    console.error('Failed to update upload in localStorage:', error);
  }
}

/**
 * Save user profile to localStorage (backup to blockchain)
 */
export function saveLocalProfile(walletAddress: string, profile: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${PROFILE_KEY}_${walletAddress.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(profile));
    console.log(`✅ Saved profile to localStorage for ${walletAddress}`);
  } catch (error) {
    console.error('Failed to save profile to localStorage:', error);
  }
}

/**
 * Get user profile from localStorage
 */
export function getLocalProfile(walletAddress: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = `${PROFILE_KEY}_${walletAddress.toLowerCase()}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load profile from localStorage:', error);
    return null;
  }
}
