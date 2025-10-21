# 🔧 Production Error Fixes

**Date:** October 21, 2025  
**Status:** Fixed and deployed

---

## 🐛 **Errors Found in Vercel Logs:**

### 1️⃣ **RPC Provider 404 Error**

**Error:**
```
HTTP request failed.
Status: 404
URL: https://sepolia.drpc.org
```

**Cause:** Missing `NEXT_PUBLIC_RPC_URL` environment variable in Vercel.

**Fix:** ✅
Add to Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/zhDx7ikWXX8vnhobQBhMb
```

**Impact:** This was preventing blockchain reads (checking submissions, getting user data from contracts)

---

### 2️⃣ **Missing Module: bls-eth-wasm**

**Error:**
```
Error: Cannot find module 'bls-eth-wasm'
page: '/api/upload-image'
```

**Cause:** Privy dependency `bls-eth-wasm` not installed.

**Fix:** ✅
```bash
pnpm add bls-eth-wasm
```

**Commit:** `388fdc1` - "fix: Add bls-eth-wasm dependency for Privy"

**Impact:** This was breaking wallet authentication and image uploads.

---

## ✅ **Steps to Complete Fix:**

### Step 1: ✅ Install Missing Dependency
- Installed `bls-eth-wasm@1.4.0`
- Committed and pushed to main
- Vercel auto-deploying now

### Step 2: ⏳ Add RPC URL to Vercel
**YOU NEED TO DO THIS:**

1. Go to https://vercel.com/dashboard
2. Select **eth-global** project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   ```
   Name: NEXT_PUBLIC_RPC_URL
   Value: https://eth-sepolia.g.alchemy.com/v2/zhDx7ikWXX8vnhobQBhMb
   ```
6. Select: ✅ Production ✅ Preview ✅ Development
7. Click **Save**

### Step 3: 🔄 Redeploy
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait ~2 minutes

---

## 🧪 **After Fix - Test:**

1. ✅ **Connect Wallet** - Should work without errors
2. ✅ **Upload Bug Photo** - Should upload to IPFS and identify with AI
3. ✅ **View Collection** - Should load blockchain submissions
4. ✅ **Refresh Page** - Data should persist

---

## 📊 **What These Fixes Enable:**

### RPC URL Fix:
- ✅ Read smart contract data
- ✅ Check user's submissions
- ✅ Load voting data
- ✅ Verify blockchain transactions

### bls-eth-wasm Fix:
- ✅ Privy wallet authentication
- ✅ Image upload API
- ✅ User registration
- ✅ Profile updates

---

## 🎯 **Complete Environment Variables Needed:**

Make sure these are ALL in Vercel:

### **API Keys (Add Manually):**
- ✅ `LIGHTHOUSE_API_KEY`
- ✅ `OPENAI_API_KEY`
- ✅ `NEXT_PUBLIC_PRIVY_APP_ID`

### **Blockchain (Add Manually):**
- ⏳ **`NEXT_PUBLIC_RPC_URL`** ← **ADD THIS NOW!**
- ✅ `NEXT_PUBLIC_CHAIN_ID=11155111`
- ✅ `NEXT_PUBLIC_BUG_TOKEN_ADDRESS`
- ✅ `NEXT_PUBLIC_BUG_TOKEN_V2_ADDRESS`
- ✅ `NEXT_PUBLIC_BUG_VOTING_ADDRESS`
- ✅ `NEXT_PUBLIC_BUG_VOTING_V2_ADDRESS`
- ✅ `NEXT_PUBLIC_BUG_NFT_ADDRESS`
- ✅ `NEXT_PUBLIC_PYUSD_ADDRESS`
- ✅ `NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS`
- ✅ `NEXT_PUBLIC_ADMIN_ADDRESSES`

### **Database (Auto-Added):**
- ✅ `POSTGRES_URL` (auto)
- ✅ `POSTGRES_PRISMA_URL` (auto)
- ✅ All other Postgres vars (auto)

---

## 📝 **Deployment Checklist:**

- [x] Install bls-eth-wasm dependency
- [x] Push to GitHub
- [ ] **Add NEXT_PUBLIC_RPC_URL to Vercel** ← **DO THIS NOW!**
- [ ] Redeploy Vercel
- [ ] Test wallet connection
- [ ] Test bug upload
- [ ] Test data persistence

---

## 🚨 **Critical Action Required:**

**You MUST add `NEXT_PUBLIC_RPC_URL` to Vercel now!**

Without it:
- ❌ Can't read blockchain data
- ❌ Can't check submissions
- ❌ Collection page won't load properly

---

**Next Step:** Add the RPC URL to Vercel environment variables and redeploy! 🚀
