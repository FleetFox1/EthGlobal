import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

/**
 * POST /api/upload-image
 * Upload image to IPFS using Pinata (serverless-friendly)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    // Initialize Pinata client
    const pinata = new PinataSDK({ pinataJwt });

    console.log('📤 Uploading to Pinata/IPFS...');

    // Upload file to Pinata (public IPFS)
    const uploadResult = await pinata.upload.public.file(file);
    
    const cid = uploadResult.cid;
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

    console.log('✅ Image uploaded to IPFS:', { cid, url });

    return NextResponse.json({ cid, url });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
