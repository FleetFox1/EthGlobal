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

    // Write to temp file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const os = require('os');
    const tmpDir = os.tmpdir();
    const fileName = `bug-${Date.now()}-${file.name}`;
    const filePath = path.join(tmpDir, fileName);

    fs.writeFileSync(filePath, buffer);

    try {
      // Upload to Lighthouse
      console.log('📤 Uploading to Lighthouse:', fileName);
      const response = await lighthouse.upload(filePath, apiKey);
      
      const cid = response.data.Hash;
      const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

      console.log('✅ Image uploaded:', { cid, url });

      return NextResponse.json({ cid, url });
    } finally {
      // Clean up temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
