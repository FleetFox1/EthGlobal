# 🚀 Blockscout Quick Setup Guide

**You have $10 credits! Let's deploy your custom explorer NOW.**

---

## Step 1: Deploy Blockscout Instance (5 minutes)

### A. Go to Blockscout Platform
1. Visit: https://deploy.blockscout.com
2. Login with your account
3. Verify you see your $10 credits

### B. Create New Instance
Click **"New Instance"** button, then fill in:

**Basic Info:**
- **Network:** `Sepolia` (from dropdown)
- **Instance Name:** `BugDex Explorer`
- **Subdomain:** `bugdex-sepolia` (or just `bugdex`)

**Network Configuration:**
- **RPC URL:** `https://eth-sepolia.g.alchemy.com/v2/zhDx7ikWXX8vnhobQBhMb` (your Alchemy endpoint from .env.local)
- **Chain ID:** `11155111`
- **Native Currency:** `ETH`

**Branding (Optional but cool):**
- **Logo:** Upload BugDex logo if you have one
- **Primary Color:** `#10b981` (green from your app)
- **Site Title:** `BugDex Explorer`

**Click "Deploy"** → Takes 2-3 minutes

### C. Get Your URL
After deployment completes, you'll see:
```
https://bugdex-sepolia.blockscout.com
```
or similar. **Copy this URL!**

---

## Step 2: Test Your Explorer (2 minutes)

Visit your new explorer and test:

**Search for BugTokenV2:**
```
0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
```

**Search for BugSubmissionStaking:**
```
0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
```

**Check recent transactions:**
- Should see your staking transactions ✅
- Should see reward distributions ✅
- Should see BUG token transfers ✅

---

## Step 3: Add to BugDex App (5 minutes)

### A. Update .env.local
```bash
# Add this line to apps/web/.env.local
NEXT_PUBLIC_BLOCKSCOUT_URL=https://bugdex-sepolia.blockscout.com
```

### B. Update Vercel Environment Variables
1. Go to: https://vercel.com/fleetfox1s-projects/eth-global/settings/environment-variables
2. Add new variable:
   - **Name:** `NEXT_PUBLIC_BLOCKSCOUT_URL`
   - **Value:** `https://bugdex-sepolia.blockscout.com` (your URL)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
3. Click **Save**
4. Redeploy: Go to Deployments → Click ··· on latest → Redeploy

### C. Test Integration
Once deployed, your app will now show Blockscout links instead of Etherscan:
- Admin page contract addresses → Click to view on Blockscout
- Transaction confirmations → Link to Blockscout
- NFT metadata → Link to Blockscout

---

## Step 4: Verify Contracts (Optional, 5 minutes)

Make your contracts look professional on Blockscout:

### BugTokenV2
1. Visit: https://bugdex-sepolia.blockscout.com/address/0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
2. Click "Code" tab
3. Click "Verify & Publish"
4. Fill in:
   - **Compiler:** `v0.8.20`
   - **Optimization:** Enabled, 200 runs
   - **Contract Code:** Copy from `apps/contracts/contracts/BugTokenV2.sol`
5. Submit

### BugSubmissionStaking
1. Visit: https://bugdex-sepolia.blockscout.com/address/0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
2. Same verification process
3. Contract Code: `apps/contracts/contracts/BugSubmissionStaking.sol`

**Why verify?**
- Shows contract source code
- Users can read functions
- Builds trust
- Looks professional for prize judges 🏆

---

## Step 5: Take Screenshots for Prize Submission (5 minutes)

Capture these for your Blockscout prize submission:

1. **Homepage** - Your branded explorer
2. **Contract Page** - BugSubmissionStaking with verified code
3. **Transaction Page** - Recent staking transaction
4. **Token Page** - BUG token with holders
5. **Search Functionality** - Searching for an address

Save to `docs/screenshots/blockscout/`

---

## What You Get 🎁

**Custom Explorer Features:**
- ✅ Your branding (BugDex logo/colors)
- ✅ Fast searches (optimized for your contracts)
- ✅ Transaction history
- ✅ Token transfers
- ✅ Contract interactions
- ✅ Verified contract code
- ✅ API endpoints (for future features)

**Prize Qualification:**
- ✅ Custom Blockscout deployment
- ✅ Integrated into your dApp
- ✅ Screenshots showing usage
- ✅ $3,500 prize eligible 💰

---

## Troubleshooting

**"Out of credits"**
- Check billing page
- $10 should give you 1-2 months of hosting
- Can top up if needed

**"RPC URL not working"**
- Double-check Alchemy endpoint
- Make sure Sepolia, not mainnet
- Test RPC in browser: `curl [YOUR_RPC_URL] -X POST -H "Content-Type: application/json" --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}'`

**"Instance not deploying"**
- Wait 5 minutes (can take time)
- Refresh page
- Check Blockscout status page

---

## Next Steps After Blockscout

1. ✅ Deploy Blockscout instance
2. ✅ Add environment variable
3. ✅ Verify contracts (optional but recommended)
4. ✅ Take screenshots
5. 🚀 **Implement NFT minting** (next task!)
6. 📹 Record demo video
7. 🏆 Submit for prizes

**Total Time:** ~20 minutes for full Blockscout setup!
