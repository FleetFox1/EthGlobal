# 🚀 Vercel Environment Variable Setup

**CRITICAL**: Add these environment variables to Vercel!

---

## 🔒 Add to Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/fleetfox1s-projects/eth-global
2. **Settings** → **Environment Variables**

### Variable 1: Staking Contract Address (Frontend)
   - **Name**: `NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS`
   - **Value**: `0x68E8DF1350C3500270ae9226a81Ca1771F2eD542`
   - **Environments**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

### Variable 2: Staking Contract Private Key (Backend)
   - **Name**: `STAKING_CONTRACT_PRIVATE_KEY`
   - **Value**: `6d82fa3f41df0f9e363801705842ca83dbd6f2948018dfeae119a2b74ff79f12`
   - **Environments**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

3. **Redeploy**:
   - Go to **Deployments** tab
   - Click **···** on latest deployment
   - Click **Redeploy**

---

## ✅ Verification

After deployment, test:

**Frontend (staking contract address)**:
```bash
# Open browser console on bugdex.life and run:
console.log(process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS)
# Should show: 0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
```

**Backend (resolve API)**:
```bash
curl https://bugdex.life/api/resolve-voting
# Should return success (even if no expired votes yet)
```

---

## 🔐 Security Notes

**NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS**:
- Public (exposed to frontend)
- Used by MetaMask to call staking contract
- Safe to expose (it's just a contract address)

**STAKING_CONTRACT_PRIVATE_KEY**:
- Private (backend only)
- Never exposed to frontend
- Used by `/api/resolve-voting` to distribute rewards
- This is the **deployer wallet** private key (contract owner)
- Wallet needs small amount of ETH for gas (~0.01 ETH is enough)

---

## 🎯 What This Enables

With both variables in Vercel:
1. Backend can call staking contract as owner
2. Rewards distributed automatically after voting
3. Users receive BUG tokens back in their wallets
4. Complete end-to-end staking flow works!

---

**Status**: Needs manual addition to Vercel dashboard 🔧
