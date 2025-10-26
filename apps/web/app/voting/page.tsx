"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Clock, Trophy, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/lib/useWallet";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

interface BugSubmission {
  id: string; // Changed from bigint to string for off-chain voting
  submitter: string;
  ipfsHash: string;
  createdAt: number; // Changed from bigint to number (timestamp in ms)
  votesFor: number; // Changed from bigint to number for off-chain voting
  votesAgainst: number; // Changed from bigint to number for off-chain voting
  resolved: boolean;
  approved: boolean;
  nftClaimed: boolean;
  nftTokenId: bigint;
  rarity: number;
  imageUrl: string;
  metadata: {
    bugInfo?: {
      commonName?: string;
      scientificName?: string;
    };
    location?: {
      state?: string;
      country?: string;
    };
  } | null;
  hasVoted: boolean;
}

const BUG_VOTING_V2_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "submissions",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "submitter", type: "address" },
      { internalType: "string", name: "ipfsHash", type: "string" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "uint256", name: "votesFor", type: "uint256" },
      { internalType: "uint256", name: "votesAgainst", type: "uint256" },
      { internalType: "bool", name: "resolved", type: "bool" },
      { internalType: "bool", name: "approved", type: "bool" },
      { internalType: "bool", name: "nftClaimed", type: "bool" },
      { internalType: "uint256", name: "nftTokenId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "submissionCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "submissionId", type: "uint256" },
      { internalType: "bool", name: "voteFor", type: "bool" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "submissionId", type: "uint256" }],
    name: "claimNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const VOTING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BUG_VOTING_V2_ADDRESS as `0x$${string}`;

export default function VotingPage() {
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "voted">("all");
  const [submissions, setSubmissions] = useState<BugSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isConnected, address } = useWallet();
  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract();
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: submissionCount, refetch: refetchCount } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: BUG_VOTING_V2_ABI,
    functionName: "submissionCount",
  });

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Load from database API instead of blockchain
      const res = await fetch(`/api/voting-submissions?status=pending_voting`);
      const data = await res.json();
      
      if (!data.success) {
        console.error('Failed to load submissions:', data.error);
        setSubmissions([]);
        setIsLoading(false);
        return;
      }

      const loaded: BugSubmission[] = [];
      
      for (const sub of data.data?.submissions || []) {
        // Check if user has voted
        let hasVoted = false;
        if (address) {
          try {
            const voteRes = await fetch(`/api/vote-offchain?uploadId=${sub.id}&voterAddress=${address}`);
            const voteData = await voteRes.json();
            // API returns { success: true, data: { hasVoted: true } }
            hasVoted = voteData.data?.hasVoted || false;
          } catch (e) {
            console.error('Error checking vote status:', e);
          }
        }

        loaded.push({
          id: sub.id, // Keep as string (no BigInt conversion)
          submitter: sub.discoverer,
          ipfsHash: sub.metadataCid,
          createdAt: sub.timestamp, // Already a number (timestamp in ms)
          votesFor: sub.votesFor || 0, // Already a number
          votesAgainst: sub.votesAgainst || 0, // Already a number
          resolved: sub.votingResolved || false,
          approved: sub.votingApproved || false,
          nftClaimed: false, // Off-chain voting doesn't claim yet
          nftTokenId: BigInt(0),
          rarity: 0,
          imageUrl: sub.imageUrl,
          metadata: {
            bugInfo: sub.bugInfo,
            location: sub.location,
          },
          hasVoted,
        });
      }

      setSubmissions(loaded);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissions([]);
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    // Load submissions from database on mount and when address changes
    loadSubmissions();
  }, [address, loadSubmissions]);

  useEffect(() => {
    if (isTxSuccess) {
      setTimeout(() => {
        refetchCount();
        loadSubmissions();
      }, 2000);
    }
  }, [isTxSuccess, refetchCount, loadSubmissions]);

  const handleVote = async (submissionId: string, voteFor: boolean) => {
    if (!isConnected || !address) { 
      alert("Connect wallet to vote!"); 
      return; 
    }

    try {
      const res = await fetch('/api/vote-offchain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: submissionId, // Already a string, no need to convert
          voterAddress: address,
          voteFor: voteFor,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(`Failed to vote: ${data.error}`);
        return;
      }

      alert(`Vote recorded! 🎉\n\nYour vote: ${voteFor ? '👍 FOR' : '👎 AGAINST'}\n\nVotes are FREE and stored in the database!`);
      
      // Reload submissions to show updated vote counts
      await loadSubmissions();
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const handleClaimNFT = (submissionId: string) => {
    if (!isConnected) { alert("Connect wallet!"); return; }
    writeContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: BUG_VOTING_V2_ABI,
      functionName: "claimNFT",
      args: [BigInt(submissionId)],
    });
  };

  const filtered = submissions.filter((s) => {
    if (activeTab === "mine") return s.submitter.toLowerCase() === address?.toLowerCase();
    if (activeTab === "voted") return s.hasVoted;
    return true;
  });

  const myCount = submissions.filter((s) => s.submitter.toLowerCase() === address?.toLowerCase()).length;
  const votedCount = submissions.filter((s) => s.hasVoted).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Testnet Disclaimer Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/30">
        <div className="max-w-screen-xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              🧪 Testnet Demo • Sepolia Network • Vote freely, no gas costs
            </p>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold">Community Voting (FREE)</h1>
              <p className="text-sm text-muted-foreground">Vote on bug submissions • No gas fees • Help the community</p>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "mine" | "voted")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
              <TabsTrigger value="mine">Mine ({myCount})</TabsTrigger>
              <TabsTrigger value="voted">Voted ({votedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">How Voting Works (NEW!)</h3>
              <p className="text-sm text-muted-foreground">
                Voting is <strong>100% FREE</strong> (no gas, no tokens!) • Votes stored in database • After 3 days, approved bugs can mint NFTs on blockchain
              </p>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading submissions from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">
              {activeTab === "mine" ? "No submissions yet" : activeTab === "voted" ? "No votes yet" : "No submissions"}
            </p>
            {activeTab !== "all" && <Button variant="outline" onClick={() => setActiveTab("all")}>View All</Button>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sub) => <SubmissionCard key={sub.id} submission={sub} onVote={handleVote} onClaimNFT={handleClaimNFT} isProcessing={isWriting || isTxPending} currentAddress={address} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function SubmissionCard({ submission: s, onVote, onClaimNFT, isProcessing, currentAddress }: {
  submission: BugSubmission; onVote: (id: string, voteFor: boolean) => void; onClaimNFT: (id: string) => void; isProcessing: boolean; currentAddress?: string;
}) {
  const isMine = s.submitter.toLowerCase() === currentAddress?.toLowerCase();
  const canClaim = isMine && s.resolved && s.approved && !s.nftClaimed;
  const total = s.votesFor + s.votesAgainst;
  const pct = total > 0 ? Math.round((s.votesFor * 100) / total) : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-muted relative">
        {s.imageUrl && <img src={s.imageUrl} alt="Bug" className="w-full h-full object-cover" />}
        {s.resolved && <Badge className={`absolute top-3 right-3 $${s.approved ? "bg-green-500" : "bg-red-500"}`}>
          {s.approved ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</> : <><XCircle className="h-3 w-3 mr-1" /> Rejected</>}
        </Badge>}
        {isMine && <Badge className="absolute top-3 left-3 bg-blue-500">Your Submission</Badge>}
      </div>
      <div className="p-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-3">
          <div className="flex gap-1"><Clock className="h-3.5 w-3.5" />{new Date(s.createdAt).toLocaleDateString()}</div>
          <span className="font-mono text-xs">{s.submitter.slice(0, 6)}...{s.submitter.slice(-4)}</span>
        </div>
        {s.metadata && <div className="mb-3"><h3 className="font-semibold">{s.metadata.bugInfo?.commonName || "Unknown"}</h3>
          {s.metadata.bugInfo?.scientificName && <p className="text-xs italic text-muted-foreground">{s.metadata.bugInfo.scientificName}</p>}</div>}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center p-2 bg-green-500/10 rounded">
            <div className="flex justify-center gap-1 mb-1"><ThumbsUp className="h-4 w-4 text-green-500" /><span className="font-bold text-green-500">{s.votesFor}</span></div>
            <p className="text-xs text-muted-foreground">Approve</p>
          </div>
          <div className="text-center p-2 bg-red-500/10 rounded">
            <div className="flex justify-center gap-1 mb-1"><ThumbsDown className="h-4 w-4 text-red-500" /><span className="font-bold text-red-500">{s.votesAgainst}</span></div>
            <p className="text-xs text-muted-foreground">Reject</p>
          </div>
        </div>
        {total > 0 && <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{total} vote{total > 1 ? "s" : ""} • More upvotes = rarer NFT!</span>
            <span className="font-medium">{Math.round(pct)}% approve</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>}
        {!s.resolved && !s.hasVoted && !isMine ? (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => onVote(s.id, true)} disabled={isProcessing} size="sm" className="bg-green-500 hover:bg-green-600">
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ThumbsUp className="h-4 w-4 mr-1" /> Yes</>}
            </Button>
            <Button onClick={() => onVote(s.id, false)} disabled={isProcessing} size="sm" variant="destructive">
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ThumbsDown className="h-4 w-4 mr-1" /> No</>}
            </Button>
          </div>
        ) : s.hasVoted ? (
          <div className="text-center py-2 text-sm text-muted-foreground"> You voted</div>
        ) : canClaim ? (
          <Button onClick={() => onClaimNFT(s.id)} disabled={isProcessing} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trophy className="h-4 w-4 mr-2" />}Claim NFT
          </Button>
        ) : s.nftClaimed ? (
          <div className="text-center py-2 text-sm"><Trophy className="h-4 w-4 inline mr-1 text-yellow-500" />NFT #{s.nftTokenId}</div>
        ) : isMine ? (
          <div className="text-center py-2 text-sm text-muted-foreground">Awaiting votes...</div>
        ) : null}
      </div>
    </Card>
  );
}
