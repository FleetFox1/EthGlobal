import { NextRequest, NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata, fileName } = body;

    if (!metadata) {
      return NextResponse.json({ error: 'Metadata required' }, { status: 400 });
    }

    const apiKey = process.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Lighthouse API key not configured' }, { status: 500 });
    }

    // Convert metadata to JSON string
    const jsonString = JSON.stringify(metadata, null, 2);
    
    // Write to temp file
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const tmpDir = os.tmpdir();
    const metadataFileName = fileName || `metadata-${Date.now()}.json`;
    const filePath = path.join(tmpDir, metadataFileName);

    fs.writeFileSync(filePath, jsonString, 'utf-8');

    try {
      // Upload to Lighthouse
      console.log('📤 Uploading metadata to Lighthouse:', metadataFileName);
      const response = await lighthouse.upload(filePath, apiKey);
      
      const cid = response.data.Hash;
      const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

      console.log('✅ Metadata uploaded:', { cid, url });

      return NextResponse.json({ cid, url });
    } finally {
      // Clean up temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('❌ Metadata upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
