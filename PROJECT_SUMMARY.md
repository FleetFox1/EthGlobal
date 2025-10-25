# BugDex - ETHGlobal Project Summary

## 🎯 Project Overview

BugDex is a decentralized bug photography dApp where users photograph insects, stake tokens to submit for community voting, and mint NFTs based on vote counts. Built on Sepolia testnet with PYUSD integration and custom Blockscout explorer.

**Live dApp**: https://bugdex.life  
**GitHub**: https://github.com/FleetFox1/EthGlobal  
**Network**: Sepolia (Chain ID: 11155111)  
**Deployer**: 0x71940fd31a77979F3a54391b86768C661C78c263

---

## 💰 Prize Tracks ($7,000 Total)

### ✅ PYUSD Integration ($3,500)
- **Feature**: Faucet unlock with PYUSD or ETH payment ($1)
- **Implementation**: Users pay 1 PYUSD to unlock unlimited BUG token claims
- **Contract**: BugTokenV2 at 0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
- **Status**: Tested and working - buddy received 10 BUG → 2 votes → 20 BUG reward

### ✅ Blockscout Explorer ($3,500)
- **URL**: https://bugdex-explorer.cloud.blockscout.com/
- **Integration**: Transaction popups after staking and minting
- **Value**: Custom branded explorer keeps users in BugDex ecosystem
- **Status**: Deployed and integrated - transaction links working

---

## 📝 Smart Contracts (Sepolia)

### BugTokenV2 - ERC20 Token with PYUSD Faucet
**Address**: `0x431185c8d1391fFD2eeB2aA4870015a1061f03e1`
- Faucet unlock: Pay 1 PYUSD or 0.00033 ETH ($1)
- Claim: 100 BUG tokens every 24 hours
- PYUSD: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9 (Sepolia)

### BugNFT v2 - NFT Contract with Public Minting
**Address**: `0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF`
- **Public minting enabled**: Anyone can mint approved bugs
- Rarity tiers: Common (0-1), Uncommon (2-4), Rare (5-9), Epic (10-19), Legendary (20+) votes
- Old contract (0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267) deprecated

### BugSubmissionStaking - Voting & Rewards
**Address**: `0x68E8DF1350C3500270ae9226a81Ca1771F2eD542`
- Stake: 10 BUG to submit for voting
- Rewards: 5 BUG per upvote received
- Voting: Free (off-chain signatures, no gas fees)
- Approval: 2+ net votes to mint NFT

### Other Contracts
- **BugVotingV2**: 0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9 (off-chain voting)
- **UserProfileRegistry**: 0xEa53a1898E8ad17e672b28BbB724CD7Ca56F1e60

---

## 🔄 User Journey

### 1. Unlock Faucet ($1 payment)
- User clicks "Get BUG Tokens"
- Choose payment: PYUSD (1 PYUSD) or ETH (0.00033 ETH)
- MetaMask approval + payment transaction
- Receive 100 BUG immediately
- Can claim more every 24 hours

### 2. Upload Bug Photo
- Take photo or choose from camera roll
- AI analysis populates: common name, scientific name, conservation status
- IPFS storage (free, decentralized via Lighthouse)
- Photo saved to database

### 3. Submit for Voting (Stake 10 BUG)
- Click "Submit for Voting"
- MetaMask approval (10 BUG allowance)
- MetaMask stake transaction (10 BUG locked)
- Submission appears in voting page

### 4. Community Voting (Free)
- Anyone can vote FOR or AGAINST
- Off-chain signatures (no gas fees!)
- Votes verified by backend, stored in database
- Real-time vote counts update

### 5. Rewards Distribution
- After voting ends: claim rewards
- Formula: stake returned + (5 BUG × upvotes)
- Example: 10 BUG stake + 2 upvotes = 20 BUG total
- If approved (2+ net votes): can mint NFT

### 6. Mint NFT
- Click "Mint NFT" on approved submission
- MetaMask transaction (public minting enabled)
- Two popups:
  1. "🎉 NFT Minted! Token ID: X, Rarity: Y"
  2. "🔍 View on Explorer: [Blockscout link]"
- Auto-switch to "On-Chain NFTs" tab
- See Pokemon-style card with rarity frame

---

## 🎨 Key Features

### Two-Tab Collection System
- **Off-Chain Tab**: Pending submissions, voting, approved but not minted
- **On-Chain Tab**: Minted NFTs with holographic rarity frames
- Auto-switch after minting to show new NFT

### NFT Rarity System
Based on net votes (upvotes - downvotes):
- **Common** (0-1 votes): Gray frame
- **Uncommon** (2-4 votes): Green frame
- **Rare** (5-9 votes): Blue frame
- **Epic** (10-19 votes): Purple frame
- **Legendary** (20+ votes): Orange/gold frame

### Blockscout Integration
- Transaction popups after staking/minting
- Custom branded explorer (not generic Etherscan)
- Links: `https://bugdex-explorer.cloud.blockscout.com/tx/{hash}`
- Keeps users in BugDex ecosystem

### Free Voting (Off-Chain)
- EIP-712 typed signatures
- Backend verifies signatures
- Database stores votes
- No gas fees for voters!

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Wallet**: Dynamic SDK
- **Image Upload**: Uploadcare
- **IPFS Storage**: Lighthouse.storage

### Backend
- **API**: Next.js API routes
- **Database**: Neon Postgres (serverless)
- **ORM**: Drizzle
- **Auth**: Wallet signatures
- **AI Analysis**: OpenAI GPT-4 (vision API)

### Smart Contracts
- **Language**: Solidity 0.8.27
- **Framework**: Hardhat
- **Testing**: Hardhat tests
- **Network**: Sepolia testnet
- **Deployment**: Hardhat scripts

### Infrastructure
- **Hosting**: Vercel
- **Explorer**: Blockscout Autoscout
- **RPC**: Alchemy (Sepolia)
- **Domain**: bugdex.life

---

## 🔑 Environment Variables (Vercel)

### Public (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
NEXT_PUBLIC_BUG_NFT_ADDRESS=0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF
NEXT_PUBLIC_STAKING_ADDRESS=0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
NEXT_PUBLIC_VOTING_ADDRESS=0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9
NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS=0xEa53a1898E8ad17e672b28BbB724CD7Ca56F1e60
NEXT_PUBLIC_BLOCKSCOUT_URL=https://bugdex-explorer.cloud.blockscout.com
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=(from Dynamic dashboard)
```

### Private (Server-side)
```
PRIVATE_KEY=(deployer wallet private key - for minting/admin functions)
OPENAI_API_KEY=(for AI bug analysis)
DATABASE_URL=(Neon Postgres connection string)
UPLOADCARE_PUBLIC_KEY=(for image uploads)
UPLOADCARE_SECRET_KEY=(for image uploads)
ALCHEMY_API_KEY=(for Sepolia RPC)
```

---

## 📊 Testing Results

### Staking & Rewards (Validated ✅)
- Buddy uploaded bug photo
- Staked 10 BUG successfully
- Received 2 community upvotes
- Claimed rewards: 20 BUG total (10 stake + 10 reward)
- **Formula works**: 5 BUG per upvote

### NFT Minting (Tested ✅)
- Admin can mint approved submissions
- Public minting enabled on v2 contract
- Two popups show: NFT details + Blockscout link
- Auto-switch to On-Chain tab
- Rarity frames display correctly

### Blockscout Integration (Working ✅)
- Explorer deployed and accessible
- Transaction popups integrated
- Links work from staking and minting flows
- Custom branding maintains ecosystem

---

## 🚀 Deployment Commands

### Smart Contracts
```bash
cd apps/contracts
pnpm hardhat run scripts/deploy.ts --network sepolia
pnpm hardhat run scripts/redeploy-nft.ts --network sepolia  # v2 with public minting
```

### Frontend
```bash
cd apps/web
vercel --prod  # or push to main (auto-deploy)
```

### Environment Variables
```bash
vercel env add NEXT_PUBLIC_BUG_NFT_ADDRESS production
# Paste: 0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF
```

---

## 🐛 Known Issues & Solutions

### Issue: Partner can't mint NFTs
**Cause**: Old contract only authorized specific addresses  
**Solution**: Deployed BugNFT v2 with `publicMintingEnabled` flag  
**Contract**: 0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF

### Issue: Blockscout 0% indexed after 12 hours
**Cause**: Alchemy rate limits (free tier)  
**Impact**: None - deployment and integration are what matter for prize  
**Status**: Explorer functional, indexing speed doesn't affect prize eligibility

### Issue: Build error "Property 'title' does not exist"
**Cause**: UserUpload interface doesn't have 'title' property  
**Solution**: Use `upload.bugInfo?.commonName` instead  
**Status**: Fixed in commit f497bca

---

## 📸 Demo Screenshots Needed

1. **Blockscout Homepage**: https://bugdex-explorer.cloud.blockscout.com/
2. **Staking Contract**: https://bugdex-explorer.cloud.blockscout.com/address/0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
3. **BUG Token**: https://bugdex-explorer.cloud.blockscout.com/address/0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
4. **Mint Transaction**: (after minting, from popup link)
5. **Search Functionality**: Search bar with any contract address

---

## 🎥 Demo Video Script (6-8 minutes)

1. **Intro (30 sec)**: BugDex overview, ETHGlobal submission
2. **Faucet (1 min)**: Pay $1 PYUSD → unlock → receive 100 BUG
3. **Upload & Stake (2 min)**: Take photo → AI analysis → stake 10 BUG → Blockscout popup
4. **Voting (1 min)**: Switch wallet → vote FOR → free voting
5. **Mint NFT (2 min)**: Mint approved bug → two popups → Blockscout link → see NFT card
6. **Blockscout (1 min)**: Show explorer, contracts, transactions
7. **Outro (30 sec)**: $7,000 in prizes, complete Web3 UX

---

## 💡 Value Propositions

### PYUSD Prize
- Real token economy powered by stablecoin
- Predictable $1 cost (no ETH volatility)
- Staking, rewards, and NFT minting all use BUG tokens
- PYUSD unlock is gateway to entire ecosystem

### Blockscout Prize
- Custom branded explorer (not generic Etherscan)
- Keeps users in BugDex ecosystem
- Free API access (no rate limits)
- Professional appearance for production dApp

---

## 📚 Key Documentation Files

- `apps/contracts/README.md` - Contract deployment guide
- `apps/web/API_DOCUMENTATION.md` - Backend API reference
- `docs/BLOCKSCOUT_VALUE_PROPOSITION.md` - Why custom explorer matters
- `docs/UPDATE_NFT_CONTRACT.md` - v2 deployment with public minting
- `docs/STAKING_TEST_GUIDE.md` - Testing staking and rewards

---

## 🎯 Final Checklist

- [x] PYUSD integration working ($3,500 prize)
- [x] Blockscout deployed and integrated ($3,500 prize)
- [x] NFT public minting enabled
- [x] Two-tab collection system implemented
- [ ] Take 5 Blockscout screenshots
- [ ] Record demo video (6-8 minutes)
- [ ] Write prize submissions (PYUSD + Blockscout)
- [ ] Submit to ETHGlobal before deadline

---

**Total Prize Value**: $7,000 (PYUSD $3,500 + Blockscout $3,500)  
**Status**: Both prizes qualified and tested  
**Next Steps**: Screenshots, video, submissions

Built with ❤️ for ETHGlobal 2025
