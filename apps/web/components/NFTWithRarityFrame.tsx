/**
 * NFT Collectible Card with Rarity Frame
 * Pokemon/trading card style with holographic effects
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { getRarityFromScore, type RarityTier } from '@/types/rarityTiers';

interface NFTWithRarityFrameProps {
  imageUrl: string;
  voteScore: number;
  name?: string;
  description?: string;
  votesFor?: number;
  votesAgainst?: number;
  className?: string;
}

export default function NFTWithRarityFrame({
  imageUrl,
  voteScore,
  name,
  description,
  votesFor,
  votesAgainst,
  className = ''
}: NFTWithRarityFrameProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get rarity tier based on vote score
  const rarity = getRarityFromScore(voteScore);
  const netVotes = voteScore; // Already calculated as votes_for - votes_against

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card Container */}
      <div
        className={`
          relative w-full aspect-[3/4] rounded-2xl overflow-hidden
          transform transition-all duration-300 ease-out
          ${isHovered ? 'scale-105 -translate-y-2' : 'scale-100'}
          ${rarity.cssClass}
        `}
        style={{
          boxShadow: isHovered
            ? '0 20px 60px rgba(0,0,0,0.4), 0 0 40px var(--rarity-glow)'
            : '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />

        {/* Holographic Shimmer Overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className={`holographic-shimmer ${rarity.name.toLowerCase()}-shimmer`} />
        </div>

        {/* Frame Overlay (PNG from public/frames) */}
        {rarity.overlayUrl && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <Image
              src={rarity.overlayUrl}
              alt={`${rarity.name} frame`}
              fill
              className="object-cover"
              onError={() => {
                // Fallback: hide frame if image fails to load
                const el = document.querySelector(`[alt="${rarity.name} frame"]`);
                if (el) (el as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Rarity Badge - Top Right */}
        <div className="absolute top-3 right-3 z-30">
          <div className={`
            px-3 py-1.5 rounded-full font-bold text-sm
            backdrop-blur-md bg-black/40 border-2
            flex items-center gap-1.5
            shadow-lg
            ${getRarityBorderColor(rarity.name)}
          `}>
            <span className="text-lg">{rarity.emoji}</span>
            <span className="text-white tracking-wide">{rarity.name.toUpperCase()}</span>
          </div>
        </div>

        {/* Vote Score Badge - Top Left */}
        {typeof votesFor !== 'undefined' && typeof votesAgainst !== 'undefined' && (
          <div className="absolute top-3 left-3 z-30">
            <div className="px-3 py-1.5 rounded-full font-bold text-xs backdrop-blur-md bg-black/50 border border-white/30 shadow-lg">
              <span className="text-green-400">👍 {votesFor}</span>
              <span className="text-white/50 mx-1">|</span>
              <span className="text-red-400">👎 {votesAgainst}</span>
            </div>
          </div>
        )}

        {/* NFT Image Container */}
        <div className="absolute inset-6 top-16 bottom-20 z-10">
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={name || 'NFT Bug'}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-2">🐛</div>
                  <div className="text-sm">Image not available</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          {name && (
            <h3 className="text-white font-bold text-lg truncate mb-1">{name}</h3>
          )}
          {description && (
            <p className="text-gray-300 text-xs line-clamp-2 mb-2">{description}</p>
          )}
          
          {/* Net Score Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400">Net Score:</div>
              <div className={`font-bold text-sm ${netVotes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netVotes >= 0 ? '+' : ''}{netVotes}
              </div>
            </div>
            
            {/* Rarity Indicator */}
            <div className="text-xs text-gray-400 italic">
              {rarity.description}
            </div>
          </div>
        </div>

        {/* Foil Shine Effect (on hover) */}
        {isHovered && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <div className="foil-shine" />
          </div>
        )}
      </div>

      {/* Hover Tooltip (optional - shows more details) */}
      {isHovered && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-40 w-64 p-3 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="text-white font-semibold text-sm mb-1">
              {rarity.emoji} {rarity.name} Rarity
            </div>
            <div className="text-gray-400 text-xs">
              {rarity.description}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-500">
              Score Range: {rarity.minScore}
              {rarity.maxScore !== null ? `-${rarity.maxScore}` : '+'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper: Get border color class based on rarity
 */
function getRarityBorderColor(rarityName: string): string {
  switch (rarityName.toLowerCase()) {
    case 'legendary':
      return 'border-orange-500';
    case 'epic':
      return 'border-purple-500';
    case 'rare':
      return 'border-blue-500';
    case 'uncommon':
      return 'border-green-500';
    case 'common':
    default:
      return 'border-gray-500';
  }
}
