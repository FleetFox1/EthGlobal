# 🚀 Deployment Roadmap: Integration → Main → Vercel

**Current Status**: `integration/merge-frontend` branch - ✅ Merge complete, ready for testing  
**Goal**: Deploy full-stack BugDex to production on Vercel

---

## 📋 Pre-Deployment Checklist

### Phase 1: Local Testing (Current Phase) ⏳
**Do this BEFORE merging to main**

- [ ] **Test Frontend Pages**
  ```bash
  cd apps/web
  pnpm install
  pnpm dev
  ```
  - [ ] Homepage loads correctly
  - [ ] Collection page displays (even with mock data)
  - [ ] Leaderboard page works
  - [ ] Profile page works
  - [ ] About page renders
  - [ ] Bottom navigation works
  - [ ] Camera modal opens and closes
  - [ ] No console errors

- [ ] **Deploy Contracts Locally**
  ```bash
  cd apps/contracts
  pnpm install
  pnpm run node        # Terminal 1 - keep running
  pnpm run deploy:local # Terminal 2
  ```
  - [ ] Contracts compile successfully
  - [ ] Deployment completes
  - [ ] Copy addresses to `.env.local`

- [ ] **Test API Routes**
  ```bash
  # Use Postman or curl
  curl http://localhost:3000/api/submissions
  ```
  - [ ] GET /api/submissions returns data
  - [ ] GET /api/user/[address] works
  - [ ] POST /api/submit-bug accepts images (needs contracts running)
  - [ ] POST /api/vote validates input

- [ ] **Test IPFS Integration**
  ```bash
  cd apps/web
  npx tsx scripts/test-ipfs.ts
  ```
  - [ ] Text upload works (already tested ✅)
  - [ ] Metadata upload works (already tested ✅)

- [ ] **Build Test**
  ```bash
  cd apps/web
  pnpm build
  ```
  - [ ] Build completes without errors
  - [ ] No TypeScript errors
  - [ ] No build warnings

---

## 🔀 Phase 2: Merge to Main

**ONLY do this after Phase 1 is complete**

### Step 1: Final Commit Check
```bash
git status
git log --oneline -5
```
Ensure all changes are committed.

### Step 2: Merge to Main
```bash
# Switch to main and pull latest
git checkout main
git pull origin main

# Merge integration branch
git merge integration/merge-frontend

# Push to GitHub
git push origin main
```

### Step 3: Tag Release (Optional but Recommended)
```bash
git tag -a v0.1.0-mvp -m "MVP: Full-stack BugDex with contracts + UI"
git push origin v0.1.0-mvp
```

### Step 4: Cleanup Old Branches
```bash
# Delete old branches locally
git branch -d backend/contracts
git branch -d integration/merge-frontend

# Delete on GitHub (after confirming everything works)
git push origin --delete frontend
git push origin --delete backend/contracts
git push origin --delete integration/merge-frontend
```

---

## ☁️ Phase 3: Deploy to Vercel

### Prerequisites
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub repo access granted to Vercel
- [ ] Lighthouse API key ready
- [ ] Decision: Deploy contracts to testnet or keep local?

### Option A: Deploy Frontend Only (Recommended for Testing)

**Best for**: Quick demo, frontend testing, no blockchain yet

1. **Connect GitHub to Vercel**
   - Go to https://vercel.com/new
   - Import `FleetFox1/EthGlobal` repository
   - Select `main` branch

2. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: cd apps/web && pnpm install && pnpm build
   Output Directory: apps/web/.next
   Install Command: pnpm install
   ```

3. **Environment Variables** (Critical!)
   ```env
   LIGHTHOUSE_API_KEY=c13bf6c2.8fa5d81dfc0f463398d7382838b48ab8
   
   # For testing with mock data
   NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
   NEXT_PUBLIC_CHAIN_ID=1337
   NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
   NEXT_PUBLIC_BUG_NFT_ADDRESS=0x0000000000000000000000000000000000000000
   NEXT_PUBLIC_BUG_VOTING_ADDRESS=0x0000000000000000000000000000000000000000
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get URL: `https://bug-dex-xxx.vercel.app`

**What works**: UI, navigation, camera modal, collection pages  
**What doesn't work**: API routes (no contracts), wallet connection

---

### Option B: Deploy Full-Stack (Recommended for Production)

**Best for**: Complete Web3 app with blockchain integration

#### Step 1: Deploy Contracts to Testnet (Sepolia)

1. **Get Sepolia ETH**
   - Visit https://sepoliafaucet.com
   - Request testnet ETH for your wallet

2. **Get Infura/Alchemy RPC**
   - Sign up at https://infura.io or https://alchemy.com
   - Create Sepolia project
   - Copy RPC URL: `https://sepolia.infura.io/v3/YOUR_KEY`

3. **Update Hardhat Config**
   ```typescript
   // apps/contracts/hardhat.config.ts
   networks: {
     sepolia: {
       url: process.env.SEPOLIA_RPC_URL,
       accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
     },
   },
   ```

4. **Deploy to Sepolia**
   ```bash
   cd apps/contracts
   
   # Add to .env
   echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY" >> .env
   echo "DEPLOYER_PRIVATE_KEY=your_wallet_private_key" >> .env
   
   # Deploy
   pnpm hardhat run scripts/deploy.ts --network sepolia
   ```

5. **Copy Contract Addresses**
   Save the deployed addresses for Vercel environment variables.

#### Step 2: Configure Vercel with Testnet

**Environment Variables**:
```env
# IPFS
LIGHTHOUSE_API_KEY=c13bf6c2.8fa5d81dfc0f463398d7382838b48ab8

# Sepolia Testnet
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111

# Deployed Contract Addresses (from Step 1)
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0xYourBugTokenAddress
NEXT_PUBLIC_BUG_NFT_ADDRESS=0xYourBugNFTAddress
NEXT_PUBLIC_BUG_VOTING_ADDRESS=0xYourBugVotingAddress

# Backend Private Key (for server-side signing)
PRIVATE_KEY=your_backend_wallet_private_key
```

#### Step 3: Deploy to Vercel
- Follow same steps as Option A
- Add environment variables above
- Deploy

**What works**: Everything! Full Web3 app with live contracts

---

## 🎯 Recommended Timeline

### Today (Day 1) - Current Phase ✅
- [x] Merge frontend + backend branches ✅
- [ ] Test frontend pages locally (30 min)
- [ ] Deploy contracts locally (15 min)
- [ ] Test API routes (30 min)

### Day 2 - Finalize
- [ ] Fix any bugs found in testing
- [ ] Connect CameraModal to API
- [ ] Test build process
- [ ] Merge to main

### Day 3 - Deploy
- [ ] Deploy to Vercel (Option A - frontend only)
- [ ] Share preview link for feedback
- [ ] Test on mobile devices

### Day 4-5 - Production (if needed)
- [ ] Deploy contracts to Sepolia testnet
- [ ] Update Vercel with contract addresses
- [ ] Add wallet connection (MetaMask)
- [ ] Test end-to-end flow

---

## ⚠️ Important Notes

### Before Merging to Main
1. **Test thoroughly** - Main branch should always work
2. **Run build** - Ensure no production errors
3. **Check console** - No critical warnings
4. **Review code** - Both you and partner sign off

### Before Deploying to Vercel
1. **Never commit private keys** - Use environment variables
2. **Test build locally first** - `pnpm build` in apps/web
3. **Use testnet first** - Don't deploy to mainnet yet
4. **Keep Lighthouse API key secret** - Only in Vercel env vars

### Vercel Configuration Tips
- **Root Directory**: MUST be `apps/web` (monorepo structure)
- **Node Version**: Vercel defaults to 18.x, you might need 20.x
- **Build Command**: May need custom command for monorepo
- **Environment Variables**: Add ALL variables before first deploy

---

## 📊 Deployment Options Comparison

| Feature | Option A (Frontend Only) | Option B (Full-Stack) |
|---------|--------------------------|------------------------|
| **Deployment Time** | 5 minutes | 30-60 minutes |
| **Cost** | Free | Free (testnet gas only) |
| **What Works** | UI, navigation, pages | Everything + blockchain |
| **Wallet Connection** | ❌ No | ✅ Yes |
| **API Routes** | ⚠️ Mock data only | ✅ Fully functional |
| **NFT Minting** | ❌ No | ✅ Yes (testnet) |
| **Good For** | UI demo, design review | Full testing, ETHGlobal submission |

---

## 🚀 Quick Deploy (Fastest Path)

**Want to deploy NOW?**

```bash
# 1. Quick test
cd apps/web
pnpm build

# 2. If build succeeds, merge to main
git checkout main
git merge integration/merge-frontend
git push origin main

# 3. Go to Vercel
# - Connect GitHub repo
# - Root: apps/web
# - Add LIGHTHOUSE_API_KEY
# - Deploy!

# Done in 10 minutes! 🎉
```

Frontend will be live, blockchain features will use mock data until you add contracts.

---

## 📞 Next Steps

**What do you want to do?**

1. **Test locally first** (recommended) - I'll guide you through Phase 1
2. **Quick deploy frontend to Vercel** - Get a live URL in 10 min
3. **Full deploy with testnet contracts** - Complete Web3 app (1-2 hours)
4. **Just merge to main for now** - Deploy later

Let me know and I'll help you execute! 🚀
