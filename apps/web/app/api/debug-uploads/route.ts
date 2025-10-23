import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * GET /api/debug-uploads
 * 
 * Debug endpoint to check what's actually in the database
 */
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id,
        wallet_address,
        voting_status,
        votes_for,
        votes_against,
        voting_deadline,
        timestamp
      FROM uploads
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      uploads: result.rows.map((row: any) => ({
        id: row.id,
        wallet: row.wallet_address?.substring(0, 8) + '...',
        status: row.voting_status,
        votesFor: row.votes_for,
        votesAgainst: row.votes_against,
        deadline: row.voting_deadline,
        timestamp: row.timestamp,
      })),
    });
  } catch (error: any) {
    console.error("❌ Debug error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
