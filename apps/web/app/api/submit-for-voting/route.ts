import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ethers } from "ethers";
import stakingABI from "@/lib/contracts/BugSubmissionStaking.json";

/**
 * POST /api/submit-for-voting
 * 
 * Verify stake and submit a bug for community voting (requires 10 BUG stake)
 * Frontend must call staking contract first, then call this API
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

    console.log("🗳️  Verifying stake and submitting for voting:", uploadId);

    const walletAddr = walletAddress.toLowerCase();

    // STEP 1: Verify stake exists in staking contract
    const STAKE_AMOUNT = 10;
    const stakingContractAddress = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS;
    
    if (!stakingContractAddress) {
      return NextResponse.json(
        { error: "Staking contract not configured" },
        { status: 500 }
      );
    }

    try {
      // Use public RPC to verify stake (read-only, no wallet needed)
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/");
      const stakingContract = new ethers.Contract(stakingContractAddress, stakingABI.abi, provider);
      
      // Check if stake exists for this uploadId
      const stake = await stakingContract.stakes(uploadId);
      
      if (!stake || !stake.submitter || stake.submitter === ethers.ZeroAddress) {
        return NextResponse.json(
          { 
            error: "No stake found in contract. Please stake 10 BUG first using your wallet.",
          },
          { status: 400 }
        );
      }

      // Verify stake is from correct wallet
      if (stake.submitter.toLowerCase() !== walletAddr) {
        return NextResponse.json(
          { 
            error: `Stake found but from different wallet. Expected ${walletAddr} but got ${stake.submitter}`,
          },
          { status: 400 }
        );
      }

      // Verify stake amount
      const stakeAmountInBUG = Number(ethers.formatEther(stake.amount));
      if (stakeAmountInBUG < STAKE_AMOUNT) {
        return NextResponse.json(
          { 
            error: `Insufficient stake amount. Found ${stakeAmountInBUG} BUG but need ${STAKE_AMOUNT} BUG`,
          },
          { status: 400 }
        );
      }

      console.log(`✅ Verified stake: ${stakeAmountInBUG} BUG from ${stake.submitter}`);
    } catch (stakeError: any) {
      console.error("❌ Failed to verify stake:", stakeError);
      return NextResponse.json(
        { error: "Failed to verify stake in contract. Did you call stakeForSubmission()?" },
        { status: 500 }
      );
    }

    // STEP 2: Check if upload exists and belongs to user
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

    // Get voting config (dynamic duration)
    const configResult = await sql`
      SELECT voting_duration_hours, voting_enabled
      FROM voting_config
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    const config = configResult.rows[0] || {
      voting_duration_hours: 72, // 3 days default
      voting_enabled: true,
    };

    // Check if voting is enabled
    if (!config.voting_enabled) {
      return NextResponse.json(
        { error: "Voting is currently disabled" },
        { status: 503 }
      );
    }

    // Calculate voting deadline using dynamic duration
    const durationMs = config.voting_duration_hours * 60 * 60 * 1000;
    const votingDeadline = new Date(Date.now() + durationMs);

    // STEP 5: Update upload to pending_voting status WITH 10 BUG stake recorded
    await sql`
      UPDATE uploads
      SET 
        voting_status = 'pending_voting',
        voting_deadline = ${votingDeadline.toISOString()},
        votes_for = 0,
        votes_against = 0,
        voting_resolved = false,
        voting_approved = false,
        bug_staked = ${STAKE_AMOUNT},
        bug_rewards_earned = 0,
        rewards_claimed = false
      WHERE id = ${uploadId}
    `;

    const durationText = config.voting_duration_hours >= 24 
      ? `${Math.floor(config.voting_duration_hours / 24)} day${Math.floor(config.voting_duration_hours / 24) > 1 ? 's' : ''}`
      : config.voting_duration_hours >= 1
      ? `${Math.floor(config.voting_duration_hours)} hour${Math.floor(config.voting_duration_hours) > 1 ? 's' : ''}`
      : `${Math.floor(config.voting_duration_hours * 60)} minute${Math.floor(config.voting_duration_hours * 60) > 1 ? 's' : ''}`;

    console.log(`✅ Submitted for voting! 10 BUG staked. Duration: ${config.voting_duration_hours}h, Deadline:`, votingDeadline);

    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        votingStatus: "pending_voting",
        votingDeadline,
        votingDurationHours: config.voting_duration_hours,
        bugStaked: STAKE_AMOUNT,
        message: `Bug submitted for community voting! 10 BUG tokens staked. You'll earn 5 BUG per upvote! Voting lasts ${durationText}.`,
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
