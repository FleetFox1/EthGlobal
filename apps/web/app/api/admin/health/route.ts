import { NextRequest, NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/api-middleware";

/**
 * GET /api/admin/health
 * 
 * Get rate limiter and circuit breaker health status
 * Returns stats for monitoring dashboards
 */
export async function GET(request: NextRequest) {
  try {
    const health = await getHealthStatus();
    
    // Determine overall health status
    const circuitBreakerStatus = Object.values(health.circuitBreakers);
    const hasOpenCircuits = circuitBreakerStatus.some(cb => cb.state === 'OPEN');
    const hasHalfOpenCircuits = circuitBreakerStatus.some(cb => cb.state === 'HALF_OPEN');
    
    let overallStatus = 'healthy';
    if (hasOpenCircuits) {
      overallStatus = 'degraded';
    } else if (hasHalfOpenCircuits) {
      overallStatus = 'recovering';
    }
    
    return NextResponse.json({
      success: true,
      status: overallStatus,
      data: health,
    });
  } catch (error) {
    console.error("Error fetching health status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch health status",
      },
      { status: 500 }
    );
  }
}
