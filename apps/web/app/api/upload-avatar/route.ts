import { NextRequest, NextResponse } from 'next/server';
import { uploadAvatarToLighthouse } from '@/lib/lighthouse';

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

    console.log('📤 Uploading avatar to IPFS...');

    // Upload via Lighthouse
    const cid = await uploadAvatarToLighthouse(file);

    console.log('✅ Avatar uploaded:', cid);

    return NextResponse.json({ cid });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
