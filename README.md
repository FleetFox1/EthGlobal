# 🐛 BugDex

> A Web3 mobile-first bug photography dApp with community voting and NFT collection - built for **ETHOnline 2025**

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Solidity](https://img.shields.io/badge/Solidity-0.8.27-gray?style=flat-square&logo=solidity)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwindcss)

**Live App**: [bugdex.life](https://bugdex.life) | **Network**: Sepolia Testnet | **Explorer**: [bugdex-explorer.cloud.blockscout.com](https://bugdex-explorer.cloud.blockscout.com)

## 🏆 Prize Tracks

BugDex integrates sponsor technologies to deliver a seamless mobile-first payment and NFT experience:

### 💵 PYUSD (PayPal USD) - Consumer Payments
**Prize Track**: Consumer Champion ($3,500) + Grand Prize ($4,500)

BugDex demonstrates two powerful PYUSD consumer use cases:

1. **Faucet Unlock Payment** - Users pay **$1 in PYUSD** (or ETH) to unlock unlimited access to claim 100 BUG tokens every 24 hours. Stablecoin option ensures predictable pricing regardless of crypto volatility.

2. **Conservation Donations** - Direct PYUSD donations to wildlife conservation organizations. Users can vote with BUG tokens to influence quarterly fund distribution. Transparent on-chain payments for real-world impact.

- **Contract**: BugTokenV3 with PYUSD integration
- **PYUSD Address**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (Sepolia)
- **Why it matters**: Mobile-first stablecoin payments for both in-app economy and charitable giving

### 🔍 Blockscout - Custom Explorer
**Prize Track**: Best use of Autoscout ($3,500)

Deployed a custom-branded explorer at **bugdex-explorer.cloud.blockscout.com** that keeps users in the BugDex ecosystem. Transaction popups after key actions (unlock, stake, mint) provide transparency without leaving the app.

- **Explorer**: [bugdex-explorer.cloud.blockscout.com](https://bugdex-explorer.cloud.blockscout.com)
- **Integration**: Confirm dialogs with transaction links (bypasses mobile popup blockers)
- **Why it matters**: Custom branding + chain indexing creates trust for a new testnet dApp

### 🔮 Pyth Network - Price Oracle
**Prize Track**: Most Innovative use of Pull Oracle ($3,000)

Uses **Pyth's ETH/USD price feed** to dynamically calculate the exact ETH needed for a $1 faucet unlock. Ensures the unlock cost stays at $1 regardless of ETH price volatility.

- **Oracle**: `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21` (Sepolia)
- **Price Feed**: ETH/USD (`0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`)
- **Implementation**: Pull-based updates fetched from Hermes before each transaction
- **Why it matters**: Dynamic pricing ensures fair consumer payments in volatile crypto markets

**Total Prize Pool**: Up to **$18,000** across 3 sponsor tracks

---

## 🚨 The Problem: Biodiversity Crisis Meets Data Gap

Over **40% of insect species are declining globally**, threatening ecosystems and food security. Yet biodiversity monitoring remains:
- **Expensive** - Requires professional researchers and equipment
- **Slow** - Data collection happens sporadically with long delays
- **Limited** - Restricted to specific regions with research funding
- **Siloed** - Data trapped in academic institutions, not accessible in real-time

Meanwhile, conservation organizations struggle with funding transparency and lack of real-time field data from diverse geographic locations.

## 💡 Our Solution: DeSci Meets Conservation Gaming

BugDex transforms biodiversity monitoring into an engaging, economically sustainable activity by combining:

🔬 **Decentralized Science (DeSci)** - Crowdsourced insect observations with on-chain provenance and IPFS storage  
💰 **Web3 Incentives** - Token rewards make conservation data collection financially viable  
🌍 **Direct Impact** - PYUSD donations flow directly to conservation organizations via community governance  
🎮 **Gamification** - NFT collecting mechanics make biodiversity research accessible and fun

Every photo becomes both a collectible NFT and valuable scientific data - geo-tagged, timestamped, and community-verified.

---

## 📖 About

**BugDex** is a mobile-first DeSci (Decentralized Science) platform that incentivizes global biodiversity data collection. Users photograph insects, submit for community verification, and mint verified observations as NFTs. The platform demonstrates how Web3 can solve real-world problems by making scientific data collection economically sustainable and accessible to everyone.

**Think**: iNaturalist meets Pokémon GO, powered by blockchain incentives and transparent conservation funding.

### How It Works
1. 💰 **Unlock Faucet** - Pay $1 (PYUSD or ETH via Pyth oracle) to unlock unlimited 24h claims
2. 📸 **Discover** - Photograph bugs with your phone camera (IPFS storage)
3. 💎 **Stake & Submit** - Stake 10 BUG tokens to submit for voting
4. 🗳️ **Community Votes** - Other users vote FOR or AGAINST (free, off-chain signatures)
5. 🎁 **Mint NFT** - Approved bugs (2+ net votes) become NFTs with rarity tiers
6. 🏆 **Earn Rewards** - Voters earn 5 BUG per upvote, discoverers keep the NFT
7. 🌍 **Support Conservation** - Donate PYUSD to wildlife organizations with transparent on-chain tracking

## ✨ Key Features

### 💳 Payments & Tokenomics
- 💵 **PYUSD Integration** - Pay $1 in stablecoin to unlock faucet (alternative to ETH)
- 🔮 **Dynamic Pricing** - Pyth oracle ensures $1 = actual $1 worth of ETH in real-time
- 🪙 **Faucet System** - Claim 100 BUG tokens every 24 hours after unlock
- � **Staking** - Lock 10 BUG to submit bugs for voting
- 🎁 **Rewards** - Earn 5 BUG per upvote received on submissions

### 🔍 Blockchain Transparency
- � **Custom Blockscout Explorer** - Branded chain explorer with transaction tracking
- 📊 **Transaction Popups** - Confirm dialogs with explorer links after key actions
- ✅ **On-Chain Verification** - All payments, stakes, and mints are transparent

### 📱 Mobile-First Experience
- 🎯 **PWA-Ready** - Install as app on iOS/Android
- 📷 **Camera Integration** - Live photo capture or upload from gallery
- 📱 **Bottom Navigation** - Thumb-friendly UI with large touch targets
- 🌗 **Dark Mode** - Full theme support for day/night usage
- ⚡ **Fast Performance** - Next.js 15 with Turbopack, optimized images

### 🐛 Bug Collection System
- 📸 **Photo Upload** - IPFS storage via Lighthouse (decentralized)
- 🗳️ **Off-Chain Voting** - Free voting with signature verification (no gas fees)
- 🎨 **NFT Minting** - Approved bugs become ERC-721 NFTs with rarity tiers
- 🏆 **Rarity System** - Common (0-1), Uncommon (2-4), Rare (5-9), Epic (10-19), Legendary (20+)
- 📊 **Leaderboard** - Track top collectors and voters
- 🎭 **Smooth Animations** - Polished transitions and hover effects
- 📱 **Mobile Safe-Area** - iOS/Android notch support

### Backend
- 🔗 **Smart Contracts** - BUG token (ERC-20), Bug NFTs (ERC-721), Voting system
- 🌐 **IPFS Storage** - Lighthouse SDK for decentralized image/metadata storage
- 🔌 **API Routes** - Submit bugs, vote, query submissions, user profiles
- 🪙 **Tokenomics** - Faucet system, staking, rewards

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Wallet**: [Privy](https://privy.io/) - Embedded wallet authentication
- **Web3**: [Ethers.js v6](https://docs.ethers.org/)

### Blockchain & Infrastructure
- **Smart Contracts**: [Solidity 0.8.27](https://soliditylang.org/)
- **Development**: [Hardhat](https://hardhat.org/)
- **Libraries**: [OpenZeppelin v5](https://www.openzeppelin.com/contracts)
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Explorer**: [Blockscout Autoscout](https://deploy.blockscout.com/) - Custom deployment
- **Oracle**: [Pyth Network](https://pyth.network/) - ETH/USD price feeds
- **Storage**: [Lighthouse IPFS](https://lighthouse.storage/) - Decentralized file storage

### Prize Integration
- **PYUSD**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (Sepolia testnet token)
- **Pyth Oracle**: `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21` (Sepolia deployment)
- **Blockscout**: Custom instance at bugdex-explorer.cloud.blockscout.com

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Privy App ID ([Get one free](https://dashboard.privy.io/))
- Lighthouse API key ([Get one here](https://lighthouse.storage/))

### Installation

```bash
# Clone repository
git clone https://github.com/FleetFox1/EthGlobal.git
cd EthGlobal
```

### Configuration

1. **Set up environment variables** (in `apps/web/`):
```bash
cp .env.example .env.local
```

2. **Configure `.env.local`**:
```env
# Privy Wallet Integration (REQUIRED)
NEXT_PUBLIC_PRIVY_APP_ID=clprtxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# IPFS Storage
LIGHTHOUSE_API_KEY=your_api_key_here

# Blockchain (after deployment)
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545  # Local Hardhat node
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x...         # After deployment
NEXT_PUBLIC_BUG_NFT_ADDRESS=0x...           # After deployment
NEXT_PUBLIC_BUG_VOTING_ADDRESS=0x...        # After deployment
```

### Running the Application

#### 1. Deploy Smart Contracts (Terminal 1)
```bash
cd apps/contracts

# Start local Hardhat node
pnpm run node

# In another terminal, deploy contracts
pnpm run deploy:local

# Copy contract addresses to apps/web/.env.local
```

#### 2. Run Tests (Optional)
```bash
cd apps/contracts
pnpm test
```

#### 3. Run Frontend (Terminal 2)
```bash
cd apps/web
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## � API Routes

The backend provides REST endpoints for bug submission, voting, and data queries. See [`apps/web/API_DOCUMENTATION.md`](apps/web/API_DOCUMENTATION.md) for full details.

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/submit-bug` | POST | Submit bug with image (multipart/form-data) |
| `/api/vote` | POST | Vote on submission (requires signature) |
| `/api/submissions` | GET | Query active/resolved submissions |
| `/api/user/[address]` | GET | Get user's NFTs and stats |

## �📁 Project Structure

```
EthGlobal/
├── apps/
│   ├── contracts/              # Smart contracts (Hardhat)
│   │   ├── contracts/
│   │   │   ├── BugToken.sol   # ERC-20 token
│   │   │   ├── BugNFT.sol     # ERC-721 NFT
│   │   │   └── BugVoting.sol  # Voting system
│   │   ├── scripts/
│   │   │   └── deploy.ts
│   │   └── test/
│   │       └── BugDex.test.ts
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── api/            # API routes
│       │   │   ├── submit-bug/
│       │   │   ├── vote/
│       │   │   ├── submissions/
│       │   │   └── user/
│       │   ├── layout.tsx
│       │   └── page.tsx        # Homepage
│       ├── components/
│       │   ├── ui/             # ShadCN UI components
│       │   ├── BottomNav.tsx
│       │   └── ScanButton.tsx
│       └── lib/
│           ├── contracts.ts    # Ethers.js contract utilities
│           ├── lighthouse.ts   # IPFS upload utilities
│           └── utils.ts
├── GIT_WORKFLOW.md             # Team collaboration guide
└── README.md
```

## 🔗 Smart Contracts (Sepolia Testnet)

### BugTokenV3 - ERC-20 with Pyth Oracle Integration 🏆
**Address**: `0x496d97744e6F313b62B3cfB6b76f303598c1a883`

The native token for BugDex with dynamic pricing for faucet unlocks.

**Key Features**:
- 🔮 **Pyth Oracle Integration** - Fetches real-time ETH/USD price to calculate unlock cost
- 💵 **PYUSD Payment Option** - Pay 1 PYUSD (stablecoin) as alternative to ETH
- 🪙 **Faucet System** - Unlock once ($1), claim 100 BUG every 24 hours
- ⏱️ **Cooldown Tracking** - On-chain timestamp verification for claims
- 🎁 **Initial Mint** - 100 BUG given immediately on unlock

**Prize Integrations**: PYUSD Consumer Payments + Pyth Price Oracle

### BugNFT v2 - ERC-721 with Rarity Tiers
**Address**: `0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF`

NFT contract for approved bug submissions with vote-based rarity.

**Rarity Calculation**:
- **Common** (0-1 votes) - 60% of submissions
- **Uncommon** (2-4 votes) - 25%
- **Rare** (5-9 votes) - 10%
- **Epic** (10-19 votes) - 4%
- **Legendary** (20+ votes) - 1%

**Features**:
- ✅ **Public Minting** - Anyone can mint approved submissions (no authorization required)
- 📊 **On-Chain Metadata** - IPFS URIs stored permanently
- 🎨 **Rarity Frames** - Visual distinction in collection view

### BugSubmissionStaking - Voting & Rewards
**Address**: `0xaD8AbE2726D86b0f3C7160BB377580207876Ab37`

Handles staking for submissions and reward distribution to voters.

**Mechanics**:
- **Stake**: 10 BUG required to submit bug for voting
- **Voting Period**: Off-chain signatures (free, no gas)
- **Approval Threshold**: 2+ net votes to mint NFT
- **Rewards**: 5 BUG per upvote to voters (from contract balance)
- **Funded**: 1000 BUG for initial reward distribution

### Supporting Contracts
- **BugVotingV2**: `0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9` - Off-chain vote verification
- **UserProfileRegistry**: `0xEa53a1898E8ad17e672b28BbB724CD7Ca56F1e60` - User profile storage
- **PYUSD (Sepolia)**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` - PayPal stablecoin
- **Pyth Oracle**: `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21` - Price feed provider

## 🎨 Key Features

### Mobile-First UI
- Fixed bottom navigation with safe-area-inset support
- Hamburger menu (Sheet sidebar) and settings (Dialog modal)
- Large, elevated circular scan button
- Responsive design with Tailwind CSS

### IPFS Integration
- Image uploads via Lighthouse SDK
- Automatic metadata generation
- Gateway URL retrieval for NFT display

### Wallet Integration (Coming Soon)
- MetaMask/WalletConnect support
- Transaction signing for votes/submissions
- Real-time balance updates

## 🛠️ Available Scripts

### Frontend (`apps/web`)
```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
```

### Contracts (`apps/contracts`)
```bash
pnpm compile      # Compile contracts
pnpm test         # Run tests
pnpm node         # Start local Hardhat node
pnpm deploy:local # Deploy to local node
```

## 👥 Team Collaboration

This project uses a **branch-based workflow**:

- **`main`** - Production-ready code
- **`backend/contracts`** - Smart contracts, API routes, IPFS integration
- **`frontend/ui`** - UI components, pages, styling

See [`GIT_WORKFLOW.md`](GIT_WORKFLOW.md) for detailed collaboration instructions.

## 📚 Documentation

- **[API Documentation](apps/web/API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Smart Contracts README](apps/contracts/README.md)** - Contract architecture and testing
- **[Frontend Progress](FRONTEND_PROGRESS.md)** - Frontend development status and features
- **[Camera Modal Docs](CAMERA_MODAL_DOCS.md)** - Camera scanning implementation guide
- **[Collection Page Docs](COLLECTION_PAGE_DOCS.md)** - Collection view architecture
- **[Component Guide](COMPONENT_GUIDE.md)** - Reusable UI components reference

## 🧪 Testing

```bash
cd apps/contracts
pnpm test
```

Current test coverage:
- ✅ BugToken faucet and minting
- ✅ BugNFT minting and metadata
- ✅ BugVoting submission and voting
- ✅ Reward distribution
- ✅ Auto-resolution at 5 votes

## 🚧 Roadmap

### MVP (Current Phase)
- [x] Smart contracts (BugToken, BugNFT, BugVoting)
- [x] IPFS integration with Lighthouse
- [x] API routes for submission, voting, queries
- [x] Mobile-first homepage with bottom navigation
- [x] Camera scanning UI with CameraModal component
- [x] Collection page with grid/list views and filters
- [x] Leaderboard page with rankings
- [x] User profile page with stats
- [x] About page with project info
- [ ] Deploy contracts to testnet
- [ ] Wallet connection (MetaMask/WalletConnect)
- [ ] Connect frontend to API routes
- [ ] Test end-to-end flow (scan → vote → mint → collect)

### Future Features
- [ ] Geolocation for bug discoveries
- [ ] AR bug scanning
- [ ] Trading marketplace
- [ ] Leaderboards and achievements
- [ ] Multi-chain support

## 🤝 Contributing & Team

Built by a solo developer for **ETHOnline 2025** with AI assistance (Claude, GitHub Copilot).

**AI Usage Disclosure**: See [AI_USAGE_DISCLOSURE.md](AI_USAGE_DISCLOSURE.md) for detailed attribution of human vs AI contributions. All architecture, design, and prize integration strategy is 100% human-led.

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live App**: [bugdex.life](https://bugdex.life)
- **Explorer**: [bugdex-explorer.cloud.blockscout.com](https://bugdex-explorer.cloud.blockscout.com)
- **GitHub**: [FleetFox1/EthGlobal](https://github.com/FleetFox1/EthGlobal)
- **ETHOnline 2025**: [ethglobal.com/events/ethonline2025](https://ethglobal.com/events/ethonline2025)
- **Deployment**: Vercel (Frontend) + Sepolia (Contracts)

---

**Built with ❤️ for ETHOnline 2025**

Integrating: **PYUSD** 💵 | **Blockscout** 🔍 | **Pyth Network** �

