/**
 * NFT Mint Preview Modal
 * Shows collectible card preview before minting
 */

'use client';

import React, { useState } from 'react';
import NFTWithRarityFrame from '@/components/NFTWithRarityFrame';
import { getRarityFromScore } from '@/types/rarityTiers';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: () => Promise<void>;
  upload: {
    id: string;
    imageUrl: string;
    title?: string;
    description?: string;
    votes_for: number;
    votes_against: number;
  };
}

export default function MintPreviewModal({
  isOpen,
  onClose,
  onMint,
  upload,
}: MintPreviewModalProps) {
  const [isMinting, setIsMinting] = useState(false);
  
  if (!isOpen) return null;

  const netVotes = upload.votes_for - upload.votes_against;
  const rarity = getRarityFromScore(netVotes);
  
  const handleMint = async () => {
    setIsMinting(true);
    try {
      await onMint();
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border-2 border-white/20 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isMinting}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              <h2 className="text-3xl font-bold text-white">Ready to Mint!</h2>
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-gray-400">
              Your bug has been approved by the community
            </p>
          </div>

          {/* Rarity Announcement */}
          <div className={`
            mb-6 p-4 rounded-xl text-center
            ${rarity.name === 'Legendary' ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500' : ''}
            ${rarity.name === 'Epic' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500' : ''}
            ${rarity.name === 'Rare' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500' : ''}
            ${rarity.name === 'Uncommon' ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500' : ''}
            ${rarity.name === 'Common' ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-2 border-gray-500' : ''}
          `}>
            <div className="text-4xl mb-2">{rarity.emoji}</div>
            <div className="text-2xl font-bold text-white mb-1">
              {rarity.name.toUpperCase()} TIER
            </div>
            <div className="text-sm text-gray-300">
              {rarity.description}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Net Score: {netVotes >= 0 ? '+' : ''}{netVotes} votes ({upload.votes_for} 👍 / {upload.votes_against} 👎)
            </div>
          </div>

          {/* Card Preview */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-sm">
              <NFTWithRarityFrame
                imageUrl={upload.imageUrl}
                voteScore={netVotes}
                name={upload.title}
                description={upload.description}
                votesFor={upload.votes_for}
                votesAgainst={upload.votes_against}
                className="w-full"
              />
            </div>
          </div>

          {/* Preview Label */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400">
              ⬆️ This is what your NFT will look like
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Holographic effects, rarity badge, and vote stats included
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={onClose}
              disabled={isMinting}
              variant="outline"
              className="flex-1 h-14 text-lg"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleMint}
              disabled={isMinting}
              className={`
                flex-1 h-14 text-lg font-bold
                ${rarity.name === 'Legendary' ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' : ''}
                ${rarity.name === 'Epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}
                ${rarity.name === 'Rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' : ''}
                ${rarity.name === 'Uncommon' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' : ''}
                ${rarity.name === 'Common' ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700' : ''}
              `}
            >
              {isMinting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Mint {rarity.name} NFT
                </>
              )}
            </Button>
          </div>

          {/* Gas Fee Notice */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-200 text-center">
              ⛽ You'll pay gas fees for minting (blockchain transaction)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
