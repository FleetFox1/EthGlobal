import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * GET /api/fix-voting-deadline
 * 
 * Fixes the voting_deadline column type from BIGINT to TIMESTAMP
 * This is a one-time fix for the migration issue
 */
export async function GET() {
  try {
    console.log("🔧 Fixing voting_deadline column type...");

    // Drop the old BIGINT column and recreate as TIMESTAMP
    await sql`
      ALTER TABLE uploads 
      DROP COLUMN IF EXISTS voting_deadline CASCADE
    `;

    await sql`
      ALTER TABLE uploads 
      ADD COLUMN voting_deadline TIMESTAMP
    `;

    console.log("✅ voting_deadline column fixed!");

    return NextResponse.json({
      success: true,
      message: "voting_deadline column type fixed (BIGINT → TIMESTAMP)",
      note: "Existing deadlines were cleared. Re-submit bugs for voting to set new deadlines.",
    });
  } catch (error: any) {
    console.error("❌ Fix failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fix column type",
      },
      { status: 500 }
    );
  }
}
