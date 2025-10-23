/**
 * NFT Card Gallery Demo
 * Showcases all rarity tiers with example cards
 */

'use client';

import React from 'react';
import NFTWithRarityFrame from '@/components/NFTWithRarityFrame';
import { rarityTiers } from '@/types/rarityTiers';

export default function CardGalleryPage() {
  // Example bug data for each rarity tier
  const exampleCards = [
    {
      imageUrl: '/placeholder-bug.svg', // You can replace with actual bug images
      voteScore: 15,
      name: 'Critical Memory Leak',
      description: 'Catastrophic bug causing 100% CPU usage after 5 minutes of runtime.',
      votesFor: 18,
      votesAgainst: 3
    },
    {
      imageUrl: '/placeholder-bug.svg',
      voteScore: 8,
      name: 'Authentication Bypass',
      description: 'Security flaw allowing unauthorized access to admin panel.',
      votesFor: 12,
      votesAgainst: 4
    },
    {
      imageUrl: '/placeholder-bug.svg',
      voteScore: 5,
      name: 'UI Rendering Glitch',
      description: 'Modal dialog appears behind main content on mobile devices.',
      votesFor: 8,
      votesAgainst: 3
    },
    {
      imageUrl: '/placeholder-bug.svg',
      voteScore: 2,
      name: 'Typo in Error Message',
      description: 'Minor spelling mistake in validation error text.',
      votesFor: 4,
      votesAgainst: 2
    },
    {
      imageUrl: '/placeholder-bug.svg',
      voteScore: 0,
      name: 'Console Warning',
      description: 'Harmless deprecation warning in browser console.',
      votesFor: 2,
      votesAgainst: 2
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎴 NFT Card Gallery
          </h1>
          <p className="text-gray-400 text-lg">
            Pokemon-style collectible cards with holographic effects
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Vote score determines rarity: 0 = Common | 1-3 = Uncommon | 4-6 = Rare | 7-9 = Epic | 10+ = Legendary
          </p>
        </div>

        {/* Rarity Tier Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-16">
          {exampleCards.map((card, index) => (
            <div key={index} className="flex flex-col items-center">
              <NFTWithRarityFrame
                imageUrl={card.imageUrl}
                voteScore={card.voteScore}
                name={card.name}
                description={card.description}
                votesFor={card.votesFor}
                votesAgainst={card.votesAgainst}
                className="w-full max-w-xs"
              />
              <div className="mt-4 text-center">
                <div className="text-white font-semibold">
                  Net Score: {card.voteScore >= 0 ? '+' : ''}{card.voteScore}
                </div>
                <div className="text-gray-500 text-sm">
                  {card.votesFor} up | {card.votesAgainst} down
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rarity Tier Legend */}
        <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            📊 Rarity Tier System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {rarityTiers.map((tier) => (
              <div
                key={tier.name}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2"
                style={{
                  borderColor: getTierColor(tier.name)
                }}
              >
                <div className="text-center mb-2">
                  <span className="text-3xl">{tier.emoji}</span>
                </div>
                <div className="text-white font-bold text-lg text-center mb-1">
                  {tier.name}
                </div>
                <div className="text-gray-400 text-sm text-center mb-2">
                  {tier.minScore}{tier.maxScore !== null ? `-${tier.maxScore}` : '+'} votes
                </div>
                <div className="text-gray-500 text-xs text-center">
                  {tier.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            🎨 How to Use
          </h2>
          <div className="text-gray-300 space-y-3">
            <p>
              <span className="text-purple-400 font-semibold">1.</span> Import the component:
              <code className="ml-2 px-2 py-1 bg-gray-800 rounded text-sm">
                import NFTWithRarityFrame from '@/components/NFTWithRarityFrame'
              </code>
            </p>
            <p>
              <span className="text-purple-400 font-semibold">2.</span> Calculate vote score:
              <code className="ml-2 px-2 py-1 bg-gray-800 rounded text-sm">
                const voteScore = votesFor - votesAgainst
              </code>
            </p>
            <p>
              <span className="text-purple-400 font-semibold">3.</span> Render the card:
              <code className="ml-2 px-2 py-1 bg-gray-800 rounded text-sm">
                {'<NFTWithRarityFrame imageUrl={url} voteScore={score} ... />'}
              </code>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              ✨ The component automatically applies holographic effects, shimmer animations, and rarity-based borders.
              Hover over cards to see the foil shine effect!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Built with Next.js + Tailwind CSS</p>
          <p>Frame overlays: <code>/public/frames/{'<rarity>'}.png</code></p>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper: Get tier color for legend display
 */
function getTierColor(tierName: string): string {
  switch (tierName.toLowerCase()) {
    case 'legendary':
      return '#ff6b00';
    case 'epic':
      return '#a855f7';
    case 'rare':
      return '#3b82f6';
    case 'uncommon':
      return '#22c55e';
    case 'common':
    default:
      return '#6b7280';
  }
}
