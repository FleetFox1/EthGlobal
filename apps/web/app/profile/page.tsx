"use client";

import { useUser } from "@/lib/useUser";
import { useWallet } from "@/lib/useWallet";
import { useBugToken, useBugNFT, areContractsConfigured } from "@/lib/contract-hooks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, Trophy, Target, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface OnChainStats {
  bugTokenBalance: string;
  nftCount: number;
  pyusdValue: string;
}

export default function ProfilePage() {
  const { profile, loading: userLoading, isAuthenticated } = useUser();
  const { isConnected, address } = useWallet();
  const { getBalance: getBugBalance } = useBugToken();
  const { getBalance: getNFTBalance } = useBugNFT();
  
  const [onChainStats, setOnChainStats] = useState<OnChainStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load blockchain stats
  useEffect(() => {
    loadOnChainStats();
  }, [isConnected, address]);

  const loadOnChainStats = async () => {
    setIsLoadingStats(true);
    
    try {
      if (!areContractsConfigured() || !isConnected || !address) {
        // Mock data when contracts not configured
        setOnChainStats({
          bugTokenBalance: "600",
          nftCount: 6,
          pyusdValue: "6.00",
        });
        setIsLoadingStats(false);
        return;
      }

      // Fetch real on-chain data
      const [bugBalance, nftCount] = await Promise.all([
        getBugBalance(address).catch(() => "0"),
        getNFTBalance(address).catch(() => 0),
      ]);

      // Calculate PYUSD value (100 BUG = 1 PYUSD)
      const pyusdValue = (parseFloat(bugBalance) / 100).toFixed(2);

      setOnChainStats({
        bugTokenBalance: parseFloat(bugBalance).toFixed(0),
        nftCount,
        pyusdValue,
      });
    } catch (error) {
      console.error("Failed to load on-chain stats:", error);
      // Fallback to mock data
      setOnChainStats({
        bugTokenBalance: "600",
        nftCount: 6,
        pyusdValue: "6.00",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (userLoading || isLoadingStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view your profile
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

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
              {profile?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{profile?.username || "BugExplorer"}</h2>
              <p className="text-sm text-muted-foreground font-mono truncate">
                {displayAddress}
              </p>
              {profile?.createdAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Wallet Balance */}
          {onChainStats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">BUG Balance</p>
                </div>
                <p className="text-2xl font-bold">
                  {parseInt(onChainStats.bugTokenBalance).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">≈ ${onChainStats.pyusdValue} PYUSD</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Rank</p>
                </div>
                <p className="text-2xl font-bold">#69</p>
                <Link href="/leaderboard" className="text-xs text-green-500 hover:underline">
                  View Leaderboard
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {onChainStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{onChainStats.nftCount}</p>
              <p className="text-xs text-muted-foreground">Bugs Collected</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{parseInt(onChainStats.bugTokenBalance)}</p>
              <p className="text-xs text-muted-foreground">BUG Tokens</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">${onChainStats.pyusdValue}</p>
              <p className="text-xs text-muted-foreground">PYUSD Value</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/collection">
            <Button variant="outline" className="w-full">
              View Collection
            </Button>
          </Link>
          <Link href="/voting">
            <Button variant="outline" className="w-full">
              Vote on Bugs
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
