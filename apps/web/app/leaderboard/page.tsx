"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, User, Loader2, Medal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  avatarUrl?: string;
  nftCount: number;
  bugBalance: string;
  score: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch from API
      const response = await fetch('/api/leaderboard');
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.data);
      } else {
        throw new Error('Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      
      // Fallback to mock data
      const mockData: LeaderboardEntry[] = [
        {
          rank: 1,
          address: "0x1234567890123456789012345678901234567890",
          username: "BugHunter",
          avatarUrl: undefined,
          nftCount: 42,
          bugBalance: "15000",
          score: 15042,
        },
        {
          rank: 2,
          address: "0x2234567890123456789012345678901234567890",
          username: "InsectCollector",
          avatarUrl: undefined,
          nftCount: 38,
          bugBalance: "12000",
          score: 12038,
        },
        {
          rank: 3,
          address: "0x3234567890123456789012345678901234567890",
          username: "NatureExplorer",
          avatarUrl: undefined,
          nftCount: 35,
          bugBalance: "10500",
          score: 10535,
        },
        {
          rank: 4,
          address: "0x4234567890123456789012345678901234567890",
          username: "BugMaster",
          avatarUrl: undefined,
          nftCount: 28,
          bugBalance: "8000",
          score: 8028,
        },
        {
          rank: 5,
          address: "0x5234567890123456789012345678901234567890",
          username: "SpeciesSeeker",
          avatarUrl: undefined,
          nftCount: 22,
          bugBalance: "6500",
          score: 6522,
        },
      ];
      setLeaderboard(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="h-6 w-6 text-amber-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/50";
      case 2:
        return "bg-gradient-to-br from-slate-400/20 to-gray-400/20 border-slate-400/50";
      case 3:
        return "bg-gradient-to-br from-orange-600/20 to-orange-400/20 border-orange-600/50";
      default:
        return "bg-card border-border";
    }
  };
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-amber-500" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">Top Bug Collectors</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {leaderboard.map((entry) => (
              <Card
                key={entry.address}
                className={`p-4 ${getRankBadgeColor(entry.rank)} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.username}
                        className="h-12 w-12 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{entry.username}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">NFTs</p>
                        <p className="text-xl font-bold">{entry.nftCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">BUG</p>
                        <p className="text-xl font-bold text-green-500">
                          {parseFloat(entry.bugBalance).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
