/**
 * Rarity Tier Configuration
 * Based on net vote score (votes_for - votes_against)
 */

export interface RarityTier {
  name: string;
  minScore: number;
  maxScore: number | null; // null = infinite
  emoji: string;
  cssClass: string; // Tailwind classes for border/glow
  overlayUrl?: string; // Optional frame overlay image
  description: string;
}

export const rarityTiers: RarityTier[] = [
  {
    name: "Legendary",
    minScore: 10,
    maxScore: null,
    emoji: "✨",
    cssClass: "legendary-frame",
    overlayUrl: "/frames/legendary.png",
    description: "Orange/Red holographic with animated shimmer"
  },
  {
    name: "Epic",
    minScore: 7,
    maxScore: 9,
    emoji: "💎",
    cssClass: "epic-frame",
    overlayUrl: "/frames/epic.png",
    description: "Purple/Pink gradient with pulsing glow"
  },
  {
    name: "Rare",
    minScore: 4,
    maxScore: 6,
    emoji: "💠",
    cssClass: "rare-frame",
    overlayUrl: "/frames/rare.png",
    description: "Blue/Cyan shimmer with light refraction"
  },
  {
    name: "Uncommon",
    minScore: 1,
    maxScore: 3,
    emoji: "🟢",
    cssClass: "uncommon-frame",
    overlayUrl: "/frames/uncommon.png",
    description: "Green/Emerald with subtle glow"
  },
  {
    name: "Common",
    minScore: 0,
    maxScore: 0,
    emoji: "⚪",
    cssClass: "common-frame",
    overlayUrl: "/frames/common.png",
    description: "Gray standard with minimal effects"
  }
];

/**
 * Determines the rarity tier based on vote score
 * @param score - Net votes (votes_for - votes_against)
 * @returns The matching RarityTier object
 */
export function getRarityFromScore(score: number): RarityTier {
  // Clamp negative scores to 0
  const normalizedScore = Math.max(0, score);
  
  // Find matching tier (sorted from highest to lowest)
  for (const tier of rarityTiers) {
    if (tier.maxScore === null && normalizedScore >= tier.minScore) {
      return tier;
    }
    if (tier.maxScore !== null && normalizedScore >= tier.minScore && normalizedScore <= tier.maxScore) {
      return tier;
    }
  }
  
  // Fallback to Common if no match found
  return rarityTiers[rarityTiers.length - 1];
}
