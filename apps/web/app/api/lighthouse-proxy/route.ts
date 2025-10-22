import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/lighthouse-proxy
 * Proxy for Lighthouse uploads when direct browser upload fails (CORS issues)
 * Uses Lighthouse SDK which handles the upload properly
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const apiKey = formData.get('apiKey') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic import of Lighthouse SDK (only loads when needed)
    const lighthouse = await import('@lighthouse-web3/sdk');
    
    console.log('📤 Uploading via Lighthouse SDK proxy...');
    
    // Use SDK's uploadBuffer method
    const response = await lighthouse.default.uploadBuffer(buffer, apiKey);
    
    const cid = response.data.Hash;
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log('✅ Proxy upload successful:', { cid, url });

    return NextResponse.json({ cid, url });
  } catch (error) {
    console.error('❌ Proxy upload error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Proxy upload failed',
        details: 'Lighthouse SDK upload failed in serverless environment'
      },
      { status: 500 }
    );
  }
}
