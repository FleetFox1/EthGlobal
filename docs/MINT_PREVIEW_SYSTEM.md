# NFT Mint Preview System 🎴

## Overview
The **hybrid minting system** gives users two paths:
1. **⚡ Instant Common Mint** - Pay gas, skip voting, get Common NFT immediately
2. **🎲 Submit for Voting** - FREE 3-day voting period, earn better rarity (Uncommon → Legendary)

## User Flow

### Option 1: Instant Common Mint
```
Upload Bug → [Mint Common NFT Now] → Preview Modal → Mint → Blockchain
                                    ↓
                                Gray card, no shimmer, instant gratification
```

### Option 2: Community Voting
```
Upload Bug → [Submit for Voting (FREE)] → 3 Days → Auto-Resolve
                                              ↓
                                          Net Votes >= 0 = Approved ✅
                                          Net Votes < 0 = Rejected ❌
                                              ↓
                                        [Congrats! Preview & Mint]
                                              ↓
                                        Preview shows rarity effects
                                        (Legendary shimmer, Epic pulse, etc.)
                                              ↓
                                        [Mint {Rarity} NFT] → Blockchain
```

## Approval Logic

**Updated to allow 0-vote submissions:**
```typescript
const netVotes = votesFor - votesAgainst;
const approved = netVotes >= 0; // Including 0 total votes

// Examples:
// 0 👍 / 0 👎 = 0 net votes → ✅ Approved (Common)
// 5 👍 / 2 👎 = +3 net votes → ✅ Approved (Uncommon)
// 2 👍 / 5 👎 = -3 net votes → ❌ Rejected
```

**Philosophy:**
- 0 votes = "No one cared" ≠ rejection
- Only **negative** votes actively reject submissions
- Common tier is the "floor" - always accessible

## Rarity System

Based on **net votes** (votes_for - votes_against):

| Rarity | Net Votes | Emoji | Visual Effects | Frame Color |
|--------|-----------|-------|----------------|-------------|
| **Legendary** | 10+ | ✨ | Orange/red holographic shimmer, 8s sweep animation | Orange-red gradient |
| **Epic** | 7-9 | 💎 | Purple/pink pulse, 2.5s breathing animation | Purple-pink gradient |
| **Rare** | 4-6 | 💠 | Blue/cyan shimmer, 2s gentle glow | Blue-cyan gradient |
| **Uncommon** | 1-3 | 🟢 | Green/emerald subtle shine | Green gradient |
| **Common** | 0 | ⚪ | Standard gray, no effects | Gray border |

## Preview Modal Features

### Component: `MintPreviewModal.tsx`
**Shows before minting:**
- 🎴 **Full NFT card** with actual holographic effects
- 📊 **Vote breakdown** (👍 votes for / 👎 votes against)
- 🏆 **Rarity tier** with emoji and description
- ✨ **Animated shimmer** (for Legendary/Epic/Rare)
- 🎨 **Rarity-specific gradient** buttons and banners
- ⛽ **Gas fee warning** (blockchain transaction notice)

**Props:**
```typescript
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
```

## Integration Example

### Collection Page Usage
```typescript
import MintPreviewModal from '@/components/MintPreviewModal';
import { useState } from 'react';

const [showPreview, setShowPreview] = useState(false);
const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

// For approved submissions
{upload.voting_approved && (
  <Button onClick={() => {
    setSelectedUpload(upload);
    setShowPreview(true);
  }}>
    🎉 Preview & Mint NFT
  </Button>
)}

// Preview Modal
<MintPreviewModal
  isOpen={showPreview}
  onClose={() => {
    setShowPreview(false);
    setSelectedUpload(null);
  }}
  onMint={async () => {
    await mintNFT(selectedUpload);
    setShowPreview(false);
    refreshCollection();
  }}
  upload={selectedUpload}
/>
```

## Minting Function (TODO)

```typescript
async function mintNFT(upload: Upload) {
  const netVotes = upload.votes_for - upload.votes_against;
  const rarity = getRarityFromScore(netVotes);
  
  // Call BugNFT contract
  const tx = await bugNFTContract.mint(
    userAddress,
    upload.imageUrl,
    {
      name: upload.title || "Bug Report",
      description: upload.description || "",
      rarity: rarity.name,
      votesFor: upload.votes_for,
      votesAgainst: upload.votes_against,
      netScore: netVotes,
    }
  );
  
  await tx.wait(); // Wait for confirmation
  
  // Update database
  await fetch('/api/mark-minted', {
    method: 'POST',
    body: JSON.stringify({ uploadId: upload.id }),
  });
}
```

## Visual Experience

### Legendary Preview (10+ votes)
```
╔══════════════════════════════════════╗
║         ✨ READY TO MINT! ✨          ║
╠══════════════════════════════════════╣
║                                      ║
║   [Orange/red shimmer announcement]  ║
║         ✨ LEGENDARY TIER ✨          ║
║      "Elite bug with 10+ votes"      ║
║     Net Score: +12 (15 👍 / 3 👎)    ║
║                                      ║
║    [NFT Card with holographic        ║
║     shimmer, 8s sweep animation,     ║
║     orange-red gradient frame,       ║
║     rarity badge top-right]          ║
║                                      ║
║  ⬆️ This is what your NFT will look   ║
║              like                    ║
║                                      ║
║  [Maybe Later]  [Mint Legendary NFT] ║
║                  (orange gradient)   ║
║                                      ║
║    ⛽ You'll pay gas fees for minting ║
╚══════════════════════════════════════╝
```

### Common Preview (0 votes)
```
╔══════════════════════════════════════╗
║         ✨ READY TO MINT! ✨          ║
╠══════════════════════════════════════╣
║                                      ║
║      [Gray standard announcement]    ║
║           ⚪ COMMON TIER ⚪            ║
║        "Standard bug report"         ║
║      Net Score: 0 (0 👍 / 0 👎)      ║
║                                      ║
║    [NFT Card with no shimmer,        ║
║     gray border, standard look,      ║
║     rarity badge top-right]          ║
║                                      ║
║  ⬆️ This is what your NFT will look   ║
║              like                    ║
║                                      ║
║   [Maybe Later]   [Mint Common NFT]  ║
║                    (gray gradient)   ║
║                                      ║
║    ⛽ You'll pay gas fees for minting ║
╚══════════════════════════════════════╝
```

## Next Steps

### 1. Update Collection Page
- [ ] Add instant Common mint button (skip voting)
- [ ] Add "Submit for Voting" button (free, 3-day wait)
- [ ] Integrate MintPreviewModal for approved submissions
- [ ] Show "Congrats! Preview & Mint" after approval

### 2. Implement Minting Function
- [ ] Wire up BugNFT contract call
- [ ] Pass rarity metadata (name, tier, votes)
- [ ] Handle transaction waiting and errors
- [ ] Update database: submitted_to_blockchain = true

### 3. Complete Frame Assets
- [x] legendary.png (done)
- [ ] epic.png (purple/pink frame)
- [ ] rare.png (blue/cyan frame)
- [ ] uncommon.png (green frame)
- [ ] common.png (gray frame)

See `public/frames/FRAME_DESIGN_GUIDE.md` for design specs.

### 4. Test Complete Flow
- [ ] Upload bug → Instant mint → See gray Common card in preview
- [ ] Upload bug → Submit for voting → Get votes → Auto-resolve
- [ ] After 3 days → See rarity-specific preview → Mint → Blockchain
- [ ] Verify holographic effects show correctly in preview
- [ ] Check gas estimation and transaction success

## Technical Details

### Database Schema
```sql
-- uploads table extended with voting columns
voting_status VARCHAR(20),        -- 'pending_voting' | 'approved' | 'rejected'
votes_for INT DEFAULT 0,
votes_against INT DEFAULT 0,
voting_deadline TIMESTAMP,
voting_resolved BOOLEAN DEFAULT FALSE,
voting_approved BOOLEAN DEFAULT NULL
```

### Key Files
- `apps/web/components/MintPreviewModal.tsx` - Preview modal component
- `apps/web/components/NFTWithRarityFrame.tsx` - Card display with effects
- `apps/web/app/nft-effects.css` - Holographic animations
- `apps/web/types/rarityTiers.ts` - Rarity system config
- `apps/web/app/api/resolve-voting/route.ts` - Auto-approval endpoint

### API Endpoints
- `POST /api/submit-for-voting` - Start 3-day voting period
- `POST /api/vote-offchain` - Cast free vote
- `GET /api/voting-submissions` - List pending votes
- `POST /api/resolve-voting` - Auto-resolve expired voting (cron)
- `POST /api/mark-minted` - Update minted status (TODO)

## Philosophy

**Hybrid minting balances:**
- 🎯 **Instant gratification** (Common mint) vs **quality control** (voting)
- 💰 **Accessibility** (free voting) vs **blockchain costs** (gas fees)
- 🎮 **Game theory** (earn rarity) vs **user choice** (skip wait)

**0-vote approval ensures:**
- No unfair rejections from lack of engagement
- Common tier is always accessible
- Only negative community feedback blocks minting
- "No one cared" ≠ "This is bad"

---

**Ready to integrate!** The preview modal shows users exactly what they're getting before paying gas. 🎴✨
