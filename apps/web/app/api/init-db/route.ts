import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db/client";

/**
 * GET /api/init-db
 * 
 * Initialize the database tables (run once on first deployment)
 * In production, you'd use Vercel's SQL tab or migrations
 */
export async function GET() {
  try {
    console.log("🗄️ Initializing database...");
    
    await initDatabase();
    
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    });
  } catch (error: any) {
    console.error("❌ Database initialization failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize database",
      },
      { status: 500 }
    );
  }
}
