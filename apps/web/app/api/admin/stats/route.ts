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

    // Get submission counts by status
    const statusResult = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM bug_submissions
      GROUP BY status
    `;

    const statusCounts: Record<string, number> = {};
    statusResult.rows.forEach((row: any) => {
      statusCounts[row.status || 'pending'] = parseInt(row.count);
    });

    // Get total votes cast (sum of all votes_for + votes_against)
    const votesResult = await sql`
      SELECT COALESCE(SUM(votes_for + votes_against), 0) as count 
      FROM bug_submissions
    `;
    const totalVotes = parseInt(votesResult.rows[0]?.count || '0');

    // Get active voting submissions (pending_voting with deadline not passed)
    const activeVotingResult = await sql`
      SELECT COUNT(*) as count 
      FROM bug_submissions 
      WHERE status = 'pending_voting' AND voting_deadline > NOW()
    `;
    const activeVoting = parseInt(activeVotingResult.rows[0]?.count || '0');

    // Get total submissions
    const totalSubmissionsResult = await sql`
      SELECT COUNT(*) as count FROM bug_submissions
    `;
    const totalSubmissions = parseInt(totalSubmissionsResult.rows[0]?.count || '0');

    // Get recent activity (last 10 submissions)
    const recentActivity = await sql`
      SELECT 
        id,
        wallet_address,
        status,
        votes_for,
        votes_against,
        created_at,
        voting_deadline
      FROM bug_submissions
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        submissions: {
          total: totalSubmissions,
          pending: statusCounts['pending'] || 0,
          pendingVoting: statusCounts['pending_voting'] || 0,
          approved: statusCounts['approved'] || 0,
          rejected: statusCounts['rejected'] || 0,
          minted: statusCounts['minted'] || 0,
        },
        votes: {
          total: totalVotes,
          active: activeVoting,
        },
        recentActivity: recentActivity.rows.map((row: any) => ({
          id: row.id,
          wallet: row.wallet_address,
          status: row.status,
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
