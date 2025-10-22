// Browser-compatible IPFS upload using Pinata
// Pinata is serverless-friendly and widely used in Web3 projects
// Uploads through our API endpoint for better security

/**
 * Upload an image from base64 data URL to IPFS using Pinata
 * @param base64Image - Base64 data URL (e.g., from canvas.toDataURL())
 * @param fileName - Name for the file
 * @returns Object with IPFS CID and gateway URL
 */
export async function uploadImageToIPFS(
  base64Image: string,
  fileName: string = `bug-image-${Date.now()}.jpg`
): Promise<{ cid: string; url: string }> {
  try {
    console.log('📤 Starting Pinata upload...');

    // Convert base64 to Blob
    const base64Data = base64Image.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    // Create File object
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    // Upload via our API endpoint (Pinata on server)
    console.log('🚀 Uploading to Pinata/IPFS...');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    const { cid, url } = result;

    console.log('✅ Image uploaded to IPFS:', { cid, url });

    return { cid, url };
  } catch (error) {
    console.error('❌ Error uploading image to IPFS:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS using Lighthouse
 * @param metadata - Metadata object
 * @param fileName - Name for the JSON file
 * @returns Object with IPFS CID and gateway URL
 */
export async function uploadMetadataToIPFS(
  metadata: any,
  fileName: string = 'metadata.json'
): Promise<{ cid: string; url: string }> {
  try {
    // Upload via our API route (server-side)
    const response = await fetch('/api/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata, fileName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const { cid, url } = data;

    console.log('✅ Metadata uploaded to IPFS:', { cid, url });

    return { cid, url };
  } catch (error) {
    console.error('❌ Error uploading metadata to IPFS:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload metadata to IPFS');
  }
}

/**
 * Upload bug submission with image and metadata to IPFS
 * @param imageData - Base64 image data
 * @param location - Location data from geolocation
 * @param discoverer - Wallet address of user
 * @returns Object with image and metadata CIDs
 */
export async function uploadBugSubmission(params: {
  imageData: string;
  location: {
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  discoverer: string;
}): Promise<{
  imageCid: string;
  imageUrl: string;
  metadataCid: string;
  metadataUrl: string;
}> {
  try {
    // Step 1: Upload image to IPFS
    const imageResult = await uploadImageToIPFS(params.imageData);

    // Step 2: Create and upload metadata
    const metadata = {
      name: `Bug Discovery #${Date.now()}`,
      description: `A bug discovered in ${params.location.state}, ${params.location.country}`,
      image: `ipfs://${imageResult.cid}`,
      external_url: 'https://bugdex.app',
      attributes: [
        { trait_type: 'State', value: params.location.state },
        { trait_type: 'Country', value: params.location.country },
        { trait_type: 'Discoverer', value: params.discoverer },
        { trait_type: 'Discovery Date', value: new Date().toISOString() },
        { trait_type: 'Latitude', value: params.location.latitude.toFixed(6) },
        { trait_type: 'Longitude', value: params.location.longitude.toFixed(6) },
      ],
    };

    const metadataResult = await uploadMetadataToIPFS(metadata);

    return {
      imageCid: imageResult.cid,
      imageUrl: imageResult.url,
      metadataCid: metadataResult.cid,
      metadataUrl: metadataResult.url,
    };
  } catch (error) {
    console.error('❌ Error uploading bug submission:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL from CID
 */
export function getIPFSUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}

/**
 * Extract CID from IPFS URL
 */
export function extractCID(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', '');
  }
  if (ipfsUrl.includes('/ipfs/')) {
    return ipfsUrl.split('/ipfs/')[1];
  }
  return ipfsUrl;
}
