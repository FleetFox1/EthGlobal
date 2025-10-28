import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * POST /api/vote-offchain
 * 
 * Cast a vote on a bug submission (off-chain, free)
 * 
 * Body:
 * - uploadId: string - ID of the upload
 * - voterAddress: string - Voter's wallet
 * - voteFor: boolean - true = approve, false = reject
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const { uploadId, voterAddress, voteFor } = body;

    // Validation
    if (!uploadId || !voterAddress || voteFor === undefined) {
      return NextResponse.json(
        { error: "Upload ID, voter address, and vote required" },
        { status: 400 }
      );
    }

    console.log(`🗳️  Vote: ${voteFor ? 'FOR' : 'AGAINST'} by ${voterAddress}`);

    const voterAddr = voterAddress.toLowerCase();

    // Check if upload exists and is in voting
    const uploadCheck = await sql`
      SELECT id, voting_status, voting_deadline, wallet_address
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

    // Can't vote on own submission
    if (upload.wallet_address === voterAddr) {
      return NextResponse.json(
        { error: "Cannot vote on your own submission" },
        { status: 403 }
      );
    }

    if (upload.voting_status !== "pending_voting") {
      return NextResponse.json(
        { error: `Submission is ${upload.voting_status}, not open for voting` },
        { status: 400 }
      );
    }

    // Check if voting deadline passed
    if (upload.voting_deadline && Date.now() > parseInt(upload.voting_deadline)) {
      return NextResponse.json(
        { error: "Voting period has ended" },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await sql`
      SELECT id, vote_for
      FROM votes
      WHERE upload_id = ${uploadId} AND voter_address = ${voterAddr}
    `;

    if (existingVote.rows.length > 0) {
      // User already voted - update their vote
      const oldVote = existingVote.rows[0].vote_for;
      
      await sql`
        UPDATE votes
        SET vote_for = ${voteFor}, voted_at = NOW()
        WHERE upload_id = ${uploadId} AND voter_address = ${voterAddr}
      `;

      // Update vote counts
      if (oldVote && !voteFor) {
        // Changed from FOR to AGAINST
        await sql`
          UPDATE uploads
          SET votes_for = votes_for - 1, votes_against = votes_against + 1
          WHERE id = ${uploadId}
        `;
      } else if (!oldVote && voteFor) {
        // Changed from AGAINST to FOR
        await sql`
          UPDATE uploads
          SET votes_for = votes_for + 1, votes_against = votes_against - 1
          WHERE id = ${uploadId}
        `;
      }

      console.log(`✅ Vote updated! (was ${oldVote ? 'FOR' : 'AGAINST'}, now ${voteFor ? 'FOR' : 'AGAINST'})`);
    } else {
      // New vote
      await sql`
        INSERT INTO votes (upload_id, voter_address, vote_for)
        VALUES (${uploadId}, ${voterAddr}, ${voteFor})
      `;

      // Update vote count
      if (voteFor) {
        await sql`UPDATE uploads SET votes_for = votes_for + 1 WHERE id = ${uploadId}`;
      } else {
        await sql`UPDATE uploads SET votes_against = votes_against + 1 WHERE id = ${uploadId}`;
      }

      console.log(`✅ Vote cast!`);
    }

    // Get updated vote counts
    const updated = await sql`
      SELECT votes_for, votes_against
      FROM uploads
      WHERE id = ${uploadId}
    `;

    const voteCounts = updated.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        votesFor: voteCounts.votes_for,
        votesAgainst: voteCounts.votes_against,
        yourVote: voteFor ? "for" : "against",
      },
    });
  } catch (error: any) {
    console.error("❌ Error casting vote:", error);

    // Check for unique constraint violation (race condition)
    if (error.message?.includes('unique')) {
      return NextResponse.json(
        { error: "You have already voted on this submission" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cast vote",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vote-offchain?uploadId=xxx&voterAddress=0x...
 * 
 * Check if a user has voted on a submission
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get("uploadId");
    const voterAddress = searchParams.get("voterAddress");

    if (!uploadId || !voterAddress) {
      return NextResponse.json(
        { error: "Upload ID and voter address required" },
        { status: 400 }
      );
    }

    const voterAddr = voterAddress.toLowerCase();

    const vote = await sql`
      SELECT vote_for, voted_at
      FROM votes
      WHERE upload_id = ${uploadId} AND voter_address = ${voterAddr}
    `;

    if (vote.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: { hasVoted: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasVoted: true,
        voteFor: vote.rows[0].vote_for,
        votedAt: vote.rows[0].voted_at,
      },
    });
  } catch (error: any) {
    console.error("❌ Error checking vote:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check vote",
      },
      { status: 500 }
    );
  }
}
