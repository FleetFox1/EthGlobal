"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Clock, Trophy, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/lib/useWallet";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

interface BugSubmission {
  id: number;
  submitter: string;
  ipfsHash: string;
  createdAt: number;
  votesFor: number;
  votesAgainst: number;
  resolved: boolean;
  approved: boolean;
  nftClaimed: boolean;
  nftTokenId: number;
  imageUrl?: string;
  metadata?: any;
  hasVoted?: boolean;
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

  useEffect(() => {
    if (submissionCount) {
      loadSubmissions();
    } else {
      setIsLoading(false);
    }
  }, [submissionCount, address]);

  useEffect(() => {
    if (isTxSuccess) {
      setTimeout(() => {
        refetchCount();
        loadSubmissions();
      }, 2000);
    }
  }, [isTxSuccess]);

  const loadSubmissions = async () => {
    if (!submissionCount) return;
    setIsLoading(true);
    const count = Number(submissionCount);
    const loaded: BugSubmission[] = [];

    for (let i = 1; i <= count; i++) {
      try {
        const res = await fetch(`/api/contract-read?address=$${VOTING_CONTRACT_ADDRESS}&method=submissions&args=$${i}`);
        const data = await res.json();
        if (data.result) {
          const sub = data.result;
          let imageUrl = "/placeholder-bug.jpg";
          let metadata = null;
          if (sub.ipfsHash) {
            try {
              const metaRes = await fetch(`https://gateway.lighthouse.storage/ipfs/$${sub.ipfsHash}`);
              metadata = await metaRes.json();
              if (metadata.image) {
                imageUrl = metadata.image.replace("ipfs://", "https://gateway.lighthouse.storage/ipfs/");
              }
            } catch (e) { console.error("IPFS error:", e); }
          }
          let hasVoted = false;
          if (address) {
            const voteRes = await fetch(`/api/contract-read?address=$${VOTING_CONTRACT_ADDRESS}&method=hasVoted&args=$${i},$${address}`);
            const voteData = await voteRes.json();
            hasVoted = voteData.result || false;
          }
          loaded.push({
            id: Number(sub.id),
            submitter: sub.submitter,
            ipfsHash: sub.ipfsHash,
            createdAt: Number(sub.createdAt),
            votesFor: Number(sub.votesFor),
            votesAgainst: Number(sub.votesAgainst),
            resolved: sub.resolved,
            approved: sub.approved,
            nftClaimed: sub.nftClaimed,
            nftTokenId: Number(sub.nftTokenId),
            imageUrl,
            metadata,
            hasVoted,
          });
        }
      } catch (e) { console.error(`Error loading submission $${i}:`, e); }
    }
    setSubmissions(loaded.reverse());
    setIsLoading(false);
  };

  const handleVote = (submissionId: number, voteFor: boolean) => {
    if (!isConnected) { alert("Connect wallet!"); return; }
    writeContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: BUG_VOTING_V2_ABI,
      functionName: "vote",
      args: [BigInt(submissionId), voteFor],
    });
  };

  const handleClaimNFT = (submissionId: number) => {
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
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold">Community Voting</h1>
              <p className="text-sm text-muted-foreground">Verify bugs  Earn rewards</p>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
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
              <h3 className="font-semibold mb-1">How Voting Works</h3>
              <p className="text-sm text-muted-foreground">
                Vote costs <strong>10 BUG</strong> stake  Get <strong>15 BUG back</strong> (10 + 5 reward) if approved  Need 5 votes to resolve
              </p>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading from blockchain...</p>
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
  submission: BugSubmission; onVote: (id: number, voteFor: boolean) => void; onClaimNFT: (id: number) => void; isProcessing: boolean; currentAddress?: string;
}) {
  const isMine = s.submitter.toLowerCase() === currentAddress?.toLowerCase();
  const canClaim = isMine && s.resolved && s.approved && !s.nftClaimed;
  const total = s.votesFor + s.votesAgainst;
  const pct = total > 0 ? (s.votesFor / total) * 100 : 0;

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
          <div className="flex gap-1"><Clock className="h-3.5 w-3.5" />{new Date(s.createdAt * 1000).toLocaleDateString()}</div>
          <span className="font-mono text-xs">{s.submitter.slice(0, 6)}...{s.submitter.slice(-4)}</span>
        </div>
        {s.metadata && <div className="mb-3"><h3 className="font-semibold">{s.metadata.name || "Unknown"}</h3>
          {s.metadata.scientificName && <p className="text-xs italic text-muted-foreground">{s.metadata.scientificName}</p>}</div>}
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
            <span className="text-muted-foreground">{total} vote{total > 1 ? "s" : ""}  Need 5</span>
            <span className="font-medium">{Math.round(pct)}% approve</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `$${pct}%` }} />
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
