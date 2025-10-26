import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * GET /api/admin/stats
 * 
 * Get admin dashboard statistics from database
 */
export async function GET() {
  try {
    // Get user count
    const usersResult = await sql`
      SELECT COUNT(*) as count FROM users
    `;
    const userCount = parseInt(usersResult.rows[0]?.count || '0');

    // Get submission counts by voting_status from uploads table
    const statusResult = await sql`
      SELECT 
        voting_status,
        COUNT(*) as count
      FROM uploads
      GROUP BY voting_status
    `;

    const statusCounts: Record<string, number> = {};
    statusResult.rows.forEach((row: any) => {
      statusCounts[row.voting_status || 'not_submitted'] = parseInt(row.count);
    });

    // Get total votes cast (sum of all votes_for + votes_against)
    const votesResult = await sql`
      SELECT COALESCE(SUM(votes_for + votes_against), 0) as count 
      FROM uploads
      WHERE voting_status IN ('pending_voting', 'approved', 'rejected')
    `;
    const totalVotes = parseInt(votesResult.rows[0]?.count || '0');

    // Get active voting submissions (pending_voting with deadline not passed)
    const activeVotingResult = await sql`
      SELECT COUNT(*) as count 
      FROM uploads 
      WHERE voting_status = 'pending_voting' AND voting_deadline > NOW()
    `;
    const activeVoting = parseInt(activeVotingResult.rows[0]?.count || '0');

    // Get total submissions (all uploads)
    const totalSubmissionsResult = await sql`
      SELECT COUNT(*) as count FROM uploads
    `;
    const totalSubmissions = parseInt(totalSubmissionsResult.rows[0]?.count || '0');

    // Get recent activity (last 10 submissions)
    const recentActivity = await sql`
      SELECT 
        id,
        wallet_address,
        voting_status,
        votes_for,
        votes_against,
        created_at,
        voting_deadline
      FROM uploads
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Get user activity stats (signups per day, last 7 days)
    const userGrowth = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Get faucet unlock stats
    const faucetStats = await sql`
      SELECT 
        COUNT(*) as total_unlocks,
        COUNT(DISTINCT wallet_address) as unique_users,
        SUM(amount_paid) as total_revenue
      FROM faucet_unlocks
    `;

    // Get voting participation (unique voters)
    const voterStats = await sql`
      SELECT COUNT(DISTINCT wallet_address) as unique_voters
      FROM votes
    `;

    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        submissions: {
          total: totalSubmissions,
          notSubmitted: statusCounts['not_submitted'] || 0,
          pendingVoting: statusCounts['pending_voting'] || 0,
          approved: statusCounts['approved'] || 0,
          rejected: statusCounts['rejected'] || 0,
          minted: statusCounts['minted'] || 0,
        },
        votes: {
          total: totalVotes,
          active: activeVoting,
        },
        faucet: {
          totalUnlocks: parseInt(faucetStats.rows[0]?.total_unlocks || '0'),
          uniqueUsers: parseInt(faucetStats.rows[0]?.unique_users || '0'),
          totalRevenue: parseFloat(faucetStats.rows[0]?.total_revenue || '0'),
        },
        participation: {
          uniqueVoters: parseInt(voterStats.rows[0]?.unique_voters || '0'),
          voterPercentage: userCount > 0 
            ? Math.round((parseInt(voterStats.rows[0]?.unique_voters || '0') / userCount) * 100)
            : 0,
        },
        growth: userGrowth.rows.map((row: any) => ({
          date: row.date,
          signups: parseInt(row.count),
        })),
        recentActivity: recentActivity.rows.map((row: any) => ({
          id: row.id,
          wallet: row.wallet_address,
          status: row.voting_status,
          votesFor: row.votes_for || 0,
          votesAgainst: row.votes_against || 0,
          timestamp: row.created_at,
          deadline: row.voting_deadline,
        })),
      },
    });
  } catch (error: any) {
    console.error("❌ Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
