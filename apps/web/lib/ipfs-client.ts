// Browser-compatible IPFS upload using Lighthouse SDK
// This runs in the browser, not on the server

/**
 * Upload an image from base64 data URL to IPFS using Lighthouse
 * @param base64Image - Base64 data URL (e.g., from canvas.toDataURL())
 * @param fileName - Name for the file
 * @returns Object with IPFS CID and gateway URL
 */
export async function uploadImageToIPFS(
  base64Image: string,
  fileName: string = 'bug-image.jpg'
): Promise<{ cid: string; url: string }> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('Lighthouse API key not configured');
    }

    // Convert base64 to Blob
    const base64Data = base64Image.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // Upload to Lighthouse
    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const cid = data.Hash;
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log('✅ Image uploaded to IPFS:', { cid, url });

    return { cid, url };
  } catch (error) {
    console.error('❌ Error uploading image to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
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
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('Lighthouse API key not configured');
    }

    // Convert metadata to JSON blob
    const jsonString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // Upload to Lighthouse
    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const cid = data.Hash;
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log('✅ Metadata uploaded to IPFS:', { cid, url });

    return { cid, url };
  } catch (error) {
    console.error('❌ Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
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
