import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const quarter = searchParams.get('quarter');

    if (!wallet || !quarter) {
      return NextResponse.json(
        { success: false, error: 'Missing wallet or quarter parameter' },
        { status: 400 }
      );
    }

    const votes = await sql`
      SELECT id FROM conservation_votes
      WHERE voter_wallet = ${wallet.toLowerCase()} AND quarter = ${quarter}
    `;

    return NextResponse.json({
      success: true,
      hasVoted: votes.rows.length > 0,
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check vote status' },
      { status: 500 }
    );
  }
}
