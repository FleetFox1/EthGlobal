# 🎴 NFT Collectible Card System

Pokemon-style NFT cards with holographic effects and rarity-based designs.

## 📂 File Structure

```
types/
  rarityTiers.ts              # Rarity configuration + getRarityFromScore()
components/
  NFTWithRarityFrame.tsx      # Main card component
app/
  nft-effects.css             # Holographic CSS animations
  layout.tsx                  # Import nft-effects.css here
  cards/page.tsx              # Demo gallery page
public/
  frames/
    legendary.png             # Frame overlay images
    epic.png
    rare.png
    uncommon.png
    common.png
```

## 🎯 Rarity Tiers

Based on net vote score (`votes_for - votes_against`):

| Score   | Rarity    | Emoji | Effect                       |
| ------- | --------- | ----- | ---------------------------- |
| 10+     | Legendary | ✨    | Orange/Red holographic       |
| 7-9     | Epic      | 💎    | Purple/Pink gradient         |
| 4-6     | Rare      | 💠    | Blue/Cyan shimmer            |
| 1-3     | Uncommon  | 🟢    | Green/Emerald                |
| 0       | Common    | ⚪    | Gray standard                |

## 🚀 Usage

### Basic Implementation

```tsx
import NFTWithRarityFrame from '@/components/NFTWithRarityFrame';

// Calculate vote score
const voteScore = votesFor - votesAgainst;

// Render card
<NFTWithRarityFrame
  imageUrl="/bugs/my-bug.jpg"
  voteScore={voteScore}
  name="Critical Memory Leak"
  description="Bug causing 100% CPU usage"
  votesFor={18}
  votesAgainst={3}
/>
```

### In Collection Page

```tsx
// In your collection page component
const netVotes = upload.votes_for - upload.votes_against;

<NFTWithRarityFrame
  imageUrl={upload.imageUrl}
  voteScore={netVotes}
  name={upload.title}
  description={upload.description}
  votesFor={upload.votes_for}
  votesAgainst={upload.votes_against}
  className="w-full max-w-sm"
/>
```

## 🎨 Features

### Visual Effects

- **Holographic Shimmer**: Animated gradient sweep across card surface
- **Rarity-Based Borders**: Gradient borders matching tier colors
- **Foil Shine**: Radial glow effect on hover
- **Glow Halos**: Pulsing outer glow (Legendary/Epic tiers)
- **Responsive Design**: Mobile-optimized with reduced animations

### Interactive Elements

- **Hover Transform**: Cards scale up and lift on hover
- **Tooltip**: Shows rarity details on hover
- **Vote Score Badge**: Top-left corner shows vote breakdown
- **Rarity Badge**: Top-right corner shows tier and emoji
- **Info Section**: Bottom area with name, description, net score

### Accessibility

- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Fallback Images**: Shows placeholder if image fails to load
- **Semantic HTML**: Proper alt text and ARIA labels

## 🖼️ Frame Overlays

Place PNG frame images in `public/frames/`:

```
public/frames/
  legendary.png   # Orange/red holographic frame
  epic.png        # Purple/pink gradient frame
  rare.png        # Blue/cyan shimmer frame
  uncommon.png    # Green/emerald frame
  common.png      # Gray standard frame
```

**Frame Design Tips:**
- Transparent background (PNG with alpha)
- Border/edge decorations
- Corner embellishments
- Size: 600x800px (3:4 aspect ratio)
- Leave center area transparent for NFT image

## 🧪 Demo Page

Visit `/cards` to see all rarity tiers in action:

```bash
npm run dev
# Navigate to http://localhost:3000/cards
```

## 🔧 Customization

### Change Rarity Thresholds

Edit `types/rarityTiers.ts`:

```ts
{
  name: "Legendary",
  minScore: 10,  // Change this threshold
  maxScore: null,
  // ...
}
```

### Add New Rarity Tier

1. Add tier to `rarityTiers` array in `types/rarityTiers.ts`
2. Create CSS class in `app/nft-effects.css` (e.g., `.mythic-frame`)
3. Add shimmer animation (e.g., `.mythic-shimmer`)
4. Create frame overlay image in `public/frames/mythic.png`

### Customize Animations

Edit `app/nft-effects.css`:

```css
@keyframes legendary-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }  /* Adjust intensity */
}
```

## 📦 Dependencies

- **Next.js 15+**: Image optimization, routing
- **React 19+**: Component rendering
- **Tailwind CSS**: Utility classes
- **TypeScript**: Type safety

## 🎭 Animation Performance

All animations use GPU-accelerated properties:
- `transform` (scale, translate)
- `opacity`
- `filter` (blur)
- `background-position`

No expensive properties like `width`, `height`, or `left/top`.

## 🐛 Troubleshooting

### Frame images not loading

- Check `public/frames/` directory exists
- Verify PNG files are named correctly: `legendary.png`, `epic.png`, etc.
- Component includes fallback: frames gracefully hide if missing

### Animations not working

- Ensure `nft-effects.css` is imported in `app/layout.tsx`
- Check browser DevTools for CSS errors
- Verify no conflicting global styles

### Cards look flat/no effects

- Clear browser cache
- Check if `prefers-reduced-motion` is enabled (disables animations)
- Inspect element to verify CSS classes are applied

## 📝 Integration Checklist

- [ ] Import `nft-effects.css` in `app/layout.tsx`
- [ ] Add frame overlay images to `public/frames/`
- [ ] Calculate `voteScore` from database (`votes_for - votes_against`)
- [ ] Replace old card display with `<NFTWithRarityFrame />`
- [ ] Test all rarity tiers with different vote scores
- [ ] Verify hover effects work on desktop
- [ ] Test responsive design on mobile
- [ ] Check accessibility (keyboard navigation, screen readers)

## 🎉 Next Steps

- **Wire up minting**: Connect "Mint NFT" button to BugNFT contract
- **Store rarity on-chain**: Include rarity tier in token metadata
- **Add card flip**: Show bug details on back of card
- **Gallery view**: Grid of user's minted NFT cards
- **Trade cards**: Marketplace for buying/selling rarity tiers

---

Built with ❤️ for ETHGlobal 2025
