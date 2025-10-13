"use client";

import { useAdmin } from "@/lib/useAdmin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  Coins, 
  Image as ImageIcon, 
  Vote, 
  Users,
  Settings,
  TrendingUp,
  Database,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function AdminPage() {
  const { isAdmin, isOwner, loading, walletAddress, isAuthenticated } = useAdmin();
  const [stats, setStats] = useState({
    totalSupply: "0",
    maxSupply: "0",
    totalNFTs: "0",
    activeSubmissions: "0",
    totalVotes: "0",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!isAdmin || !window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS!;
        const bugNFTAddress = process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS!;

        const tokenABI = [
          "function totalSupply() view returns (uint256)",
          "function MAX_SUPPLY() view returns (uint256)",
        ];
        const nftABI = [
          "function totalSupply() view returns (uint256)",
        ];

        const bugToken = new ethers.Contract(bugTokenAddress, tokenABI, provider);
        const bugNFT = new ethers.Contract(bugNFTAddress, nftABI, provider);

        const [totalSupply, maxSupply, totalNFTs] = await Promise.all([
          bugToken.totalSupply(),
          bugToken.MAX_SUPPLY(),
          bugNFT.totalSupply(),
        ]);

        setStats({
          totalSupply: ethers.formatEther(totalSupply),
          maxSupply: ethers.formatEther(maxSupply),
          totalNFTs: totalNFTs.toString(),
          activeSubmissions: "0", // TODO: Add when we have submission tracking
          totalVotes: "0", // TODO: Add when we have vote tracking
        });
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  // Wait for authentication before showing "connect wallet" message
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access the admin dashboard.
          </p>
        </Card>
      </div>
    );
  }

  // Only show access denied if authenticated but not admin
  if (isAuthenticated && !isAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You do not have admin permissions.
          </p>
          <p className="text-sm text-muted-foreground">
            Connected wallet: <span className="font-mono">{walletAddress}</span>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage BugDex contracts and monitor system activity
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin wallet:</span>
            <span className="font-mono bg-muted px-2 py-1 rounded">{walletAddress}</span>
          </div>
        </div>

        {/* Contract Ownership Status */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Contract Ownership</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Coins className={`h-5 w-5 ${isOwner.bugToken ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="font-medium">BugToken</p>
                <p className="text-sm text-muted-foreground">
                  {isOwner.bugToken ? 'Owner ✓' : 'Not Owner'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ImageIcon className={`h-5 w-5 ${isOwner.bugNFT ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="font-medium">BugNFT</p>
                <p className="text-sm text-muted-foreground">
                  {isOwner.bugNFT ? 'Owner ✓' : 'Not Owner'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Vote className={`h-5 w-5 ${isOwner.bugVoting ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="font-medium">BugVoting</p>
                <p className="text-sm text-muted-foreground">
                  {isOwner.bugVoting ? 'Owner ✓' : 'Not Owner'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Coins className="h-8 w-8 text-yellow-500" />
              {loadingStats && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {loadingStats ? '...' : parseFloat(stats.totalSupply).toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Total BUG Supply</p>
            <p className="text-xs text-muted-foreground mt-1">
              Max: {parseFloat(stats.maxSupply).toLocaleString()}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ImageIcon className="h-8 w-8 text-purple-500" />
              {loadingStats && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {loadingStats ? '...' : stats.totalNFTs}
            </h3>
            <p className="text-sm text-muted-foreground">Total Bug NFTs</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Vote className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.activeSubmissions}</h3>
            <p className="text-sm text-muted-foreground">Active Submissions</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalVotes}</h3>
            <p className="text-sm text-muted-foreground">Total Votes Cast</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold mb-1">0</h3>
            <p className="text-sm text-muted-foreground">Registered Users</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-8 w-8 text-cyan-500" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Sepolia</h3>
            <p className="text-sm text-muted-foreground">Network Status</p>
            <p className="text-xs text-green-500 mt-1">● Connected</p>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-semibold">Manage Minters</p>
                <p className="text-sm text-muted-foreground">Add or remove authorized minters</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-semibold">Voting Parameters</p>
                <p className="text-sm text-muted-foreground">Update voting rules and rewards</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-semibold">View All Submissions</p>
                <p className="text-sm text-muted-foreground">Monitor bug submissions</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-semibold">Emergency Controls</p>
                <p className="text-sm text-muted-foreground">Pause contracts or emergency actions</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* Contract Addresses */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Contract Addresses</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">BugToken</p>
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                {process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS}
              </code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">BugNFT</p>
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                {process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS}
              </code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">BugVoting</p>
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                {process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS}
              </code>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
