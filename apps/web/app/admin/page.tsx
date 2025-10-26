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
import VotingConfig from "@/components/VotingConfig";

export default function AdminPage() {
  const { isAdmin, isOwner, loading, walletAddress, isAuthenticated } = useAdmin();
  const [stats, setStats] = useState({
    totalSupply: "0",
    maxSupply: "0",
    totalNFTs: "0",
    activeSubmissions: "0",
    totalVotes: "0",
  });
  const [dbStats, setDbStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    async function loadStats() {
      if (!isAdmin) return;

      try {
        setLoadingStats(true);
        
        // Load database stats first (primary source of truth)
        const dbRes = await fetch('/api/admin/stats');
        const dbData = await dbRes.json();
        
        if (dbData.success) {
          setDbStats(dbData.data);
          
          // Update basic stats from DB
          setStats(prev => ({
            ...prev,
            totalNFTs: dbData.data.submissions?.total?.toString() || "0",
            activeSubmissions: dbData.data.votes?.active?.toString() || "0",
            totalVotes: dbData.data.votes?.total?.toString() || "0",
          }));
        }

        // Try to load on-chain data (optional, don't fail if it errors)
        if (window.ethereum) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            
            const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS;
            const bugNFTAddress = process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS;

            if (bugTokenAddress) {
              const tokenABI = [
                "function totalSupply() view returns (uint256)",
                "function MAX_SUPPLY() view returns (uint256)",
              ];

              const bugToken = new ethers.Contract(bugTokenAddress, tokenABI, provider);

              const [totalSupply, maxSupply] = await Promise.all([
                bugToken.totalSupply(),
                bugToken.MAX_SUPPLY(),
              ]);

              setStats(prev => ({
                ...prev,
                totalSupply: ethers.formatEther(totalSupply),
                maxSupply: ethers.formatEther(maxSupply),
              }));
            }
          } catch (contractError) {
            console.warn("Could not load on-chain stats (this is okay):", contractError);
            // Continue without on-chain stats - DB stats are sufficient
          }
        }
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
              {loadingStats && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <h3 className="text-2xl font-bold mb-1">{loadingStats ? '...' : stats.activeSubmissions}</h3>
            <p className="text-sm text-muted-foreground">Active Voting</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pending community votes
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              {loadingStats && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <h3 className="text-2xl font-bold mb-1">{loadingStats ? '...' : stats.totalVotes}</h3>
            <p className="text-sm text-muted-foreground">Total Votes Cast</p>
            <p className="text-xs text-muted-foreground mt-1">
              Free off-chain voting
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-orange-500" />
              {loadingStats && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {loadingStats ? '...' : dbStats?.users || 0}
            </h3>
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

        {/* Submission Breakdown */}
        {dbStats && (
          <>
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Submission Pipeline (Off-Chain Voting)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">{dbStats.submissions?.total || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Submitted</div>
                  <div className="text-xs text-muted-foreground mt-1">All time</div>
                </div>
                <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{dbStats.submissions?.pendingVoting || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Pending Voting</div>
                  <div className="text-xs text-muted-foreground mt-1">Active now</div>
                </div>
                <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{dbStats.submissions?.approved || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Approved</div>
                  <div className="text-xs text-muted-foreground mt-1">Can mint NFT</div>
                </div>
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{dbStats.submissions?.rejected || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Rejected</div>
                  <div className="text-xs text-muted-foreground mt-1">Failed vote</div>
                </div>
                <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{dbStats.submissions?.minted || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Minted</div>
                  <div className="text-xs text-muted-foreground mt-1">On blockchain</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>ℹ️ Off-Chain Voting System:</strong> Community votes are FREE and stored in the database. After 3 days, if votes_for &gt; votes_against, the bug is approved. Users then pay gas to mint approved bugs as NFTs with rarity based on vote score!
                </p>
              </div>
            </Card>

            {/* Faucet & Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  Faucet Performance
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Unlocks</span>
                    <span className="text-xl font-bold">{dbStats.faucet?.totalUnlocks || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Unique Users</span>
                    <span className="text-xl font-bold">{dbStats.faucet?.uniqueUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue (ETH/PYUSD)</span>
                    <span className="text-xl font-bold">${(dbStats.faucet?.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-900 dark:text-yellow-100">
                      <strong>Conversion:</strong> {dbStats.faucet?.uniqueUsers && dbStats.users 
                        ? Math.round((dbStats.faucet.uniqueUsers / dbStats.users) * 100)
                        : 0}% of users unlocked the faucet
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Community Engagement
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Voters</span>
                    <span className="text-xl font-bold">{dbStats.participation?.uniqueVoters || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Voting Participation</span>
                    <span className="text-xl font-bold">{dbStats.participation?.voterPercentage || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Votes Cast</span>
                    <span className="text-xl font-bold">{dbStats.votes?.total || 0}</span>
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/50 rounded border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-900 dark:text-orange-100">
                      <strong>Goal:</strong> Reach 30%+ voting participation
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* User Growth Chart */}
            {dbStats.growth && dbStats.growth.length > 0 && (
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  User Growth (Last 7 Days)
                </h2>
                <div className="flex items-end gap-2 h-40">
                  {dbStats.growth.map((day: any, index: number) => {
                    const maxSignups = Math.max(...dbStats.growth.map((d: any) => d.signups));
                    const height = maxSignups > 0 ? (day.signups / maxSignups) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs font-bold text-green-600">{day.signups}</div>
                        <div 
                          className="w-full bg-green-500 rounded-t transition-all"
                          style={{ height: `${height}%`, minHeight: day.signups > 0 ? '4px' : '0px' }}
                        />
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-2">
                {dbStats.recentActivity?.length > 0 ? (
                  dbStats.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-mono">{activity.wallet.substring(0, 10)}...{activity.wallet.substring(38)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-green-600">👍 {activity.votesFor}</span>
                          <span className="mx-1">|</span>
                          <span className="text-red-600">👎 {activity.votesAgainst}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                          activity.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                          activity.status === 'pending_voting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {activity.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Admin Actions */}
        <Card className="p-6 mb-8">
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

        {/* Voting Configuration */}
        <VotingConfig adminWallet={walletAddress || ''} />

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
              <p className="text-sm text-muted-foreground mb-1">
                BugSubmissionStaking
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
                  ✅ ACTIVE
                </span>
              </p>
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                {process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Note:</strong> Holds 10 BUG stakes during community voting. Distributes stake + rewards (5 BUG per upvote) after voting ends.
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                BugVoting 
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                  ⚠️ DEPRECATED
                </span>
              </p>
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                {process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Note:</strong> On-chain voting has been replaced with off-chain voting (free & instant). This contract is kept for ownership verification only.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
