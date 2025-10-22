import { NextRequest, NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';

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

    const apiKey = process.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Lighthouse API key not configured' }, { status: 500 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `bug-${Date.now()}-${file.name}`;
    
    try {
      // Upload buffer directly to Lighthouse (no file system needed)
      console.log('📤 Uploading to Lighthouse:', fileName);
      
      // uploadBuffer signature: (buffer, apiKey, dealParameters?)
      const response = await lighthouse.uploadBuffer(buffer, apiKey);
      
      const cid = response.data.Hash;
      const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

      console.log('✅ Image uploaded:', { cid, url });

      return NextResponse.json({ cid, url });
    } catch (uploadError) {
      console.error('❌ Lighthouse upload failed:', uploadError);
      throw uploadError;
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
