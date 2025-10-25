import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * API: Save NFT mint data to database
 * 
 * Updates uploads table with NFT information after successful mint
 */
export async function POST(request: NextRequest) {
  try {
    const { uploadId, tokenId, contractAddress, transactionHash } = await request.json();

    if (!uploadId || !tokenId || !contractAddress || !transactionHash) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: uploadId, tokenId, contractAddress, transactionHash' 
        },
        { status: 400 }
      );
    }

    console.log('💾 Saving NFT mint:', { uploadId, tokenId, contractAddress, transactionHash });

    // Update the upload record with NFT data
    const result = await sql`
      UPDATE uploads 
      SET 
        nft_minted = true,
        nft_token_id = ${parseInt(tokenId)},
        nft_contract_address = ${contractAddress},
        nft_transaction_hash = ${transactionHash}
      WHERE id = ${uploadId}
      RETURNING *
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      );
    }

    console.log('✅ NFT data saved successfully');

    return NextResponse.json({
      success: true,
      message: 'NFT mint data saved',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Failed to save NFT data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save NFT data' 
      },
      { status: 500 }
    );
  }
}
