"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Award, Target } from "lucide-react";
import Link from "next/link";

// Mock leaderboard data
const LEADERBOARD_DATA = [
  {
    rank: 1,
    address: "0x742d...9a3f",
    username: "BugMaster",
    bugsCollected: 156,
    rareCount: 12,
    votingAccuracy: 94.5,
    totalValue: 15600,
  },
  {
    rank: 2,
    address: "0x8f3e...2b1c",
    username: "InsectKing",
    bugsCollected: 143,
    rareCount: 10,
    votingAccuracy: 91.2,
    totalValue: 14300,
  },
  {
    rank: 3,
    address: "0x5a9d...7e4f",
    username: "CryptoCollector",
    bugsCollected: 128,
    rareCount: 9,
    votingAccuracy: 89.8,
    totalValue: 12800,
  },
  {
    rank: 4,
    address: "0x3c7b...6d2a",
    username: "BugHunter42",
    bugsCollected: 115,
    rareCount: 8,
    votingAccuracy: 88.1,
    totalValue: 11500,
  },
  {
    rank: 5,
    address: "0x9e2f...4c8b",
    username: "NatureLover",
    bugsCollected: 102,
    rareCount: 7,
    votingAccuracy: 87.3,
    totalValue: 10200,
  },
  {
    rank: 6,
    address: "0x1d8a...5f3e",
    username: "BeetleFan",
    bugsCollected: 94,
    rareCount: 6,
    votingAccuracy: 85.9,
    totalValue: 9400,
  },
  {
    rank: 7,
    address: "0x6b4c...8a1d",
    username: "ButterflyWhisperer",
    bugsCollected: 87,
    rareCount: 5,
    votingAccuracy: 84.2,
    totalValue: 8700,
  },
  {
    rank: 8,
    address: "0x4f9e...2d7c",
    username: "DexMaster",
    bugsCollected: 79,
    rareCount: 5,
    votingAccuracy: 82.6,
    totalValue: 7900,
  },
];

const MEDAL_COLORS = {
  1: "text-amber-500",
  2: "text-gray-400",
  3: "text-orange-600",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="Back to home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">Top BugDex Collectors</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-xs text-muted-foreground">Top Collection</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">94.5%</p>
            <p className="text-xs text-muted-foreground">Best Accuracy</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">15.6K</p>
            <p className="text-xs text-muted-foreground">Top Value (BUG)</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-2">
          {LEADERBOARD_DATA.map((user) => (
            <div
              key={user.rank}
              className={`bg-card border rounded-lg p-4 hover:shadow-md transition-shadow ${
                user.rank <= 3 ? "border-amber-500/50" : "border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {user.rank <= 3 ? (
                    <Trophy className={`h-8 w-8 mx-auto ${MEDAL_COLORS[user.rank as keyof typeof MEDAL_COLORS]}`} />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{user.username}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.address}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{user.bugsCollected}</p>
                    <p className="text-xs text-muted-foreground">Bugs</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-purple-500">{user.rareCount}</p>
                    <p className="text-xs text-muted-foreground">Rare+</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-500">{user.votingAccuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{user.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">BUG</p>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="sm:hidden text-right">
                  <p className="font-semibold">{user.bugsCollected}</p>
                  <p className="text-xs text-muted-foreground">bugs</p>
                </div>
              </div>

              {/* Mobile Expanded Stats */}
              <div className="sm:hidden mt-3 pt-3 border-t border-border flex justify-around text-xs">
                <div className="text-center">
                  <p className="font-semibold text-purple-500">{user.rareCount}</p>
                  <p className="text-muted-foreground">Rare+</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-500">{user.votingAccuracy}%</p>
                  <p className="text-muted-foreground">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.totalValue.toLocaleString()}</p>
                  <p className="text-muted-foreground">BUG</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Rank */}
        <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
              <p className="text-2xl font-bold">#42</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Your Collection</p>
              <p className="text-2xl font-bold">6 bugs</p>
            </div>
          </div>
          <Link href="/collection">
            <Button className="w-full mt-3">View My Collection</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
