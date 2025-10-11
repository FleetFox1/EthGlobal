"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, Trophy, Target, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

// Mock user data
const USER_DATA = {
  address: "0x742d35CC6634C0532925a3b844Bc9e7595f9a3f",
  username: "BugExplorer",
  joinDate: "2025-09-15",
  bugsCollected: 6,
  bugTokenBalance: 600,
  pyusdValue: 6, // 100 BUG = 1 PYUSD
  votesSubmitted: 23,
  votingAccuracy: 87.5,
  rank: 69,
  achievements: [
    { id: 1, name: "First Bug", icon: "🐛", unlocked: true },
    { id: 2, name: "Bug Collector", icon: "📚", unlocked: true },
    { id: 3, name: "Voting Expert", icon: "🗳️", unlocked: false },
    { id: 4, name: "Legendary Hunter", icon: "⭐", unlocked: false },
  ],
  recentActivity: [
    { id: 1, type: "scan", text: "Scanned Ladybug", date: "2025-10-10" },
    { id: 2, type: "vote", text: "Voted on Blue Morpho", date: "2025-10-09" },
    { id: 3, type: "mint", text: "Minted Monarch Butterfly", date: "2025-10-09" },
    { id: 4, type: "scan", text: "Scanned Praying Mantis", date: "2025-10-07" },
  ],
};

export default function ProfilePage() {
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
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-sm text-muted-foreground">Your BugDex Stats</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* User Card */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white">
              {USER_DATA.username.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{USER_DATA.username}</h2>
              <p className="text-sm text-muted-foreground font-mono truncate">
                {USER_DATA.address}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {new Date(USER_DATA.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-green-500" />
                <p className="text-xs text-muted-foreground">BUG Balance</p>
              </div>
              <p className="text-2xl font-bold">{USER_DATA.bugTokenBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">≈ {USER_DATA.pyusdValue} PYUSD</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
              <p className="text-2xl font-bold">#{USER_DATA.rank}</p>
              <Link href="/leaderboard" className="text-xs text-green-500 hover:underline">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{USER_DATA.bugsCollected}</p>
            <p className="text-xs text-muted-foreground">Bugs Collected</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{USER_DATA.votesSubmitted}</p>
            <p className="text-xs text-muted-foreground">Votes Cast</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{USER_DATA.votingAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">
              {Math.floor((Date.now() - new Date(USER_DATA.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-xs text-muted-foreground">Days Active</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {USER_DATA.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-card border rounded-lg p-4 text-center transition-all ${
                  achievement.unlocked
                    ? "border-green-500/50 hover:shadow-md"
                    : "border-border opacity-50"
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="text-sm font-semibold">{achievement.name}</p>
                {achievement.unlocked ? (
                  <p className="text-xs text-green-500 mt-1">✓ Unlocked</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">🔒 Locked</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {USER_DATA.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${
                    activity.type === "scan" ? "bg-green-500/20" :
                    activity.type === "vote" ? "bg-blue-500/20" :
                    "bg-purple-500/20"
                  }`}>
                    {activity.type === "scan" ? "🔍" :
                     activity.type === "vote" ? "🗳️" : "✨"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link href="/collection">
            <Button variant="outline" className="w-full">
              View Collection
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full">
              Scan New Bug
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
