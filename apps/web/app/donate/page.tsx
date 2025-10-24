'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Globe, Leaf, Fish, TreePine, TrendingUp, ExternalLink, Info, ArrowLeft } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { ethers } from 'ethers';
import Link from 'next/link';

// BugDex Conservation Wallet Address (update with your secure wallet)
const CONSERVATION_WALLET = process.env.NEXT_PUBLIC_CONSERVATION_WALLET || '0xYourConservationWallet';
const PYUSD_ADDRESS = process.env.NEXT_PUBLIC_PYUSD_ADDRESS || '0x9Cc4DA42fE6d04628F85E6C2078A6f0e6b50B69C';

interface ConservationOrg {
  id: number;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  vote_count?: number;
  vote_percentage?: number;
}

export default function DonatePage() {
  const { walletAddress } = useUser();
  const [organizations, setOrganizations] = useState<ConservationOrg[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [donationAmount, setDonationAmount] = useState('5');
  const [totalDonated, setTotalDonated] = useState('0');
  const [currentQuarter, setCurrentQuarter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bugBalance, setBugBalance] = useState('0');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadConservationData();
    calculateCurrentQuarter();
  }, [walletAddress]);

  function calculateCurrentQuarter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    setCurrentQuarter(`${year}-Q${quarter}`);
  }

  async function loadConservationData() {
    try {
      // Load organizations and voting stats
      const orgsRes = await fetch('/api/conservation/organizations');
      const orgsData = await orgsRes.json();
      if (orgsData.success) {
        setOrganizations(orgsData.data.organizations);
        setTotalDonated(orgsData.data.totalDonated || '0');
      }

      // Check if user has voted this quarter
      if (walletAddress) {
        const voteRes = await fetch(`/api/conservation/has-voted?wallet=${walletAddress}&quarter=${currentQuarter}`);
        const voteData = await voteRes.json();
        setHasVoted(voteData.hasVoted || false);

        // Load BUG token balance
        loadBugBalance();
      }
    } catch (error) {
      console.error('Error loading conservation data:', error);
    }
  }

  async function loadBugBalance() {
    if (!walletAddress || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS!;
      const bugToken = new ethers.Contract(
        bugTokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );

      const balance = await bugToken.balanceOf(walletAddress);
      setBugBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error loading BUG balance:', error);
    }
  }

  async function handleDonate() {
    if (!walletAddress || !window.ethereum) {
      showMessage('error', 'Please connect your wallet first');
      return;
    }

    if (parseFloat(donationAmount) <= 0) {
      showMessage('error', 'Please enter a valid donation amount');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // PYUSD contract
      const pyusdContract = new ethers.Contract(
        PYUSD_ADDRESS,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address) view returns (uint256)',
        ],
        signer
      );

      // Check balance
      const balance = await pyusdContract.balanceOf(walletAddress);
      const amountWei = ethers.parseUnits(donationAmount, 6); // PYUSD has 6 decimals

      if (balance < amountWei) {
        showMessage('error', 'Insufficient PYUSD balance');
        setLoading(false);
        return;
      }

      // Transfer PYUSD to conservation wallet
      const tx = await pyusdContract.transfer(CONSERVATION_WALLET, amountWei);
      showMessage('success', 'Transaction sent! Waiting for confirmation...');

      const receipt = await tx.wait();

      // Record donation in database
      await fetch('/api/conservation/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_wallet: walletAddress,
          amount_pyusd: donationAmount,
          transaction_hash: receipt.hash,
          quarter: currentQuarter,
        }),
      });

      showMessage('success', `Thank you! Donated $${donationAmount} PYUSD to conservation! 🌍`);
      setDonationAmount('5');
      loadConservationData(); // Refresh totals
    } catch (error: any) {
      console.error('Error donating:', error);
      showMessage('error', error.message || 'Failed to donate');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote() {
    if (!walletAddress) {
      showMessage('error', 'Please connect your wallet first');
      return;
    }

    if (selectedOrg === null) {
      showMessage('error', 'Please select an organization to vote for');
      return;
    }

    if (parseFloat(bugBalance) <= 0) {
      showMessage('error', 'You need to hold BUG tokens to vote');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/conservation/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_wallet: walletAddress,
          org_id: selectedOrg,
          bug_balance: bugBalance,
          quarter: currentQuarter,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Vote submitted! Thank you for participating! 🗳️');
        setHasVoted(true);
        loadConservationData();
      } else {
        showMessage('error', data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      showMessage('error', 'Failed to submit vote');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ocean': return <Fish className="h-5 w-5" />;
      case 'forest': return <TreePine className="h-5 w-5" />;
      case 'wildlife': return <Leaf className="h-5 w-5" />;
      case 'climate': return <Globe className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/conservation">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Donate to Conservation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-10 w-10 text-green-500" fill="currentColor" />
            <h1 className="text-4xl font-bold">Support Conservation</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Donate PYUSD to support conservation. Community votes quarterly on which organization receives funds.
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
              : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Donated</p>
                <p className="text-2xl font-bold">${parseFloat(totalDonated).toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">PYUSD contributions this quarter</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Quarter</p>
                <p className="text-2xl font-bold">{currentQuarter}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Voting period active</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Your BUG Balance</p>
                <p className="text-2xl font-bold">{parseFloat(bugBalance).toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {hasVoted ? '✅ Already voted this quarter' : 'Hold BUG to vote'}
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="p-6 mb-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How Conservation Fund Works</h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li><strong>1. Donate:</strong> Send PYUSD to the BugDex conservation wallet (transparent & secure)</li>
                <li><strong>2. Stake BUG:</strong> Hold BUG tokens to participate in quarterly voting</li>
                <li><strong>3. Vote:</strong> Community votes on which conservation org receives the funds</li>
                <li><strong>4. Distribution:</strong> Winning organization receives 100% of PYUSD donations</li>
              </ol>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                <strong>Transparency:</strong> All donations and distributions are on-chain and publicly visible at{' '}
                <a href={`https://sepolia.etherscan.io/address/${CONSERVATION_WALLET}`} target="_blank" rel="noopener noreferrer" className="underline">
                  {CONSERVATION_WALLET.slice(0, 10)}...{CONSERVATION_WALLET.slice(-8)}
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Donation Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
            Make a Donation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Donation Amount (PYUSD)</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="5"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                All donations go to the conservation wallet and are distributed quarterly
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleDonate}
                disabled={loading || !walletAddress}
                className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : `Donate $${donationAmount} PYUSD`}
              </Button>
            </div>
          </div>
        </Card>

        {/* Voting Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Vote for Conservation Organization</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {hasVoted
              ? `✅ You've already voted this quarter (${currentQuarter}). Voting opens again next quarter.`
              : `Select an organization to receive this quarter's donations. Your vote is weighted by your BUG token balance.`
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                onClick={() => !hasVoted && setSelectedOrg(org.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOrg === org.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${hasVoted ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {getCategoryIcon(org.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{org.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{org.description}</p>
                    {org.vote_count !== undefined && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {org.vote_count} votes ({org.vote_percentage}%)
                      </div>
                    )}
                  </div>
                  {selectedOrg === org.id && (
                    <div className="text-green-500">✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleVote}
            disabled={loading || !walletAddress || hasVoted || selectedOrg === null}
            className="w-full mt-6 h-12 text-lg font-semibold"
          >
            {loading ? 'Submitting Vote...' : hasVoted ? 'Already Voted This Quarter' : 'Submit Vote'}
          </Button>
        </Card>

        {/* Learn More Link */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Learn More About Conservation</h3>
            <p className="text-muted-foreground mb-4">
              Discover why bug conservation matters and the organizations we support
            </p>
            <Link href="/conservation">
              <Button variant="outline" className="gap-2">
                <Leaf className="h-4 w-4" />
                View Conservation Info
              </Button>
            </Link>
          </div>
        </Card>

        {/* Transparency Section */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Transparency & Verification
          </h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Conservation Wallet:</strong>{' '}
              <a
                href={`https://sepolia.etherscan.io/address/${CONSERVATION_WALLET}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
              >
                {CONSERVATION_WALLET}
              </a>
            </p>
            <p className="text-muted-foreground">
              All donations and distributions are publicly verifiable on-chain. View the wallet to see:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
              <li>Total PYUSD balance held for current quarter</li>
              <li>All incoming donations with transaction hashes</li>
              <li>Quarterly distribution transactions to winning organizations</li>
              <li>Complete transparent history of all conservation funding</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
