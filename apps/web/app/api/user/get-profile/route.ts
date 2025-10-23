import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * GET /api/user/get-profile?address=0x...
 * 
 * Get user profile from the database
 * 
 * Query params:
 * - address: string - Wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    // Validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    console.log("👤 Fetching profile for:", address);

    const walletAddress = address.toLowerCase();

    // Fetch from database
    const result = await sql`
      SELECT 
        wallet_address,
        username,
        bio,
        avatar_url,
        profile_ipfs_hash,
        created_at,
        updated_at
      FROM users
      WHERE wallet_address = ${walletAddress}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Profile not found",
      });
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        address: user.wallet_address,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        profileIpfsHash: user.profile_ipfs_hash,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching profile:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}
