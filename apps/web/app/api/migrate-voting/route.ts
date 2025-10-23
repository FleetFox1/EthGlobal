import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * GET /api/migrate-voting
 * 
 * Adds voting columns to uploads table for off-chain voting system
 * Run this once to migrate the database
 */
export async function GET() {
  try {
    console.log("🔄 Starting voting migration...");

    // Add voting columns to uploads table
    await sql`
      ALTER TABLE uploads 
      ADD COLUMN IF NOT EXISTS voting_status VARCHAR(20) DEFAULT 'not_submitted',
      ADD COLUMN IF NOT EXISTS votes_for INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS votes_against INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS voting_deadline BIGINT,
      ADD COLUMN IF NOT EXISTS voting_resolved BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS voting_approved BOOLEAN DEFAULT false
    `;

    // Create votes table to track who voted
    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        upload_id VARCHAR(50) NOT NULL,
        voter_address VARCHAR(42) NOT NULL,
        vote_for BOOLEAN NOT NULL,
        voted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(upload_id, voter_address)
      )
    `;

    // Create index for faster vote lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_votes_upload ON votes(upload_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_address)`;

    console.log("✅ Voting migration completed successfully!");

    return NextResponse.json({
      success: true,
      message: "Voting system migrated successfully",
      changes: [
        "Added voting_status column to uploads",
        "Added votes_for, votes_against columns",
        "Added voting_deadline column",
        "Added voting_resolved, voting_approved columns",
        "Created votes table",
        "Created indexes for performance",
      ],
    });
  } catch (error: any) {
    console.error("❌ Migration failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Migration failed",
      },
      { status: 500 }
    );
  }
}
