import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata, fileName } = body;

    if (!metadata) {
      return NextResponse.json({ error: 'Metadata required' }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    // Initialize Pinata client
    const pinata = new PinataSDK({ pinataJwt });

    // Convert metadata to JSON string
    const jsonString = JSON.stringify(metadata, null, 2);
    
    // Create File object from JSON
    const metadataFileName = fileName || `metadata-${Date.now()}.json`;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], metadataFileName, { type: 'application/json' });

    console.log('📤 Uploading metadata to Pinata:', metadataFileName);
    
    // Upload to Pinata
    const uploadResult = await pinata.upload.public.file(file);
    
    const cid = uploadResult.cid;
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

    console.log('✅ Metadata uploaded:', { cid, url });

    return NextResponse.json({ cid, url });
  } catch (error) {
    console.error('❌ Metadata upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
