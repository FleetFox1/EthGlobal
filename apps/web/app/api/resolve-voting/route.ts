import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

/**
 * Resolve expired voting periods
 * 
 * Checks all uploads with voting_status='pending_voting' where deadline has passed.
 * If votes_for > votes_against: marks as 'approved'
 * Otherwise: marks as 'rejected'
 * 
 * Can be called:
 * - Manually via GET request
 * - From cron job (Vercel Cron)
 * - When user views their collection
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Find all uploads with expired voting deadlines that haven't been resolved
    const result = await sql`
      SELECT 
        id,
        votes_for,
        votes_against,
        voting_deadline,
        wallet_address,
        metadata_cid,
        bug_staked
      FROM uploads
      WHERE voting_status = 'pending_voting'
        AND voting_deadline <= NOW()
        AND voting_resolved = false
    `;
    
    const expiredUploads = result.rows;
    
    if (expiredUploads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired voting periods to resolve',
        resolved: 0,
      });
    }
    
    const resolved = [];
    
    for (const upload of expiredUploads) {
      const votesFor = upload.votes_for || 0;
      const votesAgainst = upload.votes_against || 0;
      const bugStaked = upload.bug_staked || 10;
      
      // Approval logic: 
      // - Net votes >= 0 (including 0 total votes) → Approved
      // - Net votes < 0 (more against than for) → Rejected
      const netVotes = votesFor - votesAgainst;
      const approved = netVotes >= 0;
      const newStatus = approved ? 'approved' : 'rejected';
      
      // Calculate BUG rewards: 5 BUG per upvote
      const REWARD_PER_UPVOTE = 5;
      const bugRewards = approved ? votesFor * REWARD_PER_UPVOTE : 0;
      
      console.log(`📊 Resolving ${upload.id}: ${votesFor} FOR, ${votesAgainst} AGAINST = ${approved ? 'APPROVED' : 'REJECTED'}, Rewards: ${bugRewards} BUG`);
      
      // Update the upload with rewards
      await sql`
        UPDATE uploads
        SET 
          voting_status = ${newStatus},
          voting_resolved = true,
          voting_approved = ${approved},
          bug_rewards_earned = ${bugRewards}
        WHERE id = ${upload.id}
      `;
      
      resolved.push({
        id: upload.id,
        votesFor,
        votesAgainst,
        netVotes,
        approved,
        status: newStatus,
        bugStaked,
        bugRewardsEarned: bugRewards,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Resolved ${resolved.length} voting period(s)`,
      resolved,
    });
    
  } catch (error) {
    console.error('Error resolving voting:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to resolve voting periods',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Resolve a specific upload's voting period (manual trigger)
 * 
 * POST body: { uploadId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId } = body;
    
    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'uploadId is required' },
        { status: 400 }
      );
    }
    
    // Get the upload
    const result = await sql`
      SELECT 
        id,
        votes_for,
        votes_against,
        voting_deadline,
        voting_status,
        voting_resolved
      FROM uploads
      WHERE id = ${uploadId}
    `;
    
    const uploads = result.rows;
    
    if (uploads.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      );
    }
    
    const upload = uploads[0];
    
    // Check if already resolved
    if (upload.voting_resolved) {
      return NextResponse.json({
        success: true,
        message: 'Already resolved',
        status: upload.voting_status,
        approved: upload.voting_status === 'approved',
      });
    }
    
    // Check if voting period is over
    const now = new Date();
    const deadline = new Date(upload.voting_deadline);
    
    if (deadline > now) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Voting period not ended yet',
          deadline: deadline.toISOString(),
          timeRemaining: Math.ceil((deadline.getTime() - now.getTime()) / 1000 / 60 / 60) + ' hours',
        },
        { status: 400 }
      );
    }
    
    // Resolve the voting
    const votesFor = upload.votes_for || 0;
    const votesAgainst = upload.votes_against || 0;
    const approved = votesFor > votesAgainst;
    const newStatus = approved ? 'approved' : 'rejected';
    
    await sql`
      UPDATE uploads
      SET 
        voting_status = ${newStatus},
        voting_resolved = true,
        voting_approved = ${approved}
      WHERE id = ${uploadId}
    `;
    
    return NextResponse.json({
      success: true,
      message: `Voting resolved: ${approved ? 'APPROVED' : 'REJECTED'}`,
      data: {
        uploadId,
        votesFor,
        votesAgainst,
        approved,
        status: newStatus,
      },
    });
    
  } catch (error) {
    console.error('Error resolving voting:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to resolve voting',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
