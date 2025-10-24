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

    // Fetch from database with voting data
    const result = await sql`
      SELECT 
        u.id,
        u.wallet_address as discoverer,
        u.image_cid as "imageCid",
        u.metadata_cid as "metadataCid",
        u.image_url as "imageUrl",
        u.metadata_url as "metadataUrl",
        u.timestamp,
        u.location,
        u.bug_info as "bugInfo",
        u.submitted_to_blockchain as "submittedToBlockchain",
        u.submission_id as "submissionId",
        u.transaction_hash as "transactionHash",
        bs.voting_status as "votingStatus",
        bs.votes_for as "votesFor",
        bs.votes_against as "votesAgainst",
        bs.voting_deadline as "votingDeadline",
        bs.voting_resolved as "votingResolved",
        bs.voting_approved as "votingApproved"
      FROM uploads u
      LEFT JOIN bug_submissions bs ON u.id = bs.upload_id
      WHERE u.wallet_address = ${walletAddress}
      ORDER BY u.timestamp DESC
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
      // Voting data from bug_submissions
      votingStatus: row.votingStatus || 'not_submitted',
      votesFor: row.votesFor || 0,
      votesAgainst: row.votesAgainst || 0,
      votingDeadline: row.votingDeadline,
      votingResolved: row.votingResolved || false,
      votingApproved: row.votingApproved || false,
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
