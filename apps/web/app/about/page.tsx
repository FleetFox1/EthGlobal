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
            Discover, collect, and trade bug NFTs on the blockchain
          </p>
        </div>

        {/* What is BugDex */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3">What is BugDex?</h3>
          <p className="text-muted-foreground mb-4">
            BugDex is a mobile-first Web3 app where users can scan real-world bugs using their phone camera, 
            mint them as collectible NFTs, and trade them with other collectors. Our community-driven voting 
            system ensures authenticity and rewards active participants. A portion of platform fees supports 
            bug conservation efforts worldwide.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                📸
              </div>
              <div>
                <h4 className="font-semibold mb-1">1. Scan a Bug</h4>
                <p className="text-sm text-muted-foreground">
                  Use your phone camera to capture photos of bugs you find in nature.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                🗳️
              </div>
              <div>
                <h4 className="font-semibold mb-1">2. Community Voting</h4>
                <p className="text-sm text-muted-foreground">
                  Submit your bug for community verification. Other users vote on authenticity.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                ✨
              </div>
              <div>
                <h4 className="font-semibold mb-1">3. Mint Your NFT</h4>
                <p className="text-sm text-muted-foreground">
                  Once approved, your bug is minted as an NFT and you receive BUG tokens as a reward.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">
                🔄
              </div>
              <div>
                <h4 className="font-semibold mb-1">4. Trade & Collect</h4>
                <p className="text-sm text-muted-foreground">
                  Build your collection, trade with others, and complete your BugDex!
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
