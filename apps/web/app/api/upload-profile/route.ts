import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileData, walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    if (!profileData) {
      return NextResponse.json({ error: 'Profile data required' }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    console.log('📤 Uploading profile to IPFS for:', walletAddress);

    // Add metadata to profile
    const profileWithMetadata = {
      ...profileData,
      metadata: {
        ...profileData.metadata,
        updatedAt: Date.now(),
        version: "1.0",
      },
    };

    // Convert to JSON and create File object
    const jsonString = JSON.stringify(profileWithMetadata, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], `profile-${walletAddress}.json`, { type: 'application/json' });

    // Upload to Pinata
    const pinata = new PinataSDK({ pinataJwt });
    const uploadResult = await pinata.upload.public.file(file);
    const ipfsHash = uploadResult.cid;

    console.log('✅ Profile uploaded:', ipfsHash);

    return NextResponse.json({ ipfsHash });
  } catch (error) {
    console.error('❌ Profile upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
