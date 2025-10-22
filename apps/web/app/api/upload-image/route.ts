import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/upload-image
 * Returns the Lighthouse API key for client-side uploads
 * 
 * NOTE: This is safe because:
 * 1. Lighthouse API keys are meant for client-side use
 * 2. They can only upload, not delete/modify data
 * 3. Rate limits are per-key, so worst case is quota exhaustion
 * 4. This is the recommended approach by Lighthouse for web3 apps
 */
export async function GET() {
  const apiKey = process.env.LIGHTHOUSE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Lighthouse API key not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey });
}

/**
 * POST /api/upload-image (legacy endpoint - kept for compatibility)
 * This endpoint is no longer used - uploads now happen client-side
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Use client-side upload with Lighthouse SDK.',
      migration: 'Call GET /api/upload-image to get API key, then upload from browser'
    },
    { status: 410 }
  );
}
