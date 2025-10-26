import { BottomNav } from "@/components/BottomNav";
import { FaucetButton } from "@/components/FaucetButton";
import { Button } from "@/components/ui/button";
import { Vote, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Testnet Disclaimer Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/30">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              🧪 Testnet Demo • Running on Sepolia • No real funds required
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pb-24 px-4 pt-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to BugDex
            </h1>
            <p className="text-lg text-muted-foreground">
              Your Web3 Bug Collection App
            </p>
          </div>

          {/* Faucet Section */}
          <div className="mb-8 max-w-md mx-auto">
            <FaucetButton />
          </div>

          <div className="text-center mb-8">
            <div className="p-8 border border-border rounded-lg bg-card">
              <p className="text-muted-foreground">
                Tap the <span className="font-semibold">Scan</span> button below to start
                discovering bugs!
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Link href="/voting">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/50 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer">
                <Vote className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-1">Vote on Bugs</h3>
                <p className="text-sm text-muted-foreground">
                  Help verify submissions and earn 5 BUG per vote
                </p>
              </div>
            </Link>

            <Link href="/collection">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer">
                <BookOpen className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-1">My Collection</h3>
                <p className="text-sm text-muted-foreground">
                  View your collected bug NFTs
                </p>
              </div>
            </Link>

            <Link href="/leaderboard">
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/50 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer">
                <Trophy className="h-8 w-8 text-amber-500 mb-3" />
                <h3 className="font-semibold mb-1">Leaderboard</h3>
                <p className="text-sm text-muted-foreground">
                  See top bug collectors
                </p>
              </div>
            </Link>
          </div>
          
          {/* How It Works */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-center">How BugDex Works</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">📸</div>
                <h3 className="font-semibold mb-1">1. Discover</h3>
                <p className="text-muted-foreground">Photograph bugs using your camera</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🗳️</div>
                <h3 className="font-semibold mb-1">2. Vote</h3>
                <p className="text-muted-foreground">Community verifies submissions (earn 5 BUG)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold mb-1">3. Collect NFTs</h3>
                <p className="text-muted-foreground">Approved bugs become unique NFTs</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
