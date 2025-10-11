# 🎉 Wallet Integration Complete!

## ✅ What's Done

### Installed Dependencies
- ✅ `@privy-io/react-auth` (v3.3.0) - Wallet authentication
- ✅ `@privy-io/wagmi` (v2.0.1) - Wagmi integration
- ✅ `wagmi` (v2.18.0) - React hooks for Ethereum
- ✅ `viem` (v2.38.0) - TypeScript Ethereum library
- ✅ `@tanstack/react-query` (v5.90.2) - State management

### Created Components
1. **`components/PrivyProvider.tsx`**
   - Wraps app with Privy authentication
   - Configures Sepolia, Base Sepolia, Mainnet chains
   - Sets up wagmi and TanStack Query

2. **`lib/useWallet.ts`**
   - Custom hook for wallet state
   - Provides: `isReady`, `isConnected`, `address`, `connect`, `disconnect`

3. **`components/WalletButton.tsx`**
   - Smart wallet button component
   - Shows "Connect Wallet" when disconnected
   - Displays address when connected (e.g., "0x1234...5678")
   - Includes disconnect functionality

### Updated Files
1. **`app/layout.tsx`**
   - Added `<PrivyProvider>` wrapper around children
   - All pages now have access to wallet context

2. **`components/BottomNav.tsx`**
   - Replaced TODO wallet button with `<WalletButton />`
   - Wallet connection now available in hamburger menu

3. **`README.md`**
   - Added Privy to tech stack
   - Updated prerequisites
   - Added Privy App ID to env configuration

### Documentation
- ✅ `WALLET_INTEGRATION.md` - Complete setup guide with examples
- ✅ `.env.local.example` - Environment variable template

## 🚀 How to Use

### Get Privy App ID
1. Visit https://dashboard.privy.io/
2. Create a new app (free tier available)
3. Copy your App ID (format: `clprtxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Configure Environment
```bash
cd apps/web
cp .env.local.example .env.local
# Edit .env.local and add your NEXT_PUBLIC_PRIVY_APP_ID
```

### Start Dev Server
```bash
pnpm dev
```

### Test Wallet Connection
1. Open http://localhost:3000
2. Click hamburger menu (bottom left)
3. Click "Connect Wallet"
4. Choose login method:
   - 🦊 MetaMask/browser wallet
   - 📧 Email magic link
   - 🔐 Google Sign In

## 🔌 Next Integration Steps

### 1. Camera Modal - Submit Bug with Wallet
**File**: `components/CameraModal.tsx`

```tsx
import { useWallet } from '@/lib/useWallet';

export function CameraModal() {
  const { isConnected, address, connect } = useWallet();

  const handleSubmit = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    // Submit to API with address
    const response = await fetch('/api/submit-bug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: capturedImage,
        submitterAddress: address,
      }),
    });
  };
}
```

### 2. Voting Page - Connect to Vote
**File**: `app/voting/page.tsx`

```tsx
import { useWallet } from '@/lib/useWallet';

export default function VotingPage() {
  const { isConnected, address, connect } = useWallet();

  const handleVote = async (submissionId: string, vote: boolean) => {
    if (!isConnected) {
      connect();
      return;
    }

    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        voterAddress: address,
        vote,
      }),
    });
  };
}
```

### 3. Collection Page - Fetch User NFTs
**File**: `app/collection/page.tsx`

```tsx
import { useWallet } from '@/lib/useWallet';
import { useEffect, useState } from 'react';

export default function CollectionPage() {
  const { isConnected, address } = useWallet();
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    if (isConnected && address) {
      // Fetch user's NFTs
      fetch(`/api/user/${address}`)
        .then(res => res.json())
        .then(data => setNfts(data.nfts));
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return <div>Connect wallet to view your collection</div>;
  }

  return <div>Your NFTs: {nfts.length}</div>;
}
```

### 4. Profile Page - Show Connected User Stats
**File**: `app/profile/page.tsx`

```tsx
import { useWallet } from '@/lib/useWallet';

export default function ProfilePage() {
  const { isConnected, address } = useWallet();

  if (!isConnected) {
    return <div>Connect wallet to view profile</div>;
  }

  return <div>Profile for: {address}</div>;
}
```

## 📝 Environment Variables

Create `.env.local` in `apps/web/`:

```env
# REQUIRED: Get from https://dashboard.privy.io/
NEXT_PUBLIC_PRIVY_APP_ID=clprtxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# IPFS Storage
LIGHTHOUSE_API_KEY=your-lighthouse-api-key

# Contract Addresses (update after deployment)
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=
NEXT_PUBLIC_BUG_NFT_ADDRESS=
NEXT_PUBLIC_BUG_VOTING_ADDRESS=

# Network
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your-key
```

## 🎯 Available Wallet Hook

```tsx
import { useWallet } from '@/lib/useWallet';

function MyComponent() {
  const {
    isReady,      // boolean - Privy is loaded
    isConnected,  // boolean - User has connected
    address,      // string | undefined - Wallet address
    wallet,       // Wallet object
    connect,      // () => void - Open login modal
    disconnect,   // () => void - Disconnect wallet
    user,         // Privy user object
  } = useWallet();
}
```

## 🌐 Supported Chains

- **Sepolia Testnet** (11155111) - Main testnet
- **Base Sepolia** (84532) - L2 testnet
- **Ethereum Mainnet** (1) - Production

## 🎨 Customization

Edit `components/PrivyProvider.tsx`:

```typescript
config={{
  appearance: {
    theme: 'dark',           // or 'light'
    accentColor: '#22c55e',  // Your brand color
    logo: 'https://...',     // Your logo
  },
  loginMethods: ['wallet', 'email', 'google'],
}}
```

## 🐛 Troubleshooting

### Error: "Invalid App ID"
- Add `NEXT_PUBLIC_PRIVY_APP_ID` to `.env.local`
- Restart dev server: `pnpm dev`

### Wallet Not Connecting
- Check browser console for errors
- Ensure MetaMask is installed
- Try email or Google login instead

### TypeScript Errors
```bash
rm -rf node_modules .next
pnpm install
```

## ✨ What's Next?

1. 🔄 **Wire Camera Modal** - Add wallet check to bug submission
2. 🔄 **Wire Voting Page** - Replace mock data with API calls
3. 🔄 **Wire Collection Page** - Fetch real NFTs from blockchain
4. 🔄 **Wire Profile Page** - Show stats for connected wallet
5. 🔄 **Deploy Contracts** - Get contract addresses for .env
6. 🔄 **Test End-to-End** - Submit, vote, claim NFT flow

## 📚 Resources

- [Privy Docs](https://docs.privy.io/)
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [Complete Guide](./WALLET_INTEGRATION.md)

---

**Status**: ✅ Wallet integration ready! Start dev server and test connection.
**Next**: Wire up Camera Modal to require wallet before submission.
