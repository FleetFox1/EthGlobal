import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for user uploads (before blockchain submission)
// In production, replace with a database
const userUploads = new Map<string, Array<{
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
  submittedToBlockchain: boolean;
  transactionHash?: string;
  submissionId?: number;
}>>();

/**
 * POST - Save a new upload to user's collection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      imageCid, 
      metadataCid, 
      imageUrl, 
      metadataUrl, 
      discoverer, 
      location 
    } = body;

    if (!imageCid || !metadataCid || !discoverer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's uploads
    const uploads = userUploads.get(discoverer.toLowerCase()) || [];

    // Create new upload
    const newUpload = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageCid,
      metadataCid,
      imageUrl,
      metadataUrl,
      discoverer: discoverer.toLowerCase(),
      timestamp: Date.now(),
      location,
      submittedToBlockchain: false,
    };

    uploads.push(newUpload);
    userUploads.set(discoverer.toLowerCase(), uploads);

    console.log('✅ Upload saved to collection:', newUpload.id);

    return NextResponse.json({
      success: true,
      data: {
        upload: newUpload,
        totalUploads: uploads.length,
      },
    });
  } catch (error: any) {
    console.error('❌ Error saving upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save upload' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get all uploads for a user
 * Query params: address (wallet address)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter required' },
        { status: 400 }
      );
    }

    const uploads = userUploads.get(address.toLowerCase()) || [];

    return NextResponse.json({
      success: true,
      data: {
        uploads: uploads.sort((a, b) => b.timestamp - a.timestamp),
        count: uploads.length,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching uploads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update upload (e.g., mark as submitted to blockchain)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, transactionHash, submissionId } = body;

    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID required' },
        { status: 400 }
      );
    }

    // Find and update the upload
    let updated = false;
    for (const [address, uploads] of userUploads.entries()) {
      const upload = uploads.find(u => u.id === uploadId);
      if (upload) {
        upload.submittedToBlockchain = true;
        upload.transactionHash = transactionHash;
        upload.submissionId = submissionId;
        updated = true;
        console.log('✅ Upload updated:', uploadId);
        break;
      }
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { updated: true },
    });
  } catch (error: any) {
    console.error('❌ Error updating upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update upload' },
      { status: 500 }
    );
  }
}
