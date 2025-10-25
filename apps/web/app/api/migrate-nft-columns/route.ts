import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Migration: Add NFT tracking columns to uploads table
 * 
 * Adds:
 * - nft_minted: boolean flag to track if NFT was minted
 * - nft_token_id: the token ID of the minted NFT
 * - nft_contract_address: which NFT contract was used (V1 or V2)
 * - nft_transaction_hash: the mint transaction hash
 */
export async function GET() {
  try {
    console.log('🔄 Starting NFT columns migration...');

    // Add NFT tracking columns
    await sql`
      ALTER TABLE uploads 
      ADD COLUMN IF NOT EXISTS nft_minted BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS nft_token_id INTEGER,
      ADD COLUMN IF NOT EXISTS nft_contract_address VARCHAR(42),
      ADD COLUMN IF NOT EXISTS nft_transaction_hash VARCHAR(66)
    `;

    console.log('✅ NFT columns added successfully');

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_uploads_nft_minted ON uploads(nft_minted)
    `;

    console.log('✅ NFT index created');

    return NextResponse.json({
      success: true,
      message: 'NFT tracking columns added to uploads table',
      columns: [
        'nft_minted (BOOLEAN)',
        'nft_token_id (INTEGER)',
        'nft_contract_address (VARCHAR(42))',
        'nft_transaction_hash (VARCHAR(66))'
      ]
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Migration failed' 
      },
      { status: 500 }
    );
  }
}
