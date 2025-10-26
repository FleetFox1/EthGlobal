import { NextRequest, NextResponse } from "next/server";
import { getSubmissionDetails, getActiveSubmissions } from "@/lib/contracts";
import { getIPFSUrl } from "@/lib/pinata";

/**
 * GET /api/submissions
 * 
 * Fetch all active submissions or a specific submission
 * 
 * Query params:
 * - id: number (optional) - Fetch specific submission
 * - status: "active" | "all" (optional) - Filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const submissionId = searchParams.get("id");
    const status = searchParams.get("status") || "active";

    // Fetch specific submission
    if (submissionId) {
      const id = parseInt(submissionId);
      if (isNaN(id) || id < 1) {
        return NextResponse.json(
          { error: "Invalid submission ID" },
          { status: 400 }
        );
      }

      console.log("📋 Fetching submission:", id);
      const submission = await getSubmissionDetails(id);

      // Add IPFS URLs
      const metadataURL = getIPFSUrl(submission.ipfsHash);

      // Calculate time remaining
      const votingDeadline = submission.createdAt + 3 * 24 * 60 * 60;
      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = Math.max(0, votingDeadline - now);

      return NextResponse.json({
        success: true,
        data: {
          ...submission,
          metadataURL,
          votingDeadline,
          timeRemaining,
          status: submission.resolved
            ? submission.approved
              ? "approved"
              : "rejected"
            : timeRemaining > 0
            ? "active"
            : "expired",
          progress: {
            votesFor: submission.votesFor,
            votesAgainst: submission.votesAgainst,
            total: submission.votesFor + submission.votesAgainst,
            threshold: 5,
            percentageFor:
              submission.votesFor + submission.votesAgainst > 0
                ? (submission.votesFor /
                    (submission.votesFor + submission.votesAgainst)) *
                  100
                : 0,
          },
        },
      });
    }

    // Fetch active or all submissions
    console.log("📋 Fetching", status, "submissions");

    if (status === "active") {
      const submissions = await getActiveSubmissions();

      const enrichedSubmissions = submissions.map((sub) => ({
        ...sub,
        metadataURL: getIPFSUrl(sub.ipfsHash),
        votingDeadline: sub.createdAt + 3 * 24 * 60 * 60,
        timeRemaining: Math.max(
          0,
          sub.createdAt + 3 * 24 * 60 * 60 - Math.floor(Date.now() / 1000)
        ),
        progress: {
          votesFor: sub.votesFor,
          votesAgainst: sub.votesAgainst,
          total: sub.votesFor + sub.votesAgainst,
          threshold: 5,
        },
      }));

      return NextResponse.json({
        success: true,
        count: enrichedSubmissions.length,
        data: enrichedSubmissions,
      });
    }

    // If status is "all", we would need to implement pagination
    // For now, just return active submissions
    return NextResponse.json({
      success: false,
      error: "Fetching all submissions not yet implemented. Use status=active",
    });
  } catch (error: any) {
    console.error("❌ Error in submissions API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch submissions",
      },
      { status: 500 }
    );
  }
}
