import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Check database for unlock status
    const result = await sql`
      SELECT 
        wallet_address,
        unlocked_at,
        payment_method,
        transaction_hash
      FROM faucet_unlocks
      WHERE LOWER(wallet_address) = LOWER(${walletAddress})
      LIMIT 1
    `;

    const hasUnlocked = result.rows.length > 0;

    return NextResponse.json({
      success: true,
      hasUnlocked,
      data: hasUnlocked ? result.rows[0] : null
    });

  } catch (error: any) {
    console.error('Error checking unlock status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to check unlock status' 
      },
      { status: 500 }
    );
  }
}
