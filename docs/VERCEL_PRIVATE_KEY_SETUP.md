# 🚀 Vercel Environment Variable Setup

**CRITICAL**: Add private key to Vercel for reward distribution!

---

## 🔒 Add to Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/fleetfox1s-projects/eth-global
2. **Settings** → **Environment Variables**
3. **Add New Variable**:
   - **Name**: `STAKING_CONTRACT_PRIVATE_KEY`
   - **Value**: `6d82fa3f41df0f9e363801705842ca83dbd6f2948018dfeae119a2b74ff79f12`
   - **Environments**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Redeploy**:
   - Go to **Deployments** tab
   - Click **···** on latest deployment
   - Click **Redeploy**

---

## ✅ Verification

After deployment, test the resolve API:
```bash
curl https://bugdex.life/api/resolve-voting
```

Should return success (even if no expired votes yet).

---

## 🔐 Security Notes

- This private key is for the **deployer wallet** (contract owner)
- It's needed for backend to call `distributeRewards()` and `returnStake()`
- Only used in `/api/resolve-voting` endpoint
- Never exposed to frontend
- Wallet needs small amount of ETH for gas (~0.01 ETH is enough)

---

## 🎯 What This Enables

With private key in Vercel:
1. Backend can call staking contract as owner
2. Rewards distributed automatically after voting
3. Users receive BUG tokens back in their wallets
4. Complete end-to-end staking flow works!

---

**Status**: Needs manual addition to Vercel dashboard 🔧
