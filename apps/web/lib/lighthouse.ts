import lighthouse from "@lighthouse-web3/sdk";

const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY!;

if (!LIGHTHOUSE_API_KEY) {
  throw new Error("LIGHTHOUSE_API_KEY is not defined in environment variables");
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
    const response = await lighthouse.upload(filePath, LIGHTHOUSE_API_KEY);
    
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
    const response = await lighthouse.upload(filePath, LIGHTHOUSE_API_KEY);

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
