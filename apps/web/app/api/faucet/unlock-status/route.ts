import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/faucet/unlock-status?wallet=0x...
 * Check if a wallet has unlocked the faucet
 * Returns database status as backup to on-chain check
 */
export async function GET(request: NextRequest) {
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
        last_claim_at,
        total_claims
      FROM faucet_unlocks
      WHERE LOWER(wallet_address) = LOWER(${walletAddress})
      LIMIT 1
    `;

    const hasUnlocked = result.rows.length > 0;

    if (hasUnlocked) {
      const unlock = result.rows[0];
      return NextResponse.json({
        success: true,
        hasUnlocked: true,
        unlockedAt: unlock.unlocked_at,
        paymentMethod: unlock.payment_method,
        lastClaimAt: unlock.last_claim_at,
        totalClaims: unlock.total_claims,
      });
    }

    return NextResponse.json({
      success: true,
      hasUnlocked: false,
    });

  } catch (error) {
    console.error('Failed to check unlock status:', error);
    return NextResponse.json(
      { error: 'Failed to check unlock status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faucet/unlock-status
 * Record a successful unlock in database
 * Called after on-chain unlock succeeds
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, paymentMethod, paymentAmount, transactionHash } = body;

    if (!walletAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert or update unlock record
    await sql`
      INSERT INTO faucet_unlocks (
        wallet_address,
        payment_method,
        payment_amount,
        transaction_hash
      )
      VALUES (
        LOWER(${walletAddress}),
        ${paymentMethod},
        ${paymentAmount || 0},
        ${transactionHash || null}
      )
      ON CONFLICT (wallet_address) 
      DO UPDATE SET
        payment_method = EXCLUDED.payment_method,
        transaction_hash = EXCLUDED.transaction_hash
    `;

    return NextResponse.json({
      success: true,
      message: 'Unlock status recorded',
    });

  } catch (error) {
    console.error('Failed to record unlock:', error);
    return NextResponse.json(
      { error: 'Failed to record unlock' },
      { status: 500 }
    );
  }
}
