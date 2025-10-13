"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, Clock, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useBugVoting, areContractsConfigured } from "@/lib/contract-hooks";
import { useWallet } from "@/lib/useWallet";

interface BugSubmission {
  id: number;
  imageUrl: string;
  submittedBy: string;
  submittedAt: string;
  votes: {
    real: number;
    fake: number;
    total: number;
  };
  requiredVotes: number;
  status: "pending" | "approved" | "rejected";
  userVote?: "real" | "fake" | null;
  metadataCid?: string; // IPFS metadata CID
  canClaimNFT?: boolean; // If approved and user is discoverer
}

// Mock bug submissions
const MOCK_SUBMISSIONS: BugSubmission[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1582515073490-39981397c445?w=600&h=600&fit=crop",
    submittedBy: "0x742d...9a3f",
    submittedAt: "2025-10-10T14:30:00",
    votes: { real: 12, fake: 3, total: 15 },
    requiredVotes: 20,
    status: "pending",
    userVote: null,
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1568526381923-caf3fd520382?w=600&h=600&fit=crop",
    submittedBy: "0x8f3e...2b1c",
    submittedAt: "2025-10-10T13:15:00",
    votes: { real: 8, fake: 7, total: 15 },
    requiredVotes: 20,
    status: "pending",
    userVote: null,
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=600&h=600&fit=crop",
    submittedBy: "0x5a9d...7e4f",
    submittedAt: "2025-10-10T12:00:00",
    votes: { real: 18, fake: 2, total: 20 },
    requiredVotes: 20,
    status: "approved",
    userVote: "real",
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1534189324936-e6d2320c8e94?w=600&h=600&fit=crop",
    submittedBy: "0x3c7b...6d2a",
    submittedAt: "2025-10-10T11:30:00",
    votes: { real: 5, fake: 2, total: 7 },
    requiredVotes: 20,
    status: "pending",
    userVote: null,
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=600&h=600&fit=crop",
    submittedBy: "0x9e2f...4c8b",
    submittedAt: "2025-10-10T10:45:00",
    votes: { real: 3, fake: 15, total: 18 },
    requiredVotes: 20,
    status: "rejected",
    userVote: "fake",
  },
];

export default function VotingPage() {
  const [submissions, setSubmissions] = useState<BugSubmission[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "voted">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);
  
  const { isConnected, address } = useWallet();
  const { getActiveSubmissions, vote, claimNFT } = useBugVoting();

  // Load submissions from blockchain
  useEffect(() => {
    loadSubmissions();
  }, [isConnected, address]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      // If contracts not configured, show mock data
      if (!areContractsConfigured()) {
        console.log("⚠️ Contracts not configured - using mock data");
        setSubmissions(MOCK_SUBMISSIONS);
        setIsLoading(false);
        return;
      }

      // Fetch real submissions from blockchain
      const activeSubmissions = await getActiveSubmissions();
      
      // Transform blockchain data to UI format
      const formattedSubmissions: BugSubmission[] = await Promise.all(
        activeSubmissions.map(async (sub: any, index: number) => {
          // Fetch metadata from IPFS if available
          let imageUrl = "https://images.unsplash.com/photo-1582515073490-39981397c445?w=600&h=600&fit=crop";
          
          if (sub.metadataCid) {
            try {
              const metadataUrl = `https://gateway.lighthouse.storage/ipfs/${sub.metadataCid}`;
              const metadataRes = await fetch(metadataUrl);
              const metadata = await metadataRes.json();
              if (metadata.image) {
                imageUrl = metadata.image.replace('ipfs://', 'https://gateway.lighthouse.storage/ipfs/');
              }
            } catch (err) {
              console.error("Failed to fetch metadata:", err);
            }
          }

          // Calculate status
          let status: "pending" | "approved" | "rejected" = "pending";
          if (sub.votesFor + sub.votesAgainst >= sub.requiredVotes) {
            const realPercentage = (sub.votesFor / (sub.votesFor + sub.votesAgainst)) * 100;
            status = realPercentage >= 70 ? "approved" : "rejected";
          }

          // Check if user can claim NFT
          const canClaimNFT = status === "approved" && 
                             sub.discoverer?.toLowerCase() === address?.toLowerCase() &&
                             !sub.nftMinted;

          return {
            id: Number(sub.id),
            imageUrl,
            submittedBy: sub.discoverer?.slice(0, 6) + "..." + sub.discoverer?.slice(-4) || "Unknown",
            submittedAt: new Date(Number(sub.timestamp) * 1000).toISOString(),
            votes: {
              real: Number(sub.votesFor),
              fake: Number(sub.votesAgainst),
              total: Number(sub.votesFor) + Number(sub.votesAgainst),
            },
            requiredVotes: Number(sub.requiredVotes),
            status,
            userVote: sub.hasVoted ? (sub.votedFor ? "real" : "fake") : null,
            metadataCid: sub.metadataCid,
            canClaimNFT,
          };
        })
      );

      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error("Failed to load submissions:", error);
      // Fallback to mock data
      setSubmissions(MOCK_SUBMISSIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (submissionId: number, voteChoice: "real" | "fake") => {
    if (!isConnected || !address) {
      alert("Please connect your wallet to vote!");
      return;
    }

    if (!areContractsConfigured()) {
      // Mock voting for demo
      setSubmissions((prev) =>
        prev.map((submission) => {
          if (submission.id === submissionId) {
            const newVotes = {
              real: submission.votes.real + (voteChoice === "real" ? 1 : 0),
              fake: submission.votes.fake + (voteChoice === "fake" ? 1 : 0),
              total: submission.votes.total + 1,
            };
            let newStatus = submission.status;
            if (newVotes.total >= submission.requiredVotes) {
              const realPercentage = (newVotes.real / newVotes.total) * 100;
              newStatus = realPercentage >= 70 ? "approved" : "rejected";
            }
            return { ...submission, votes: newVotes, status: newStatus, userVote: voteChoice };
          }
          return submission;
        })
      );
      return;
    }

    setIsVoting(submissionId);
    try {
      console.log(`📝 Voting ${voteChoice} on submission ${submissionId}...`);
      const txHash = await vote(submissionId, voteChoice === "real");
      console.log("✅ Vote submitted:", txHash);
      
      // Reload submissions to reflect new vote
      await loadSubmissions();
      
      alert(`Vote recorded!\n\nYou earned 5 BUG tokens!\nTx: ${txHash}`);
    } catch (error: any) {
      console.error("Vote failed:", error);
      alert(`Failed to vote: ${error.message || "Unknown error"}`);
    } finally {
      setIsVoting(null);
    }
  };

  const handleClaimNFT = async (submissionId: number) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet!");
      return;
    }

    setIsClaiming(submissionId);
    try {
      console.log(`🎨 Claiming NFT for submission ${submissionId}...`);
      const txHash = await claimNFT(submissionId);
      console.log("✅ NFT claimed:", txHash);
      
      // Reload submissions
      await loadSubmissions();
      
      alert(`NFT minted successfully!\n\nCheck your collection!\nTx: ${txHash}`);
    } catch (error: any) {
      console.error("Claim failed:", error);
      alert(`Failed to claim NFT: ${error.message || "Unknown error"}`);
    } finally {
      setIsClaiming(null);
    }
  };

  const handleVote_old = (submissionId: number, vote: "real" | "fake") => {
    setSubmissions((prev) =>
      prev.map((submission) => {
        if (submission.id === submissionId) {
          // Calculate new vote counts
          const newVotes = {
            real: submission.votes.real + (vote === "real" ? 1 : 0),
            fake: submission.votes.fake + (vote === "fake" ? 1 : 0),
            total: submission.votes.total + 1,
          };

          // Determine status
          let newStatus = submission.status;
          if (newVotes.total >= submission.requiredVotes) {
            const realPercentage = (newVotes.real / newVotes.total) * 100;
            newStatus = realPercentage >= 70 ? "approved" : "rejected";
          }

          return {
            ...submission,
            votes: newVotes,
            status: newStatus,
            userVote: vote,
          };
        }
        return submission;
      })
    );
  };

  const filteredSubmissions = submissions.filter((submission) => {
    if (filter === "pending") return submission.status === "pending";
    if (filter === "voted") return submission.userVote !== null;
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const votedCount = submissions.filter((s) => s.userVote !== null).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" aria-label="Back to home">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Community Voting</h1>
                <p className="text-sm text-muted-foreground">Help verify bug submissions</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              variant={filter === "voted" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("voted")}
            >
              My Votes ({votedCount})
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({submissions.length})
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">How Voting Works</h3>
              <p className="text-sm text-muted-foreground">
                Vote on bug submissions to help the community verify authenticity. If a submission gets 70%+ "Real" votes,
                it's approved for free minting! You earn <strong className="text-foreground">5 BUG tokens</strong> for each vote.
              </p>
            </div>
          </div>
        </div>

        {/* Submissions Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {filter === "pending" ? "No pending submissions" : "No submissions found"}
            </p>
            {filter !== "all" && (
              <Button variant="outline" onClick={() => setFilter("all")}>
                View All Submissions
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredSubmissions.map((submission) => (
              <VotingCard
                key={submission.id}
                submission={submission}
                onVote={handleVote}
                onClaimNFT={handleClaimNFT}
                isVoting={isVoting === submission.id}
                isClaiming={isClaiming === submission.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VotingCard({
  submission,
  onVote,
  onClaimNFT,
  isVoting,
  isClaiming,
}: {
  submission: BugSubmission;
  onVote: (id: number, vote: "real" | "fake") => void;
  onClaimNFT?: (id: number) => void;
  isVoting?: boolean;
  isClaiming?: boolean;
}) {
  const realPercentage = submission.votes.total > 0
    ? (submission.votes.real / submission.votes.total) * 100
    : 0;

  const fakePercentage = submission.votes.total > 0
    ? (submission.votes.fake / submission.votes.total) * 100
    : 0;

  const progressPercentage = (submission.votes.total / submission.requiredVotes) * 100;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square bg-muted relative">
        <img
          src={submission.imageUrl}
          alt="Bug submission"
          className="w-full h-full object-cover"
        />
        
        {/* Status Badge */}
        {submission.status !== "pending" && (
          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5 ${
            submission.status === "approved"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}>
            <CheckCircle2 className="h-4 w-4" />
            {submission.status === "approved" ? "Approved" : "Rejected"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Submitter Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(submission.submittedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}</span>
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            {submission.submittedBy}
          </span>
        </div>

        {/* Vote Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {submission.votes.total} / {submission.requiredVotes} votes
            </span>
            <span className="font-semibold">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Vote Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="font-semibold">{submission.votes.real}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${realPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real ({Math.round(realPercentage)}%)
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span className="font-semibold">{submission.votes.fake}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${fakePercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fake ({Math.round(fakePercentage)}%)
            </p>
          </div>
        </div>

        {/* Voting Buttons */}
        {submission.status === "pending" && !submission.userVote ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onVote(submission.id, "real")}
              disabled={isVoting}
              className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Real
            </Button>
            <Button
              onClick={() => onVote(submission.id, "fake")}
              disabled={isVoting}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsDown className="h-4 w-4 mr-2" />
              )}
              Fake
            </Button>
          </div>
        ) : submission.canClaimNFT && onClaimNFT ? (
          <Button
            onClick={() => onClaimNFT(submission.id)}
            disabled={isClaiming}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isClaiming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Minting NFT...
              </>
            ) : (
              <>
                🎨 Claim NFT
              </>
            )}
          </Button>
        ) : submission.userVote ? (
          <div className={`text-center py-2 rounded-lg font-semibold ${
            submission.userVote === "real"
              ? "bg-green-500/20 text-green-700 dark:text-green-400"
              : "bg-red-500/20 text-red-700 dark:text-red-400"
          }`}>
            You voted: {submission.userVote === "real" ? "✓ Real" : "✗ Fake"}
            <span className="block text-xs font-normal mt-1">
              +5 BUG earned
            </span>
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground text-sm">
            Voting closed
          </div>
        )}
      </div>
    </div>
  );
}
