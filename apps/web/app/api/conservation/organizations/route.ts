import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    const currentQuarter = `${year}-Q${quarter}`;

    // Get organizations with vote counts for current quarter
    const result = await sql`
      SELECT 
        co.id,
        co.name,
        co.description,
        co.category,
        co.logo_url,
        COUNT(cv.id) as vote_count,
        COALESCE(SUM(cv.bug_balance), 0) as weighted_votes
      FROM conservation_orgs co
      LEFT JOIN conservation_votes cv ON co.id = cv.org_id AND cv.quarter = ${currentQuarter}
      WHERE co.verified = true
      GROUP BY co.id, co.name, co.description, co.category, co.logo_url
      ORDER BY weighted_votes DESC, vote_count DESC
    `;

    const orgs = result.rows;

    // Calculate vote percentages
    const totalWeightedVotes = orgs.reduce((sum: number, org: any) => sum + parseFloat(org.weighted_votes), 0);
    const organizations = orgs.map((org: any) => ({
      ...org,
      vote_count: parseInt(org.vote_count),
      vote_percentage: totalWeightedVotes > 0 
        ? ((parseFloat(org.weighted_votes) / totalWeightedVotes) * 100).toFixed(1) 
        : '0.0',
    }));

    // Get total donated this quarter
    const donationResult = await sql`
      SELECT COALESCE(SUM(amount_pyusd), 0) as total
      FROM conservation_donations
      WHERE quarter = ${currentQuarter}
    `;
    const totalDonated = donationResult.rows[0]?.total || '0';

    return NextResponse.json({
      success: true,
      data: {
        organizations,
        totalDonated,
        currentQuarter,
      },
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
