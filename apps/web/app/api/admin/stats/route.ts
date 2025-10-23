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
        voting_status,
        COUNT(*) as count
      FROM uploads
      GROUP BY voting_status
    `;

    const statusCounts: Record<string, number> = {};
    statusResult.rows.forEach((row: any) => {
      statusCounts[row.voting_status || 'not_submitted'] = parseInt(row.count);
    });

    // Get total votes cast
    const votesResult = await sql`
      SELECT COUNT(*) as count FROM votes
    `;
    const totalVotes = parseInt(votesResult.rows[0]?.count || '0');

    // Get active voting submissions (pending_voting)
    const activeVoting = statusCounts['pending_voting'] || 0;

    // Get total submissions
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
        timestamp,
        voting_deadline
      FROM uploads
      ORDER BY timestamp DESC
      LIMIT 10
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
          minted: statusCounts['submitted_to_blockchain'] || 0,
        },
        votes: {
          total: totalVotes,
          active: activeVoting,
        },
        recentActivity: recentActivity.rows.map((row: any) => ({
          id: row.id,
          wallet: row.wallet_address,
          status: row.voting_status,
          votesFor: row.votes_for || 0,
          votesAgainst: row.votes_against || 0,
          timestamp: row.timestamp,
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
