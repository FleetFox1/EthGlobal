# Integration Examples: Using NFTWithRarityFrame in Collection Page

Copy these code snippets into your collection page to replace existing card display.

## Basic Usage

```tsx
import NFTWithRarityFrame from '@/components/NFTWithRarityFrame';

// Example: Inside your collection page component where you map over uploads

// OLD CODE (current card display):
/*
<div className="bg-white rounded-lg shadow p-4">
  <img src={upload.imageUrl} alt={upload.title} />
  <h3>{upload.title}</h3>
  <p>Votes: {upload.votes_for} / {upload.votes_against}</p>
</div>
*/

// NEW CODE (with holographic NFT cards):
{uploads.map((upload) => {
  // Calculate net vote score
  const netVotes = (upload.votes_for || 0) - (upload.votes_against || 0);
  
  return (
    <div key={upload.id} className="p-4">
      <NFTWithRarityFrame
        imageUrl={upload.imageUrl}
        voteScore={netVotes}
        name={upload.title || 'Untitled Bug'}
        description={upload.description || 'No description available'}
        votesFor={upload.votes_for || 0}
        votesAgainst={upload.votes_against || 0}
        className="w-full max-w-sm mx-auto"
      />
      
      {/* Optional: Action buttons below card */}
      {upload.voting_status === 'approved' && !upload.submitted_to_blockchain && (
        <button
          onClick={() => handleMintNFT(upload)}
          className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:scale-105 transition-transform"
        >
          🔥 Mint {getRarityFromScore(netVotes).emoji} {getRarityFromScore(netVotes).name} NFT
        </button>
      )}
    </div>
  );
})}
```

## Advanced: Show Different Views Based on Status

```tsx
function renderUploadCard(upload: Upload) {
  const netVotes = (upload.votes_for || 0) - (upload.votes_against || 0);
  
  // For bugs not yet submitted to voting - show simple preview
  if (upload.voting_status === 'not_submitted') {
    return (
      <div className="bg-gray-800 rounded-xl p-4">
        <img src={upload.imageUrl} alt={upload.title} className="rounded-lg" />
        <button onClick={() => submitForVoting(upload)}>
          Submit for Voting (FREE)
        </button>
      </div>
    );
  }
  
  // For bugs in voting or approved - show full NFT card
  if (upload.voting_status === 'pending_voting' || upload.voting_status === 'approved') {
    return (
      <NFTWithRarityFrame
        imageUrl={upload.imageUrl}
        voteScore={netVotes}
        name={upload.title}
        description={upload.description}
        votesFor={upload.votes_for}
        votesAgainst={upload.votes_against}
      />
    );
  }
  
  // For minted NFTs - show card with "Minted" badge
  if (upload.submitted_to_blockchain) {
    return (
      <div className="relative">
        <NFTWithRarityFrame
          imageUrl={upload.imageUrl}
          voteScore={netVotes}
          name={upload.title}
          description={upload.description}
          votesFor={upload.votes_for}
          votesAgainst={upload.votes_against}
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white font-bold rounded-full text-sm">
          ✅ MINTED
        </div>
      </div>
    );
  }
}
```

## Helper: Show Rarity Info

```tsx
// HELPER: Import getRarityFromScore if you need it
import { getRarityFromScore } from '@/types/rarityTiers';

// Example: Show rarity info in a separate section
function RarityDisplay({ voteScore }: { voteScore: number }) {
  const rarity = getRarityFromScore(voteScore);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{rarity.emoji}</span>
      <div>
        <div className="font-bold text-white">{rarity.name}</div>
        <div className="text-sm text-gray-400">{rarity.description}</div>
      </div>
    </div>
  );
}
```

## Grid Layout: Display Cards in Responsive Grid

```tsx
function NFTCardGrid({ uploads }: { uploads: Upload[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8">
      {uploads.map((upload) => {
        const netVotes = (upload.votes_for || 0) - (upload.votes_against || 0);
        
        return (
          <NFTWithRarityFrame
            key={upload.id}
            imageUrl={upload.imageUrl}
            voteScore={netVotes}
            name={upload.title}
            description={upload.description}
            votesFor={upload.votes_for}
            votesAgainst={upload.votes_against}
            className="w-full"
          />
        );
      })}
    </div>
  );
}
```

## Modal View: Show Expanded Card on Click

```tsx
function NFTCardModal({ upload, onClose }: { upload: Upload; onClose: () => void }) {
  const netVotes = (upload.votes_for || 0) - (upload.votes_against || 0);
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full">
        <NFTWithRarityFrame
          imageUrl={upload.imageUrl}
          voteScore={netVotes}
          name={upload.title}
          description={upload.description}
          votesFor={upload.votes_for}
          votesAgainst={upload.votes_against}
          className="w-full"
        />
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => handleMintNFT(upload)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition-transform"
          >
            🔥 Mint NFT
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

**Note**: These are example snippets. Replace `Upload` type, `handleMintNFT`, and `submitForVoting` with your actual implementations.
