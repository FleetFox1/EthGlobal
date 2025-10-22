import { NextRequest, NextResponse } from 'next/server';

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

    const fileName = `bug-${Date.now()}-${file.name}`;
    
    try {
      // Upload directly to Lighthouse HTTP API (no SDK dependencies)
      console.log('📤 Uploading to Lighthouse API:', fileName);
      
      // Create form data for Lighthouse API
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      // Try Lighthouse API - using the upload endpoint
      // Alternative endpoints: node.lighthouse.storage or api.lighthouse.storage
      const response = await fetch('https://api.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Lighthouse API error response:', errorText);
        throw new Error(`Lighthouse API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📦 Lighthouse response:', result);
      
      const cid = result.Hash;
      const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

      console.log('✅ Image uploaded:', { cid, url });

      return NextResponse.json({ cid, url });
    } catch (uploadError) {
      console.error('❌ Lighthouse upload failed:', uploadError);
      
      // If it's a timeout, provide helpful error message
      if (uploadError instanceof Error && uploadError.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Upload timeout - Lighthouse API is slow or unreachable. Please try again.' },
          { status: 504 }
        );
      }
      
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
