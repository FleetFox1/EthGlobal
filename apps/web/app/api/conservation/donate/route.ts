import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const { donor_wallet, amount_pyusd, transaction_hash, quarter } = await request.json();

    if (!donor_wallet || !amount_pyusd || !transaction_hash || !quarter) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate transaction hash format (basic check)
    if (!transaction_hash.startsWith('0x') || transaction_hash.length !== 66) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction hash' },
        { status: 400 }
      );
    }

    // Check if this transaction has already been recorded
    const existing = await sql`
      SELECT id FROM conservation_donations
      WHERE transaction_hash = ${transaction_hash}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Donation already recorded' },
        { status: 400 }
      );
    }

    // Record the donation
    const result = await sql`
      INSERT INTO conservation_donations (
        donor_wallet,
        amount_pyusd,
        transaction_hash,
        quarter,
        donation_wallet,
        blockchain_network
      )
      VALUES (
        ${donor_wallet.toLowerCase()},
        ${amount_pyusd},
        ${transaction_hash},
        ${quarter},
        ${process.env.NEXT_PUBLIC_CONSERVATION_WALLET},
        'sepolia'
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        message: 'Donation recorded successfully',
      },
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record donation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quarter = searchParams.get('quarter');

    let query;
    if (quarter) {
      query = sql`
        SELECT 
          donor_wallet,
          amount_pyusd,
          transaction_hash,
          donated_at,
          quarter
        FROM conservation_donations
        WHERE quarter = ${quarter}
        ORDER BY donated_at DESC
      `;
    } else {
      query = sql`
        SELECT 
          donor_wallet,
          amount_pyusd,
          transaction_hash,
          donated_at,
          quarter
        FROM conservation_donations
        ORDER BY donated_at DESC
        LIMIT 100
      `;
    }

    const donations = await query;

    return NextResponse.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
