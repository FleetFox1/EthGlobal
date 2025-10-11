# 🐛 BugDex

> A Web3 mobile-first app for discovering and collecting bugs - built for EthGlobal 2025

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Solidity](https://img.shields.io/badge/Solidity-0.8.27-gray?style=flat-square&logo=solidity)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwindcss)

## 📖 About

**BugDex** is a Web3-powered bug collection platform where users discover, vote on, and collect bug NFTs. Built with smart contracts, IPFS storage, and a mobile-first interface.

### How It Works
1. 📸 **Discover** - Scan or upload bug images
2. 🗳️ **Vote** - Community votes on submissions (stake 10 BUG tokens)
3. 🎁 **Collect** - Approved bugs become NFTs + voters earn rewards
4. 💎 **Trade** - Collect rare bugs and build your collection

## ✨ Features

### Frontend
- 🎯 **Mobile-First Design** - PWA-ready, optimized for phones
- � **Camera Scanning** - Capture bugs with live camera or upload photos
- �📱 **Bottom Navigation** - Hamburger menu, scan button, settings
- 📚 **Collection View** - Grid/list view toggle with filters and search
- 🏆 **Leaderboard** - Top collectors ranking with stats
- 👤 **User Profile** - Stats, achievements, and activity feed
- ℹ️ **About Page** - Project info and tokenomics
- 🎨 **Modern UI** - ShadCN UI components with Tailwind CSS
- 🌗 **Dark Mode** - Full theme support
- ⚡ **Fast & Responsive** - Next.js 15 with Turbopack
- 🎭 **Smooth Animations** - Polished transitions and hover effects
- 📱 **Mobile Safe-Area** - iOS/Android notch support

### Backend
- 🔗 **Smart Contracts** - BUG token (ERC-20), Bug NFTs (ERC-721), Voting system
- 🌐 **IPFS Storage** - Lighthouse SDK for decentralized image/metadata storage
- 🔌 **API Routes** - Submit bugs, vote, query submissions, user profiles
- 🪙 **Tokenomics** - Faucet system, staking, rewards

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **UI**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend / Blockchain
- **Smart Contracts**: [Solidity 0.8.27](https://soliditylang.org/)
- **Framework**: [Hardhat](https://hardhat.org/)
- **Libraries**: [OpenZeppelin v5](https://www.openzeppelin.com/contracts)
- **Web3**: [Ethers.js v6](https://docs.ethers.org/)
- **Storage**: [Lighthouse IPFS](https://lighthouse.storage/)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
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
LIGHTHOUSE_API_KEY=your_api_key_here
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

## 🔗 Smart Contracts

### BugToken (ERC-20)
- **Faucet**: Users claim 100 BUG tokens daily
- **Staking**: Required for voting (10 BUG per vote)
- **Max Supply**: 100,000,000 BUG

### BugNFT (ERC-721)
- **Metadata**: IPFS-based with image hash, rarity, discoverer
- **Rarity System**: 5 levels (Common → Legendary)
- **Verification**: Community-driven validation

### BugVoting
- **Submission**: Users submit bugs with IPFS metadata
- **Voting Period**: 3 days from submission
- **Auto-Resolution**: Mints NFT at 5 votes
- **Rewards**: 50% to discoverer, 50% split among voters

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

## 🤝 Contributing

We're building this for **ETHGlobal 2025**! If you're on the team:

1. Check the current branch strategy in `GIT_WORKFLOW.md`
2. Create a feature branch from `backend/contracts` or `frontend/ui`
3. Make your changes and test locally
4. Submit a PR with clear description

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **GitHub**: [FleetFox1/EthGlobal](https://github.com/FleetFox1/EthGlobal)
- **Lighthouse**: [lighthouse.storage](https://lighthouse.storage/)
- **ETHGlobal**: [ethglobal.com](https://ethglobal.com/)

---

Built with ❤️ for **ETHGlobal 2025** 🐛

