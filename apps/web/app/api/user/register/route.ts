import { NextRequest, NextResponse } from "next/server";

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

// Simple in-memory storage for demo (replace with real DB for production)
// For hackathon, you might use: Vercel KV, Supabase, or MongoDB
const userProfiles = new Map<string, UserProfile>();

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

    // Check if user exists
    const existingUser = userProfiles.get(address.toLowerCase());
    const now = Date.now();

    if (existingUser) {
      // Update existing user
      const updatedUser: UserProfile = {
        ...existingUser,
        lastLogin: now,
        username: username || existingUser.username,
        email: email || existingUser.email,
        privyUserId: privyUserId || existingUser.privyUserId,
      };

      userProfiles.set(address.toLowerCase(), updatedUser);

      return NextResponse.json({
        success: true,
        data: {
          user: updatedUser,
          isNewUser: false,
        },
      });
    } else {
      // Create new user
      const newUser: UserProfile = {
        address: address.toLowerCase(),
        username: username || `User${address.slice(2, 8)}`,
        email: email,
        createdAt: now,
        lastLogin: now,
        privyUserId: privyUserId,
      };

      userProfiles.set(address.toLowerCase(), newUser);

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

    const user = userProfiles.get(address.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

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
