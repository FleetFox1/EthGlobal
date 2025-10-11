import { NextRequest, NextResponse } from "next/server";
import { getSubmissionDetails } from "@/lib/contracts";

/**
 * POST /api/vote
 * 
 * Client-side voting endpoint
 * Note: Actual voting transaction is signed and sent from the client
 * This endpoint provides submission validation and information
 * 
 * Request body (JSON):
 * - submissionId: number
 * - userAddress: string
 * - voteFor: boolean
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, userAddress, voteFor } = body;

    // Validation
    if (!submissionId || submissionId < 1) {
      return NextResponse.json(
        { error: "Valid submission ID is required" },
        { status: 400 }
      );
    }

    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Valid wallet address is required" },
        { status: 400 }
      );
    }

    if (typeof voteFor !== "boolean") {
      return NextResponse.json(
        { error: "voteFor must be true or false" },
        { status: 400 }
      );
    }

    console.log("🗳️  Vote request:", {
      submissionId,
      userAddress,
      voteFor: voteFor ? "APPROVE" : "REJECT",
    });

    // Fetch submission details
    const submission = await getSubmissionDetails(submissionId);

    // Check if submission is still open
    if (submission.resolved) {
      return NextResponse.json(
        { error: "Submission has already been resolved" },
        { status: 400 }
      );
    }

    const votingDeadline = submission.createdAt + 3 * 24 * 60 * 60; // 3 days
    const now = Math.floor(Date.now() / 1000);

    if (now > votingDeadline) {
      return NextResponse.json(
        { error: "Voting period has ended" },
        { status: 400 }
      );
    }

    // Return submission info and voting instructions
    return NextResponse.json({
      success: true,
      message: "Ready to vote",
      data: {
        submission: {
          id: submission.id,
          ipfsHash: submission.ipfsHash,
          submitter: submission.submitter,
          votesFor: submission.votesFor,
          votesAgainst: submission.votesAgainst,
          createdAt: submission.createdAt,
          votingDeadline,
          timeRemaining: votingDeadline - now,
        },
        votingConfig: {
          stakeAmount: "10", // 10 BUG tokens
          threshold: 5, // 5 votes needed
          reward: "5", // 5 BUG reward
        },
        instructions: {
          step1: "Approve BUG token spending",
          step2: "Call vote() function on voting contract",
          contractFunction: "vote(uint256 submissionId, bool voteFor)",
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error in vote API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process vote request",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vote
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/vote",
    method: "POST",
    description: "Validate and prepare for voting on a bug submission",
    note: "Actual vote transaction must be signed and sent from client wallet",
    requestBody: {
      submissionId: "number - Submission ID to vote on",
      userAddress: "string - Voter's wallet address",
      voteFor: "boolean - true to approve, false to reject",
    },
    response: {
      success: "boolean",
      data: {
        submission: "object - Submission details",
        votingConfig: "object - Voting parameters",
        instructions: "object - How to vote from client",
      },
    },
  });
}
