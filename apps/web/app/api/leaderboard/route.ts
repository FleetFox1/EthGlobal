import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * GET /api/leaderboard
 * 
 * Get top users ranked by their on-chain stats
 */

export async function GET(request: NextRequest) {
  try {
    // Fetch all users from database
    const result = await sql`
      SELECT 
        wallet_address,
        username,
        avatar_url,
        bio,
        created_at
      FROM users
      ORDER BY created_at ASC
      LIMIT 50
    `;

    const users = result.rows;

    // For now, return users with mock stats
    // TODO: Query blockchain for real NFT counts and BUG balances
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      address: user.wallet_address,
      username: user.username || `User${user.wallet_address.slice(2, 8)}`,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      nftCount: Math.floor(Math.random() * 50), // Mock for now
      bugBalance: (Math.floor(Math.random() * 20000)).toString(), // Mock for now
      score: 0,
    }));

    // Sort by combined score (NFT count + BUG balance / 1000)
    leaderboard.sort((a, b) => {
      const scoreA = a.nftCount + parseInt(a.bugBalance) / 1000;
      const scoreB = b.nftCount + parseInt(b.bugBalance) / 1000;
      return scoreB - scoreA;
    });

    // Update ranks after sorting
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
      entry.score = entry.nftCount + parseInt(entry.bugBalance) / 1000;
    });

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    console.error("❌ Error fetching leaderboard:", error);

    // Return mock data if database fails
    const mockData = [
      {
        rank: 1,
        address: "0x1234567890123456789012345678901234567890",
        username: "BugHunter",
        avatarUrl: undefined,
        nftCount: 42,
        bugBalance: "15000",
        score: 15042,
      },
      {
        rank: 2,
        address: "0x2234567890123456789012345678901234567890",
        username: "InsectCollector",
        avatarUrl: undefined,
        nftCount: 38,
        bugBalance: "12000",
        score: 12038,
      },
      {
        rank: 3,
        address: "0x3234567890123456789012345678901234567890",
        username: "NatureExplorer",
        avatarUrl: undefined,
        nftCount: 35,
        bugBalance: "10500",
        score: 10535,
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockData,
      note: "Using mock data - database unavailable",
    });
  }
}
