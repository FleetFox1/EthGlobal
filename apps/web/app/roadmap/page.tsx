"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Target, Rocket, Globe, Trophy, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/about">
              <Button variant="ghost" size="icon" aria-label="Back to about">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Future Roadmap</h1>
              <p className="text-sm text-muted-foreground">Building the future of DeSci biodiversity</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold mb-3">The Road Ahead</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From a hackathon project to a global biodiversity monitoring network. Here's how we plan 
            to scale BugDex into a sustainable DeSci platform with real conservation impact.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {/* Q1 2026 - Launch & Stabilize */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Q1 2026: Launch & Stabilize</h3>
                <p className="text-sm text-muted-foreground">Jan - Mar 2026</p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🎮 Trading Card Game (TCG)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Transform NFTs into playable cards with stats and battle mechanics. Weekly tournaments 
                  with BUG token prizes.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Bug type advantages (Flying &gt; Crawling, etc.)</li>
                  <li>Card evolution system (combine duplicates)</li>
                  <li>Tournament entry fees create revenue</li>
                </ul>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">💎 Enhanced Token Utility</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Multiple BUG token sinks to maintain value and reward holders.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>NFT staking for passive income (5-30% APY)</li>
                  <li>Premium features: AI identification, bulk upload, priority queue</li>
                  <li>NFT customization: holographic effects, custom frames</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Q2 2026 - Growth & Partnerships */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Q2 2026: Growth & Partnerships</h3>
                <p className="text-sm text-muted-foreground">Apr - Jun 2026</p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🔬 Research Partnerships</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Partner with universities and conservation organizations to export verified data.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>API integration with iNaturalist, Xerces Society</li>
                  <li>Bonus rewards when data used in published research</li>
                  <li>Co-authorship opportunities for top contributors</li>
                </ul>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">👥 Social & Community</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Build viral growth loops and community engagement features.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Guild system: Teams of 50 compete for territory control</li>
                  <li>Referral rewards: 10% of friend's earnings forever</li>
                  <li>NFT marketplace: Peer-to-peer trading with escrow</li>
                </ul>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🎯 Endangered Species Bounties</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Conservation orgs post high-reward missions for rare species documentation.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>10x rewards for critically endangered species</li>
                  <li>Location-based alerts for nearby bounties</li>
                  <li>Leaderboard for conservation impact by region</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Q3 2026 - Advanced Features */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Q3 2026: Advanced Features</h3>
                <p className="text-sm text-muted-foreground">Jul - Sep 2026</p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">📍 AR & Geolocation</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Augmented reality features and territory control mechanics.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>AR bug spawning: See virtual insects in real world</li>
                  <li>Geo-fencing: Stake BUG to claim 1km territory</li>
                  <li>Earn 1% of NFT mints in your territory</li>
                  <li>Public heatmaps showing biodiversity by region</li>
                </ul>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🎲 Breeding & Genetics</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Combine NFTs to create hybrid offspring with genetic traits.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Traits passed down: color, pattern, size</li>
                  <li>Ultra-rare "shiny" variants (1% chance)</li>
                  <li>Breeding requires BUG token staking</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Q4 2026 - Scale & Impact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Q4 2026: Scale & Impact</h3>
                <p className="text-sm text-muted-foreground">Oct - Dec 2026</p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🌍 Carbon Credit Integration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Direct environmental action beyond documentation.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Spend BUG to plant trees (on-chain verification)</li>
                  <li>Partner with reforestation projects</li>
                  <li>Profile badges: "Planted 1000 trees"</li>
                </ul>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">📚 Educational Partnerships</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Work with schools and educational institutions.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Bug encyclopedia with achievement badges</li>
                  <li>Educational curriculum for K-12 schools</li>
                  <li>Student competitions with scholarships</li>
                </ul>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🎪 Seasonal Events</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Regular limited-time events to drive engagement.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Summer: Butterfly Migration Challenge</li>
                  <li>Fall: Beetle Battle Royale</li>
                  <li>Winter: Frost Insect Hunt</li>
                  <li>Limited species with 10x rarity multipliers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2027 & Beyond */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">2027 & Beyond: Global Network</h3>
                <p className="text-sm text-muted-foreground">Long-term vision</p>
              </div>
            </div>
            <div className="ml-16 space-y-3">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🌐 Multi-Chain Expansion</h4>
                <p className="text-sm text-muted-foreground">
                  Deploy to low-fee chains (Base, Polygon, Arbitrum) for global accessibility. 
                  Cross-chain NFT bridges for maximum liquidity.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🔬 Real Scientific Impact</h4>
                <p className="text-sm text-muted-foreground">
                  Publish peer-reviewed papers using BugDex data. Secure grants from 
                  National Science Foundation, EPA, and conservation foundations.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🏆 Global Competitions</h4>
                <p className="text-sm text-muted-foreground">
                  Host international TCG championships with $100K+ prize pools. 
                  Partner with gaming organizations and streaming platforms.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">📱 Mobile App Launch</h4>
                <p className="text-sm text-muted-foreground">
                  Native iOS and Android apps with offline mode, push notifications, 
                  and optimized AR features. Target 1M+ downloads.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sustainability Model */}
        <section className="mt-12 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-green-400" />
            Sustainability Model
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-green-400 mb-1">Revenue Streams</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Tournament entry fees (5-10 BUG per player)</li>
                <li>Premium subscriptions (50 BUG/month)</li>
                <li>NFT marketplace fees (2.5% per trade)</li>
                <li>Breeding fees (10-50 BUG per hybrid)</li>
                <li>Research API access licenses ($5K-50K/year per institution)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-1">Token Economics</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Staking locks supply (reduces inflation pressure)</li>
                <li>Burning mechanisms on premium features (deflationary)</li>
                <li>DAO treasury funds development via fee revenue</li>
                <li>Long-term holders rewarded through appreciation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-1">Conservation Funding</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>20% of platform revenue → conservation wallet</li>
                <li>Community votes quarterly on fund distribution</li>
                <li>Transparent on-chain tracking via Blockscout</li>
                <li>Target: $1M donated to conservation by 2027</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-10 text-center bg-card border rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-3">Join the Journey</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            BugDex is more than a game - it's a movement to democratize biodiversity science. 
            Every photo you take contributes to global conservation efforts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Start Collecting
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
