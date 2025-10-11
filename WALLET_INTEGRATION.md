# Wallet Integration Setup Guide

## Overview
BugDex now uses **Privy** for wallet authentication, providing a seamless Web3 onboarding experience with support for:
- 🦊 **MetaMask** and other browser wallets
- 📧 **Email-based wallets** (no crypto knowledge needed)
- 🔐 **Google Social Login** with embedded wallets
- 🌐 **Multi-chain support** (Sepolia, Base Sepolia, Mainnet)

## Quick Start

### 1. Get Your Privy App ID

1. Visit [https://dashboard.privy.io/](https://dashboard.privy.io/)
2. Sign up or log in
3. Create a new app
4. Copy your **App ID** (format: `clprtxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2. Configure Environment Variables

Create a `.env.local` file in `apps/web/`:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Privy App ID:

```env
NEXT_PUBLIC_PRIVY_APP_ID=clprtxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Start the Dev Server

```bash
cd apps/web
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) and test the wallet connection!

## How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│           Root Layout (layout.tsx)          │
│  ┌───────────────────────────────────────┐  │
│  │    PrivyProvider (Wallet Context)     │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   QueryClientProvider (State)   │  │  │
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │  WagmiProvider (Chains)   │  │  │  │
│  │  │  │    ┌───────────────┐      │  │  │  │
│  │  │  │    │  Your App     │      │  │  │  │
│  │  │  │    └───────────────┘      │  │  │  │
│  │  │  └───────────────────────────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Key Components

#### `PrivyProvider.tsx`
- Wraps the entire app with Privy authentication context
- Configures supported chains (Sepolia, Base Sepolia, Mainnet)
- Sets up wagmi for contract interactions
- Provides TanStack Query for state management

#### `useWallet.ts` Hook
Custom hook that provides:
```typescript
const {
  isReady,      // Provider is loaded
  isConnected,  // User has connected wallet
  address,      // User's wallet address
  wallet,       // Wallet object
  connect,      // Function to open login modal
  disconnect,   // Function to disconnect wallet
  user,         // Full Privy user object
} = useWallet();
```

#### `WalletButton.tsx`
Smart button component that:
- Shows "Connect Wallet" when disconnected
- Displays shortened address when connected (0x1234...5678)
- Provides disconnect button
- Auto-sizes for menu or header placement

### Usage in Components

```tsx
'use client';

import { useWallet } from '@/lib/useWallet';

export function MyComponent() {
  const { isConnected, address, connect } = useWallet();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return <div>Connected: {address}</div>;
}
```

## Integration Points

### 🎯 Ready to Wire Up

1. **Camera Modal** (`components/CameraModal.tsx`)
   - Add wallet check before submission
   - Use `address` for bug ownership
   
2. **Voting Page** (`app/voting/page.tsx`)
   - Require connection to vote
   - Use `address` for vote tracking
   
3. **Collection Page** (`app/collection/page.tsx`)
   - Fetch NFTs for connected `address`
   - Display user's collection
   
4. **Profile Page** (`app/profile/page.tsx`)
   - Show stats for connected `address`
   - Display achievements and activity

### Example: Gating Features

```tsx
'use client';

import { useWallet } from '@/lib/useWallet';
import { Button } from '@/components/ui/button';

export function VoteButton({ submissionId }: { submissionId: string }) {
  const { isConnected, address, connect } = useWallet();

  const handleVote = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    // Call voting API
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        voterAddress: address,
        vote: true,
      }),
    });

    // Handle response...
  };

  return (
    <Button onClick={handleVote}>
      {isConnected ? 'Vote Real' : 'Connect to Vote'}
    </Button>
  );
}
```

## Supported Chains

| Chain | Chain ID | RPC |
|-------|----------|-----|
| Sepolia | 11155111 | Public RPC |
| Base Sepolia | 84532 | Public RPC |
| Mainnet | 1 | Public RPC |

To add more chains, edit `components/PrivyProvider.tsx`:

```typescript
const config = createConfig({
  chains: [sepolia, baseSepolia, mainnet, arbitrum], // Add here
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(), // And here
  },
});
```

## Customization

### Theme & Branding

Edit `components/PrivyProvider.tsx`:

```typescript
config={{
  appearance: {
    theme: 'dark',           // 'light' or 'dark'
    accentColor: '#22c55e',  // Your brand color
    logo: 'https://...',     // Your logo URL
  },
  loginMethods: ['wallet', 'email', 'google'], // Login options
}}
```

### Login Methods

Available options:
- `'wallet'` - MetaMask, Coinbase Wallet, etc.
- `'email'` - Magic link to email
- `'google'` - Google OAuth with embedded wallet
- `'twitter'` - Twitter OAuth
- `'discord'` - Discord OAuth
- `'github'` - GitHub OAuth
- `'apple'` - Apple Sign In

## Testing

### Local Testing (Without Privy App ID)

The app will use a placeholder App ID and show connection errors. To test properly:
1. Get a real Privy App ID (free tier available)
2. Add it to `.env.local`
3. Restart dev server

### Production Deployment

1. Add `NEXT_PUBLIC_PRIVY_APP_ID` to your hosting platform's environment variables
2. Configure allowed domains in Privy dashboard
3. Deploy!

## Troubleshooting

### "Invalid App ID" Error
- Check that `NEXT_PUBLIC_PRIVY_APP_ID` is set in `.env.local`
- Restart dev server after adding env vars
- Verify App ID format (starts with `clprt`)

### Wallet Not Connecting
- Check browser console for errors
- Ensure MetaMask/wallet extension is installed
- Try different login method (email/Google)

### TypeScript Errors
```bash
# Reinstall dependencies
cd apps/web
rm -rf node_modules .next
pnpm install
```

## Next Steps

1. ✅ Wallet integration complete
2. 🔄 Wire up Camera Modal to require wallet
3. 🔄 Connect Voting page to `/api/vote`
4. 🔄 Connect Collection page to `/api/user/[address]`
5. 🔄 Add wallet gating to Profile page

## Resources

- [Privy Documentation](https://docs.privy.io/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [TanStack Query](https://tanstack.com/query/latest)
