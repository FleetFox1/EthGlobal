"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Top Bug Collectors</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/50 rounded-lg p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Trophy className="h-24 w-24 text-amber-500" />
                <Sparkles className="h-8 w-8 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              The leaderboard will track top bug collectors, voters, and NFT holders.
            </p>
            
            <div className="bg-card border border-border rounded-lg p-6 space-y-3 text-left">
              <h3 className="font-semibold text-center mb-4">What to expect:</h3>
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Collector Rankings</p>
                  <p className="text-sm text-muted-foreground">See who has the most bug NFTs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Voting Accuracy</p>
                  <p className="text-sm text-muted-foreground">Track your verification success rate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Rare Collection Bonus</p>
                  <p className="text-sm text-muted-foreground">Extra points for discovering rare species</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
