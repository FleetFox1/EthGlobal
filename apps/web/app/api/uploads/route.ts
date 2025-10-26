import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

type BugInfo = {
  commonName: string;
  scientificName: string;
  family: string;
  order: string;
  confidence: number;
  distribution: string;
  habitat: string;
  diet: string;
  size: string;
  isDangerous: boolean;
  dangerLevel: number;
  conservationStatus: string;
  interestingFacts: string[];
  characteristics: {
    venom: number;
    biteForce: number;
    disease: number;
    aggression: number;
    speed: number;
  };
  lifespan: string;
  rarity: string;
};

type Location = {
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

/**
 * POST - Save a new upload to user's collection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      imageCid, 
      metadataCid, 
      imageUrl, 
      metadataUrl, 
      discoverer, 
      location,
      bugInfo // AI identification data
    } = body;

    if (!imageCid || !metadataCid || !discoverer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const walletAddress = discoverer.toLowerCase();
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    // Insert into database
    await sql`
      INSERT INTO uploads (
        id,
        wallet_address,
        image_cid,
        metadata_cid,
        image_url,
        metadata_url,
        timestamp,
        location,
        bug_info,
        submitted_to_blockchain
      ) VALUES (
        ${uploadId},
        ${walletAddress},
        ${imageCid},
        ${metadataCid},
        ${imageUrl},
        ${metadataUrl},
        ${timestamp},
        ${JSON.stringify(location)},
        ${JSON.stringify(bugInfo)},
        false
      )
    `;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as count 
      FROM uploads 
      WHERE wallet_address = ${walletAddress}
    `;
    const totalUploads = parseInt(countResult.rows[0].count);

    console.log('✅ Upload saved to database:', uploadId);

    return NextResponse.json({
      success: true,
      data: {
        upload: {
          id: uploadId,
          imageCid,
          metadataCid,
          imageUrl,
          metadataUrl,
          discoverer: walletAddress,
          timestamp,
          location,
          bugInfo,
          submittedToBlockchain: false,
        },
        totalUploads,
      },
    });
  } catch (error: any) {
    console.error('❌ Error saving upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save upload' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get all uploads for a user
 * Query params: address (wallet address)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter required' },
        { status: 400 }
      );
    }

    const walletAddress = address.toLowerCase();

    // Fetch from database with voting data (voting columns are in uploads table)
    const result = await sql`
      SELECT 
        id,
        wallet_address as discoverer,
        image_cid as "imageCid",
        metadata_cid as "metadataCid",
        image_url as "imageUrl",
        metadata_url as "metadataUrl",
        timestamp,
        location,
        bug_info as "bugInfo",
        submitted_to_blockchain as "submittedToBlockchain",
        submission_id as "submissionId",
        transaction_hash as "transactionHash",
        voting_status as "votingStatus",
        votes_for as "votesFor",
        votes_against as "votesAgainst",
        voting_deadline as "votingDeadline",
        voting_resolved as "votingResolved",
        voting_approved as "votingApproved",
        nft_minted as "nftMinted",
        nft_token_id as "nftTokenId",
        nft_contract_address as "nftContractAddress",
        nft_transaction_hash as "nftTransactionHash"
      FROM uploads
      WHERE wallet_address = ${walletAddress}
      ORDER BY timestamp DESC
    `;

    const uploads = result.rows.map(row => ({
      id: row.id,
      imageCid: row.imageCid,
      metadataCid: row.metadataCid,
      imageUrl: row.imageUrl,
      metadataUrl: row.metadataUrl,
      discoverer: row.discoverer,
      timestamp: parseInt(row.timestamp),
      location: row.location,
      bugInfo: row.bugInfo,
      submittedToBlockchain: row.submittedToBlockchain,
      submissionId: row.submissionId,
      transactionHash: row.transactionHash,
      // Voting data directly from uploads table
      votingStatus: row.votingStatus || 'not_submitted',
      votesFor: row.votesFor || 0,
      votesAgainst: row.votesAgainst || 0,
      votingDeadline: row.votingDeadline,
      votingResolved: row.votingResolved || false,
      votingApproved: row.votingApproved || false,
      // NFT tracking data
      nftMinted: row.nftMinted || false,
      nftTokenId: row.nftTokenId,
      nftContractAddress: row.nftContractAddress,
      nftTransactionHash: row.nftTransactionHash,
    }));

    return NextResponse.json({
      success: true,
      data: {
        uploads,
        count: uploads.length,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching uploads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update upload (e.g., mark as submitted to blockchain)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, transactionHash, submissionId } = body;

    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID required' },
        { status: 400 }
      );
    }

    // Update in database
    const result = await sql`
      UPDATE uploads
      SET 
        submitted_to_blockchain = true,
        transaction_hash = ${transactionHash},
        submission_id = ${submissionId}
      WHERE id = ${uploadId}
      RETURNING id
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      );
    }

    console.log('✅ Upload updated in database:', uploadId);

    return NextResponse.json({
      success: true,
      data: { updated: true },
    });
  } catch (error: any) {
    console.error('❌ Error updating upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update upload' },
      { status: 500 }
    );
  }
}
