import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * PUT /api/user/update-profile
 * 
 * Update user profile in the database
 * 
 * Body:
 * - address: string - Wallet address (required)
 * - username?: string - Display name
 * - bio?: string - User bio/description
 * - avatarUrl?: string - Avatar image URL (from IPFS)
 * - profileIpfsHash?: string - IPFS hash of full profile JSON
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, username, bio, avatarUrl, profileIpfsHash } = body;

    // Validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    console.log("👤 Updating profile for:", address);

    const walletAddress = address.toLowerCase();

    // Check if user exists
    const existingResult = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `;

    if (existingResult.rows.length === 0) {
      // Create user if doesn't exist
      const defaultUsername = username || `User${address.slice(2, 8)}`;
      await sql`
        INSERT INTO users (wallet_address, username, bio, avatar_url, profile_ipfs_hash)
        VALUES (
          ${walletAddress},
          ${defaultUsername},
          ${bio || null},
          ${avatarUrl || null},
          ${profileIpfsHash || null}
        )
      `;

      return NextResponse.json({
        success: true,
        data: {
          address: walletAddress,
          username: defaultUsername,
          bio,
          avatarUrl,
          profileIpfsHash,
          isNewUser: true,
        },
      });
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(avatarUrl);
    }
    if (profileIpfsHash !== undefined) {
      updates.push(`profile_ipfs_hash = $${paramCount++}`);
      values.push(profileIpfsHash);
    }

    // Always update timestamp
    updates.push(`updated_at = NOW()`);

    if (updates.length > 1) { // More than just timestamp
      // Use template literal for the SET clause, but parameterized values
      await sql.query(
        `UPDATE users SET ${updates.join(', ')} WHERE wallet_address = $${paramCount}`,
        [...values, walletAddress]
      );
    }

    // Fetch updated user
    const updatedResult = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `;

    const updatedUser = updatedResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        address: updatedUser.wallet_address,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatar_url,
        profileIpfsHash: updatedUser.profile_ipfs_hash,
        updatedAt: updatedUser.updated_at,
        isNewUser: false,
      },
    });
  } catch (error: any) {
    console.error("❌ Error updating profile:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
