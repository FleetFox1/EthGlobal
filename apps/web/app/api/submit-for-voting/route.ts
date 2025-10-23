import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * POST /api/submit-for-voting
 * 
 * Submit a bug for community voting (off-chain, free)
 * 
 * Body:
 * - uploadId: string - ID of the upload
 * - walletAddress: string - Submitter's wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, walletAddress } = body;

    // Validation
    if (!uploadId || !walletAddress) {
      return NextResponse.json(
        { error: "Upload ID and wallet address required" },
        { status: 400 }
      );
    }

    console.log("🗳️  Submitting for voting:", uploadId);

    const walletAddr = walletAddress.toLowerCase();

    // Check if upload exists and belongs to user
    const uploadCheck = await sql`
      SELECT id, wallet_address, voting_status
      FROM uploads
      WHERE id = ${uploadId}
    `;

    if (uploadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    const upload = uploadCheck.rows[0];

    if (upload.wallet_address !== walletAddr) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    if (upload.voting_status !== "not_submitted") {
      return NextResponse.json(
        { error: `Already ${upload.voting_status}` },
        { status: 400 }
      );
    }

    // Set voting deadline (3 days from now)
    const votingDeadline = Date.now() + (3 * 24 * 60 * 60 * 1000);

    // Update upload to pending_voting status
    await sql`
      UPDATE uploads
      SET 
        voting_status = 'pending_voting',
        voting_deadline = ${votingDeadline},
        votes_for = 0,
        votes_against = 0,
        voting_resolved = false,
        voting_approved = false
      WHERE id = ${uploadId}
    `;

    console.log("✅ Submitted for voting! Deadline:", new Date(votingDeadline));

    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        votingStatus: "pending_voting",
        votingDeadline,
        message: "Bug submitted for community voting! Voting is free and lasts 3 days.",
      },
    });
  } catch (error: any) {
    console.error("❌ Error submitting for voting:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit for voting",
      },
      { status: 500 }
    );
  }
}
