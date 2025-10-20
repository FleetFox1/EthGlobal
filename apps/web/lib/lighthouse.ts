import lighthouse from "@lighthouse-web3/sdk";
import { UserProfile } from './types/profile';

export type { UserProfile };

function getAPIKey(): string {
  const apiKey = process.env.LIGHTHOUSE_API_KEY;
  if (!apiKey) {
    throw new Error("LIGHTHOUSE_API_KEY is not defined in environment variables");
  }
  return apiKey;
}

/**
 * Upload a file to IPFS via Lighthouse
 * @param file - File buffer or path
 * @param fileName - Name of the file
 * @returns Object with CID and gateway URL
 */
export async function uploadFileToIPFS(
  file: Buffer | string,
  fileName: string
): Promise<{ cid: string; url: string }> {
  try {
    // If file is a Buffer, write to temp file first
    let filePath: string;
    
    if (Buffer.isBuffer(file)) {
      const fs = require("fs");
      const path = require("path");
      const tmpDir = require("os").tmpdir();
      filePath = path.join(tmpDir, fileName);
      fs.writeFileSync(filePath, file);
    } else {
      filePath = file;
    }

    // Upload to Lighthouse
    const response = await lighthouse.upload(filePath, getAPIKey());
    
    // Clean up temp file if we created one
    if (Buffer.isBuffer(file)) {
      const fs = require("fs");
      fs.unlinkSync(filePath);
    }

    const cid = response.data.Hash;
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log("✅ File uploaded to IPFS:", { cid, url });

    return { cid, url };
  } catch (error) {
    console.error("❌ Error uploading to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}

/**
 * Upload text/JSON to IPFS via Lighthouse
 * @param content - String content (JSON, text, etc.)
 * @param fileName - Name for the file
 * @returns Object with CID and gateway URL
 */
export async function uploadTextToIPFS(
  content: string,
  fileName: string = "metadata.json"
): Promise<{ cid: string; url: string }> {
  try {
    const fs = require("fs");
    const path = require("path");
    const tmpDir = require("os").tmpdir();
    const filePath = path.join(tmpDir, fileName);

    // Write content to temp file
    fs.writeFileSync(filePath, content, "utf-8");

    // Upload to Lighthouse
    const response = await lighthouse.upload(filePath, getAPIKey());

    // Clean up
    fs.unlinkSync(filePath);

    const cid = response.data.Hash;
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log("✅ Text uploaded to IPFS:", { cid, url });

    return { cid, url };
  } catch (error) {
    console.error("❌ Error uploading text to IPFS:", error);
    throw new Error("Failed to upload text to IPFS");
  }
}

/**
 * Upload bug metadata JSON to IPFS
 * @param metadata - Bug metadata object
 * @returns Object with CID and gateway URL
 */
export async function uploadBugMetadata(metadata: {
  name: string;
  description: string;
  image: string; // IPFS CID or URL
  species?: string;
  location?: string;
  rarity: string;
  discoverer: string;
  timestamp: number;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}): Promise<{ cid: string; url: string }> {
  try {
    // Format metadata for NFT standard
    const nftMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image.startsWith("ipfs://")
        ? metadata.image
        : `ipfs://${metadata.image}`,
      external_url: "https://bugdex.app", // Your app URL
      attributes: [
        ...(metadata.attributes || []),
        { trait_type: "Species", value: metadata.species || "Unknown" },
        { trait_type: "Location", value: metadata.location || "Unknown" },
        { trait_type: "Rarity", value: metadata.rarity },
        { trait_type: "Discoverer", value: metadata.discoverer },
        { trait_type: "Discovery Date", value: new Date(metadata.timestamp).toISOString() },
      ],
    };

    const metadataString = JSON.stringify(nftMetadata, null, 2);
    return await uploadTextToIPFS(metadataString, "bug-metadata.json");
  } catch (error) {
    console.error("❌ Error uploading bug metadata:", error);
    throw new Error("Failed to upload bug metadata");
  }
}

/**
 * Get IPFS gateway URL from CID
 */
export function getIPFSUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}

/**
 * Convert IPFS URL to CID
 */
export function extractCID(ipfsUrl: string): string {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "");
  }
  if (ipfsUrl.includes("/ipfs/")) {
    return ipfsUrl.split("/ipfs/")[1];
  }
  return ipfsUrl;
}

// ==================== USER PROFILE FUNCTIONS ====================

/**
 * Upload user profile data to IPFS via Lighthouse
 * @param profileData - User profile object
 * @param walletAddress - User's wallet address (used for naming)
 * @returns IPFS hash of uploaded profile
 */
export async function uploadProfileToLighthouse(
  profileData: UserProfile,
  walletAddress: string
): Promise<string> {
  try {
    // Add metadata
    const profileWithMetadata: UserProfile = {
      ...profileData,
      metadata: {
        ...profileData.metadata,
        updatedAt: Date.now(),
        version: "1.0",
      },
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(profileWithMetadata, null, 2);

    // Upload to IPFS
    const result = await uploadTextToIPFS(
      jsonString,
      `profile-${walletAddress}.json`
    );

    console.log("✅ Profile uploaded to IPFS:", result.cid);
    return result.cid;
  } catch (error) {
    console.error("❌ Error uploading profile to Lighthouse:", error);
    throw error;
  }
}

/**
 * Upload avatar image to IPFS via Lighthouse (client-side)
 * @param file - Image file to upload
 * @returns IPFS hash of uploaded image
 */
export async function uploadAvatarToLighthouse(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Lighthouse API key not configured");
  }

  try {
    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image must be less than 5MB");
    }

    console.log("📤 Uploading avatar to Lighthouse IPFS...");
    const response = await lighthouse.upload([file], apiKey);

    if (!response?.data?.Hash) {
      throw new Error("No IPFS hash returned from Lighthouse");
    }

    const ipfsHash = response.data.Hash;
    console.log("✅ Avatar uploaded to IPFS:", ipfsHash);

    return ipfsHash;
  } catch (error) {
    console.error("❌ Error uploading avatar to Lighthouse:", error);
    throw error;
  }
}

/**
 * Fetch user profile data from IPFS via Lighthouse gateway
 * @param ipfsHash - IPFS hash of the profile
 * @returns User profile object
 */
export async function fetchProfileFromLighthouse(
  ipfsHash: string
): Promise<UserProfile | null> {
  if (!ipfsHash) {
    return null;
  }

  try {
    const gatewayUrl = getIPFSUrl(ipfsHash);
    console.log("📥 Fetching profile from IPFS:", ipfsHash);

    const response = await fetch(gatewayUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const profile: UserProfile = await response.json();
    console.log("✅ Profile fetched from IPFS");

    return profile;
  } catch (error) {
    console.error("❌ Error fetching profile from Lighthouse:", error);
    return null;
  }
}

/**
 * Get public URL for an avatar image stored on IPFS
 * @param ipfsHash - IPFS hash of the avatar image
 * @returns Public URL to access the image
 */
export function getAvatarUrl(ipfsHash: string | undefined): string | undefined {
  if (!ipfsHash) {
    return undefined;
  }

  return getIPFSUrl(ipfsHash);
}
