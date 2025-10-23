import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    console.log('📤 Uploading avatar to IPFS via Pinata...');

    const pinata = new PinataSDK({ pinataJwt });
    const uploadResult = await pinata.upload.public.file(file);
    const cid = uploadResult.cid;

    console.log('✅ Avatar uploaded:', cid);

    return NextResponse.json({ 
      success: true,
      cid,
      url: `https://gateway.pinata.cloud/ipfs/${cid}`
    });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}
