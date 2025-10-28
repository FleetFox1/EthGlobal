import { NextRequest, NextResponse } from "next/server";
import { sendAlert, AlertTemplates, monitorHealth } from "@/lib/alerts";

/**
 * GET /api/admin/alerts/test
 * 
 * Test alert system by sending a test alert
 */
export async function GET(request: NextRequest) {
  try {
    await sendAlert({
      severity: 'info',
      title: 'Test Alert',
      message: 'This is a test alert from BugDex monitoring system.',
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'manual_test',
        requestUrl: request.url,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test alert sent successfully',
    });
  } catch (error) {
    console.error("Error sending test alert:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test alert",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/alerts/monitor
 * 
 * Manually trigger health monitoring and alerts
 */
export async function POST(request: NextRequest) {
  try {
    await monitorHealth();

    return NextResponse.json({
      success: true,
      message: 'Health monitoring completed',
    });
  } catch (error) {
    console.error("Error during health monitoring:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to monitor health",
      },
      { status: 500 }
    );
  }
}
