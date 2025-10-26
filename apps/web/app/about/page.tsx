"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, Users, Vote, Zap } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
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
              <h1 className="text-2xl font-bold">About BugDex</h1>
              <p className="text-sm text-muted-foreground">ETHGlobal 2025</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐞</div>
          <h2 className="text-3xl font-bold mb-3">BugDex</h2>
          <p className="text-lg text-muted-foreground">
            Crowdsourcing biodiversity data through Web3 incentives
          </p>
        </div>

        {/* The Problem */}
        <section className="mb-8 bg-red-500/5 border border-red-500/20 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-red-400">🚨 The Problem</h3>
          <p className="text-muted-foreground mb-3">
            We're in the midst of an <strong>insect apocalypse</strong>. Over 40% of insect species are declining globally, 
            with catastrophic consequences for ecosystems and food security. Yet biodiversity monitoring remains expensive, 
            slow, and limited to professional researchers.
          </p>
          <p className="text-muted-foreground">
            Critical biodiversity data sits unused in nature while conservation organizations struggle with funding 
            and lack of real-time field data from diverse geographic locations.
          </p>
        </section>

        {/* Our Solution */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3">💡 Our Solution: DeSci Meets Conservation</h3>
          <p className="text-muted-foreground mb-4">
            BugDex turns citizen science into a rewarding experience. By gamifying insect photography with Web3 incentives, 
            we create a global network of biodiversity data collectors. Every photo becomes both a collectible NFT and 
            valuable scientific data - geo-tagged, timestamped, and community-verified.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <div className="text-2xl mb-2">🔬</div>
              <h4 className="font-semibold mb-1">DeSci Data Collection</h4>
              <p className="text-xs text-muted-foreground">
                Crowdsourced biodiversity observations with on-chain provenance and IPFS storage
              </p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold mb-1">Economic Incentives</h4>
              <p className="text-xs text-muted-foreground">
                Token rewards for contributions, making conservation data collection financially sustainable
              </p>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-semibold mb-1">Direct Impact</h4>
              <p className="text-xs text-muted-foreground">
                PYUSD donations flow directly to conservation orgs, governed by community voting
              </p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="text-2xl mb-2">🎮</div>
              <h4 className="font-semibold mb-1">Engaging UX</h4>
              <p className="text-xs text-muted-foreground">
                NFT collecting mechanics make biodiversity monitoring fun and accessible to everyone
              </p>
            </div>
          </div>
        </section>

        {/* What is BugDex */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3">What is BugDex?</h3>
          <p className="text-muted-foreground mb-4">
            BugDex is a mobile-first DeSci (Decentralized Science) application that rewards people for documenting 
            insect biodiversity. Users photograph bugs they encounter, stake tokens to submit for community verification, 
            and mint verified observations as NFTs with rarity based on vote counts. The platform combines PYUSD payments, 
            Pyth oracle pricing, and Blockscout transparency to create a seamless Web3 experience for conservation impact.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                �
              </div>
              <div>
                <h4 className="font-semibold mb-1">1. Unlock Access</h4>
                <p className="text-sm text-muted-foreground">
                  Pay $1 (PYUSD or ETH via Pyth oracle) to unlock unlimited daily BUG token claims. Stablecoin option ensures predictable pricing.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                📸
              </div>
              <div>
                <h4 className="font-semibold mb-1">2. Photograph Insects</h4>
                <p className="text-sm text-muted-foreground">
                  Capture bugs you find in nature with geo-tagged, timestamped photos stored on IPFS for permanent decentralized storage.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                🗳️
              </div>
              <div>
                <h4 className="font-semibold mb-1">3. Community Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Stake 10 BUG tokens to submit for voting. Community votes FOR/AGAINST with free off-chain signatures (no gas fees).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">
                ✨
              </div>
              <div>
                <h4 className="font-semibold mb-1">4. Mint & Earn</h4>
                <p className="text-sm text-muted-foreground">
                  Approved bugs (2+ net votes) mint as NFTs with rarity tiers. Voters earn 5 BUG per upvote, incentivizing quality verification.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">
                🌍
              </div>
              <div>
                <h4 className="font-semibold mb-1">5. Support Conservation</h4>
                <p className="text-sm text-muted-foreground">
                  Donate PYUSD directly to wildlife conservation organizations. Vote with BUG tokens to influence quarterly fund distribution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tokenomics */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Tokenomics</h3>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-semibold text-lg">BUG Token</h4>
                <p className="text-sm text-muted-foreground">Platform utility token (no monetary value)</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm">Submission Cost</span>
                <span className="font-semibold">10 BUG to submit for voting</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm">Vote Reward</span>
                <span className="font-semibold">5 BUG per vote</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm">Successful Mint Reward</span>
                <span className="font-semibold">100 BUG tokens</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Faucet Access</span>
                <span className="font-semibold">100 BUG (one-time unlock)</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-muted-foreground">
              ⚠️ <strong>Disclaimer:</strong> BUG tokens are utility tokens with no inherent monetary value. 
              They cannot be exchanged for fiat currency, PYUSD, ETH, or other cryptocurrencies. 
              BUG tokens are used solely for platform governance and access.
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Key Features</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <Zap className="h-6 w-6 text-amber-500 mb-2" />
              <h4 className="font-semibold mb-1">Instant Scanning</h4>
              <p className="text-sm text-muted-foreground">
                Quick camera capture or photo upload from gallery
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <Vote className="h-6 w-6 text-blue-500 mb-2" />
              <h4 className="font-semibold mb-1">Community Governance</h4>
              <p className="text-sm text-muted-foreground">
                Democratic voting system for bug verification
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <Users className="h-6 w-6 text-purple-500 mb-2" />
              <h4 className="font-semibold mb-1">Social Trading</h4>
              <p className="text-sm text-muted-foreground">
                Trade bugs with collectors worldwide
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <Coins className="h-6 w-6 text-green-500 mb-2" />
              <h4 className="font-semibold mb-1">Earn Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Get BUG tokens for scanning and voting
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Built With</h3>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Frontend</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Next.js 15</li>
                  <li>• React 19</li>
                  <li>• Tailwind CSS v4</li>
                  <li>• shadcn/ui</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Web3</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Solidity</li>
                  <li>• Hardhat</li>
                  <li>• IPFS (Lighthouse)</li>
                  <li>• PYUSD</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Future Roadmap CTA */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Curious About What's Next?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
              From trading card games to AR features, see how we're building BugDex into 
              a global biodiversity monitoring network.
            </p>
            <Link href="/roadmap">
              <Button className="bg-purple-500 hover:bg-purple-600">
                View Future Roadmap
              </Button>
            </Link>
          </div>
        </section>

        {/* Team */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Team</h3>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Built for ETHGlobal 2025 Hackathon
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/FleetFox1/EthGlobal" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://ethglobal.com" target="_blank" rel="noopener noreferrer">
                  ETHGlobal
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Start Collecting Bugs
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
