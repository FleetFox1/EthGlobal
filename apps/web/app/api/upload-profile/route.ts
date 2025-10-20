import { NextRequest, NextResponse } from 'next/server';
import { uploadProfileToLighthouse } from '@/lib/lighthouse';

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

    console.log('📤 Uploading profile to IPFS for:', walletAddress);

    // Upload to IPFS via Lighthouse
    const ipfsHash = await uploadProfileToLighthouse(profileData, walletAddress);

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
