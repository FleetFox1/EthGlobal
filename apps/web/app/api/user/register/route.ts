import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * POST /api/user/register
 * 
 * Register or update a user profile when they connect their wallet
 * 
 * Body:
 * - address: string - Wallet address (from Privy)
 * - username?: string - Optional display name
 * - email?: string - Optional email from Privy
 */

interface UserProfile {
  address: string;
  username: string;
  email?: string;
  createdAt: number;
  lastLogin: number;
  privyUserId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, username, email, privyUserId } = body;

    // Validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    console.log("👤 Registering/updating user:", address);

    const walletAddress = address.toLowerCase();
    const now = Date.now();
    const defaultUsername = username || `User${address.slice(2, 8)}`;

    // Check if user exists
    const existingResult = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `;

    const existingUser = existingResult.rows[0];

    if (existingUser) {
      // Update existing user
      await sql`
        UPDATE users
        SET 
          username = ${username || existingUser.username},
          updated_at = NOW()
        WHERE wallet_address = ${walletAddress}
      `;

      const updatedUser: UserProfile = {
        address: walletAddress,
        username: username || existingUser.username,
        email: email,
        createdAt: new Date(existingUser.created_at).getTime(),
        lastLogin: now,
        privyUserId: privyUserId,
      };

      return NextResponse.json({
        success: true,
        data: {
          user: updatedUser,
          isNewUser: false,
        },
      });
    } else {
      // Create new user
      await sql`
        INSERT INTO users (wallet_address, username)
        VALUES (${walletAddress}, ${defaultUsername})
      `;

      const newUser: UserProfile = {
        address: walletAddress,
        username: defaultUsername,
        email: email,
        createdAt: now,
        lastLogin: now,
        privyUserId: privyUserId,
      };

      console.log("✅ New user created:", newUser.username);

      return NextResponse.json({
        success: true,
        data: {
          user: newUser,
          isNewUser: true,
        },
      });
    }
  } catch (error: any) {
    console.error("❌ Error in user registration:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to register user",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/register
 * 
 * Get user profile by address (query param)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const walletAddress = address.toLowerCase();

    // Fetch from database
    const result = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const dbUser = result.rows[0];
    const user: UserProfile = {
      address: dbUser.wallet_address,
      username: dbUser.username,
      email: undefined, // Email not stored in DB schema
      createdAt: new Date(dbUser.created_at).getTime(),
      lastLogin: new Date(dbUser.updated_at).getTime(),
      privyUserId: undefined,
    };

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error("❌ Error fetching user:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
