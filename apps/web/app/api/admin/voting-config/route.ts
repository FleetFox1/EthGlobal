import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

/**
 * GET /api/admin/voting-config
 * Retrieve current voting configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Get or create default config
    const result = await sql`
      SELECT * FROM voting_config
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    let config;
    if (result.rows.length === 0) {
      // Create default config if none exists
      const createResult = await sql`
        INSERT INTO voting_config (
          voting_duration_hours,
          voting_enabled,
          min_votes_required,
          approval_threshold_percent
        ) VALUES (
          72,  -- 3 days default
          true,
          0,   -- No minimum votes required
          0    -- Net votes >= 0 (50% threshold)
        )
        RETURNING *
      `;
      config = createResult.rows[0];
    } else {
      config = result.rows[0];
    }

    return NextResponse.json({
      success: true,
      data: {
        voting_duration_hours: config.voting_duration_hours,
        voting_enabled: config.voting_enabled,
        min_votes_required: config.min_votes_required,
        approval_threshold_percent: config.approval_threshold_percent,
        updated_at: config.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching voting config:', error);
    
    // Return default config on error
    return NextResponse.json({
      success: true,
      data: {
        voting_duration_hours: 72, // 3 days
        voting_enabled: true,
        min_votes_required: 0,
        approval_threshold_percent: 0,
      },
    });
  }
}

/**
 * POST /api/admin/voting-config
 * Update voting configuration (admin only)
 * 
 * Body:
 * - voting_duration_hours: number (e.g., 72 for 3 days, 0.083 for 5 minutes)
 * - voting_enabled: boolean (toggle voting on/off)
 * - min_votes_required: number (optional)
 * - approval_threshold_percent: number (optional, 0-100)
 * - admin_wallet: string (admin verification)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      voting_duration_hours,
      voting_enabled,
      min_votes_required,
      approval_threshold_percent,
      admin_wallet,
    } = body;

    // Admin verification - check against admin list (same as useAdmin hook)
    const adminAddresses = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.split(',').map(addr => addr.trim().toLowerCase()) || [];
    const isAdmin = admin_wallet && adminAddresses.includes(admin_wallet.toLowerCase());
    
    console.log('🔐 Admin check:', {
      provided: admin_wallet?.toLowerCase(),
      adminList: adminAddresses,
      isAdmin,
    });
    
    if (!isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Admin access required',
          hint: 'Your wallet must be in NEXT_PUBLIC_ADMIN_ADDRESSES environment variable'
        },
        { status: 403 }
      );
    }

    // Validation
    if (voting_duration_hours !== undefined) {
      if (typeof voting_duration_hours !== 'number' || voting_duration_hours < 0) {
        return NextResponse.json(
          { success: false, error: 'voting_duration_hours must be a positive number' },
          { status: 400 }
        );
      }
    }

    if (voting_enabled !== undefined && typeof voting_enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'voting_enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Update config (upsert pattern)
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (voting_duration_hours !== undefined) {
      updates.voting_duration_hours = voting_duration_hours;
    }
    if (voting_enabled !== undefined) {
      updates.voting_enabled = voting_enabled;
    }
    if (min_votes_required !== undefined) {
      updates.min_votes_required = min_votes_required;
    }
    if (approval_threshold_percent !== undefined) {
      updates.approval_threshold_percent = approval_threshold_percent;
    }

    // Get current config
    const currentConfig = await sql`
      SELECT * FROM voting_config
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    let result;
    if (currentConfig.rows.length === 0) {
      // Insert new config
      result = await sql`
        INSERT INTO voting_config (
          voting_duration_hours,
          voting_enabled,
          min_votes_required,
          approval_threshold_percent,
          updated_at
        ) VALUES (
          ${updates.voting_duration_hours ?? 72},
          ${updates.voting_enabled ?? true},
          ${updates.min_votes_required ?? 0},
          ${updates.approval_threshold_percent ?? 0},
          ${updates.updated_at}
        )
        RETURNING *
      `;
    } else {
      // Update existing config
      const id = currentConfig.rows[0].id;
      result = await sql`
        UPDATE voting_config
        SET 
          voting_duration_hours = COALESCE(${updates.voting_duration_hours}, voting_duration_hours),
          voting_enabled = COALESCE(${updates.voting_enabled}, voting_enabled),
          min_votes_required = COALESCE(${updates.min_votes_required}, min_votes_required),
          approval_threshold_percent = COALESCE(${updates.approval_threshold_percent}, approval_threshold_percent),
          updated_at = ${updates.updated_at}
        WHERE id = ${id}
        RETURNING *
      `;
    }

    const newConfig = result.rows[0];

    console.log('✅ Voting config updated:', newConfig);

    return NextResponse.json({
      success: true,
      message: 'Voting configuration updated',
      data: {
        voting_duration_hours: newConfig.voting_duration_hours,
        voting_enabled: newConfig.voting_enabled,
        min_votes_required: newConfig.min_votes_required,
        approval_threshold_percent: newConfig.approval_threshold_percent,
        updated_at: newConfig.updated_at,
      },
    });
  } catch (error) {
    console.error('❌ Error updating voting config:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update voting configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
