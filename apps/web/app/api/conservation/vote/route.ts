import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const { voter_wallet, org_id, bug_balance, quarter } = await request.json();

    if (!voter_wallet || !org_id || !bug_balance || !quarter) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate BUG balance is positive
    if (parseFloat(bug_balance) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Must hold BUG tokens to vote' },
        { status: 400 }
      );
    }

    // Check if user already voted this quarter
    const existing = await sql`
      SELECT id FROM conservation_votes
      WHERE voter_wallet = ${voter_wallet.toLowerCase()} AND quarter = ${quarter}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You have already voted this quarter' },
        { status: 400 }
      );
    }

    // Verify organization exists
    const org = await sql`
      SELECT id FROM conservation_orgs
      WHERE id = ${org_id} AND verified = true
    `;

    if (org.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization' },
        { status: 400 }
      );
    }

    // Record the vote
    const result = await sql`
      INSERT INTO conservation_votes (
        voter_wallet,
        org_id,
        bug_balance,
        quarter
      )
      VALUES (
        ${voter_wallet.toLowerCase()},
        ${org_id},
        ${bug_balance},
        ${quarter}
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        message: 'Vote recorded successfully',
      },
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
