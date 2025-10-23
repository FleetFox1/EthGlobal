import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * GET /api/voting-submissions?status=pending_voting&address=0x...
 * 
 * Get submissions that are open for voting
 * 
 * Query params:
 * - status: string - voting status filter (optional)
 * - address: string - get only user's submissions (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending_voting";
    const address = searchParams.get("address");

    console.log("📋 Fetching voting submissions:", { status, address });

    let submissions;

    if (address) {
      const walletAddr = address.toLowerCase();
      submissions = await sql`
        SELECT 
          id,
          wallet_address,
          image_cid,
          metadata_cid,
          image_url,
          metadata_url,
          timestamp,
          location,
          bug_info,
          voting_status,
          votes_for,
          votes_against,
          voting_deadline,
          voting_resolved,
          voting_approved,
          submitted_to_blockchain,
          submission_id,
          transaction_hash
        FROM uploads
        WHERE wallet_address = ${walletAddr}
        AND voting_status = ${status}
        ORDER BY timestamp DESC
      `;
    } else {
      submissions = await sql`
        SELECT 
          id,
          wallet_address,
          image_cid,
          metadata_cid,
          image_url,
          metadata_url,
          timestamp,
          location,
          bug_info,
          voting_status,
          votes_for,
          votes_against,
          voting_deadline,
          voting_resolved,
          voting_approved,
          submitted_to_blockchain,
          submission_id,
          transaction_hash
        FROM uploads
        WHERE voting_status = ${status}
        ORDER BY timestamp DESC
      `;
    }

    const formatted = submissions.rows.map((row: any) => ({
      id: row.id,
      discoverer: row.wallet_address,
      imageCid: row.image_cid,
      metadataCid: row.metadata_cid,
      imageUrl: row.image_url,
      metadataUrl: row.metadata_url,
      timestamp: parseInt(row.timestamp),
      location: row.location,
      bugInfo: row.bug_info,
      votingStatus: row.voting_status,
      votesFor: row.votes_for || 0,
      votesAgainst: row.votes_against || 0,
      votingDeadline: row.voting_deadline ? new Date(row.voting_deadline).getTime() : null,
      votingResolved: row.voting_resolved || false,
      votingApproved: row.voting_approved || false,
      submittedToBlockchain: row.submitted_to_blockchain || false,
      submissionId: row.submission_id,
      transactionHash: row.transaction_hash,
    }));

    console.log(`✅ Found ${formatted.length} submissions`);

    return NextResponse.json({
      success: true,
      data: {
        submissions: formatted,
        count: formatted.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching submissions:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch submissions",
      },
      { status: 500 }
    );
  }
}
