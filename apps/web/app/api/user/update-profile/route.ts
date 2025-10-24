import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * PUT /api/user/update-profile
 * 
 * Update user profile settings
 * 
 * Body:
 * - address: string - Wallet address (required)
 * - username?: string - Display name
 * - bio?: string - User bio
 * - avatarUrl?: string - Profile picture URL
 * - profileIpfsHash?: string - IPFS hash for decentralized profile data
 * - settings?: object - JSON object for notifications, privacy, display, blockchain settings
 */

interface ProfileSettings {
  notifications?: {
    email?: boolean;
    votes?: boolean;
    mints?: boolean;
  };
  privacy?: {
    publicCollection?: boolean;
    showWalletAddress?: boolean;
    shareLocation?: boolean;
  };
  display?: {
    theme?: "light" | "dark";
    currency?: "USD" | "ETH" | "PYUSD";
  };
  blockchain?: {
    defaultPayment?: "ETH" | "PYUSD";
  };
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, username, bio, avatarUrl, profileIpfsHash, settings } = body;

    // Validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const walletAddress = address.toLowerCase();

    console.log("🔄 Updating profile for:", walletAddress);

    // Check if user exists
    const existingResult = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `;

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // Prepare update fields
    const updateFields: any = {
      updated_at: new Date(),
    };

    if (username !== undefined) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatarUrl !== undefined) updateFields.avatar_url = avatarUrl;
    if (profileIpfsHash !== undefined) updateFields.profile_ipfs_hash = profileIpfsHash;

    // Store settings as JSONB if database supports it, or use profile_ipfs_hash for decentralized storage
    // For now, we'll store settings in IPFS and just keep the hash in DB
    
    // Build SQL update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (username !== undefined) {
      setClauses.push(`username = $${paramCount++}`);
      values.push(username);
    }
    if (bio !== undefined) {
      setClauses.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (avatarUrl !== undefined) {
      setClauses.push(`avatar_url = $${paramCount++}`);
      values.push(avatarUrl);
    }
    if (profileIpfsHash !== undefined) {
      setClauses.push(`profile_ipfs_hash = $${paramCount++}`);
      values.push(profileIpfsHash);
    }

    // Always update timestamp
    setClauses.push(`updated_at = NOW()`);
    values.push(walletAddress); // For WHERE clause

    if (setClauses.length > 1) { // More than just updated_at
      const query = `
        UPDATE users
        SET ${setClauses.join(", ")}
        WHERE wallet_address = $${paramCount}
        RETURNING *
      `;

      const result = await sql.query(query, values);
      const updatedUser = result.rows[0];

      console.log("✅ Profile updated successfully for:", username || walletAddress);

      return NextResponse.json({
        success: true,
        data: {
          user: {
            address: updatedUser.wallet_address,
            username: updatedUser.username,
            bio: updatedUser.bio,
            avatarUrl: updatedUser.avatar_url,
            profileIpfsHash: updatedUser.profile_ipfs_hash,
            updatedAt: new Date(updatedUser.updated_at).getTime(),
          },
          settings: settings || null,
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "No changes to update",
      });
    }
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
