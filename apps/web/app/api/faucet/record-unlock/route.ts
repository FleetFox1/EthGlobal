import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, paymentMethod, transactionHash, amount } = body;

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
        transaction_hash,
        unlocked_at
      ) VALUES (
        LOWER(${walletAddress}),
        ${paymentMethod},
        ${amount},
        ${transactionHash},
        NOW()
      )
      ON CONFLICT (wallet_address) 
      DO UPDATE SET
        unlocked_at = NOW(),
        transaction_hash = ${transactionHash}
    `;

    return NextResponse.json({
      success: true,
      message: 'Unlock recorded successfully'
    });

  } catch (error: any) {
    console.error('Error recording unlock:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to record unlock' 
      },
      { status: 500 }
    );
  }
}
